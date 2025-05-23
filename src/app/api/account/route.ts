import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DipendenteType, RuoloType } from '@/types/db';
import { UserType } from '@/types/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorizzato" },
        { status: 401 }
      );
    }

    // Query to get user and employee details including department
    const sql = `
      SELECT 
        u.id_user,
        u.username,
        u.is_admin,
        u.ultimo_accesso,
        d.id_dipendente,
        d.nome,
        d.cognome,
        d.email,
        d.ruolo,
        dip.nome as nome_dipartimento
      FROM users u
      JOIN dipendenti d ON u.id_dipendente = d.id_dipendente 
      JOIN dipartimenti dip ON d.id_dipartimento = dip.id_dipartimento
      WHERE d.email = ?
    `;

    const results = await queryDatabase(sql, [session.user.email]);

    if (!results.length) {
      return NextResponse.json(
        { message: "Utente non trovato" },
        { status: 404 }
      );
    }

    const userData = results[0] as {
      username: string;
      is_admin: boolean;
      ultimo_accesso: Date;
      nome: string;
      cognome: string;
      email: string;
      ruolo: string;
      nome_dipartimento: string;
    };

    // Format response to match expected structure
    const response: {
      user: UserType;
      dipendente: DipendenteType & { nome_dipartimento: string };
    } = {
      user: {
        // Populate UserType fields.
        // Fields available in results[0] (accessed via `userData as any` due to narrow cast)
        id_user: (userData as any).id_user,
        id_dipendente: (userData as any).id_dipendente,
        // Fields available in the explicitly typed `userData`
        username: userData.username,
        is_admin: userData.is_admin,
        ultimo_accesso: userData.ultimo_accesso.toISOString(), // Assuming userData.ultimo_accesso is always a valid Date
        // Mandatory UserType fields not available from the query:
        // These are filled with placeholders to satisfy the type.
        password_hash: "", // Sensitive data, should not be sent. Placeholder.
        is_active: true, // Assuming user is active if data is fetched. Placeholder.
        created_at: new Date(0).toISOString(), // Placeholder (Epoch time).
        // Optional fields like reset_token, updated_at are not set, which is fine.
      },
      dipendente: {
        // Populate DipendenteType fields.
        // Field available in results[0] (accessed via `userData as any`)
        id_dipendente: (userData as any).id_dipendente,
        // Fields available in the explicitly typed `userData`
        nome: userData.nome,
        cognome: userData.cognome,
        email: userData.email,
        ruolo: userData.ruolo as RuoloType, // Assuming userData.ruolo is a valid RuoloType string
        nome_dipartimento: userData.nome_dipartimento,
        // Mandatory DipendenteType field not available from the query:
        id_dipartimento: 0, // Placeholder: d.id_dipartimento is not selected in the SQL query.
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("API Error fetching account data:", error);
    return NextResponse.json(
      { message: "Errore durante il recupero dei dati dell'account." },
      { status: 500 }
    );
  }
}
