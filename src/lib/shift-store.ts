import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShiftSchedule {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  description: string;
  isActive: boolean;
  color: string;
}

export interface ShiftEmployee {
  id: string;
  name: string;
  role: 'Supervisor' | 'Kasir Roda 2' | 'Kasir Roda 4' | 'Security' | 'Maintenance';
  shiftId: string;
  contactNumber: string;
  password?: string; // For authentication via phone number
  email?: string;
  isOnDuty: boolean;
  canAccessDashboard: boolean; // For emergency access
}

export interface ShiftHandover {
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
  status: 'pending' | 'completed' | 'verified';
  createdAt: string;
}

interface ShiftStore {
  // Shift Schedules
  shifts: ShiftSchedule[];
  currentShift: ShiftSchedule | null;
  
  // Employees
  employees: ShiftEmployee[];
  
  // Handovers
  handovers: ShiftHandover[];
  
  // Actions
  addShift: (shift: Omit<ShiftSchedule, 'id'>) => void;
  updateShift: (id: string, shift: Partial<ShiftSchedule>) => void;
  deleteShift: (id: string) => void;
  setCurrentShift: () => void;
  
  addEmployee: (employee: Omit<ShiftEmployee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<ShiftEmployee>) => void;
  deleteEmployee: (id: string) => void;
  
  createHandover: (handover: Omit<ShiftHandover, 'id' | 'createdAt'>) => void;
  updateHandover: (id: string, handover: Partial<ShiftHandover>) => void;
  getActiveEmployees: () => ShiftEmployee[];
  getCurrentShiftEmployees: () => ShiftEmployee[];
  
  // Utilities
  isShiftActive: (shift: ShiftSchedule) => boolean;
  getNextShift: () => ShiftSchedule | null;
  getShiftDuration: (shift: ShiftSchedule) => number;
}

// Default shifts configuration
const defaultShifts: ShiftSchedule[] = [
  {
    id: 'shift-morning',
    name: 'Shift Pagi',
    startTime: '06:00',
    endTime: '14:00',
    description: 'Shift pagi untuk pelayanan pagi hingga siang',
    isActive: true,
    color: '#f59e0b' // QR-Tunai Yellow
  },
  {
    id: 'shift-afternoon',
    name: 'Shift Siang',
    startTime: '14:00',
    endTime: '22:00',
    description: 'Shift siang untuk pelayanan siang hingga malam',
    isActive: true,
    color: '#4f46e5' // QR-Tunai Blue
  },
  {
    id: 'shift-night',
    name: 'Shift Malam',
    startTime: '22:00',
    endTime: '06:00',
    description: 'Shift malam untuk pelayanan 24 jam',
    isActive: true,
    color: '#1e1b4b' // Dark Blue
  }
];

// Default employees - Updated for dual cashier system
const defaultEmployees: ShiftEmployee[] = [
  {
    id: 'emp-001',
    name: 'Ahmad Supervisor',
    role: 'Supervisor',
    shiftId: 'shift-morning',
    contactNumber: '081234567890',
    password: 'admin123', // Default password
    email: 'ahmad.supervisor@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
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
    canAccessDashboard: true
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
    canAccessDashboard: true
  },
  {
    id: 'emp-004',
    name: 'Budi Security',
    role: 'Security',
    shiftId: 'shift-morning',
    contactNumber: '081234567893',
    password: 'security123',
    isOnDuty: false,
    canAccessDashboard: true // Emergency access
  },
  {
    id: 'emp-005',
    name: 'Dewi Supervisor',
    role: 'Supervisor',
    shiftId: 'shift-afternoon',
    contactNumber: '081234567894',
    password: 'admin123',
    email: 'dewi.supervisor@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
  },
  {
    id: 'emp-006',
    name: 'Roni Kasir Roda 2',
    role: 'Kasir Roda 2',
    shiftId: 'shift-afternoon',
    contactNumber: '081234567895',
    password: 'kasir123',
    email: 'roni.kasir@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
  },
  {
    id: 'emp-007',
    name: 'Tina Kasir Roda 4',
    role: 'Kasir Roda 4',
    shiftId: 'shift-afternoon',
    contactNumber: '081234567896',
    password: 'kasir123',
    email: 'tina.kasir@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
  },
  {
    id: 'emp-008',
    name: 'Lisa Security',
    role: 'Security',
    shiftId: 'shift-afternoon',
    contactNumber: '081234567897',
    password: 'security123',
    isOnDuty: false,
    canAccessDashboard: true // Emergency access
  },
  {
    id: 'emp-009',
    name: 'Joko Supervisor',
    role: 'Supervisor',
    shiftId: 'shift-night',
    contactNumber: '081234567898',
    password: 'admin123',
    email: 'joko.supervisor@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
  },
  {
    id: 'emp-010',
    name: 'Maya Kasir Roda 2',
    role: 'Kasir Roda 2',
    shiftId: 'shift-night',
    contactNumber: '081234567899',
    password: 'kasir123',
    email: 'maya.kasir@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
  },
  {
    id: 'emp-011',
    name: 'Rio Kasir Roda 4',
    role: 'Kasir Roda 4',
    shiftId: 'shift-night',
    contactNumber: '081234567900',
    password: 'kasir123',
    email: 'rio.kasir@qrtunai.com',
    isOnDuty: false,
    canAccessDashboard: true
  },
  {
    id: 'emp-012',
    name: 'Andi Security',
    role: 'Security',
    shiftId: 'shift-night',
    contactNumber: '081234567901',
    password: 'security123',
    isOnDuty: false,
    canAccessDashboard: true // Emergency access
  }
];

export const useShiftStore = create<ShiftStore>()(
  persist(
    (set, get) => ({
      shifts: defaultShifts,
      currentShift: null,
      employees: defaultEmployees,
      handovers: [],

      addShift: (shiftData) => {
        const newShift: ShiftSchedule = {
          ...shiftData,
          id: `shift-${Date.now()}`
        };
        set((state) => ({
          shifts: [...state.shifts, newShift]
        }));
      },

      updateShift: (id, shiftData) => {
        set((state) => ({
          shifts: state.shifts.map(shift => 
            shift.id === id ? { ...shift, ...shiftData } : shift
          )
        }));
      },

      deleteShift: (id) => {
        set((state) => ({
          shifts: state.shifts.filter(shift => shift.id !== id)
        }));
      },

      setCurrentShift: () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
        
        const { shifts } = get();
        
        for (const shift of shifts) {
          if (!shift.isActive) continue;
          
          const [startHour, startMin] = shift.startTime.split(':').map(Number);
          const [endHour, endMin] = shift.endTime.split(':').map(Number);
          
          let startMinutes = startHour * 60 + startMin;
          let endMinutes = endHour * 60 + endMin;
          
          // Handle overnight shifts
          if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60; // Add 24 hours
            if (currentTime < startMinutes) {
              // We're in the next day portion of an overnight shift
              if (currentTime <= (endMinutes - 24 * 60)) {
                set({ currentShift: shift });
                return;
              }
            }
          }
          
          if (currentTime >= startMinutes && currentTime < endMinutes) {
            set({ currentShift: shift });
            return;
          }
        }
        
        set({ currentShift: null });
      },

      addEmployee: (employeeData) => {
        const newEmployee: ShiftEmployee = {
          ...employeeData,
          id: `emp-${Date.now()}`
        };
        set((state) => ({
          employees: [...state.employees, newEmployee]
        }));
      },

      updateEmployee: (id, employeeData) => {
        set((state) => ({
          employees: state.employees.map(emp => 
            emp.id === id ? { ...emp, ...employeeData } : emp
          )
        }));
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter(emp => emp.id !== id)
        }));
      },

      createHandover: (handoverData) => {
        const newHandover: ShiftHandover = {
          ...handoverData,
          id: `handover-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          handovers: [...state.handovers, newHandover]
        }));
      },

      updateHandover: (id, handoverData) => {
        set((state) => ({
          handovers: state.handovers.map(handover => 
            handover.id === id ? { ...handover, ...handoverData } : handover
          )
        }));
      },

      getActiveEmployees: () => {
        return get().employees.filter(emp => emp.isOnDuty);
      },

      getCurrentShiftEmployees: () => {
        const { currentShift, employees } = get();
        if (!currentShift) return [];
        return employees.filter(emp => emp.shiftId === currentShift.id);
      },

      isShiftActive: (shift) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        let startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes) {
          endMinutes += 24 * 60;
          if (currentTime < startMinutes) {
            return currentTime <= (endMinutes - 24 * 60);
          }
        }
        
        return currentTime >= startMinutes && currentTime < endMinutes;
      },

      getNextShift: () => {
        const { shifts, currentShift } = get();
        if (!currentShift) return null;
        
        const currentIndex = shifts.findIndex(s => s.id === currentShift.id);
        const nextIndex = (currentIndex + 1) % shifts.length;
        return shifts[nextIndex];
      },

      getShiftDuration: (shift) => {
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        let startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes) {
          endMinutes += 24 * 60;
        }
        
        return endMinutes - startMinutes; // duration in minutes
      }
    }),
    {
      name: 'shift-management-storage',
    }
  )
);

// Helper functions
export const formatTime = (time: string) => {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  return `${displayHour}:${minute} ${period}`;
};

export const getCurrentShiftName = () => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 14) return 'Shift Pagi';
  if (hour >= 14 && hour < 22) return 'Shift Siang';
  return 'Shift Malam';
};

export const getShiftColor = (shiftName: string) => {
  switch (shiftName) {
    case 'Shift Pagi': return '#f59e0b';
    case 'Shift Siang': return '#4f46e5';
    case 'Shift Malam': return '#1e1b4b';
    default: return '#6b7280';
  }
};