import { NextResponse } from "next/server";
import type { NextApiRequest } from "next";
import { executeQuery } from "@/lib/db";

export async function GET(
  req: NextApiRequest,
  {
    params,
  }: { params: Promise<{ table: string; column: string; row: string }> }
) {
  if (req.method !== "GET") {
    return NextResponse.json(
      { message: "Metodo non consentito" },
      { status: 405 }
    );
  }

  const { table, column, row } = await params;
  if (!table || !column || !row) {
    return NextResponse.json(
      { message: "Alcuni valori sono sbagliati o mancanti" },
      { status: 403 }
    );
  }

  const [res] = await executeQuery("SELECT * FROM ? WHERE ? = ?;", [
    table,
    column,
    row,
  ]);

  return NextResponse.json({ res }, { status: 200 });
}
