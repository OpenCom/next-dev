import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/lib/db';
 
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
  ) {
  const { slug } = await params;

  if(typeof parseInt(slug) != 'number'){
    return NextResponse.json({ error: 'Invalid slug', example: '/api/spese/1' });
  };

  let conn: any;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`SELECT * FROM spesa WHERE id = ${slug};`);
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
