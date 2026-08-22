import SQLite from 'react-native-sqlite-storage';

import {LATEST_SCHEMA_VERSION, migrations} from './migrations';

export const DATABASE_NAME = 'cafe-pos.db';

export interface SqlStatement {
  sql: string;
  params?: readonly unknown[];
}

export interface SqlResult {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item(index: number): Record<string, unknown>;
  };
}

type Database = Awaited<ReturnType<typeof SQLite.openDatabase>>;

SQLite.enablePromise(true);

let databasePromise: Promise<Database> | undefined;
let initializationPromise: Promise<void> | undefined;

export function getDatabase(): Promise<Database> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabase({name: DATABASE_NAME, location: 'default'});
  }

  return databasePromise;
}

export async function executeSql(sql: string, params: readonly unknown[] = []): Promise<SqlResult> {
  const database = await getDatabase();
  const results = await database.executeSql(sql, [...params]);
  return results[0] as unknown as SqlResult;
}

export async function runInTransaction(statements: readonly SqlStatement[]): Promise<void> {
  const database = await getDatabase();

  await new Promise<void>((resolve, reject) => {
    database.transaction(
      transaction => {
        statements.forEach(({sql, params = []}) => {
          transaction.executeSql(sql, [...params]);
        });
      },
      reject,
      resolve,
    );
  });
}

async function getSchemaVersion(): Promise<number> {
  const result = await executeSql('PRAGMA user_version');
  return Number(result.rows.item(0).user_version);
}

async function migrateDatabase(): Promise<void> {
  const currentVersion = await getSchemaVersion();

  if (currentVersion > LATEST_SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than this application supports.`,
    );
  }

  for (let version = currentVersion + 1; version <= LATEST_SCHEMA_VERSION; version += 1) {
    const migration = migrations[version];
    if (!migration) {
      throw new Error(`Missing database migration for version ${version}.`);
    }

    await runInTransaction(migration);
    // This driver requires PRAGMA statements to run directly on the database,
    // rather than within a transaction callback.
    await executeSql(`PRAGMA user_version = ${version}`);
  }
}

/** Opens the local database, enforces foreign keys, and applies pending migrations once. */
export function initializeDatabase(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await getDatabase();
      await executeSql('PRAGMA foreign_keys = ON');
      await migrateDatabase();
    })().catch(error => {
      initializationPromise = undefined;
      throw error;
    });
  }

  return initializationPromise;
}
