import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(
  req: NextRequest
) {

  if (req.method !== "POST") {
    return NextResponse.json({ message: "Metodo non consentito" }, {status: 405});
  }
  // Verifica che il Content-Type sia application/json    
  const contentType = req.headers.get("Content-Type");
  if (contentType !== "application/json") {
    return NextResponse.json({ message: "Content-Type non valido" }, {status: 415});
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: "E-mail e password sono obbligatorie" }, {status: 400});
  }

  const datiDipendente: any[] = await executeQuery(
    'SELECT id_dipendente FROM dipendenti WHERE email = ?',
    [email]
  );

    // Verifica se il dipendente è stato trovato
    if (datiDipendente.length === 0) {
      return NextResponse.json({ message: "Errore: devi essere associato a un dipendente. Usa la mail aziendale per registrarti." }, {status: 400});
    }

  // genero l'username a partire dalla mail aziendale
  const username = email.slice(0, email.indexOf('@'));
  const id_dipendente: number = datiDipendente[0].id_dipendente;

  const existingUsers = await executeQuery(
    'SELECT * FROM user_details WHERE email = ? OR username = ? OR id_dipendente = ?',
    [email, username, id_dipendente]
  );

  if (existingUsers.length > 0) {

    let conflictFieldText = '';
    const existingUser = existingUsers[0];
    
    if (existingUser.email === email) {
      conflictFieldText = 'con questa e-mail';
    } else if (existingUser.username === username) {
      conflictFieldText = 'con questo username';
    } else if (existingUser.id_dipendente === id_dipendente) {
      conflictFieldText = 'collegato a questo dipendente';
    }
    
    return NextResponse.json({ message: `Un utente ${conflictFieldText} esiste già`}, {status: 409});
  }

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Store user in database
    await executeQuery(
      'INSERT INTO users (password_hash, username, id_dipendente) VALUES (?, ?, ?)',
      [hashedPassword, username, id_dipendente]
    );
    return NextResponse.json({ message: 'Utente creato con successo!' },{status: 200});
  } catch (error: any) {
    console.error('Errore di registrazione:', error);

    if (error.sqlState === '45000') {
      return NextResponse.json({ message: error.message || 'Errore: Il dipendente associato non esiste.' },{status: 400});
    }
    return NextResponse.json({ message: 'Errore in fase di registrazione. Non è stato posibile creare l\'utente.' },{status: 400});
  }

}