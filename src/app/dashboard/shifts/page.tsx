"use client";

import { useState } from 'react';
import { useShiftStore } from '@/lib/shift-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  UserCheck,
  ArrowRightLeft
} from 'lucide-react';
import { ShiftFinancialHandover } from '@/components/shift-financial-handover';
import PinProtection from '@/components/pin-protection';

// Types and Interfaces
interface Employee {
  id: string;
  name: string;
  role: 'Supervisor' | 'Kasir Roda 2' | 'Kasir Roda 4' | 'Security' | 'Maintenance';
  shiftId: string;
  contactNumber: string;
  password?: string;
  email?: string; 
  isOnDuty: boolean;
  canAccessDashboard: boolean;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface Handover {
  id: string;
  fromShift: string;
  toShift: string;
  date: string;
  handoverTime: string;
  totalTransactions: number;
  totalAmount: number;
  cashOnHand: number;
  issues: string[];
  notes: string;
  handedOverBy: string;
  receivedBy: string;
  status: 'completed' | 'pending';
}

type EmployeeRole = 'Supervisor' | 'Kasir Roda 2' | 'Kasir Roda 4' | 'Security' | 'Maintenance' | '';

interface EmployeeFormData {
  name: string;
  role: EmployeeRole;
  shiftId: string;
  contactNumber: string;
  password?: string;
  email: string;
}

interface HandoverFormData {
  fromShift: string;
  toShift: string;
  totalTransactions: number;
  totalAmount: number;
  cashOnHand: number;
  issues: string;
  notes: string;
  handedOverBy: string;
  receivedBy: string;
}

interface FinancialHandoverData {
  shiftId: string;
  shiftName: string;
  userId: string;
  userName: string;
}

// Helper function to validate employee role
function isValidEmployeeRole(role: EmployeeRole): role is 'Supervisor' | 'Kasir Roda 2' | 'Kasir Roda 4' | 'Security' | 'Maintenance' {
  return role !== '' && ['Supervisor', 'Kasir Roda 2', 'Kasir Roda 4', 'Security', 'Maintenance'].includes(role);
}

export default function ShiftManagementPage() {
  const {
    shifts,
    employees,
    handovers,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    createHandover,
    updateHandover
  } = useShiftStore();

  const [selectedShift, setSelectedShift] = useState('all');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showHandover, setShowHandover] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Financial Handover States
  const [showFinancialHandover, setShowFinancialHandover] = useState(false);
  const [financialHandoverShift, setFinancialHandoverShift] = useState<FinancialHandoverData>({ 
    shiftId: '', 
    shiftName: '', 
    userId: '', 
    userName: '' 
  });

  // Employee Form States
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>({
    name: '',
    role: '',
    shiftId: '',
    contactNumber: '',
    password: '',
    email: ''
  });

  // Handover Form States
  const [handoverForm, setHandoverForm] = useState<HandoverFormData>({
    fromShift: '',
    toShift: '',
    totalTransactions: 0,
    totalAmount: 0,
    cashOnHand: 0,
    issues: '',
    notes: '',
    handedOverBy: '',
    receivedBy: ''
  });

  const handleAddEmployee = () => {
    // Validate form data
    if (!employeeForm.name.trim()) {
      alert('Nama karyawan harus diisi');
      return;
    }
    
    if (!isValidEmployeeRole(employeeForm.role)) {
      alert('Jabatan harus dipilih');
      return;
    }
    
    if (!employeeForm.shiftId) {
      alert('Shift harus dipilih');
      return;
    }
    
    if (!employeeForm.contactNumber.trim()) {
      alert('Nomor telepon harus diisi');
      return;
    }

    addEmployee({
      name: employeeForm.name,
      role: employeeForm.role,
      shiftId: employeeForm.shiftId,
      contactNumber: employeeForm.contactNumber,
      password: employeeForm.password || 'default123', // Default password if not provided
      email: employeeForm.email,
      isOnDuty: false,
      canAccessDashboard: true // All employees can access dashboard for emergency
    });
    setEmployeeForm({
      name: '',
      role: '',
      shiftId: '',
      contactNumber: '',
      password: '',
      email: ''
    });
    setShowAddEmployee(false);
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee as Employee);
    setEmployeeForm({
      name: employee.name,
      role: employee.role,
      shiftId: employee.shiftId,
      contactNumber: employee.contactNumber,
      password: '', // Don't pre-fill password for security
      email: employee.email || ''
    });
    setShowAddEmployee(true);
  };
  
  const handleFinancialHandover = (shift: Shift) => {
    setFinancialHandoverShift({
      shiftId: shift.id,
      shiftName: shift.name,
      userId: 'current_user', // You might want to get actual user ID from auth context
      userName: 'Current User' // You might want to get actual user name from auth context
    });
    setShowFinancialHandover(true);
  };
  
  const handleUpdateEmployee = () => {
    // Validate form data
    if (!editingEmployee) {
      alert('Data karyawan tidak ditemukan');
      return;
    }
    
    if (!employeeForm.name.trim()) {
      alert('Nama karyawan harus diisi');
      return;
    }
    
    if (!isValidEmployeeRole(employeeForm.role)) {
      alert('Jabatan harus dipilih');
      return;
    }
    
    if (!employeeForm.shiftId) {
      alert('Shift harus dipilih');
      return;
    }

    // Prepare update data with proper typing
    const updateData = {
      name: employeeForm.name,
      role: employeeForm.role,
      shiftId: employeeForm.shiftId,
      contactNumber: employeeForm.contactNumber,
      password: employeeForm.password || editingEmployee.password, // Keep existing password if not changed
      email: employeeForm.email
    };
    
    updateEmployee(editingEmployee.id, updateData);
    setEmployeeForm({
      name: '',
      role: '',
      shiftId: '',
      contactNumber: '',
      password: '',
      email: ''
    });
    setShowAddEmployee(false);
    setEditingEmployee(null);
  };

  const handleCreateHandover = () => {
    // Validate handover form
    if (!handoverForm.fromShift) {
      alert('Shift serah harus dipilih');
      return;
    }
    
    if (!handoverForm.toShift) {
      alert('Shift terima harus dipilih');
      return;
    }
    
    if (handoverForm.fromShift === handoverForm.toShift) {
      alert('Shift serah dan terima tidak boleh sama');
      return;
    }
    
    if (!handoverForm.handedOverBy.trim()) {
      alert('Nama yang menyerahkan harus diisi');
      return;
    }
    
    if (!handoverForm.receivedBy.trim()) {
      alert('Nama yang menerima harus diisi');
      return;
    }

    createHandover({
      ...handoverForm,
      date: new Date().toISOString().split('T')[0],
      handoverTime: new Date().toTimeString().split(' ')[0],
      issues: handoverForm.issues.split(',').map(i => i.trim()).filter(i => i),
      status: 'completed'
    });
    setHandoverForm({
      fromShift: '',
      toShift: '',
      totalTransactions: 0,
      totalAmount: 0,
      cashOnHand: 0,
      issues: '',
      notes: '',
      handedOverBy: '',
      receivedBy: ''
    });
    setShowHandover(false);
  };

  const toggleEmployeeDuty = (employeeId: string, isOnDuty: boolean) => {
    try {
      updateEmployee(employeeId, { isOnDuty: !isOnDuty });
    } catch (error) {
      alert('Gagal mengupdate status karyawan');
      console.error('Toggle employee duty error:', error);
    }
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    if (confirm(`Yakin ingin menghapus karyawan ${employeeName}? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        deleteEmployee(employeeId);
      } catch (error) {
        alert('Gagal menghapus karyawan');
        console.error('Delete employee error:', error);
      }
    }
  };

  const filteredEmployees = selectedShift && selectedShift !== 'all'
    ? employees.filter(emp => emp.shiftId === selectedShift)
    : employees;

  const getShiftName = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    return shift ? shift.name : 'Unknown Shift';
  };

  return (
    <PinProtection 
      title="Manajemen Shift & Karyawan"
      description="Masukkan PIN penanggung jawab untuk mengakses manajemen shift dan karyawan"
    >
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Shift Kerja</h1>
              <p className="text-gray-600 mt-1">Kelola shift kerja, karyawan, dan serah terima</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-qr-blue-100 text-qr-blue-800 border-qr-blue-200">
                {shifts.filter(s => s.isActive).length} Shift Aktif
              </Badge>
              <Badge className="bg-qr-yellow-100 text-qr-yellow-800 border-qr-yellow-200">
                {employees.filter(e => e.isOnDuty).length} Karyawan Bertugas
              </Badge>
            </div>
          </div>
        </div>

        {/* Shift Status Widget */}
        {/* Main Content */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Karyawan
            </TabsTrigger>
            <TabsTrigger value="handovers" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Serah Terima
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jadwal Shift
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-qr-blue-500" />
                    Daftar Karyawan
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Select value={selectedShift} onValueChange={setSelectedShift}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter berdasarkan shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Shift</SelectItem>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
                      <DialogTrigger asChild>
                        <Button className="bg-qr-blue-500 hover:bg-qr-blue-600">
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Karyawan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nama Karyawan</Label>
                            <Input
                              id="name"
                              value={employeeForm.name}
                              onChange={(e) => setEmployeeForm(prev => ({...prev, name: e.target.value}))}
                              placeholder="Masukkan nama karyawan"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Jabatan</Label>
                            <Select 
                              value={employeeForm.role} 
                              onValueChange={(value) => setEmployeeForm(prev => ({...prev, role: value as EmployeeRole}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jabatan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Supervisor">Supervisor</SelectItem>
                                <SelectItem value="Kasir Roda 2">Kasir Roda 2</SelectItem>
                                <SelectItem value="Kasir Roda 4">Kasir Roda 4</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shift">Shift</Label>
                            <Select 
                              value={employeeForm.shiftId} 
                              onValueChange={(value) => setEmployeeForm(prev => ({...prev, shiftId: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih shift" />
                              </SelectTrigger>
                              <SelectContent>
                                {shifts.map((shift) => (
                                  <SelectItem key={shift.id} value={shift.id}>
                                    {shift.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact">Nomor Telepon</Label>
                            <Input
                              id="contact"
                              value={employeeForm.contactNumber}
                              onChange={(e) => setEmployeeForm(prev => ({...prev, contactNumber: e.target.value}))}
                              placeholder="081234567890"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nomor HP ini akan digunakan sebagai username login
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password Login</Label>
                            <Input
                              id="password"
                              type="password"
                              value={employeeForm.password || ''}
                              onChange={(e) => setEmployeeForm(prev => ({...prev, password: e.target.value}))}
                              placeholder="Buat password untuk login"
                            />
                            <p className="text-xs text-muted-foreground">
                              Password ini digunakan untuk login ke dashboard
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email (Opsional)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={employeeForm.email}
                              onChange={(e) => setEmployeeForm(prev => ({...prev, email: e.target.value}))}
                              placeholder="nama@qrtunai.com"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                              className="bg-qr-blue-500 hover:bg-qr-blue-600 flex-1"
                            >
                              {editingEmployee ? 'Update Karyawan' : 'Tambah Karyawan'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowAddEmployee(false);
                                setEditingEmployee(null);
                                setEmployeeForm({
                                  name: '',
                                  role: '',
                                  shiftId: '',
                                  contactNumber: '',
                                  password: '',
                                  email: ''
                                });
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${employee.isOnDuty ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <h3 className="font-semibold">{employee.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge variant="outline" className="text-xs">
                                {employee.role}
                              </Badge>
                              <span>•</span>
                              <span>{getShiftName(employee.shiftId)}</span>
                              <span>•</span>
                              <span>{employee.contactNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEmployeeDuty(employee.id, employee.isOnDuty)}
                          className={employee.isOnDuty 
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          {employee.isOnDuty ? 'Bertugas' : 'Tidak Bertugas'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada karyawan yang terdaftar</p>
                      <p className="text-sm">Klik tombol "Tambah Karyawan" untuk memulai</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Handovers Tab */}
          <TabsContent value="handovers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-qr-blue-500" />
                    Riwayat Serah Terima
                  </CardTitle>
                  <Dialog open={showHandover} onOpenChange={setShowHandover}>
                    <DialogTrigger asChild>
                      <Button className="bg-qr-yellow-500 hover:bg-qr-yellow-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Serah Terima
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Buat Laporan Serah Terima</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Shift Serah</Label>
                            <Select 
                              value={handoverForm.fromShift} 
                              onValueChange={(value) => setHandoverForm(prev => ({...prev, fromShift: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih shift" />
                              </SelectTrigger>
                              <SelectContent>
                                {shifts.map((shift) => (
                                  <SelectItem key={shift.id} value={shift.id}>
                                    {shift.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Shift Terima</Label>
                            <Select 
                              value={handoverForm.toShift} 
                              onValueChange={(value) => setHandoverForm(prev => ({...prev, toShift: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih shift" />
                              </SelectTrigger>
                              <SelectContent>
                                {shifts.map((shift) => (
                                  <SelectItem key={shift.id} value={shift.id}>
                                    {shift.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Total Transaksi</Label>
                            <Input
                              type="number"
                              value={handoverForm.totalTransactions}
                              onChange={(e) => setHandoverForm(prev => ({...prev, totalTransactions: parseInt(e.target.value) || 0}))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total Pendapatan</Label>
                            <Input
                              type="number"
                              value={handoverForm.totalAmount}
                              onChange={(e) => setHandoverForm(prev => ({...prev, totalAmount: parseInt(e.target.value) || 0}))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kas di Tangan</Label>
                            <Input
                              type="number"
                              value={handoverForm.cashOnHand}
                              onChange={(e) => setHandoverForm(prev => ({...prev, cashOnHand: parseInt(e.target.value) || 0}))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Diserahkan Oleh</Label>
                            <Input
                              value={handoverForm.handedOverBy}
                              onChange={(e) => setHandoverForm(prev => ({...prev, handedOverBy: e.target.value}))}
                              placeholder="Nama karyawan yang menyerahkan"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Diterima Oleh</Label>
                            <Input
                              value={handoverForm.receivedBy}
                              onChange={(e) => setHandoverForm(prev => ({...prev, receivedBy: e.target.value}))}
                              placeholder="Nama karyawan yang menerima"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Masalah/Kendala (Pisahkan dengan koma)</Label>
                          <Input
                            value={handoverForm.issues}
                            onChange={(e) => setHandoverForm(prev => ({...prev, issues: e.target.value}))}
                            placeholder="Contoh: Printer rusak, Stok habis"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Catatan Tambahan</Label>
                          <Textarea
                            value={handoverForm.notes}
                            onChange={(e) => setHandoverForm(prev => ({...prev, notes: e.target.value}))}
                            placeholder="Catatan penting untuk shift selanjutnya..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button 
                            onClick={handleCreateHandover}
                            className="bg-qr-yellow-500 hover:bg-qr-yellow-600 flex-1"
                          >
                            Buat Laporan Serah Terima
                          </Button>
                          <Button variant="outline" onClick={() => setShowHandover(false)}>
                            Batal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {handovers.slice(0, 10).map((handover) => (
                    <div key={handover.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <ArrowRightLeft className="h-5 w-5 text-qr-blue-500" />
                          <div>
                            <h3 className="font-semibold">
                              {getShiftName(handover.fromShift)} → {getShiftName(handover.toShift)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(handover.date).toLocaleDateString('id-ID')} • {handover.handoverTime}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          handover.status === 'completed' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {handover.status === 'completed' ? 'Selesai' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Transaksi:</span>
                          <p className="font-semibold">{handover.totalTransactions}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Pendapatan:</span>
                          <p className="font-semibold">
                            Rp {handover.totalAmount.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Kas:</span>
                          <p className="font-semibold">
                            Rp {handover.cashOnHand.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Diserahkan:</span>
                          <p className="font-medium">{handover.handedOverBy}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Diterima:</span>
                          <p className="font-medium">{handover.receivedBy}</p>
                        </div>
                      </div>

                      {handover.issues.length > 0 && (
                        <div className="mb-3">
                          <span className="text-gray-600 text-sm">Masalah:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {handover.issues.map((issue, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {handover.notes && (
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <span className="text-gray-600">Catatan:</span>
                          <p className="mt-1">{handover.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {handovers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada riwayat serah terima</p>
                      <p className="text-sm">Klik tombol "Buat Serah Terima" untuk memulai</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-qr-blue-500" />
                  Jadwal Shift Harian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-4 h-4 rounded-full border ${
                              shift.color === '#EF4444' ? 'bg-red-500' :
                              shift.color === '#10B981' ? 'bg-green-500' :
                              shift.color === '#F59E0B' ? 'bg-yellow-500' :
                              shift.color === '#8B5CF6' ? 'bg-purple-500' :
                              'bg-blue-500'
                            }`}
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{shift.name}</h3>
                            <p className="text-sm text-gray-600">
                              {shift.startTime} - {shift.endTime} • {shift.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFinancialHandover(shift)}
                            className="text-xs"
                          >
                            Financial Handover
                          </Button>
                          <Badge className={shift.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {shift.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Tim Shift:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {employees
                            .filter(emp => emp.shiftId === shift.id)
                            .map((employee) => (
                              <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${employee.isOnDuty ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <span className="font-medium">{employee.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {employee.role}
                                </Badge>
                              </div>
                            ))
                          }
                        </div>
                        {employees.filter(emp => emp.shiftId === shift.id).length === 0 && (
                          <p className="text-sm text-gray-500 italic">Belum ada karyawan yang ditugaskan</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Financial Handover Dialog */}
        <ShiftFinancialHandover
          shiftId={financialHandoverShift.shiftId}
          shiftName={financialHandoverShift.shiftName}
          userId={financialHandoverShift.userId}
          userName={financialHandoverShift.userName}
          isOpen={showFinancialHandover}
          onClose={() => setShowFinancialHandover(false)}
          onComplete={() => {
            setShowFinancialHandover(false);
            // Optionally refresh or update some data here
          }}
        />
      </div>
    </div>
    </PinProtection>
  );
}