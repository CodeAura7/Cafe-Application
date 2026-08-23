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
    databasePromise = SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });
  }

  return databasePromise as Promise<Database>;
}

export async function executeSql(
  sql: string,
  params: readonly unknown[] = [],
): Promise<SqlResult> {
  const database = await getDatabase();
  const results = await database.executeSql(sql, [...params]);

  return results[0] as unknown as SqlResult;
}

export async function runInTransaction(
  statements: readonly SqlStatement[],
): Promise<void> {
  const database = await getDatabase();

  await new Promise<void>((resolve, reject) => {
    database.transaction(
      (
        transaction: {
          executeSql: (
            sql: string,
            params: unknown[],
          ) => void;
        },
      ) => {
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

  for (
    let version = currentVersion + 1;
    version <= LATEST_SCHEMA_VERSION;
    version += 1
  ) {
    const migration = migrations[version];

    if (!migration) {
      throw new Error(
        `Missing database migration for version ${version}.`,
      );
    }

    await runInTransaction(migration);

    // This driver requires PRAGMA statements to run directly on the database,
    // rather than within a transaction callback.
    await executeSql(
      `PRAGMA user_version = ${version}`,
    );
  }
}

/** Opens the local database, enforces foreign keys, and applies pending migrations once. */
export function initializeDatabase(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await getDatabase();
      await executeSql('PRAGMA foreign_keys = ON');
      await migrateDatabase();
      await seedInitialData();
    })().catch(error => {
      initializationPromise = undefined;
      throw error;
    });
  }

  return initializationPromise;
}

const initialProducts: ReadonlyArray<
  [string, number, string]
> = [
  ['Time Pass', 50, 'FOOD'],
  ['Spicy Pav Patty', 70, 'FOOD'],
  ['Monaco Bites (8pcs)', 100, 'FOOD'],
  ['Cheesy Pocket (4pcs)', 120, 'FOOD'],
  ['Korean Bun', 120, 'FOOD'],
  ['Peri Peri Korean Bun', 140, 'FOOD'],
  ['Falafel Burger', 140, 'FOOD'],
  ['Garlic Toast (2 pcs)', 50, 'FOOD'],
  ['Malai Toast (2pcs)', 70, 'FOOD'],
  ['Hydrebadi Masala Toast', 80, 'FOOD'],
  ['Creamy Open Toast', 80, 'FOOD'],
  ['Paneer Panini', 90, 'FOOD'],
  ['Coleslaw Basket (6 pcs)', 130, 'FOOD'],
  ['Garlic Sticks with Cream Cheese', 100, 'FOOD'],
  ['Veggie Delight Cracker Pizza', 200, 'FOOD'],
  ['Tandoori Paneer Cracker Pizza', 200, 'FOOD'],

  ['Kalakhatta Tiktok', 80, 'BEVERAGES'],
  ['Bubble Gum Kiddie', 80, 'BEVERAGES'],
  ['Cranberry Castle', 80, 'BEVERAGES'],
  ['Blue Lagoon Sapphire', 80, 'BEVERAGES'],
  ['Green Apple Fizzy', 80, 'BEVERAGES'],
  ['Banarasi Lemon Tea (Tamtam)', 40, 'BEVERAGES'],
  ['Haldi Badam Milk', 50, 'BEVERAGES'],
  ['Coffee Kiss', 60, 'BEVERAGES'],
  ['Black Coffee Mojito', 80, 'BEVERAGES'],
  ['Cold Coffee Mocha', 100, 'BEVERAGES'],
  ['Chilled Dry Fruit Milkshake', 90, 'BEVERAGES'],
  ['Strawberry Boba Shake', 190, 'BEVERAGES'],
  ['Cranberry Boba Shake', 190, 'BEVERAGES'],
  ['Blueberry Boba Shake', 190, 'BEVERAGES'],

  ['Extra Amul Cheese', 30, 'OTHERS'],
];

async function seedInitialData(): Promise<void> {
  const timestamp = new Date().toISOString();

  const productStatements: SqlStatement[] =
    initialProducts.map(
      ([name, price, category]) => ({
        sql: `INSERT INTO PRODUCTS (name, price, category, is_active, created_at, updated_at)
              SELECT ?, ?, ?, 1, ?, ? WHERE NOT EXISTS (SELECT 1 FROM PRODUCTS WHERE name = ?)`,
        params: [
          name,
          price,
          category,
          timestamp,
          timestamp,
          name,
        ],
      }),
    );

  const tableStatements: SqlStatement[] =
    Array.from(
      {length: 20},
      (_, index) => index + 1,
    ).map(tableNumber => ({
      sql: 'INSERT INTO TABLES (table_number, status) SELECT ?, \'AVAILABLE\' WHERE NOT EXISTS (SELECT 1 FROM TABLES WHERE table_number = ?)',
      params: [tableNumber, tableNumber],
    }));

  await runInTransaction([
    ...productStatements,
    ...tableStatements,
  ]);
}