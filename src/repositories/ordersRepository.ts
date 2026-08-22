import {executeSql} from '../database';
import type {CreateOrderInput, Order, OrderId, UpdateOrderInput} from '../types';

import {orderFromRow} from './rowMappers';

const now = (): string => new Date().toISOString();

function assertOrderTotals(subtotal: number, discount: number, finalTotal: number): void {
  if (![subtotal, discount, finalTotal].every(Number.isFinite) || subtotal < 0 || discount < 0) {
    throw new Error('Order totals must be non-negative numbers.');
  }
  const expectedFinalTotal = subtotal - discount;
  const roundingTolerance = Number.EPSILON * Math.max(1, Math.abs(expectedFinalTotal)) * 8;
  if (
    discount > subtotal ||
    finalTotal < 0 ||
    Math.abs(finalTotal - expectedFinalTotal) > roundingTolerance
  ) {
    throw new Error('Final total must equal subtotal minus the fixed discount.');
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const subtotal = input.subtotal ?? 0;
  const discount = input.discount ?? 0;
  const finalTotal = input.finalTotal ?? subtotal - discount;
  assertOrderTotals(subtotal, discount, finalTotal);
  const timestamp = now();

  const result = await executeSql(
    `INSERT INTO ORDERS
      (order_number, customer_name, table_id, status, subtotal, discount, final_total, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.orderNumber,
      input.customerName ?? null,
      input.tableId ?? null,
      input.status ?? 'ACTIVE',
      subtotal,
      discount,
      finalTotal,
      timestamp,
      timestamp,
    ],
  );
  return requireOrder(result.insertId as OrderId);
}

export async function getOrderById(id: OrderId): Promise<Order | null> {
  const result = await executeSql('SELECT * FROM ORDERS WHERE id = ?', [id]);
  return result.rows.length === 0 ? null : orderFromRow(result.rows.item(0));
}

export async function getOrderByNumber(orderNumber: number): Promise<Order | null> {
  const result = await executeSql('SELECT * FROM ORDERS WHERE order_number = ?', [orderNumber]);
  return result.rows.length === 0 ? null : orderFromRow(result.rows.item(0));
}

export async function requireOrder(id: OrderId): Promise<Order> {
  const order = await getOrderById(id);
  if (!order) {
    throw new Error(`Order ${id} does not exist.`);
  }
  return order;
}

export async function listOrders(status?: Order['status']): Promise<Order[]> {
  const result = await executeSql(
    `SELECT * FROM ORDERS${status ? ' WHERE status = ?' : ''} ORDER BY created_at DESC`,
    status ? [status] : [],
  );
  return Array.from({length: result.rows.length}, (_, index) => orderFromRow(result.rows.item(index)));
}

export async function updateOrder(id: OrderId, input: UpdateOrderInput): Promise<Order> {
  const existing = await requireOrder(id);
  const subtotal = input.subtotal ?? existing.subtotal;
  const discount = input.discount ?? existing.discount;
  const finalTotal = input.finalTotal ?? subtotal - discount;
  assertOrderTotals(subtotal, discount, finalTotal);

  await executeSql(
    `UPDATE ORDERS
     SET customer_name = ?, table_id = ?, status = ?, subtotal = ?, discount = ?, final_total = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.customerName === undefined ? existing.customerName : input.customerName,
      input.tableId === undefined ? existing.tableId : input.tableId,
      input.status ?? existing.status,
      subtotal,
      discount,
      finalTotal,
      now(),
      id,
    ],
  );

  return requireOrder(id);
}
