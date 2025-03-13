import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  try {
    // Skip auth check for error pages
    if (request.nextUrl.pathname.startsWith('/auth/error')) {
      return NextResponse.next();
    }
    
    console.log('Middleware processing request for:', request.nextUrl.pathname);
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // In production, we don't want to log as much
    if (process.env.NODE_ENV === 'production') {
      if (token) {
        console.log('Middleware - Token exists for user:', token.email);
      } else {
        console.log('Middleware - No token found for path:', request.nextUrl.pathname);
      }
    } else {
      // Detailed logging for development
      if (token) {
        console.log('Middleware - Token exists:', {
          id: token.id,
          email: token.email,
          name: token.name,
          sub: token.sub,
          provider: token.provider,
          // Don't log the full token for security reasons
          hasAccessToken: !!token.accessToken
        });
      } else {
        console.log('Middleware - No token found');
        
        // Log cookies for debugging
        const cookies = {};
        request.cookies.getAll().forEach(cookie => {
          cookies[cookie.name] = 'Cookie value present (hidden)';
        });
        console.log('Middleware - Request cookies:', cookies);
        
        // Log headers for debugging
        const headers = {};
        request.headers.forEach((value, key) => {
          headers[key] = key.toLowerCase().includes('auth') ? 'Auth header present (hidden)' : value;
        });
        console.log('Middleware - Request headers:', headers);
      }
    }
    
    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/todos/:path*',
    '/dashboard/:path*',
    '/auth/:path*'
  ],
}; 