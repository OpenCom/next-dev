import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import type { TrasfertaType } from '@/types/db';

export async function GET(request: Request) {
  try {
    const sql = `
      SELECT 
        t.id_trasferta,
        t.luogo,
        t.data_inizio,
        t.data_fine,
        t.budget,
        t.motivo_viaggio,
        t.note,
        p.nome AS nome_progetto,
        CONCAT(d.nome, ' ', d.cognome) AS nome_responsabile
      FROM trasferte t
      JOIN progetti p ON t.id_progetto = p.id_progetto
      JOIN dipendenti d ON t.id_responsabile = d.id_dipendente
      ORDER BY t.data_inizio DESC;
    `;

    const trasferte = await queryDatabase<TrasfertaType & { nome_progetto: string; nome_responsabile: string }>(sql);

    return NextResponse.json(trasferte);

  } catch (error) {
    console.error("API Error fetching business trips:", error);
    return NextResponse.json(
      { message: "Errore durante il recupero delle trasferte." },
      { status: 500 }
    );
  }
} 