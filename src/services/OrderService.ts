import {executeSql, runInTransaction, type SqlStatement} from '../database';
import type {CartItem, Order, OrderId, ProductId, TableId} from '../types';
import {getOrderById, requireOrder} from '../repositories/ordersRepository';
import {getTableById} from '../repositories/tablesRepository';

const now = (): string => new Date().toISOString();

export async function nextOrderNumber(): Promise<number> {
  const result = await executeSql('SELECT COALESCE(MAX(order_number), 999) + 1 AS next_number FROM ORDERS');
  return Number(result.rows.item(0).next_number);
}

export async function startTableOrder(tableId: TableId, customerName?: string): Promise<Order> {
  const table = await getTableById(tableId);
  if (!table || table.status !== 'AVAILABLE') throw new Error('This table is no longer available.');
  const orderNumber = await nextOrderNumber();
  const timestamp = now();
  await runInTransaction([
    {sql: `INSERT INTO ORDERS (order_number, customer_name, table_id, status, subtotal, discount, final_total, created_at, updated_at)
           VALUES (?, ?, ?, 'ACTIVE', 0, 0, 0, ?, ?)`, params: [orderNumber, customerName?.trim() || null, tableId, timestamp, timestamp]},
    {sql: "UPDATE TABLES SET status = 'OCCUPIED' WHERE id = ?", params: [tableId]},
  ]);
  const result = await executeSql('SELECT id FROM ORDERS WHERE order_number = ?', [orderNumber]);
  return requireOrder(Number(result.rows.item(0).id));
}

export async function getActiveOrderForTable(tableId: TableId): Promise<Order | null> {
  const result = await executeSql("SELECT id FROM ORDERS WHERE table_id = ? AND status = 'ACTIVE'", [tableId]);
  return result.rows.length ? getOrderById(Number(result.rows.item(0).id)) : null;
}

export async function assignTable(orderId: OrderId, tableId: TableId): Promise<void> {
  const table = await getTableById(tableId);
  if (!table || table.status !== 'AVAILABLE') throw new Error('Select an available table.');
  await runInTransaction([
    {sql: 'UPDATE ORDERS SET table_id = ?, updated_at = ? WHERE id = ? AND status = \'ACTIVE\'', params: [tableId, now(), orderId]},
    {sql: "UPDATE TABLES SET status = 'OCCUPIED' WHERE id = ?", params: [tableId]},
  ]);
}

export async function completeOrder(input: {
  orderId?: OrderId;
  customerName?: string;
  tableId?: TableId | null;
  discount: number;
  cart: CartItem[];
}): Promise<Order> {
  if (!input.cart.length) throw new Error('Add at least one item to the cart.');
  const subtotal = input.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (!Number.isFinite(input.discount) || input.discount < 0 || input.discount > subtotal) {
    throw new Error('Discount must be between ₹0 and the subtotal.');
  }
  const finalTotal = subtotal - input.discount;
  const timestamp = now();
  const statements: SqlStatement[] = [];
  let orderId = input.orderId;
  let orderNumber: number | undefined;
  let tableId = input.tableId ?? null;

  if (orderId) {
    const existing = await requireOrder(orderId);
    tableId = existing.tableId;
    statements.push({sql: `UPDATE ORDERS SET customer_name = ?, status = 'COMPLETED', subtotal = ?, discount = ?, final_total = ?, updated_at = ? WHERE id = ?`, params: [input.customerName?.trim() || null, subtotal, input.discount, finalTotal, timestamp, orderId]});
    statements.push({sql: 'DELETE FROM ORDER_ITEMS WHERE order_id = ?', params: [orderId]});
  } else {
    orderNumber = await nextOrderNumber();
    statements.push({sql: `INSERT INTO ORDERS (order_number, customer_name, table_id, status, subtotal, discount, final_total, created_at, updated_at)
      VALUES (?, ?, ?, 'COMPLETED', ?, ?, ?, ?, ?)`, params: [orderNumber, input.customerName?.trim() || null, tableId, subtotal, input.discount, finalTotal, timestamp, timestamp]});
  }
  const orderReference = orderId ? '?' : '(SELECT id FROM ORDERS WHERE order_number = ?)';
  for (const item of input.cart) {
    statements.push({sql: `INSERT INTO ORDER_ITEMS (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, item_total)
      VALUES (${orderReference}, ?, ?, ?, ?, ?)`, params: orderId ? [orderId, item.productId, item.name, item.unitPrice, item.quantity, item.unitPrice * item.quantity] : [orderNumber, item.productId, item.name, item.unitPrice, item.quantity, item.unitPrice * item.quantity]});
  }
  if (tableId) statements.push({sql: "UPDATE TABLES SET status = 'AVAILABLE' WHERE id = ?", params: [tableId]});
  await runInTransaction(statements);
  if (!orderId) {
    const result = await executeSql('SELECT id FROM ORDERS WHERE order_number = ?', [orderNumber]);
    orderId = Number(result.rows.item(0).id);
  }
  return requireOrder(orderId);
}

/** Persists an occupied table's in-progress cart so it can be reopened later. */
export async function saveActiveOrder(orderId: OrderId, customerName: string, discount: number, cart: CartItem[]): Promise<void> {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) {
    throw new Error('Discount must be between ₹0 and the subtotal.');
  }
  const statements: SqlStatement[] = [
    {sql: `UPDATE ORDERS SET customer_name = ?, subtotal = ?, discount = ?, final_total = ?, updated_at = ? WHERE id = ? AND status = 'ACTIVE'`, params: [customerName.trim() || null, subtotal, discount, subtotal - discount, now(), orderId]},
    {sql: 'DELETE FROM ORDER_ITEMS WHERE order_id = ?', params: [orderId]},
  ];
  cart.forEach(item => statements.push({sql: `INSERT INTO ORDER_ITEMS (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, item_total)
    VALUES (?, ?, ?, ?, ?, ?)`, params: [orderId, item.productId, item.name, item.unitPrice, item.quantity, item.unitPrice * item.quantity]}));
  await runInTransaction(statements);
}

export function cartItem(productId: ProductId, name: string, unitPrice: number): CartItem {
  return {productId, name, unitPrice, quantity: 1};
}
