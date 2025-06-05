import type { UserType, DipendenteType } from './db';
import jwt from 'jsonwebtoken';

export interface AuthUserType extends Pick<DipendenteType, 'nome' | 'ruolo' | 'email' | 'id_dipendente'>, Pick<UserType, 'is_admin'> {}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUserType | null;
    isLoading: boolean;
    login: (userData: AuthUserType) => void;
    logout: () => void;
  }

interface AuthFormDataType {
  password: string;
}
export interface AuthFormDataType_Login extends AuthFormDataType {
  username: string;
}

export interface AuthFormDataType_Register extends AuthFormDataType {
  email: string;
}

export const JwtOptions: jwt.SignOptions = {
  algorithm: 'HS256',
  expiresIn: '1h'
}

export interface JwtPayload {
  user: AuthUserType;
  // exp: number;
  // iat: number;
  // iss: string;
  // aud: string;
  // sub: string;
  // jti: string;
  [key: string]: any;
} 
