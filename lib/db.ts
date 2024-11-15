// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
@typescript-eslint/no-explicit-any
export const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res;
};

