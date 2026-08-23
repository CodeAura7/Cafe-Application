import {executeSql} from '../database';
import type {CreateProductInput, Product, ProductCategory, ProductId, UpdateProductInput} from '../types';

import {productFromRow} from './rowMappers';

const now = (): string => new Date().toISOString();

function assertProductInput(name: string, price: number): void {
  if (!name.trim()) {
    throw new Error('Product name is required.');
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Product price must be a non-negative number.');
  }
}

function assertCategory(category: ProductCategory): void {
  if (!['FOOD', 'BEVERAGES', 'DESSERT', 'OTHERS'].includes(category)) {
    throw new Error('Product category is invalid.');
  }
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  assertProductInput(input.name, input.price);
  assertCategory(input.category);
  const timestamp = now();
  const result = await executeSql(
    `INSERT INTO PRODUCTS (name, price, category, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.name.trim(), input.price, input.category, input.isActive === false ? 0 : 1, timestamp, timestamp],
  );
  return requireProduct(result.insertId as ProductId);
}

export async function getProductById(id: ProductId): Promise<Product | null> {
  const result = await executeSql('SELECT * FROM PRODUCTS WHERE id = ?', [id]);
  return result.rows.length === 0 ? null : productFromRow(result.rows.item(0));
}

export async function requireProduct(id: ProductId): Promise<Product> {
  const product = await getProductById(id);
  if (!product) {
    throw new Error(`Product ${id} does not exist.`);
  }
  return product;
}

export async function listProducts(activeOnly = false, category?: ProductCategory): Promise<Product[]> {
  const clauses = [activeOnly ? 'is_active = 1' : '', category ? 'category = ?' : ''].filter(Boolean);
  const result = await executeSql(
    `SELECT * FROM PRODUCTS${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''} ORDER BY name COLLATE NOCASE`,
    category ? [category] : [],
  );
  return Array.from({length: result.rows.length}, (_, index) => productFromRow(result.rows.item(index)));
}

export async function updateProduct(id: ProductId, input: UpdateProductInput): Promise<Product> {
  const existing = await requireProduct(id);
  const name = input.name === undefined ? existing.name : input.name.trim();
  const price = input.price === undefined ? existing.price : input.price;
  const category = input.category ?? existing.category;
  assertProductInput(name, price);
  assertCategory(category);

  await executeSql(
    `UPDATE PRODUCTS
     SET name = ?, price = ?, category = ?, is_active = ?, updated_at = ?
     WHERE id = ?`,
    [name, price, category, input.isActive === undefined ? (existing.isActive ? 1 : 0) : input.isActive ? 1 : 0, now(), id],
  );

  return requireProduct(id);
}
