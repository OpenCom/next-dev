// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { RuoloType } from "@/types/db"; // Assicurati che il percorso sia corretto

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Corrisponde a user.id restituito da authorize
      id_dipendente: number; // O il tipo corretto di id_dipendente
      nome: string;
      email: string;
      ruolo: RuoloType;
      is_admin: boolean;
    } & DefaultSession["user"]; // Per mantenere eventuali campi di default come 'expires'
  }

  // L'oggetto User restituito dalla funzione authorize
  interface User extends DefaultUser {
    id_dipendente: number; // O il tipo corretto
    nome: string;
    // email è già in DefaultUser
    // id è già in DefaultUser (assicurati che il tipo sia stringa)
    ruolo: RuoloType;
    is_admin: boolean;
  }
}

declare module "next-auth/jwt" {
  // Il token JWT come viene codificato/decodificato
  interface JWT extends DefaultJWT {
    id: string;
    id_dipendente: number; // O il tipo corretto
    nome: string;
    // email e name sono già potenzialmente in DefaultJWT
    ruolo: RuoloType;
    is_admin: boolean;
  }
}