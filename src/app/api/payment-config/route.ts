import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getPaymentConfiguration,
  savePaymentConfiguration,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  addQrisAccount,
  updateQrisAccount,
  validateBankAccountNumber,
  generateBackupData,
  INDONESIAN_BANK_CODES,
  type BankAccount,
  type QrisAccount
} from '@/lib/payment-config';

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

// Utility functions
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"']/g, '');
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET - Get payment configuration
export async function GET(request: NextRequest) {
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
    
    // Only admin/owner can view payment configuration
    if (decoded.role !== 'Owner' && decoded.role !== 'Supervisor') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const config = getPaymentConfiguration();

    return NextResponse.json({
      success: true,
      data: config,
      bankCodes: INDONESIAN_BANK_CODES
    });

  } catch (error) {
    console.error('Get payment config error:', error);
    
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
        details: ['Gagal mengambil konfigurasi pembayaran'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Add bank account or QRIS account
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
    
    // Only admin/owner can add payment accounts
    if (decoded.role !== 'Owner') {
      return NextResponse.json(
        { error: 'Akses ditolak - hanya Owner yang dapat menambah akun pembayaran' },
        { status: 403 }
      );
    }

    const { type, ...accountData } = await request.json();

    // Validation
    const validationErrors: string[] = [];

    if (!type || (type !== 'bank' && type !== 'qris')) {
      validationErrors.push('Tipe akun harus "bank" atau "qris"');
    }

    if (type === 'bank') {
      const { bankName, bankCode, accountNumber, accountHolder, accountType } = accountData;

      if (!bankName || typeof bankName !== 'string' || bankName.trim().length < 2) {
        validationErrors.push('Nama bank harus diisi minimal 2 karakter');
      }

      if (!bankCode || !INDONESIAN_BANK_CODES[bankCode]) {
        validationErrors.push('Kode bank tidak valid');
      }

      if (!accountNumber || typeof accountNumber !== 'string') {
        validationErrors.push('Nomor rekening harus diisi');
      } else if (bankCode && !validateBankAccountNumber(INDONESIAN_BANK_CODES[bankCode]?.code || '', accountNumber)) {
        validationErrors.push('Format nomor rekening tidak valid untuk bank yang dipilih');
      }

      if (!accountHolder || typeof accountHolder !== 'string' || accountHolder.trim().length < 2) {
        validationErrors.push('Nama pemilik rekening harus diisi minimal 2 karakter');
      }

      if (!accountType || !['current', 'savings', 'escrow'].includes(accountType)) {
        validationErrors.push('Tipe rekening harus "current", "savings", atau "escrow"');
      }
    } else if (type === 'qris') {
      const { merchantId, merchantName, qrisCode } = accountData;

      if (!merchantId || typeof merchantId !== 'string' || merchantId.trim().length < 3) {
        validationErrors.push('Merchant ID harus diisi minimal 3 karakter');
      }

      if (!merchantName || typeof merchantName !== 'string' || merchantName.trim().length < 2) {
        validationErrors.push('Nama merchant harus diisi minimal 2 karakter');
      }

      if (!qrisCode || typeof qrisCode !== 'string') {
        validationErrors.push('Kode QRIS harus diisi');
      }
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
    let accountId: string;

    if (type === 'bank') {
      const bankCodeInfo = INDONESIAN_BANK_CODES[accountData.bankCode];
      const newAccount = {
        bankName: bankCodeInfo.name,
        bankCode: bankCodeInfo.code,
        accountNumber: sanitizeInput(accountData.accountNumber),
        accountHolder: sanitizeInput(accountData.accountHolder),
        balance: accountData.balance || 0,
        isActive: accountData.isActive !== false,
        logo: accountData.logo || '',
        swiftCode: bankCodeInfo.swiftCode,
        branchName: accountData.branchName ? sanitizeInput(accountData.branchName) : undefined,
        branchCode: accountData.branchCode ? sanitizeInput(accountData.branchCode) : undefined,
        accountType: accountData.accountType as 'current' | 'savings' | 'escrow',
        dailyLimit: accountData.dailyLimit || 500000000,
        monthlyLimit: accountData.monthlyLimit || 10000000000
      };

      accountId = addBankAccount(newAccount);
    } else {
      const newAccount = {
        merchantId: sanitizeInput(accountData.merchantId),
        merchantName: sanitizeInput(accountData.merchantName),
        qrisCode: accountData.qrisCode,
        logoUrl: accountData.logoUrl || '',
        isActive: accountData.isActive !== false,
        feePercentage: accountData.feePercentage || 0.7,
        dailyLimit: accountData.dailyLimit || 20000000,
        monthlyLimit: accountData.monthlyLimit || 500000000
      };

      accountId = addQrisAccount(newAccount);
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${type} berhasil ditambahkan`,
      accountId
    });

  } catch (error) {
    console.error('Add payment account error:', error);
    
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
        details: ['Gagal menambahkan akun pembayaran'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT - Update payment configuration or account
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
    
    // Only admin/owner can update payment accounts
    if (decoded.role !== 'Owner') {
      return NextResponse.json(
        { error: 'Akses ditolak - hanya Owner yang dapat mengubah konfigurasi pembayaran' },
        { status: 403 }
      );
    }

    const { action, ...updateData } = await request.json();

    if (action === 'updateAccount') {
      const { type, id, ...updates } = updateData;
      
      if (!id) {
        return NextResponse.json(
          { error: 'ID akun diperlukan' },
          { status: 400 }
        );
      }

      let success = false;
      if (type === 'bank') {
        success = updateBankAccount(id, updates);
      } else if (type === 'qris') {
        success = updateQrisAccount(id, updates);
      }

      if (!success) {
        return NextResponse.json(
          { error: 'Akun tidak ditemukan atau gagal diupdate' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Akun berhasil diupdate'
      });

    } else if (action === 'updateConfiguration') {
      const config = getPaymentConfiguration();
      const updatedConfig = {
        ...config,
        ...updateData
      };

      savePaymentConfiguration(updatedConfig);

      return NextResponse.json({
        success: true,
        message: 'Konfigurasi pembayaran berhasil diupdate'
      });

    } else if (action === 'backup') {
      const backupData = generateBackupData();
      
      return new NextResponse(backupData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="payment-backup-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Aksi tidak dikenali' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Update payment config error:', error);
    
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
        details: ['Gagal mengupdate konfigurasi pembayaran'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment account
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak diizinkan' },
        { status: 401 }
      );
    }

    // Verify token
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
    
    // Only admin/owner can delete payment accounts
    if (decoded.role !== 'Owner') {
      return NextResponse.json(
        { error: 'Akses ditolak - hanya Owner yang dapat menghapus akun pembayaran' },
        { status: 403 }
      );
    }

    const { type, id } = await request.json();

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID dan tipe akun diperlukan' },
        { status: 400 }
      );
    }

    let success = false;
    if (type === 'bank') {
      success = deleteBankAccount(id);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete payment account error:', error);
    
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan server',
        details: ['Gagal menghapus akun pembayaran'],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}