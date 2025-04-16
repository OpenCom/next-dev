import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { getCurrentTimestampMySQL } from "@/lib/time";
import { AuthUserType } from "@/types/auth";
import { cookies } from 'next/headers';


export async function POST(req: NextRequest) {

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

  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Email/Username o Password mancanti..." },
      { status: 204 }
    );
  }

  try {

    const authData = await authenticateUser(identifier, password);
    const { user } = authData;
    
    if (!user) {
      return NextResponse.json(
        { message: authData.message },
        { status: authData.status }
      );
    }

    const cookieStore = await cookies()
    const token = createToken({
      user : {
        email: user.email,
        ruolo: user.ruolo,
        nome: user.nome,
        cognome: user.cognome,
        // ultimo_accesso: user.ultimo_accesso,
        is_admin: user.is_admin,
        id_dipendente: user.id_dipendente
      }
    });
    
    // Set the token as an HTTP-only cookie
    cookieStore.set('userData', token, {
      httpOnly: false, // accessibile da js
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 1 day in seconds
    });

    return NextResponse.json(
      { message: 'Login effettuato con successo', user },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Errore del server" }, { status: 500 });
  }
}


/**
 * Autentica un utente usando email/username e password
 * @param identifier Email o username dell'utente
 * @param password Password dell'utente
 * @returns I dati dell'utente o null se l'autenticazione fallisce
 */

export async function authenticateUser(
  identifier: string,
  password: string
): Promise<{message: string, status: number, user: AuthUserType | null}> {
  
  // Controllo se l'utente ha passato una mail o un username
  let username = identifier.trim().toLowerCase();
  if (username.indexOf("@") !== -1) {
    // Se c'è la @, allora è una mail
    username = username.split("@")[0];
  }

  /**
   * ==== ATTENZIONE: ====
   * Se l'utente ha cambiato email e usa la mail al posto dello username, in caso non sia stato aggiornato anche lo username in base alla nuova mail l'utente no viene trovato. Si può risolvere in vari modi, al momento non è una priorità.
   */
  const existingUsers = await executeQuery(
    `SELECT * FROM users WHERE username = ?`, [username]
  );

  if (existingUsers.length === 0) {
    return {
      message: "Utente non trovato",
      status: 401,
      user: null,
    };
  }
  // Se l'utente esiste, controllo la password e gestisco i tentativi di accesso
  const user = existingUsers[0];
  
  console.log(user);
  try {

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      const tentativiRimanenti = user.tentativi_accesso_rimasti - 1;
      // Se i tentativi sono finiti, blocca l'account
      if (tentativiRimanenti <= 0) {
        await executeQuery(
          `UPDATE users SET is_active = FALSE WHERE id_user = ?`,
          [user.id_user]
        );
        await executeQuery(
          `UPDATE users SET tentativi_accesso_rimasti = 0 WHERE id_user = ?`,
          [user.id_user]
        );

        return { 
          message: "Account bloccato, troppi tentativi errati.", 
          status: 301,
          user: null
        }
      } else {
        // Altrimenti, aggiorna i tentativi di accesso
        await executeQuery(
          `UPDATE users SET tentativi_accesso_rimasti = ? WHERE id_user = ?`,
          [tentativiRimanenti, user.id_user]
        );
        return {
          message: `Password errata. Tentativi rimanenti: ${tentativiRimanenti}`,
          status: 401,
          user: null,
        };
        
      }
    }

    // Login riuscito
    // resetto l'account come attivo e rimetto i tentativi di accesso a 5
    await executeQuery(`UPDATE users SET is_active = TRUE WHERE id_user = ?`, [
      user.id_user,
    ]);
    await executeQuery(
      `UPDATE users SET tentativi_accesso_rimasti = 5 WHERE id_user = ?`,
      [user.id_user]
    );

    // Aggiorna l'ultimo accesso
    await executeQuery(
      `UPDATE users SET ultimo_accesso = ? WHERE id_user = ?`,
      [getCurrentTimestampMySQL(), user.id_user]
    );

    // Ottengo i dati utente
    const userDetails = await executeQuery(
      `SELECT * FROM user_details WHERE id_user = ?`,
      [user.id_user]
    );

    // Se l'utente esiste, restituisco i dettagli
    if (userDetails && userDetails.length > 0) {
      return {
        message: `Ciao, ${userDetails[0].nome}!`,
        status: 200,
        user: userDetails[0] as AuthUserType
      }
    }

    return {
      message: "Errore durante la verifica della password",
      status: 500,
      user: null,
    }

  } catch (error) {
    // errore generico
    console.error("Errore di autenticazione:", error);
    return {
      message: "Si è verificato un errore durante l'accesso.",
      status: 500,
      user: null,
    }
  }
}