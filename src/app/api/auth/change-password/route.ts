import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In production, this should be in a database
let users = [
  {
    id: 'USR001',
    name: 'Owner Utama',
    username: 'owner',
    password: '$2b$10$Y8KI9EG5zk7Kn6iKJz7xweNCI5DUHoz8Ldt7ZEDAeAcPRbKh/u8nW', // password: 'admin123'
    role: 'Owner',
    status: 'Active'
  },
  {
    id: 'USR002',
    name: 'Kasir Pagi',
    username: 'kasir01',
    password: '$2b$10$Y8KI9EG5zk7Kn6iKJz7xweNCI5DUHoz8Ldt7ZEDAeAcPRbKh/u8nW', // password: 'admin123'
    role: 'Cashier',
    status: 'Active'
  },
  {
    id: 'USR003',
    name: 'Kasir Malam',
    username: 'kasir02',
    password: '$2b$10$Y8KI9EG5zk7Kn6iKJz7xweNCI5DUHoz8Ldt7ZEDAeAcPRbKh/u8nW', // password: 'admin123'
    role: 'Cashier',
    status: 'Inactive'
  }
];

interface UserPayload {
  userId: string;
  username: string;
  role: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak diizinkan' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as UserPayload;
    
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Konfirmasi password tidak cocok' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Find user
    const userIndex = users.findIndex(u => u.id === decoded.userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const user = users[userIndex];

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidCurrentPassword) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    users[userIndex] = {
      ...user,
      password: hashedNewPassword
    };

    return NextResponse.json({
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}