import {executeSql} from '../database';
import type {BillHistoryItem, ProductCategory, ProductSalesRow, SalesReport} from '../types';
import {orderFromRow} from './rowMappers';

const rows = (result: Awaited<ReturnType<typeof executeSql>>) => Array.from({length: result.rows.length}, (_, i) => result.rows.item(i));

export async function listCompletedBills(): Promise<BillHistoryItem[]> {
  const result = await executeSql(`SELECT ORDERS.*, TABLES.table_number FROM ORDERS
    LEFT JOIN TABLES ON TABLES.id = ORDERS.table_id WHERE ORDERS.status = 'COMPLETED' ORDER BY ORDERS.created_at DESC`);
  return rows(result).map(row => ({...orderFromRow(row), tableNumber: row.table_number === null ? null : Number(row.table_number)}));
}

export async function getSalesReport(from: string, to: string): Promise<SalesReport> {
  const totals = await executeSql(`SELECT COUNT(*) AS bill_count, COALESCE(SUM(subtotal), 0) AS gross_sales,
    COALESCE(SUM(discount), 0) AS discounts, COALESCE(SUM(final_total), 0) AS final_sales FROM ORDERS
    WHERE status = 'COMPLETED' AND created_at >= ? AND created_at < ?`, [from, to]);
  const productRows = await executeSql(`SELECT ORDER_ITEMS.category_snapshot AS category, ORDER_ITEMS.product_name_snapshot AS name,
    ORDER_ITEMS.unit_price_snapshot AS unit_price, SUM(ORDER_ITEMS.quantity) AS quantity,
    SUM(ORDER_ITEMS.item_total) AS revenue FROM ORDER_ITEMS JOIN ORDERS ON ORDERS.id = ORDER_ITEMS.order_id
    WHERE ORDERS.status = 'COMPLETED' AND ORDERS.created_at >= ? AND ORDERS.created_at < ?
    GROUP BY ORDER_ITEMS.category_snapshot, ORDER_ITEMS.product_name_snapshot, ORDER_ITEMS.unit_price_snapshot ORDER BY revenue DESC`, [from, to]);
  const total = totals.rows.item(0);
  return {billCount: Number(total.bill_count), grossSales: Number(total.gross_sales), discounts: Number(total.discounts), finalSales: Number(total.final_sales), products: mapSalesRows(rows(productRows))};
}

/**
 * Product-wise sales for a date range, optionally filtered by the product's
 * historical category and price snapshot. It deliberately never joins PRODUCTS,
 * so later menu edits cannot rewrite sales history.
 */
export async function getProductSalesReport(
  from: string,
  to: string,
  category?: ProductCategory,
): Promise<ProductSalesRow[]> {
  const categoryClause = category ? 'AND ORDER_ITEMS.category_snapshot = ?' : '';
  const params = category ? [from, to, category] : [from, to];

  const result = await executeSql(
    `SELECT ORDER_ITEMS.category_snapshot AS category, ORDER_ITEMS.product_name_snapshot AS name,
       ORDER_ITEMS.unit_price_snapshot AS unit_price, SUM(ORDER_ITEMS.quantity) AS quantity,
       SUM(ORDER_ITEMS.item_total) AS revenue
     FROM ORDER_ITEMS
     JOIN ORDERS ON ORDERS.id = ORDER_ITEMS.order_id
     WHERE ORDERS.status = 'COMPLETED' AND ORDERS.created_at >= ? AND ORDERS.created_at < ? ${categoryClause}
     GROUP BY ORDER_ITEMS.category_snapshot, ORDER_ITEMS.product_name_snapshot, ORDER_ITEMS.unit_price_snapshot
     ORDER BY revenue DESC`,
    params,
  );

  return mapSalesRows(rows(result));
}

function mapSalesRows(reportRows: Record<string, unknown>[]): ProductSalesRow[] {
  return reportRows.map(row => ({
    category: String(row.category) as ProductCategory,
    name: String(row.name),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    revenue: Number(row.revenue),
  }));
}
