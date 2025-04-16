import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';


type SpeseURLParams = {
  params: {
      type: string;
      id: string;
  }
}

/**
 * Restituisce dati singola spesa in base ai parametri passati
 * @param request Oggetto request, necessario (NextRequest)
 * @param context Context object che contiene i params
 * @param context.params Parameters from the dynamic route segments
 * @param context.params.type su che tipo di query fare la richiesta
 * @param context.params.id id del tipo specificato
 * @returns JSON contenente i dati della spesa/delle
 */
export async function GET(
  request: NextRequest, // Necessario anche se non usato
  { params }: SpeseURLParams
) {
  const { type, id } = await params;
  const allowedTypes = ['all', 'employee', 'id', 'category'];

  if (!allowedTypes.includes(type)) {
    return NextResponse.json({ message: `Tipologia di richiesta non valida. Sono consentiti solo: ${allowedTypes.join(', ')}` }, { status: 403 });
  };

  if (type !== 'all' && isNaN(parseInt(id))) {
    return NextResponse.json({ message: "ID non valido. Usare un id numerico per questo tipo di richiesta." }, { status: 400 });
  };

  try {
    let query = '';
    let queryParams: string[] = [];

    switch (type) {
      case 'all':
        query = 'SELECT * FROM spese WHERE is_deleted = 0';
        break;
      case 'employee':
        query = 'SELECT * FROM spese WHERE id_dipendente = ? AND is_deleted = 0';
        queryParams = [id];
        break;
      case 'category':
        query = 'SELECT * FROM spese WHERE id_categoria = ? AND is_deleted = 0';
        queryParams = [id];
        break;
      case 'id':
        query = 'SELECT * FROM spese WHERE id_spesa = ? AND is_deleted = 0';
        queryParams = [id];
        break;
      default:
        // This case should technically not be reached due to allowedTypes check, but good for safety
        return NextResponse.json({ message: "Tipo di richiesta non gestito" }, { status: 500 });
    }

    // Execute the query
    const results = await executeQuery(query, queryParams);


    // Facci in modo che sia sempre un array
    const data = Array.isArray(results) ? results : [results];

    // If fetching by a specific ID ('id', 'employee', 'category') and no data is found
    if (type !== 'all' && (!data || (Array.isArray(data) && data.length === 0))) {
        return NextResponse.json({ message: "Nessun risultato trovato per l'ID specificato." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ message: "Errore durante il recupero dei dati dal database." }, { status: 500 });
  }
}
