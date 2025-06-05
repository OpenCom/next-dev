import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import type { TrasfertaType } from '@/types/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() { //request: Request
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


export async function POST(request: Request) {
  // controlla che l'utente sia loggato
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Utente non autenticato" }, { status: 401 });
  }

  try {
    const { luogo, data_inizio, data_fine, budget, motivo_viaggio, note, id_progetto, id_responsabile } = await request.json();

    const sql = `
      INSERT INTO trasferte (
        uuid_trasferta,
        luogo, 
        data_inizio, 
        data_fine, 
        budget, 
        motivo_viaggio, 
        note, 
        id_progetto, 
        id_responsabile
      )
      VALUES (
        UUID(),
        ?, ?, ?, ?, ?, ?, ?, ?
      );
    `;

    queryDatabase(sql, [luogo, data_inizio, data_fine, budget, motivo_viaggio, note, id_progetto, id_responsabile]);
    
    return NextResponse.json({ message: "Trasferta creata con successo" });

  } catch (error) {
    console.error("API Error creating business trip:", error);
    return NextResponse.json(
      { message: "Errore durante la creazione della trasferta." },
      { status: 500 }
    );
  }
}