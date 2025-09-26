import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { 
  type Employee, 
  getEmployeesFromStorage, 
  addEmployee, 
  updateEmployee 
} from './employees-storage';

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

// JWT Secret validation
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set or too short!');
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

interface UserPayload {
  userId: string;
  username?: string;
  contactNumber?: string;
  role: string;
  name: string;
  userType: 'admin' | 'employee';
}

// Validation schemas
const VALID_ROLES = ['Supervisor', 'Kasir Roda 2', 'Kasir Roda 4', 'Security', 'Maintenance'] as const;

// Utility functions
function validateContactNumber(contactNumber: string): boolean {
  // Indonesian phone number validation (08xxxxxxxxx or +628xxxxxxxxx)
  const phoneRegex = /^(\+628|08)[0-9]{8,12}$/;
  return phoneRegex.test(contactNumber);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"']/g, '');
}

// GET - List all employees
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak diizinkan' },
        { status: 401 }
      );
    }

    // Verify token with proper type handling
    let decoded: UserPayload;
    try {
      const tokenPayload = jwt.verify(token, JWT_SECRET as string);
      decoded = tokenPayload as UserPayload;
    } catch (err) {
      console.error('JWT verification failed:', err);
      return NextResponse.json(
        { error: 'Token tidak valid atau telah expired' },
        { status: 401 }
      );
    }
    
    // Only admin/supervisor can view all employees
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    // Get employees from storage
    const employees = getEmployeesFromStorage();

    return NextResponse.json({
      employees: employees.map((emp: Employee) => ({
        ...emp,
        password: undefined // Don't send passwords in response
      }))
    });

  } catch (error) {
    console.error('Get employees error:', error);
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token telah expired, silakan login kembali' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan server',
        details: ['Gagal mengambil data karyawan'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Add new employee
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak diizinkan' },
        { status: 401 }
      );
    }

    // Verify token with proper error handling
    let decoded: UserPayload;
    try {
      const tokenPayload = jwt.verify(token, JWT_SECRET as string);
      decoded = tokenPayload as UserPayload;
    } catch (err) {
      console.error('JWT verification failed:', err);
      return NextResponse.json(
        { error: 'Token tidak valid atau telah expired' },
        { status: 401 }
      );
    }
    
    // Only admin/supervisor can add employees
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { name, role, shiftId, contactNumber, password, email } = await request.json();

    // Enhanced input validation
    const validationErrors: string[] = [];
    
    // Required field validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      validationErrors.push('Nama harus diisi minimal 2 karakter');
    }
    
    if (!role || !VALID_ROLES.includes(role as any)) {
      validationErrors.push(`Role harus salah satu dari: ${VALID_ROLES.join(', ')}`);
    }
    
    if (!shiftId || typeof shiftId !== 'string' || shiftId.trim().length === 0) {
      validationErrors.push('Shift ID harus diisi');
    }
    
    if (!contactNumber || typeof contactNumber !== 'string' || !validateContactNumber(contactNumber)) {
      validationErrors.push('Nomor HP tidak valid (contoh: 081234567890)');
    }
    
    // Optional field validation
    if (email && typeof email === 'string' && email.trim() !== '' && !validateEmail(email)) {
      validationErrors.push('Format email tidak valid');
    }
    
    if (password && typeof password === 'string' && password.length < 6) {
      validationErrors.push('Password harus minimal 6 karakter');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validasi gagal', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedContactNumber = contactNumber.trim();
    const sanitizedEmail = email ? sanitizeInput(email.trim()) : undefined;

    // Check if contact number already exists
    const employees = getEmployeesFromStorage();
    
    const existingEmployee = employees.find((emp: Employee) => emp.contactNumber === sanitizedContactNumber);
    if (existingEmployee) {
      return NextResponse.json(
        { 
          error: 'Nomor HP sudah terdaftar',
          details: ['Nomor HP ini sudah digunakan oleh karyawan lain']
        },
        { status: 400 }
      );
    }

    // Create new employee with sanitized data
    const newEmployee: Employee = {
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: sanitizedName,
      role: role as Employee['role'],
      shiftId: shiftId.trim(),
      contactNumber: sanitizedContactNumber,
      password: password ? password.trim() : 'default123',
      email: sanitizedEmail,
      isOnDuty: false,
      canAccessDashboard: true,
      isActive: true
    };

    // Add employee to storage
    addEmployee(newEmployee);

    return NextResponse.json({
      message: 'Karyawan berhasil ditambahkan',
      employee: {
        ...newEmployee,
        password: undefined
      }
    });

  } catch (error) {
    console.error('Add employee error:', error);
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token telah expired, silakan login kembali' },
        { status: 401 }
      );
    }
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Format data tidak valid',
          details: ['Periksa format JSON request body']
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan server',
        details: ['Gagal menambahkan karyawan baru'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak diizinkan' },
        { status: 401 }
      );
    }

    // Verify token with proper error handling
    let decoded: UserPayload;
    try {
      const tokenPayload = jwt.verify(token, JWT_SECRET as string);
      decoded = tokenPayload as UserPayload;
    } catch (err) {
      console.error('JWT verification failed:', err);
      return NextResponse.json(
        { error: 'Token tidak valid atau telah expired' },
        { status: 401 }
      );
    }
    
    // Only admin/supervisor can update employees
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { id, name, role, shiftId, contactNumber, password, email, isActive } = await request.json();

    // Enhanced input validation
    const validationErrors: string[] = [];

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      validationErrors.push('ID karyawan diperlukan');
    }

    // Validate optional fields if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      validationErrors.push('Nama harus minimal 2 karakter');
    }
    
    if (role !== undefined && !VALID_ROLES.includes(role as any)) {
      validationErrors.push(`Role harus salah satu dari: ${VALID_ROLES.join(', ')}`);
    }
    
    if (shiftId !== undefined && (typeof shiftId !== 'string' || shiftId.trim().length === 0)) {
      validationErrors.push('Shift ID tidak boleh kosong');
    }
    
    if (contactNumber !== undefined && (typeof contactNumber !== 'string' || !validateContactNumber(contactNumber))) {
      validationErrors.push('Nomor HP tidak valid (contoh: 081234567890)');
    }
    
    if (email !== undefined && typeof email === 'string' && email.trim() !== '' && !validateEmail(email)) {
      validationErrors.push('Format email tidak valid');
    }
    
    if (password !== undefined && typeof password === 'string' && password.length < 6) {
      validationErrors.push('Password harus minimal 6 karakter');
    }
    
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      validationErrors.push('Status aktif harus berupa boolean');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validasi gagal', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedId = id.trim();
    const sanitizedName = name ? sanitizeInput(name.trim()) : undefined;
    const sanitizedContactNumber = contactNumber ? contactNumber.trim() : undefined;
    const sanitizedEmail = email && email.trim() !== '' ? sanitizeInput(email.trim()) : undefined;

    const employees = getEmployeesFromStorage();
    
    const employee = employees.find((emp: Employee) => emp.id === sanitizedId);
    if (!employee) {
      return NextResponse.json(
        { 
          error: 'Karyawan tidak ditemukan',
          details: ['ID karyawan tidak valid atau sudah dihapus']
        },
        { status: 404 }
      );
    }

    // Check if new contact number conflicts with existing employees
    if (sanitizedContactNumber && sanitizedContactNumber !== employee.contactNumber) {
      const existingEmployee = employees.find((emp: Employee) => 
        emp.contactNumber === sanitizedContactNumber && emp.id !== sanitizedId
      );
      if (existingEmployee) {
        return NextResponse.json(
          { 
            error: 'Nomor HP sudah digunakan karyawan lain',
            details: ['Pilih nomor HP yang berbeda']
          },
          { status: 400 }
        );
      }
    }

    // Update employee data with sanitized inputs
    const updatedData = {
      ...employee,
      ...(sanitizedName && { name: sanitizedName }),
      ...(role && { role: role as Employee['role'] }),
      ...(shiftId && { shiftId: shiftId.trim() }),
      ...(sanitizedContactNumber && { contactNumber: sanitizedContactNumber }),
      ...(password && { password: password.trim() }),
      ...(sanitizedEmail !== undefined && { email: sanitizedEmail || undefined }),
      ...(isActive !== undefined && { isActive })
    };

    // Attempt to update employee
    const updateSuccess = updateEmployee(sanitizedId, updatedData);
    
    if (!updateSuccess) {
      console.error(`Failed to update employee with ID: ${sanitizedId}`);
      return NextResponse.json(
        { 
          error: 'Gagal mengupdate data karyawan',
          details: ['Terjadi kesalahan saat menyimpan data']
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Data karyawan berhasil diubah',
      employee: {
        ...updatedData,
        password: undefined // Don't send password in response
      }
    });

  } catch (error) {
    console.error('Update employee error:', error);
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token telah expired, silakan login kembali' },
        { status: 401 }
      );
    }
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Format data tidak valid',
          details: ['Periksa format JSON request body']
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan server',
        details: ['Silakan coba lagi atau hubungi administrator'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
