import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type TrasferteURLParams = {
  params: Promise<{
    id: string;
  }>
}

/**
 * Restituisce i dettagli di una trasferta e le relative spese
 * @param request Oggetto request, necessario (NextRequest)
 * @param context Context object che contiene i params
 * @param context.params Parameters from the dynamic route segments
 * @param context.params.id id della trasferta
 * @returns JSON contenente i dettagli della trasferta e le relative spese
 */
export async function GET(
  request: NextRequest,
  { params }: TrasferteURLParams
) {
  const { id } = await params;

  if (isNaN(parseInt(id))) {
    return NextResponse.json(
      { message: "ID non valido. Usare un id numerico." },
      { status: 400 }
    );
  }

  try {
    // Get trasferta details
    const trasfertaQuery = `
      SELECT t.*, p.nome as nome_progetto, 
             CONCAT(d.nome, ' ', d.cognome) as nome_responsabile
      FROM trasferte t
      JOIN progetti p ON t.id_progetto = p.id_progetto
      JOIN dipendenti d ON t.id_responsabile = d.id_dipendente
      WHERE t.id_trasferta = ?
    `;

    // Get associated spese
    const speseQuery = `
      SELECT s.*, c.nome as nome_categoria,
             CONCAT(d.nome, ' ', d.cognome) as nome_dipendente
      FROM spese s
      JOIN categorie_spese c ON s.id_categoria = c.id_categoria
      JOIN dipendenti d ON s.id_dipendente = d.id_dipendente
      WHERE s.id_trasferta = ? AND s.is_deleted = false
      ORDER BY s.data_spesa DESC
    `;

    const trasferta = await executeQuery(trasfertaQuery, [id]);
    const spese = await executeQuery(speseQuery, [id]);

    if (!trasferta || (Array.isArray(trasferta) && trasferta.length === 0)) {
      return NextResponse.json(
        { message: "Nessuna trasferta trovata per l'ID specificato." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      trasferta: Array.isArray(trasferta) ? trasferta[0] : trasferta,
      spese: Array.isArray(spese) ? spese : [spese]
    }, { status: 200 });

  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { message: "Errore durante il recupero dei dati dal database." },
      { status: 500 }
    );
  }
} 


export async function PUT(request: NextRequest, { params }: TrasferteURLParams) {

  const { id } = await params;
  const data = await request.json();

  // controlla che l'utente sia loggato
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Utente non autenticato" }, { status: 401 });
  }

  try {
    const trasfertaQuery = `
      UPDATE trasferte 
      SET ? 
      WHERE id_trasferta = ?
    `;

    const trasferta = await executeQuery(trasfertaQuery, [data, id]);

    return NextResponse.json({ message: "Trasferta aggiornata con successo" }, { status: 200 });

  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { message: "Errore durante l'aggiornamento della trasferta." },
      { status: 500 }
    );
  }
}