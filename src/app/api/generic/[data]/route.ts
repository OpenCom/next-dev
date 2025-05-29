import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Lista delle tabelle consentite per le query generiche
const ALLOWED_TABLES = ['dipendenti', 'progetti', 'categorie', 'spese'] as const;
type AllowedTable = typeof ALLOWED_TABLES[number];

type CustomQueryURLParams = {
  params: Promise<{
    data: string;
  }>
}

export async function GET(
  request: NextRequest,
  { params }: CustomQueryURLParams
) {
  try {
    // controlla che l'utente sia loggato
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Utente non autenticato" }, { status: 401 });
    }

    const { data } = await params;
    if (!data) {
      return NextResponse.json(
        { message: "Manca il valore da cercare" },
        { status: 400 }
      );
    }

    // Verifica che la tabella richiesta sia tra quelle consentite
    if (!ALLOWED_TABLES.includes(data as AllowedTable)) {
      return NextResponse.json(
        { message: "Tabella non consentita" },
        { status: 403 }
      );
    }

    // Esegui la query in modo sicuro
    const res = await executeQuery(`SELECT * FROM ${data};`);

    return NextResponse.json({ res }, { status: 200 });
  } catch (error) {
    console.error('Error in generic route:', error);
    return NextResponse.json(
      { message: "Errore durante l'elaborazione della richiesta" },
      { status: 500 }
    );
  }
}
