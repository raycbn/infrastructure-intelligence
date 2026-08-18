import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getPool(): Pool {
  if (globalForDb.pool) return globalForDb.pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required at runtime");
  const created = new Pool({ connectionString, max: 10 });
  if (process.env.NODE_ENV !== "production") globalForDb.pool = created;
  return created;
}

function getDatabase() {
  database ??= drizzle(getPool(), { schema });
  return database;
}

// Importing this module is safe during build. The pool and Drizzle client are
// created only when application code actually performs a database operation.
export const pool = new Proxy({} as Pool, { get(_target, property) {
  const value = Reflect.get(getPool(), property);
  return typeof value === "function" ? value.bind(getPool()) : value;
} });
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, { get(_target, property) {
  const client = getDatabase();
  const value = Reflect.get(client, property);
  return typeof value === "function" ? value.bind(client) : value;
} });
