import type {CafeTable, Order, OrderItem, Product} from '../types';

type Row = Record<string, unknown>;

const asNumber = (value: unknown): number => Number(value);

export function productFromRow(row: Row): Product {
  return {
    id: asNumber(row.id),
    name: String(row.name),
    price: asNumber(row.price),
    isActive: asNumber(row.is_active) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function tableFromRow(row: Row): CafeTable {
  return {
    id: asNumber(row.id),
    tableNumber: asNumber(row.table_number),
    status: String(row.status) as CafeTable['status'],
  };
}

export function orderFromRow(row: Row): Order {
  return {
    id: asNumber(row.id),
    orderNumber: asNumber(row.order_number),
    customerName: row.customer_name === null ? null : String(row.customer_name),
    tableId: row.table_id === null ? null : asNumber(row.table_id),
    status: String(row.status) as Order['status'],
    subtotal: asNumber(row.subtotal),
    discount: asNumber(row.discount),
    finalTotal: asNumber(row.final_total),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function orderItemFromRow(row: Row): OrderItem {
  return {
    id: asNumber(row.id),
    orderId: asNumber(row.order_id),
    productId: asNumber(row.product_id),
    productNameSnapshot: String(row.product_name_snapshot),
    unitPriceSnapshot: asNumber(row.unit_price_snapshot),
    quantity: asNumber(row.quantity),
    itemTotal: asNumber(row.item_total),
  };
}
