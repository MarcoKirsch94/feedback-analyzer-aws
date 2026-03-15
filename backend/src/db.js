import pg from "pg";
const { Pool } = pg;

export function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");

  const isLocal =
    url.includes("@localhost:") ||
    url.includes("@127.0.0.1:") ||
    url.includes("@db:");

  return new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
}

export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sentiment VARCHAR(16) NOT NULL,
      confidence_json JSONB NOT NULL,
      key_phrases_json JSONB NOT NULL
    );
  `);
}