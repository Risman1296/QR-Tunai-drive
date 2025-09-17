import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In production, this should be in a database
// This needs to be synchronized with login system
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
  username?: string;
  contactNumber?: string;
  role: string;
  name: string;
  userType: 'admin' | 'employee';
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

    // Handle admin user password change
    if (decoded.userType === 'admin' || !decoded.userType) {
      // Find admin user
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

      // Update password in users array
      users[userIndex] = {
        ...user,
        password: hashedNewPassword
      };

      // Also update in the login system
      await updateAdminPasswordInLoginSystem(decoded.userId, hashedNewPassword);

      return NextResponse.json({
        message: 'Password berhasil diubah'
      });
    }

    // Handle employee password change  
    if (decoded.userType === 'employee') {
      return await updateEmployeePassword(decoded.userId, currentPassword, newPassword);
    }

    return NextResponse.json(
      { error: 'Tipe user tidak dikenal' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// Function to update admin password in login system
async function updateAdminPasswordInLoginSystem(userId: string, hashedPassword: string) {
  try {
    // This is a workaround to sync with login system
    // In production, both should use the same database
    const fs = await import('fs');
    const path = await import('path');
    
    // Update the hardcoded admin password in login route
    const loginRoutePath = path.join(process.cwd(), 'src/app/api/auth/login/route.ts');
    
    // For now, we'll use a simpler approach - write to a JSON file that login system can read
    const passwordUpdatesPath = path.join(process.cwd(), 'password-updates.json');
    
    let updates: any = {};
    if (fs.existsSync(passwordUpdatesPath)) {
      const data = fs.readFileSync(passwordUpdatesPath, 'utf8');
      updates = JSON.parse(data);
    }
    
    updates[userId] = {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(passwordUpdatesPath, JSON.stringify(updates, null, 2));
    
    console.log('Admin password updated in sync file');
  } catch (error) {
    console.error('Error syncing admin password:', error);
  }
}

// Function to update employee password
async function updateEmployeePassword(employeeId: string, currentPassword: string, newPassword: string) {
  try {
    const { findEmployeeById, updateEmployeePassword: updatePassword } = require('../employees/employees-storage');
    
    // Find the employee
    const employee = findEmployeeById(employeeId);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify current password (plain text for now, should be hashed in production)
    if (employee.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      );
    }

    // Update password in employee storage
    const success = updatePassword(employeeId, newPassword);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengubah password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Password berhasil diubah'
    });
    
  } catch (error) {
    console.error('Error updating employee password:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password karyawan' },
      { status: 500 }
    );
  }
}