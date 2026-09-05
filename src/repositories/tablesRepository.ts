import {executeSql} from '../database';
import type {CafeTable, TableId, UpdateTableInput} from '../types';

import {tableFromRow} from './rowMappers';

export async function getTableById(id: TableId): Promise<CafeTable | null> {
  const result = await executeSql(tableQuery('WHERE TABLES.id = ?'), [id]);
  return result.rows.length === 0 ? null : tableFromRow(result.rows.item(0));
}

export async function getTableByNumber(tableNumber: number): Promise<CafeTable | null> {
  const result = await executeSql(tableQuery('WHERE TABLES.table_number = ?'), [tableNumber]);
  return result.rows.length === 0 ? null : tableFromRow(result.rows.item(0));
}

export async function listTables(): Promise<CafeTable[]> {
  const result = await executeSql(`${tableQuery()} ORDER BY TABLES.table_number`);
  return Array.from({length: result.rows.length}, (_, index) => tableFromRow(result.rows.item(index)));
}

/** Tables are a projection of active orders; TABLES.status is maintained only
 * for compatibility with existing installations and must not be the source of truth. */
function tableQuery(where = ''): string {
  return `SELECT TABLES.id, TABLES.table_number,
    CASE WHEN active_order.id IS NULL THEN 'AVAILABLE' ELSE 'OCCUPIED' END AS status,
    active_order.id AS active_order_id, active_order.customer_name
    FROM TABLES
    LEFT JOIN ORDERS AS active_order
      ON active_order.table_id = TABLES.id AND active_order.status = 'ACTIVE'
    ${where}`;
}

export async function updateTable(id: TableId, input: UpdateTableInput): Promise<CafeTable> {
  await executeSql('UPDATE TABLES SET status = ? WHERE id = ?', [input.status, id]);
  const table = await getTableById(id);
  if (!table) {
    throw new Error(`Table ${id} does not exist.`);
  }
  return table;
}
