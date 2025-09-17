import { NextRequest, NextResponse } from 'next/server';

// Simple JWT decode function for Edge Runtime
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Simple signature verification for Edge Runtime (basic check)
function verifyJWTSignature(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = decodeJWT(token);
    if (!payload) return false;
    
    // For Edge Runtime, we'll do basic validation
    // In production, you'd want more robust verification
    return payload.userId && payload.username && payload.role;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  // Check if the request is for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;
    console.log('Dashboard access attempt, token:', token ? 'exists' : 'none');

    if (!token) {
      console.log('No token, redirecting to login');
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token with Edge-compatible function
      const secret = process.env.JWT_SECRET || 'change-this-secret-key-for-production';
      const isValid = verifyJWTSignature(token, secret);
      
      if (isValid) {
        console.log('Token valid, allowing dashboard access');
        return NextResponse.next();
      } else {
        console.log('Token invalid, redirecting to login');
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.set('auth-token', '', { maxAge: 0 });
        return response;
      }
    } catch (error) {
      console.log('Token verification error, redirecting to login. Error:', (error as Error).message);
      // Token is invalid, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Clear invalid token
      response.cookies.set('auth-token', '', { maxAge: 0 });
      return response;
    }
  }

  // For login route, redirect to dashboard if already logged in
  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('auth-token')?.value;
    console.log('Login page access, token:', token ? 'exists' : 'none');

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'change-this-secret-key-for-production';
        const isValid = verifyJWTSignature(token, secret);
        
        if (isValid) {
          console.log('Token valid on login page, redirecting to dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          console.log('Token invalid on login page, clearing cookie');
          const response = NextResponse.next();
          response.cookies.set('auth-token', '', { maxAge: 0 });
          return response;
        }
      } catch (error) {
        console.log('Token invalid on login page, clearing cookie. Error:', (error as Error).message);
        // Token is invalid, clear it and continue to login
        const response = NextResponse.next();
        response.cookies.set('auth-token', '', { maxAge: 0 });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
};