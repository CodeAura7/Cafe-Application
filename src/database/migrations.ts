import type {SqlStatement} from './index';

export const LATEST_SCHEMA_VERSION = 1;

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
};
