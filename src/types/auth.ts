import type { UserType, DipendenteType } from './db';

export interface AuthUserType extends Pick<DipendenteType, 'nome' | 'cognome' | 'ruolo' | 'email'>, Pick<UserType, 'is_admin' | 'ultimo_accesso'> {}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUserType | null;
    isLoading: boolean;
    login: (userData: AuthUserType) => void;
    logout: () => void;
  }