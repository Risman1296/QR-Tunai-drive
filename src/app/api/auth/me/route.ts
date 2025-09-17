import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: string;
  username: string;
  role: string;
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as UserPayload;

    return NextResponse.json({
      user: {
        id: decoded.userId,
        name: decoded.name,
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json(
      { error: 'Token tidak valid' },
      { status: 401 }
    );
  }
}