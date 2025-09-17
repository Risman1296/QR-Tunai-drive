import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Get employees from persistent storage (simulate database)
// In production, this should connect to your actual database
function getEmployeesFromStorage() {
  // This would typically fetch from database
  // For now, we'll use the same structure as shift-store
  return [
    {
      id: 'emp-001',
      name: 'Ahmad Supervisor',
      role: 'Supervisor',
      contactNumber: '081234567890',
      password: 'admin123',
      canAccessDashboard: true,
      isActive: true
    },
    {
      id: 'emp-002',
      name: 'Siti Kasir Roda 2',
      role: 'Kasir Roda 2',
      contactNumber: '081234567891',
      password: 'kasir123',
      canAccessDashboard: true,
      isActive: true
    },
    {
      id: 'emp-003',
      name: 'Eko Kasir Roda 4',
      role: 'Kasir Roda 4',
      contactNumber: '081234567892',
      password: 'kasir123',
      canAccessDashboard: true,
      isActive: true
    },
    {
      id: 'emp-004',
      name: 'Budi Security',
      role: 'Security',
      contactNumber: '081234567893',
      password: 'security123',
      canAccessDashboard: true,
      isActive: true
    },
    // Add more employees as needed...
  ];
}

// Legacy admin users (for backward compatibility)
const adminUsers = [
  {
    id: 'USR001',
    name: 'Owner Utama',
    username: 'owner',
    password: '$2b$10$Y8KI9EG5zk7Kn6iKJz7xweNCI5DUHoz8Ldt7ZEDAeAcPRbKh/u8nW', // password: 'admin123'
    role: 'Owner',
    status: 'Active'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nomor HP dan password wajib diisi' },
        { status: 400 }
      );
    }

    // First check if it's an admin user (legacy)
    const adminUser = adminUsers.find(u => u.username === username);
    if (adminUser) {
      if (adminUser.status !== 'Active') {
        return NextResponse.json(
          { error: 'Akun Anda tidak aktif. Hubungi administrator.' },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, adminUser.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Username atau password salah' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { 
          userId: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.name,
          userType: 'admin'
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      const response = NextResponse.json({
        message: 'Login berhasil',
        user: {
          id: adminUser.id,
          name: adminUser.name,
          username: adminUser.username,
          role: adminUser.role,
          userType: 'admin'
        }
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400
      });

      return response;
    }

    // Check employee login (phone number based)
    const employees = getEmployeesFromStorage();
    const employee = employees.find(emp => emp.contactNumber === username);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Nomor HP tidak terdaftar' },
        { status: 401 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Hubungi supervisor.' },
        { status: 401 }
      );
    }

    if (!employee.canAccessDashboard) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke dashboard' },
        { status: 403 }
      );
    }

    // Verify password (plain text for now, in production use bcrypt)
    if (employee.password !== password) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token for employee
    const token = jwt.sign(
      { 
        userId: employee.id,
        contactNumber: employee.contactNumber,
        role: employee.role,
        name: employee.name,
        userType: 'employee'
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: employee.id,
        name: employee.name,
        contactNumber: employee.contactNumber,
        role: employee.role,
        userType: 'employee'
      }
    });

    // Set HTTP-only cookie with proper settings
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    });

    console.log('Login successful, cookie set for employee:', employee.name);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}