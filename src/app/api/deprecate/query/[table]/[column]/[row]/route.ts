import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/lib/db";

type CustomQueryURLParams = {
  params: {
    table: string;
    column: string; 
    row: string 
  }
}
export async function GET(
    request: NextRequest,
    { params }: CustomQueryURLParams
  ) {
    
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
