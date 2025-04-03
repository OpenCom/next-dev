import { NextResponse } from "next/server";
import type { NextApiRequest } from 'next'
import { executeQuery } from '@/lib/db';
 
export async function GET(
    req: NextApiRequest,
    { params }: { params: Promise<{ slug: string }> }
  ) {
  const { slug } = await params;

  if (req.method !== "GET") {
    return NextResponse.json({ message: "Metodo non consentito" }, {status: 405});
  }

  if(typeof parseInt(slug) != 'number'){
    return NextResponse.json({ message: "Usare un id numerico relativo alla spesa" }, {status: 403});
  };
  
  const [res] = await executeQuery('SELECT * FROM spese WHERE id_spesa = ?',[slug]);
  return NextResponse.json({res},{status: 200});
}
