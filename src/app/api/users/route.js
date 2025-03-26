import { NextResponse } from "next/server";
import pool from '@/lib/db';
 
export async function GET() {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM `users`');
    return NextResponse.json({rows});
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }
    return NextResponse.json({ error: 'Database query failed', details: err.message });
  } finally {
    conn.release();  // Libera la connessione
  }
}


