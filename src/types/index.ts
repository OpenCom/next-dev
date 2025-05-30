import { GridRenderCellParams } from "@mui/x-data-grid";
import jwt from "jsonwebtoken";

// Database Types
export type DipendenteType = {
  id_dipendente: number;
  id_dipartimento: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'responsabile' | 'dipendente' | 'contabile' | 'esterno';
};

export type UserType = {
  id_user: number;
  username: string;
  password_hash: string;
  id_dipendente: number;
  is_admin: boolean;
  ultimo_accesso?: string;
  reset_token?: string;
  reset_token_expiry?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export type ProgettoType = {
  id_progetto: number;
  nome: string;
  data_inizio: string;
  data_fine?: string;
};

export type CategoriaSpesaType = {
  id_categoria: number;
  nome: string;
};

export type TrasfertaType = {
  id_trasferta: number;
  id_progetto: number;
  luogo: string;
  data_inizio: string;
  data_fine?: string;
  id_responsabile: number;
  budget: number;
  motivo_viaggio?: string;
  note?: string;
};

export type TrasfertaPartecipantiType = {
  id_trasferta: number;
  id_dipendente: number;
};

export type SpesaType = {
  id_spesa: number;
  uuid_spesa: string;
  id_trasferta: number;
  id_categoria: number;
  id_dipendente: number;
  data_spesa: string;
  descrizione: string;
  importo: number;
  scontrino_url?: string;
  stato_approvazione: 'presentata' | 'approvata' | 'respinta';
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type ApprovazioneType = {
  id_approvazione: number;
  id_spesa: number;
  id_responsabile: number;
  stato: 'approvata' | 'respinta';
  motivazione: string;
  data_approvazione: string;
};

// Extended Types with Additional Details
export interface TrasfertaWithDetails extends TrasfertaType {
  nome_progetto: string;
  nome_responsabile: string;
  uuid_trasferta: string;
}

export interface SpesaWithDetails extends Omit<SpesaType, 'importo' | 'scontrino_url'> {
  importo: string;
  scontrino_url: string | null;
  nome_categoria: string;
  nome_dipendente: string;
}

export interface NewSpesa extends Omit<SpesaType, 'id_spesa' | 'uuid_spesa' | 'created_at'> {}

export type SpesaConCategoria = {
  uuid_spesa: string;
  nome_trasferta: string;
  nome_categoria: string;
  descrizione: string;
  data_spesa: string;
  importo: number;
  stato_approvazione: 'presentata' | 'approvata' | 'respinta';
  scontrino_url: string | null;
};

// Auth Types
export interface AuthUserType extends Pick<DipendenteType, 'nome' | 'ruolo' | 'email' | 'id_dipendente'>, Pick<UserType, 'is_admin'> {id: number} 

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUserType | null;
  isLoading: boolean;
  login: (userData: AuthUserType) => void;
  logout: () => void;
}

export interface AuthFormDataType {
  password: string;
}

export interface AuthFormDataType_Login extends AuthFormDataType {
  identifier: string;
}

export interface AuthFormDataType_Register extends AuthFormDataType {
  email: string;
}

// Component Props Types
export interface SpeseGridProps {
  spese: SpesaWithDetails[];
  loading?: boolean;
  fileName?: string;
}

export interface AlertProps {
  maxWidth?: number;
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
}

// API Types
export type SpeseURLParams = {
  params: {
    type: string;
    id: string;
  };
};

export type CustomQueryURLParams = {
  params: {
    table: string;
    column: string;
    row: string;
  };
};

// Database Error Type
export class DatabaseError extends Error {
  status: number;
  originalError?: any;

  constructor(message: string, status: number = 500, originalError?: any) {
    super(message);
    this.name = "DatabaseError";
    this.status = status;
    this.originalError = originalError;
  }
}

// Dashboard Types
export interface DashboardStats {
  totalSpese: number;
  totalBudget: number;
  speseByCategoria: {
    categoria: string;
    total: number;
    count: number;
  }[];
  speseByTrasferta: {
    trasferta: string;
    total: number;
    count: number;
  }[];
  speseByStato?: {
    stato: 'presentata' | 'approvata' | 'respinta';
    total: number;
    count: number;
  }[];
  speseByProgetto: {
    progetto: string;
    total: number;
    count: number;
  }[];
}

export interface DashboardData {
  stats: DashboardStats;
  isAdmin: boolean;
}

// NextAuth Types
declare module "next-auth" {
  interface User {
    id_dipendente: number;
    is_admin: boolean;
    ruolo: string;
  }

  interface Session {
    user: AuthUserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_dipendente: number;
    is_admin: boolean;
    ruolo: string;
  }
}

// JWT Types
export interface JwtOptions {
  expiresIn?: string | number;
  algorithm?: jwt.Algorithm;
  [key: string]: any;
}

export interface JwtPayload {
  user: AuthUserType;
  exp?: number;
  iat?: number;
  [key: string]: any;
} 