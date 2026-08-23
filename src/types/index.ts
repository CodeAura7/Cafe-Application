export type ProductId = number;
export type TableId = number;
export type OrderId = number;
export type OrderItemId = number;
export type ProductCategory = 'FOOD' | 'BEVERAGES' | 'DESSERT' | 'OTHERS';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type OrderStatus = 'ACTIVE' | 'COMPLETED';

export interface Product {
  id: ProductId;
  name: string;
  price: number;
  category: ProductCategory;
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
  category: ProductCategory;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  category?: ProductCategory;
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

export interface CartItem {
  productId: ProductId;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface BillHistoryItem extends Order {
  tableNumber: number | null;
}

export interface SalesReport {
  billCount: number;
  grossSales: number;
  discounts: number;
  finalSales: number;
  products: Array<{name: string; quantity: number; revenue: number}>;
}
