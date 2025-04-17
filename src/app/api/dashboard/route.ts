import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT
          (SELECT COUNT(*) FROM trasferte) AS totalTrasferte,
          (SELECT SUM(importo) FROM spese) AS totalSpese;
    `;

    const results = await executeQuery(query);
    const data = results[0]; // Get the first (and only) row

    // Handle potential null if spese table is empty or all importo are NULL
    if (data && data.totalSpese === null) {
        data.totalSpese = 0; // Set sum to 0 if it's null
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ message: "Errore durante il recupero delle statistiche dal database." }, { status: 500 });
  }
}