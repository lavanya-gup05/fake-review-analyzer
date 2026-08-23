import { Pool } from "pg";

// Reuse the pool across hot-reloads in dev so we don't open a new connection
// per request; Next.js dev server re-evaluates modules on every change.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Render's managed Postgres requires SSL but uses a self-signed chain
    // from the client's point of view — this is Render's own documented
    // setting for connecting from an app, not a general-purpose relaxation.
    ssl: process.env.DATABASE_URL?.includes("render.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

let initialized = false;

/**
 * Returns a ready-to-query pool, creating the analyzed_reviews table on
 * first use if it doesn't exist yet. Safe to call on every request —
 * CREATE TABLE IF NOT EXISTS is a no-op after the first successful run.
 */
export async function getPool() {
  if (!initialized) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analyzed_reviews (
        id SERIAL PRIMARY KEY,
        review_text TEXT NOT NULL,
        product_name TEXT,
        product_type TEXT,
        prediction TEXT NOT NULL,
        label INTEGER NOT NULL,
        confidence NUMERIC NOT NULL,
        risk_level TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    initialized = true;
  }
  return pool;
}
