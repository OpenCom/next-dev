import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return NextResponse.json({ message: "Metodo non consentito" }, {status: 405});
  }

  const { email, password, dipendente_id, username } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "E-mail e password sono obbligatorie" });
  }

  if (!dipendente_id) {
    return res
    .status(400)
    .json({ message: "Errore: devi essere associato a un dipendente. Usa la mail aziendale." }); // invieremo a ogni user un link con il dipendente_id già impostato.
  }

  const existingUsers = await executeQuery(
    'SELECT * FROM users WHERE email = ? OR username = ? OR dipendente_id = ?',
    [email, username, dipendente_id]
  );

  if (existingUsers.length > 0) {

    let conflictField = '';
    const existingUser = existingUsers[0];
    
    if (existingUser.email === email) {
      conflictField = 'email';
    } else if (existingUser.username === username) {
      conflictField = 'username';
    } else if (existingUser.dipendente_id === dipendente_id) {
      conflictField = 'dipendente_id';
    }
    
    return res.status(409).json({ 
      error: `Un utente con questo ${conflictField} esiste già` 
    });
  }

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Store user in database
    await executeQuery(
      'INSERT INTO users (email, password, username, dipendente_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, username, dipendente_id]
    );
    
    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Errore di registrazione:', error);
    return res.status(500).json({ message: 'Errore in fase di registrazione. Non è stato posibile creare l\'utente.' });
  }

}