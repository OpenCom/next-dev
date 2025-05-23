import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function getAuthUser(request: NextRequest): AuthUser {
  return {
    id: request.headers.get('x-user-id') || '',
    email: request.headers.get('x-user-email') || '',
    role: request.headers.get('x-user-role') || '',
  };
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  
  if (!user.id || !user.email) {
    throw new Error('Non autorizzato');
  }
  
  return user;
} 