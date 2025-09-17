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
        { error: 'Tidak diizinkan' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as UserPayload;

    // Only owner can backup data
    if (decoded.role !== 'Owner') {
      return NextResponse.json(
        { error: 'Hanya owner yang dapat melakukan backup data' },
        { status: 403 }
      );
    }

    // Get all transactions data (in production, this would come from database)
    const response = await fetch(`${request.nextUrl.origin}/api/transactions`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const transactions = await response.json();

    // Create backup data structure
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        transactions,
        users: [
          { id: 'USR001', name: 'Owner Utama', username: 'owner', role: 'Owner', status: 'Active' },
          { id: 'USR002', name: 'Kasir Pagi', username: 'kasir01', role: 'Cashier', status: 'Active' },
          { id: 'USR003', name: 'Kasir Malam', username: 'kasir02', role: 'Cashier', status: 'Inactive' }
        ]
      },
      metadata: {
        total_transactions: transactions.length,
        backup_by: decoded.name,
        backup_user_id: decoded.userId
      }
    };

    // Return JSON data as downloadable file
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="qr-tunai-backup-${new Date().toISOString().split('T')[0]}.json"`);

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat backup' },
      { status: 500 }
    );
  }
}