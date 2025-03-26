
import { NextResponse } from "next/server";
import pool from '@/lib/db';
 
export async function GET() {
  let conn: any;
  try {
    conn = await pool.getConnection();
    const [rows1] = await conn.query('SELECT COUNT(*) AS totalTrasferte FROM trasferte');
    const [rows2] = await conn.query('SELECT SUM(quanto) AS totalSpese FROM spesa');
    
    const results = {
        totalTrasferte: rows1[0].totalTrasferte,
        totalSpese: rows2[0].totalSpese,
      };
    
    return NextResponse.json({ results });

  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }
      return NextResponse.json({ error: 'Database query failed', details: err.message });
  } finally {
    conn.release();  // Libera la connessione
}
}