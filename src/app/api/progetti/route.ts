import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id_progetto: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Utente non autenticato" }, { status: 401 });
  }

  const { id_progetto } = await params;
  const progetto = await queryDatabase(`SELECT * FROM progetti where id_progetto = ?`, [id_progetto]);
  return NextResponse.json(progetto);
}

export async function POST(request: Request) {
  // controlla che l'utente sia loggato
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Utente non autenticato" }, { status: 401 });
  }

  try {
    const { nome, acronimo, codice_progetto, centro_costo, data_inizio, data_fine } = await request.json();

    const sql = `
      INSERT INTO progetti (
        nome, 
        acronimo,
        codice_progetto,
        centro_costo,
        data_inizio, 
        data_fine
      )
      VALUES (
        ?, ?, ?, ?, ?, ?
      );
    `;

    await queryDatabase(sql, [nome, acronimo, codice_progetto, centro_costo, data_inizio, data_fine]);
    
    return NextResponse.json({ message: "Progetto creato con successo" });

  } catch (error) {
    console.error("API Error creating project:", error);
    return NextResponse.json(
      { message: "Errore durante la creazione del progetto." },
      { status: 500 }
    );
  }
}