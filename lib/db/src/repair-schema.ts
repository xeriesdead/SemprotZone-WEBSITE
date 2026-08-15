import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before repairing the schema.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(`
    ALTER TABLE "contents"
    ADD COLUMN IF NOT EXISTS "view_count" integer NOT NULL DEFAULT 0
  `);
  console.log("Verified contents.view_count exists.");
} finally {
  await pool.end();
}