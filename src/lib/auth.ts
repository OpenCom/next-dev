import bcrypt from "bcryptjs";
import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtOptions, JwtPayload, AuthUserType, UserType, DipendenteType } from "@/types"; // Assicurati che questi tipi siano corretti
import { NextAuthOptions, User as NextAuthUser } from "next-auth"; // Importa User da next-auth se necessario per type hinting
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "./db";
import { RuoloType } from "@/types/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("[AUTHORIZE] Tentativo di autorizzazione con:", credentials);
        if (!credentials?.username || !credentials?.password) {
          console.error("[AUTHORIZE] Username o password mancanti");
          throw new Error('Username e password sono obbligatori');
        }

        try {
          const query = `
            SELECT u.*, d.id_dipendente, d.nome, d.cognome, d.email, d.ruolo
            FROM users u
            JOIN dipendenti d ON u.id_dipendente = d.id_dipendente
            WHERE u.username = ? AND u.is_active = 1
          `;
          const users = await executeQuery(query, [credentials.username]);
          console.log("[AUTHORIZE] Utenti dal DB:", users);

          if (!users || (Array.isArray(users) && users.length === 0)) {
            console.warn("[AUTHORIZE] Utente non trovato o array vuoto.");
            // Restituire null qui fa fallire il login senza reindirizzare alla pagina di errore
            // Se vuoi reindirizzare alla pagina di errore, lancia un errore.
            // throw new Error('Credenziali non valide - utente non trovato');
            return null;
          }

          const userFromDb = Array.isArray(users) ? users[0] : users;
          console.log("[AUTHORIZE] Utente trovato nel DB:", userFromDb);

          const isValid = await bcrypt.compare(credentials.password, userFromDb.password_hash);
          console.log("[AUTHORIZE] Password valida:", isValid);

          if (!isValid) {
            console.warn("[AUTHORIZE] Password non valida.");
            // throw new Error('Credenziali non valide - password errata');
            return null;
          }

          // Assicurati che i campi esistano e abbiano valori validi
          if (userFromDb.id_dipendente == null || !userFromDb.nome || !userFromDb.email) {
             console.error("[AUTHORIZE] Dati utente mancanti o non validi dal DB:", userFromDb);
             // throw new Error('Dati utente incompleti dal database.');
             return null;
          }

          const userToReturn = {
            id: userFromDb.id_dipendente.toString(), // NextAuth si aspetta `id` come stringa
            id_dipendente: userFromDb.id_dipendente,
            nome: userFromDb.nome,
            email: userFromDb.email,
            ruolo: userFromDb.ruolo as RuoloType, // Assicurati che RuoloType sia corretto
            is_admin: Boolean(userFromDb.is_admin) // Converti in booleano esplicitamente
          };
          console.log("[AUTHORIZE] Oggetto utente restituito:", userToReturn);
          return userToReturn;

        } catch (error) {
          console.error("[AUTHORIZE] Errore durante l'autorizzazione:", error);
          // Lanciare l'errore qui reindirizzerà alla pagina di errore configurata
          throw new Error('Errore interno durante l\'autorizzazione');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("[JWT CALLBACK] Input:", { token, user, account, isNewUser });
      // 'user' è l'oggetto restituito da 'authorize' e viene passato solo al primo login.
      if (user) {
        token.id = user.id; // Questo 'id' è quello che abbiamo mappato da id_dipendente
        token.id_dipendente = user.id_dipendente;
        token.nome = user.nome;
        token.email = user.email; // Assicurati che 'user' abbia 'email'
        token.ruolo = user.ruolo;
        token.is_admin = user.is_admin;
      }
      console.log("[JWT CALLBACK] Token restituito:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("[SESSION CALLBACK] Input:", { session, token });
      // 'token' è il JWT restituito dal callback 'jwt'.
      // 'session.user' di default potrebbe avere solo { name, email, image }.
      if (token && session.user) { // Assicurati che session.user esista
        session.user.id = parseInt(token.id); // Assicurati che token.id sia un numero
        session.user.id_dipendente = token.id_dipendente as number;
        session.user.nome = token.nome as string;
        session.user.email = token.email as string; // Assicurati che token.email esista
        session.user.ruolo = token.ruolo as RuoloType;
        session.user.is_admin = token.is_admin as boolean;
      } else if (token) { // Fallback nel caso session.user non sia inizializzato
        session.user = {
          id: parseInt(token.id),
          id_dipendente: token.id_dipendente as any,
          nome: token.nome as string,
          email: token.email as string,
          ruolo: token.ruolo as RuoloType,
          is_admin: token.is_admin as boolean,
        };
      }
      console.log("[SESSION CALLBACK] Sessione restituita:", session);
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error', // Pagina per mostrare errori (es. credenziali errate se `authorize` lancia un errore)
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ore
  },
  secret: JWT_SECRET, // Cruciale per la strategia JWT
  debug: process.env.NODE_ENV === 'development', // Abilita log dettagliati da NextAuth
};

export async function verifyPassword(password: string, hashedPassword: string) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

/**
 * Creates a JWT token
 * @param payload The data to be encoded in the token
 * @param options JWT sign options
 * @returns The generated JWT token
 */
export function createToken(
  payload: JwtPayload, 
  options: SignOptions = {}
): string {
  const defaultOptions: SignOptions = { 
    expiresIn: '24h'
  };
  
  const tokenOptions: SignOptions = { ...defaultOptions, ...options };
  
  return jwt.sign(payload, JWT_SECRET, tokenOptions);
}

/**
 * Verifies a JWT token
 * @param token The token to verify
 * @returns The decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null; // Invalid token
  }
}