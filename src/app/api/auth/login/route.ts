import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { AuthUserType } from "@/types/auth";
import { getCurrentTimestamp } from "@/lib/time";

import { useAuth } from "@/context/AuthContext";

export async function POST(req: NextRequest, res: NextResponse) {
  const { login } = useAuth();

  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Metodo non consentito" },
      { status: 405 }
    );
  }

  // Verifica che il Content-Type sia application/json
  const contentType = req.headers.get("Content-Type");
  if (contentType !== "application/json") {
    return NextResponse.json(
      { message: "Content-Type non valido" },
      { status: 415 }
    );
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { message: "Username o Password mancanti..." },
      { status: 400 }
    );
  }

  const username = email.slice(0, email.indexOf("@"));
  const existingUsers = await executeQuery(
    "SELECT * FROM user_details WHERE email = ? OR username = ?",
    [email, username]
  );
  if (existingUsers.length === 0) {
    return NextResponse.json(
      { message: "Utente non trovato" },
      { status: 404 }
    );
  }

  // Se l'utente esiste, controlla la password
  // e gestisci i tentativi di accesso
  const user = existingUsers[0];
  try {
    const isPasswordValid = await verifyPassword(password, user.passowrd);

    if (!isPasswordValid) {
      const tentativiRimanenti = user.tentativi_accesso_rimasti - 1;

      // Se i tentativi sono finiti, blocca l'account
      if (tentativiRimanenti <= 0) {
        await executeQuery(
          `UPDATE users SET is_active = FALSE WHERE user_id = ?`,
          [user.user_id]
        );
        await executeQuery(
          `UPDATE users SET tentativi_accesso_rimasti = 0 WHERE user_id = ?`,
          [user.user_id]
        );

        return NextResponse.json(
          { message: "Account bloccato, troppi tentativi errati." },
          { status: 301 }
        );
      } else {
        // Altrimenti, aggiorna i tentativi di accesso
        await executeQuery(
          `UPDATE users SET tentativi_accesso_rimasti = ? WHERE user_id = ?`,
          [tentativiRimanenti, user.user_id]
        );
        return NextResponse.json(
          {
            message: `Password errata. Tentativi rimanenti: ${tentativiRimanenti}`,
          },
          { status: 401 }
        );
      }
    }

    // Login riuscito
    // resetto l'account come attivo e rimetto i tentativi di accesso a 5
    await executeQuery(`UPDATE users SET is_active = TRUE WHERE user_id = ?`, [
      user.user_id,
    ]);
    await executeQuery(
      `UPDATE users SET tentativi_accesso_rimasti = 5 WHERE user_id = ?`,
      [user.user_id]
    );

    // Aggiorna l'ultimo accesso
    await executeQuery(
      `UPDATE users SET ultimo_accesso = ? WHERE user_id = ?`,
      [getCurrentTimestamp(), user.user_id]
    );

    // Imposta i dati di sessione
    const dati_utente: AuthUserType = await executeQuery(
      `SELECT nome, cognome, ruolo, email, is_admin, ultimo_accesso FROM user_details WHERE user_id = ?`,
      [user.user_id]
    );
    login(dati_utente);

    return NextResponse.json(
      { message: "Login effettuato con successo" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Errore del server" }, { status: 500 });
  }
}
