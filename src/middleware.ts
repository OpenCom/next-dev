import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth check for auth-related endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    //   console.log('Skipping auth check for auth endpoint:', request.nextUrl.pathname);
      return NextResponse.next();
    }

    try {
    //   console.log('Checking auth for:', request.nextUrl.pathname);
    //   console.log('Request headers:', Object.fromEntries(request.headers.entries()));
      
      const token = await getToken({ 
        req: request,
        secret: process.env.JWT_SECRET 
      });
      
    //   console.log('Token:', token);

      if (!token) {
        console.log('No token found');
        return NextResponse.json(
          { message: 'Non autorizzato' },
          { status: 401 }
        );
      }

      // Add user info to request headers for API routes to use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.id_dipendente?.toString() || '');
      requestHeaders.set('x-user-email', token.email || '');
      requestHeaders.set('x-user-role', token.ruolo || '');

      // Debug log for headers
    //   console.log('Setting headers:', {
    //     'x-user-id': token.id_dipendente,
    //     'x-user-email': token.email,
    //     'x-user-role': token.ruolo
    //   });

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { message: 'Errore di autenticazione' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 