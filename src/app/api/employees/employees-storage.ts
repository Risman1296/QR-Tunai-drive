// Employee storage system - In production, this should be a database
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface Employee {
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

// Default employees data
const defaultEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Ahmad Supervisor',
    role: 'Supervisor',
    shiftId: 'shift-morning',
    contactNumber: '081234567890',
    password: 'admin123',
    email: 'ahmad.supervisor@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true,
    isActive: true
  },
  {
    id: 'emp-002',
    name: 'Siti Kasir Roda 2',
    role: 'Kasir Roda 2',
    shiftId: 'shift-morning',
    contactNumber: '081234567891',
    password: 'kasir123',
    email: 'siti.kasir@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true,
    isActive: true
  },
  {
    id: 'emp-003',
    name: 'Eko Kasir Roda 4',
    role: 'Kasir Roda 4',
    shiftId: 'shift-morning',
    contactNumber: '081234567892',
    password: 'kasir123',
    email: 'eko.kasir@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true,
    isActive: true
  },
  {
    id: 'emp-004',
    name: 'Budi Security',
    role: 'Security',
    shiftId: 'shift-morning',
    contactNumber: '081234567893',
    password: 'security123',
    email: 'budi.security@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true,
    isActive: true
  }
];

const EMPLOYEES_FILE_PATH = join(process.cwd(), 'employees-data.json');

// Get employees from storage
export function getEmployeesFromStorage(): Employee[] {
  try {
    if (existsSync(EMPLOYEES_FILE_PATH)) {
      const data = readFileSync(EMPLOYEES_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } else {
      // Create file with default data if it doesn't exist
      writeFileSync(EMPLOYEES_FILE_PATH, JSON.stringify(defaultEmployees, null, 2));
      return defaultEmployees;
    }
  } catch (error) {
    console.error('Error reading employees data:', error);
    return defaultEmployees;
  }
}

// Save employees to storage
export function saveEmployeesToStorage(employees: Employee[]): void {
  try {
    writeFileSync(EMPLOYEES_FILE_PATH, JSON.stringify(employees, null, 2));
  } catch (error) {
    console.error('Error saving employees data:', error);
  }
}

// Add new employee
export function addEmployee(employee: Employee): void {
  const employees = getEmployeesFromStorage();
  employees.push(employee);
  saveEmployeesToStorage(employees);
}

// Update employee
export function updateEmployee(id: string, updatedData: Partial<Employee>): boolean {
  const employees = getEmployeesFromStorage();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return false;
  }
  
  employees[index] = { ...employees[index], ...updatedData };
  saveEmployeesToStorage(employees);
  return true;
}

// Delete employee
export function deleteEmployee(id: string): boolean {
  const employees = getEmployeesFromStorage();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return false;
  }
  
  employees.splice(index, 1);
  saveEmployeesToStorage(employees);
  return true;
}

// Find employee by contact number
export function findEmployeeByContactNumber(contactNumber: string): Employee | undefined {
  const employees = getEmployeesFromStorage();
  return employees.find(emp => emp.contactNumber === contactNumber);
}

// Find employee by id
export function findEmployeeById(id: string): Employee | undefined {
  const employees = getEmployeesFromStorage();
  return employees.find(emp => emp.id === id);
}

// Activate/deactivate employee
export function setEmployeeStatus(id: string, isActive: boolean): boolean {
  const employees = getEmployeesFromStorage();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return false;
  }
  
  employees[index].isActive = isActive;
  saveEmployeesToStorage(employees);
  return true;
}

// Update employee password
export function updateEmployeePassword(id: string, newPassword: string): boolean {
  const employees = getEmployeesFromStorage();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return false;
  }
  
  employees[index].password = newPassword;
  saveEmployeesToStorage(employees);
  return true;
}