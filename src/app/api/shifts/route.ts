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

// GET - Get shift management overview
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
    
    // Only admin/supervisor can view shift management
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { getEmployeesFromStorage } = await import('../employees/employees-storage');
    const employees = getEmployeesFromStorage();

    // Get shift statistics
    const activeEmployees = employees.filter(emp => emp.isActive);
    const onDutyEmployees = employees.filter(emp => emp.isOnDuty);
    
    const shiftCounts = {
      'shift-morning': employees.filter(emp => emp.shiftId === 'shift-morning' && emp.isActive).length,
      'shift-afternoon': employees.filter(emp => emp.shiftId === 'shift-afternoon' && emp.isActive).length,
      'shift-night': employees.filter(emp => emp.shiftId === 'shift-night' && emp.isActive).length
    };

    const roleDistribution = {
      'Supervisor': activeEmployees.filter(emp => emp.role === 'Supervisor').length,
      'Kasir Roda 2': activeEmployees.filter(emp => emp.role === 'Kasir Roda 2').length,
      'Kasir Roda 4': activeEmployees.filter(emp => emp.role === 'Kasir Roda 4').length,
      'Security': activeEmployees.filter(emp => emp.role === 'Security').length,
      'Maintenance': activeEmployees.filter(emp => emp.role === 'Maintenance').length
    };

    return NextResponse.json({
      overview: {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        onDutyEmployees: onDutyEmployees.length,
        inactiveEmployees: employees.length - activeEmployees.length
      },
      shiftDistribution: shiftCounts,
      roleDistribution,
      employees: activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        shiftId: emp.shiftId,
        contactNumber: emp.contactNumber,
        isOnDuty: emp.isOnDuty,
        isActive: emp.isActive
      }))
    });

  } catch (error) {
    console.error('Get shift management error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Clock in/out or change duty status
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
    
    const { action, employeeId, targetEmployeeId } = await request.json();

    const { getEmployeesFromStorage, updateEmployee, findEmployeeById } = await import('../employees/employees-storage');

    // Handle self clock in/out
    if (action === 'clock-in' || action === 'clock-out') {
      let empId = employeeId;
      
      // If no employeeId provided, use current user (for employees clocking themselves)
      if (!empId && decoded.userType === 'employee') {
        empId = decoded.userId;
      }

      if (!empId) {
        return NextResponse.json(
          { error: 'ID karyawan diperlukan' },
          { status: 400 }
        );
      }

      const employee = findEmployeeById(empId);
      if (!employee) {
        return NextResponse.json(
          { error: 'Karyawan tidak ditemukan' },
          { status: 404 }
        );
      }

      // Check authorization
      if (decoded.userType === 'employee' && decoded.userId !== empId) {
        return NextResponse.json(
          { error: 'Anda hanya bisa mengubah status duty Anda sendiri' },
          { status: 403 }
        );
      }

      const newStatus = action === 'clock-in';
      updateEmployee(empId, { isOnDuty: newStatus });

      // Log the action
      await logShiftActivity({
        employeeId: empId,
        employeeName: employee.name,
        action: action,
        timestamp: new Date().toISOString(),
        performedBy: decoded.name
      });

      return NextResponse.json({
        message: `${employee.name} berhasil ${action === 'clock-in' ? 'masuk' : 'keluar'} shift`,
        employee: {
          id: employee.id,
          name: employee.name,
          isOnDuty: newStatus
        }
      });
    }

    // Handle admin actions (change employee shift, status, etc.)
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak untuk tindakan ini' },
        { status: 403 }
      );
    }

    if (action === 'change-shift' && targetEmployeeId) {
      const { newShiftId } = await request.json();
      
      const employee = findEmployeeById(targetEmployeeId);
      if (!employee) {
        return NextResponse.json(
          { error: 'Karyawan tidak ditemukan' },
          { status: 404 }
        );
      }

      updateEmployee(targetEmployeeId, { shiftId: newShiftId });

      // Log the action
      await logShiftActivity({
        employeeId: targetEmployeeId,
        employeeName: employee.name,
        action: 'shift-change',
        timestamp: new Date().toISOString(),
        performedBy: decoded.name,
        details: `Shift changed to ${newShiftId}`
      });

      return NextResponse.json({
        message: `Shift ${employee.name} berhasil diubah`,
        employee: {
          id: employee.id,
          name: employee.name,
          shiftId: newShiftId
        }
      });
    }

    return NextResponse.json(
      { error: 'Aksi tidak dikenal' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Shift management action error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// Function to log shift activities
async function logShiftActivity(activity: {
  employeeId: string;
  employeeName: string;
  action: string;
  timestamp: string;
  performedBy: string;
  details?: string;
}) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const logPath = path.join(process.cwd(), 'shift-activities.json');
    
    let activities: any[] = [];
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      activities = JSON.parse(data);
    }
    
    activities.push({
      id: `activity-${Date.now()}`,
      ...activity
    });
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities = activities.slice(-1000);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(activities, null, 2));
    
  } catch (error) {
    console.error('Error logging shift activity:', error);
  }
}