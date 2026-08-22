import {executeSql} from '../database';
import type {CafeTable, TableId, UpdateTableInput} from '../types';

import {tableFromRow} from './rowMappers';

export async function getTableById(id: TableId): Promise<CafeTable | null> {
  const result = await executeSql('SELECT * FROM TABLES WHERE id = ?', [id]);
  return result.rows.length === 0 ? null : tableFromRow(result.rows.item(0));
}

export async function getTableByNumber(tableNumber: number): Promise<CafeTable | null> {
  const result = await executeSql('SELECT * FROM TABLES WHERE table_number = ?', [tableNumber]);
  return result.rows.length === 0 ? null : tableFromRow(result.rows.item(0));
}

export async function listTables(): Promise<CafeTable[]> {
  const result = await executeSql('SELECT * FROM TABLES ORDER BY table_number');
  return Array.from({length: result.rows.length}, (_, index) => tableFromRow(result.rows.item(index)));
}

export async function updateTable(id: TableId, input: UpdateTableInput): Promise<CafeTable> {
  await executeSql('UPDATE TABLES SET status = ? WHERE id = ?', [input.status, id]);
  const table = await getTableById(id);
  if (!table) {
    throw new Error(`Table ${id} does not exist.`);
  }
  return table;
}
