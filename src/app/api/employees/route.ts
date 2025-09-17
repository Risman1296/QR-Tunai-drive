import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: string;
  username?: string;
  contactNumber?: string;
  role: string;
  name: string;
  userType: 'admin' | 'employee';
}

interface Employee {
  id: string;
  name: string;
  role: 'Supervisor' | 'Kasir Roda 2' | 'Kasir Roda 4' | 'Security' | 'Maintenance';
  shiftId: string;
  contactNumber: string;
  password: string;
  email?: string;
  isOnDuty: boolean;
  canAccessDashboard: boolean;
  isActive: boolean;
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as UserPayload;
    
    // Only admin/supervisor can view all employees
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    // Get employees from storage
    const { getEmployeesFromStorage } = await import('./employees-storage');
    const employees = getEmployeesFromStorage();

    return NextResponse.json({
      employees: employees.map(emp => ({
        ...emp,
        password: undefined // Don't send passwords in response
      }))
    });

  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as UserPayload;
    
    // Only admin/supervisor can add employees
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { name, role, shiftId, contactNumber, password, email } = await request.json();

    // Validate input
    if (!name || !role || !shiftId || !contactNumber) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Check if contact number already exists
    const { getEmployeesFromStorage, addEmployee } = await import('./employees-storage');
    const employees = getEmployeesFromStorage();
    
    const existingEmployee = employees.find(emp => emp.contactNumber === contactNumber);
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Nomor HP sudah terdaftar' },
        { status: 400 }
      );
    }

    // Create new employee
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      shiftId,
      contactNumber,
      password: password || 'default123',
      email,
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
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as UserPayload;
    
    // Only admin/supervisor can update employees
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { id, name, role, shiftId, contactNumber, password, email, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID karyawan diperlukan' },
        { status: 400 }
      );
    }

    const { getEmployeesFromStorage, updateEmployee } = await import('./employees-storage');
    const employees = getEmployeesFromStorage();
    
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if new contact number conflicts
    if (contactNumber && contactNumber !== employee.contactNumber) {
      const existingEmployee = employees.find(emp => emp.contactNumber === contactNumber && emp.id !== id);
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Nomor HP sudah digunakan karyawan lain' },
          { status: 400 }
        );
      }
    }

    // Update employee data
    const updatedData = {
      ...employee,
      ...(name && { name }),
      ...(role && { role }),
      ...(shiftId && { shiftId }),
      ...(contactNumber && { contactNumber }),
      ...(password && { password }),
      ...(email !== undefined && { email }),
      ...(isActive !== undefined && { isActive })
    };

    updateEmployee(id, updatedData);

    return NextResponse.json({
      message: 'Data karyawan berhasil diubah',
      employee: {
        ...updatedData,
        password: undefined
      }
    });

  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}