import { NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';
 
export async function GET() {
  const [res] = await executeQuery('SELECT COUNT(id_user) FROM users');
  return NextResponse.json({message: 'connection successful', users: res['COUNT(id_user)']})
}
