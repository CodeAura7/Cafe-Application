export type ProductId = number;
export type TableId = number;
export type OrderId = number;
export type OrderItemId = number;

export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type OrderStatus = 'ACTIVE' | 'COMPLETED';

export interface Product {
  id: ProductId;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CafeTable {
  id: TableId;
  tableNumber: number;
  status: TableStatus;
}

export interface Order {
  id: OrderId;
  orderNumber: number;
  customerName: string | null;
  tableId: TableId | null;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  finalTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: OrderItemId;
  orderId: OrderId;
  productId: ProductId;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  itemTotal: number;
}

export interface CreateProductInput {
  name: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  isActive?: boolean;
}

export interface UpdateTableInput {
  status: TableStatus;
}

export interface CreateOrderInput {
  orderNumber: number;
  customerName?: string | null;
  tableId?: TableId | null;
  status?: OrderStatus;
  subtotal?: number;
  discount?: number;
  finalTotal?: number;
}

export interface UpdateOrderInput {
  customerName?: string | null;
  tableId?: TableId | null;
  status?: OrderStatus;
  subtotal?: number;
  discount?: number;
  finalTotal?: number;
}

export interface CreateOrderItemInput {
  orderId: OrderId;
  productId: ProductId;
  quantity: number;
}

export interface UpdateOrderItemInput {
  quantity: number;
}
