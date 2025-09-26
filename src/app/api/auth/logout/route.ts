import { NextResponse } from 'next/server';

// Force dynamic untuk autentikasi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Logout berhasil'
    });

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
