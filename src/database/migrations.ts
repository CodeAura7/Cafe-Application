import type {SqlStatement} from './index';

export const LATEST_SCHEMA_VERSION = 4;

export const migrations: Record<number, readonly SqlStatement[]> = {
  1: [
    {
      sql: `CREATE TABLE IF NOT EXISTS PRODUCTS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS TABLES (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number INTEGER NOT NULL UNIQUE,
        status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'OCCUPIED'))
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS ORDERS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number INTEGER NOT NULL UNIQUE,
        customer_name TEXT,
        table_id INTEGER,
        status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED')),
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        discount REAL NOT NULL CHECK (discount >= 0 AND discount <= subtotal),
        final_total REAL NOT NULL CHECK (final_total >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (table_id) REFERENCES TABLES(id)
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name_snapshot TEXT NOT NULL,
        unit_price_snapshot REAL NOT NULL CHECK (unit_price_snapshot >= 0),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        item_total REAL NOT NULL CHECK (item_total >= 0),
        FOREIGN KEY (order_id) REFERENCES ORDERS(id),
        FOREIGN KEY (product_id) REFERENCES PRODUCTS(id)
      )`,
    },
    {
      sql: `CREATE UNIQUE INDEX IF NOT EXISTS orders_one_active_order_per_table
        ON ORDERS(table_id)
        WHERE table_id IS NOT NULL AND status = 'ACTIVE'`,
    },
    {sql: 'CREATE INDEX IF NOT EXISTS order_items_order_id ON ORDER_ITEMS(order_id)'},
    {sql: 'CREATE INDEX IF NOT EXISTS orders_status_created_at ON ORDERS(status, created_at)'},
  ],
  // Kept separate from version 1 so existing installations migrate safely.
  2: [{sql: "ALTER TABLE PRODUCTS ADD COLUMN category TEXT NOT NULL DEFAULT 'OTHERS' CHECK (category IN ('FOOD', 'BEVERAGES', 'DESSERT', 'OTHERS'))"}],
  // Preserve the category alongside the existing name and price snapshots.  Old
  // items receive the category currently attached to their product; new items
  // are permanently independent of later product edits.
  3: [
    {
      sql: "ALTER TABLE ORDER_ITEMS ADD COLUMN category_snapshot TEXT NOT NULL DEFAULT 'OTHERS' CHECK (category_snapshot IN ('FOOD', 'BEVERAGES', 'DESSERT', 'OTHERS'))",
    },
    {
      sql: `UPDATE ORDER_ITEMS
            SET category_snapshot = COALESCE(
              (SELECT category FROM PRODUCTS WHERE PRODUCTS.id = ORDER_ITEMS.product_id),
              'OTHERS'
            )`,
    },
    {sql: 'CREATE INDEX IF NOT EXISTS order_items_category_snapshot ON ORDER_ITEMS(category_snapshot)'},
  ],
  4: [
    {
      sql: `CREATE TABLE IF NOT EXISTS APP_ACCOUNT (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        user_id TEXT NOT NULL UNIQUE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        question_one TEXT NOT NULL,
        answer_one_salt TEXT NOT NULL,
        answer_one_hash TEXT NOT NULL,
        question_two TEXT NOT NULL,
        answer_two_salt TEXT NOT NULL,
        answer_two_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    },
  ],
};
