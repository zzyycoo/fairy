import { create } from 'zustand';
import type { 
  BookingState, 
  PIDDatabase, 
  ServiceType, 
  Guest, 
  CarService, 
  GolfGuest, 
  OneDayTripGuest 
} from './types';

// 获取今天和明天的日期字符串
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface StoreState {
  // 暗色模式
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // PID 数据库
  pidDatabase: PIDDatabase;
  setPIDDatabase: (data: Map<string, any>, oldIndex: Map<string, string>, newIndex: Map<string, string>, count: number) => void;
  
  // 预订状态
  booking: BookingState;
  
  // 服务选择
  toggleService: (service: ServiceType) => void;
  clearServices: () => void;
  
  // Room Booking
  initRoomBooking: () => void;
  updateRoomBooking: (data: Partial<BookingState['roomBooking']>) => void;
  addGuest: () => void;
  removeGuest: (id: number) => void;
  updateGuest: (id: number, data: Partial<Guest>) => void;
  toggleSharer: (guestId: number) => void;
  updateSharer: (guestId: number, data: Partial<Guest['sharer']>) => void;
  removeSharer: (guestId: number) => void;
  
  // Car Service
  addCarService: () => void;
  removeCarService: (id: number) => void;
  updateCarService: (id: number, data: Partial<CarService>) => void;
  
  // Golf Booking
  initGolfBooking: () => void;
  updateGolfBooking: (data: Partial<BookingState['golfBooking']>) => void;
  addGolfGuest: () => void;
  removeGolfGuest: (id: number) => void;
  updateGolfGuest: (id: number, data: Partial<GolfGuest>) => void;
  syncGolfGuestsFromRoom: () => void;
  
  // Bus Service
  initBusService: () => void;
  updateBusService: (data: Partial<BookingState['busService']>) => void;
  toggleBusRoute: (route: 'hcmToHt' | 'htToHcm') => void;
  
  // One Day Trip
  initOneDayTrip: () => void;
  updateOneDayTrip: (data: Partial<BookingState['oneDayTrip']>) => void;
  addOneDayTripGuest: () => void;
  removeOneDayTripGuest: (id: number) => void;
  updateOneDayTripGuest: (id: number, data: Partial<OneDayTripGuest>) => void;
  setOneDayTripMode: (mode: boolean) => void;
  
  // 邮件
  setGeneratedEmail: (email: string | null, subject: string | null) => void;
  
  // 重置
  resetAll: () => void;
}

// Guest ID 计数器
let guestIdCounter = 1;
let carIdCounter = 1;
let golfGuestIdCounter = 1;
let oneDayTripGuestIdCounter = 1;

const initialState: BookingState = {
  selectedServices: new Set(),
  isOneDayTripMode: false,
  roomBooking: null,
  carServices: [],
  golfBooking: null,
  busService: null,
  oneDayTrip: null,
  generatedEmail: null,
  emailSubject: null,
};

export const useStore = create<StoreState>((set) => ({
  // 暗色模式 - 从 localStorage 读取
  darkMode: (() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('fairy-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })(),
  
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    localStorage.setItem('fairy-dark-mode', String(newMode));
    return { darkMode: newMode };
  }),
  
  // PID 数据库
  pidDatabase: {
    records: new Map(),
    oldPIDIndex: new Map(),
    newPIDIndex: new Map(),
    loaded: false,
    count: 0,
  },
  
  setPIDDatabase: (records, oldIndex, newIndex, count) => set({
    pidDatabase: {
      records,
      oldPIDIndex: oldIndex,
      newPIDIndex: newIndex,
      loaded: true,
      count,
    },
  }),
  
  // 预订状态
  booking: initialState,
  
  // 服务选择
  toggleService: (service) => set((state) => {
    const newSet = new Set(state.booking.selectedServices);
    if (newSet.has(service)) {
      newSet.delete(service);
    } else {
      newSet.add(service);
    }
    return { booking: { ...state.booking, selectedServices: newSet } };
  }),
  
  clearServices: () => set((state) => ({
    booking: { ...state.booking, selectedServices: new Set() },
  })),
  
  // Room Booking
  initRoomBooking: () => set((state) => ({
    booking: {
      ...state.booking,
      roomBooking: {
        agent: '',
        hotel: '',
        checkIn: getTodayStr(),
        checkOut: getTomorrowStr(),
        authorizer: 'Jian.Xu',
        rateCode: 'CASBAR',
        deposit: 'No',
        guests: [],
      },
    },
  })),
  
  updateRoomBooking: (data) => set((state) => ({
    booking: {
      ...state.booking,
      roomBooking: state.booking.roomBooking 
        ? { ...state.booking.roomBooking, ...data }
        : null,
    },
  })),
  
  addGuest: () => set((state) => {
    if (!state.booking.roomBooking) return state;
    const newGuest: Guest = {
      id: guestIdCounter++,
      oldPID: '',
      newPID: '',
      name: '',
      roomType: '',
    };
    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: [...state.booking.roomBooking.guests, newGuest],
        },
      },
    };
  }),
  
  removeGuest: (id) => set((state) => {
    if (!state.booking.roomBooking) return state;
    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.filter((g) => g.id !== id),
        },
      },
    };
  }),
  
  updateGuest: (id, data) => set((state) => {
    if (!state.booking.roomBooking) return state;
    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        },
      },
    };
  }),
  
  toggleSharer: (guestId) => set((state) => {
    if (!state.booking.roomBooking) return state;
    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  sharer: g.sharer
                    ? undefined
                    : { oldPID: '', newPID: '', name: '' },
                }
              : g
          ),
        },
      },
    };
  }),
  
  updateSharer: (guestId, data) => set((state) => {
    if (!state.booking.roomBooking) return state;
    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === guestId && g.sharer
              ? { ...g, sharer: { ...g.sharer, ...data } }
              : g
          ),
        },
      },
    };
  }),
  
  removeSharer: (guestId) => set((state) => {
    if (!state.booking.roomBooking) return state;
    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === guestId ? { ...g, sharer: undefined } : g
          ),
        },
      },
    };
  }),
  
  // Car Service
  addCarService: () => set((state) => {
    const roomGuest = state.booking.roomBooking?.guests[0];
    const newCar: CarService = {
      id: carIdCounter++,
      oldPID: '',
      newPID: '',
      name: roomGuest?.name || '',
      carType: 'limo',
      guests: 4,
      phone: '0343222771',
      date: state.booking.roomBooking?.checkIn || getTodayStr(),
      time: '12:00',
      pickup: '',
      dropoff: '',
      payment: 'Free Comp (If guest enough 2000 points)',
      authorizer: 'xujian',
    };
    return {
      booking: {
        ...state.booking,
        carServices: [...state.booking.carServices, newCar],
      },
    };
  }),
  
  removeCarService: (id) => set((state) => ({
    booking: {
      ...state.booking,
      carServices: state.booking.carServices.filter((c) => c.id !== id),
    },
  })),
  
  updateCarService: (id, data) => set((state) => ({
    booking: {
      ...state.booking,
      carServices: state.booking.carServices.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    },
  })),
  
  // Golf Booking
  initGolfBooking: () => set((state) => ({
    booking: {
      ...state.booking,
      golfBooking: {
        dateTime: '',
        pax: 4,
        authorizer: 'Jian.Xu',
        payment: 'pro +600/1000 – post to room',
        note: 'Casino Rate (If guests show CSN membership)',
        guests: [],
      },
    },
  })),
  
  updateGolfBooking: (data) => set((state) => ({
    booking: {
      ...state.booking,
      golfBooking: state.booking.golfBooking
        ? { ...state.booking.golfBooking, ...data }
        : null,
    },
  })),
  
  addGolfGuest: () => set((state) => {
    if (!state.booking.golfBooking) return state;
    const newGuest: GolfGuest = {
      id: golfGuestIdCounter++,
      oldPID: '',
      newPID: '',
      name: '',
    };
    const newGuests = [...state.booking.golfBooking.guests, newGuest];
    return {
      booking: {
        ...state.booking,
        golfBooking: {
          ...state.booking.golfBooking,
          guests: newGuests,
          pax: newGuests.length,
        },
      },
    };
  }),
  
  removeGolfGuest: (id) => set((state) => {
    if (!state.booking.golfBooking) return state;
    const newGuests = state.booking.golfBooking.guests.filter((g) => g.id !== id);
    return {
      booking: {
        ...state.booking,
        golfBooking: {
          ...state.booking.golfBooking,
          guests: newGuests,
          pax: newGuests.length,
        },
      },
    };
  }),
  
  updateGolfGuest: (id, data) => set((state) => {
    if (!state.booking.golfBooking) return state;
    return {
      booking: {
        ...state.booking,
        golfBooking: {
          ...state.booking.golfBooking,
          guests: state.booking.golfBooking.guests.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        },
      },
    };
  }),
  
  syncGolfGuestsFromRoom: () => set((state) => {
    if (!state.booking.golfBooking || !state.booking.roomBooking) return state;
    
    const roomGuests = state.booking.roomBooking.guests;
    const newGolfGuests: GolfGuest[] = [];
    
    roomGuests.forEach((rg) => {
      newGolfGuests.push({
        id: golfGuestIdCounter++,
        oldPID: rg.oldPID,
        newPID: rg.newPID,
        name: rg.name,
      });
      
      if (rg.sharer) {
        newGolfGuests.push({
          id: golfGuestIdCounter++,
          oldPID: rg.sharer.oldPID,
          newPID: rg.sharer.newPID,
          name: rg.sharer.name,
        });
      }
    });
    
    return {
      booking: {
        ...state.booking,
        golfBooking: {
          ...state.booking.golfBooking,
          guests: newGolfGuests,
          pax: newGolfGuests.length,
        },
      },
    };
  }),
  
  // Bus Service
  initBusService: () => set((state) => {
    const roomGuest = state.booking.roomBooking?.guests[0];
    return {
      booking: {
        ...state.booking,
        busService: {
          oldPID: roomGuest?.oldPID || '',
          newPID: roomGuest?.newPID || '',
          passenger: roomGuest?.name || '',
          authorizer: 'Jian.Xu',
          routes: {
            hcmToHt: false,
            htToHcm: false,
            hcmToHtDetails: { time: '12:00 pm', date: getTodayStr(), seats: 5 },
            htToHcmDetails: { time: '14:00 pm', date: getTodayStr(), seats: 5 },
          },
        },
      },
    };
  }),
  
  updateBusService: (data) => set((state) => ({
    booking: {
      ...state.booking,
      busService: state.booking.busService
        ? { ...state.booking.busService, ...data }
        : null,
    },
  })),
  
  toggleBusRoute: (route) => set((state) => {
    if (!state.booking.busService) return state;
    return {
      booking: {
        ...state.booking,
        busService: {
          ...state.booking.busService,
          routes: {
            ...state.booking.busService.routes,
            [route]: !state.booking.busService.routes[route],
          },
        },
      },
    };
  }),
  
  // One Day Trip
  initOneDayTrip: () => set((state) => ({
    booking: {
      ...state.booking,
      oneDayTrip: {
        agent: '',
        date: getTodayStr(),
        subjectType: 'patron',
        guests: [],
      },
    },
  })),
  
  updateOneDayTrip: (data) => set((state) => ({
    booking: {
      ...state.booking,
      oneDayTrip: state.booking.oneDayTrip
        ? { ...state.booking.oneDayTrip, ...data }
        : null,
    },
  })),
  
  addOneDayTripGuest: () => set((state) => {
    if (!state.booking.oneDayTrip) return state;
    const newGuest: OneDayTripGuest = {
      id: oneDayTripGuestIdCounter++,
      oldPID: '',
      newPID: '',
      name: '',
    };
    return {
      booking: {
        ...state.booking,
        oneDayTrip: {
          ...state.booking.oneDayTrip,
          guests: [...state.booking.oneDayTrip.guests, newGuest],
        },
      },
    };
  }),
  
  removeOneDayTripGuest: (id) => set((state) => {
    if (!state.booking.oneDayTrip) return state;
    return {
      booking: {
        ...state.booking,
        oneDayTrip: {
          ...state.booking.oneDayTrip,
          guests: state.booking.oneDayTrip.guests.filter((g) => g.id !== id),
        },
      },
    };
  }),
  
  updateOneDayTripGuest: (id, data) => set((state) => {
    if (!state.booking.oneDayTrip) return state;
    return {
      booking: {
        ...state.booking,
        oneDayTrip: {
          ...state.booking.oneDayTrip,
          guests: state.booking.oneDayTrip.guests.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        },
      },
    };
  }),
  
  setOneDayTripMode: (mode) => set((state) => ({
    booking: {
      ...state.booking,
      isOneDayTripMode: mode,
    },
  })),
  
  // 邮件
  setGeneratedEmail: (email, subject) => set((state) => ({
    booking: {
      ...state.booking,
      generatedEmail: email,
      emailSubject: subject,
    },
  })),
  
  // 重置
  resetAll: () => {
    guestIdCounter = 1;
    carIdCounter = 1;
    golfGuestIdCounter = 1;
    oneDayTripGuestIdCounter = 1;
    set({ booking: initialState });
  },
}));
