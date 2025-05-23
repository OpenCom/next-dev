import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';

type TrasferteURLParams = {
  params: {
    uuid: string;
  }
}

/**
 * Restituisce i dettagli di una trasferta e le relative spese
 */
export async function GET(
  request: NextRequest,
  { params }: TrasferteURLParams
) {
  try {
    // Verify authentication
    const user = requireAuth(request);

    const { uuid } = params;

    // Get trasferta details
    const trasfertaQuery = `
      SELECT t.*, p.nome as nome_progetto, 
             CONCAT(d.nome, ' ', d.cognome) as nome_responsabile
      FROM trasferte t
      JOIN progetti p ON t.id_progetto = p.id_progetto
      JOIN dipendenti d ON t.id_responsabile = d.id_dipendente
      WHERE t.uuid_trasferta = ?
    `;

    // Get associated spese
    const speseQuery = `
      SELECT s.*, c.nome as nome_categoria,
             CONCAT(d.nome, ' ', d.cognome) as nome_dipendente
      FROM spese s
      JOIN categorie_spese c ON s.id_categoria = c.id_categoria
      JOIN dipendenti d ON s.id_dipendente = d.id_dipendente
      WHERE s.id_trasferta = (SELECT id_trasferta FROM trasferte WHERE uuid_trasferta = ?)
      AND s.is_deleted = false
      ORDER BY s.data_spesa DESC
    `;

    const trasferta = await executeQuery(trasfertaQuery, [uuid]);
    const spese = await executeQuery(speseQuery, [uuid]);

    if (!trasferta || (Array.isArray(trasferta) && trasferta.length === 0)) {
      return NextResponse.json(
        { message: "Nessuna trasferta trovata per l'UUID specificato." },
        { status: 404 }
      );
    }

    // Ensure we're returning a single trasferta object
    const trasfertaData = Array.isArray(trasferta) ? trasferta[0] : trasferta;
    
    // Ensure we're returning an array of spese
    const speseData = Array.isArray(spese) ? spese : [spese];

    return NextResponse.json({
      trasferta: trasfertaData,
      spese: speseData
    }, { status: 200 });

  } catch (error) {
    console.error("Database query failed:", error);
    if (error instanceof Error && error.message === 'Non autorizzato') {
      return NextResponse.json(
        { message: "Non autorizzato" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Errore durante il recupero dei dati dal database." },
      { status: 500 }
    );
  }
} 