import {executeSql} from '../database';
import type {CreateOrderItemInput, OrderItem, OrderItemId, OrderId, UpdateOrderItemInput} from '../types';

import {requireProduct} from './productsRepository';
import {orderItemFromRow} from './rowMappers';

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Order item quantity must be a positive whole number.');
  }
}

export async function createOrderItem(input: CreateOrderItemInput): Promise<OrderItem> {
  assertQuantity(input.quantity);
  const product = await requireProduct(input.productId);
  if (!product.isActive) {
    throw new Error('Inactive products cannot be added to an order.');
  }

  const result = await executeSql(
    `INSERT INTO ORDER_ITEMS
      (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, item_total)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.orderId, product.id, product.name, product.price, input.quantity, product.price * input.quantity],
  );
  return requireOrderItem(result.insertId as OrderItemId);
}

export async function getOrderItemById(id: OrderItemId): Promise<OrderItem | null> {
  const result = await executeSql('SELECT * FROM ORDER_ITEMS WHERE id = ?', [id]);
  return result.rows.length === 0 ? null : orderItemFromRow(result.rows.item(0));
}

export async function requireOrderItem(id: OrderItemId): Promise<OrderItem> {
  const item = await getOrderItemById(id);
  if (!item) {
    throw new Error(`Order item ${id} does not exist.`);
  }
  return item;
}

export async function listOrderItems(orderId: OrderId): Promise<OrderItem[]> {
  const result = await executeSql('SELECT * FROM ORDER_ITEMS WHERE order_id = ? ORDER BY id', [orderId]);
  return Array.from({length: result.rows.length}, (_, index) => orderItemFromRow(result.rows.item(index)));
}

export async function updateOrderItem(id: OrderItemId, input: UpdateOrderItemInput): Promise<OrderItem> {
  assertQuantity(input.quantity);
  const existing = await requireOrderItem(id);
  await executeSql(
    'UPDATE ORDER_ITEMS SET quantity = ?, item_total = ? WHERE id = ?',
    [input.quantity, existing.unitPriceSnapshot * input.quantity, id],
  );
  return requireOrderItem(id);
}
