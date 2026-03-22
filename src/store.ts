import { create } from 'zustand';
import type { 
  BookingState, 
  PIDDatabase, 
  ServiceType, 
  Guest, 
  Sharer,
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

// V2.0.24: 计算表单完成进度
const calculateProgress = (state: BookingState): number => {
  if (!state.selectedServices.has('room') || !state.roomBooking) return 0;
  
  const rb = state.roomBooking;
  let total = 0;
  let completed = 0;
  
  // 必填字段
  const requiredFields = {
    agent: !!rb.agent,
    hotel: !!rb.hotel,
    checkIn: !!rb.checkIn,
    checkOut: !!rb.checkOut,
  };
  
  Object.entries(requiredFields).forEach(([_, filled]) => {
    total++;
    if (filled) completed++;
  });
  
  // 客人信息
  rb.guests.forEach(guest => {
    total += 3; // name, roomType, (oldPID or newPID)
    if (guest.name) completed++;
    if (guest.roomType) completed++;
    if (guest.oldPID || guest.newPID) completed++;
  });
  
  return Math.round((completed / total) * 100);
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
  
  // V2.0.40: 多Sharer支持
  addSharer: (guestId: number) => void;
  removeSharer: (guestId: number, sharerId: number) => void;
  updateSharer: (guestId: number, sharerId: number, data: Partial<Sharer>) => void;
  
  // V2.0.24: 手动计算表单进度（避免自动计算导致的循环）
  calculateFormProgress: () => void;

  // V2.0.24: 验证
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  
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

// ID 计数器
let guestIdCounter = 1;
let sharerIdCounter = 1;
let carIdCounter = 1;
let golfGuestIdCounter = 1;
let oneDayTripGuestIdCounter = 1;

// 预设 Room Booking 初始数据
const getInitialRoomBooking = () => ({
  agent: '',
  hotel: '' as '',
  checkIn: getTodayStr(),
  checkOut: getTomorrowStr(),
  authorizer: 'Jian.Xu',
  rateCode: 'CASBAR',
  deposit: 'No',
  guests: [{
    id: 1,
    oldPID: '',
    newPID: '',
    name: '',
    roomType: '',
    sharers: [] as any,
  }],
});

const initialState: BookingState = {
  selectedServices: new Set(),
  isOneDayTripMode: false,
  roomBooking: getInitialRoomBooking(), // 预设数据，不需要初始化
  carServices: [],
  golfBooking: null,
  busService: null,
  oneDayTrip: null,
  generatedEmail: null,
  emailSubject: null,
  validationErrors: {},
  formProgress: 0,
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
  initRoomBooking: () => set((state) => {
    // V2.0.36: 不设置默认酒店，让用户自己选择
    const defaultGuest: Guest = {
      id: guestIdCounter++,
      oldPID: '',
      newPID: '',
      name: '',
      roomType: '',
      sharers: [], // V2.0.39: 默认空数组，但表单始终可见
    };
    
    const newBooking = {
      ...state.booking,
      roomBooking: {
        agent: '',
        hotel: '' as const, // V2.0.36: 空字符串，不设置默认
        checkIn: getTodayStr(),
        checkOut: getTomorrowStr(),
        authorizer: 'Jian.Xu',
        rateCode: 'CASBAR',
        deposit: 'No',
        guests: [defaultGuest],
      },
    };
    
    return {
      booking: newBooking
    };
  }),

  updateRoomBooking: (data) => set((state) => ({
    booking: {
      ...state.booking,
      roomBooking: state.booking.roomBooking 
        ? { ...state.booking.roomBooking, ...data }
        : null,
    }
  })),
  
  addGuest: () => set((state) => {
    if (!state.booking.roomBooking) return state;
    const newGuest: Guest = {
      id: guestIdCounter++,
      oldPID: '',
      newPID: '',
      name: '',
      roomType: '',
      sharers: [], // V2.0.39: 默认空sharers数组
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
    
    const newBooking = {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        },
        // 移除 formProgress 自动更新，避免循环
        // formProgress: calculateProgress({ ...state.booking, roomBooking: { ...state.booking.roomBooking, guests: state.booking.roomBooking.guests.map((g) => g.id === id ? { ...g, ...data } : g) } }),
      },
    };
    
    return {
      booking: newBooking.booking
    };
  }),
  
  // V2.0.40: 多Sharer支持
  addSharer: (guestId) => set((state) => {
    if (!state.booking.roomBooking) return state;
    
    const newSharer: Sharer = {
      id: sharerIdCounter++,
      oldPID: '',
      newPID: '',
      name: '',
    };
    
    const newBooking = {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === guestId
              ? { ...g, sharers: [...g.sharers, newSharer] }
              : g
          ),
        },
      },
    };
    
    return {
      booking: newBooking.booking
    };
  }),

  removeSharer: (guestId, sharerId) => set((state) => {
    if (!state.booking.roomBooking) return state;

    return {
      booking: {
        ...state.booking,
        roomBooking: {
          ...state.booking.roomBooking,
          guests: state.booking.roomBooking.guests.map((g) =>
            g.id === guestId
              ? { ...g, sharers: g.sharers.filter((s) => s.id !== sharerId) }
              : g
          ),
        },
      },
    };
  }),

  updateSharer: (guestId, sharerId, data) => set((state) => {
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
                  sharers: g.sharers.map((s) =>
                    s.id === sharerId ? { ...s, ...data } : s
                  ),
                }
              : g
          ),
        },
      },
    };
  }),
  
  // V2.0.24: 手动计算表单进度（避免自动计算导致的循环）
  calculateFormProgress: () => set((state) => ({
    booking: {
      ...state.booking,
      formProgress: calculateProgress(state.booking),
    },
  })),

  // V2.0.24: 验证
  setValidationError: (field, error) => set((state) => ({
    booking: {
      ...state.booking,
      validationErrors: { ...state.booking.validationErrors, [field]: error },
    },
  })),
  
  clearValidationError: (field) => set((state) => {
    const newErrors = { ...state.booking.validationErrors };
    delete newErrors[field];
    return {
      booking: {
        ...state.booking,
        validationErrors: newErrors,
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
      
      // V2.0.40: 包含所有sharers
      if (rg.sharers && rg.sharers.length > 0) {
        rg.sharers.forEach((sharer) => {
          newGolfGuests.push({
            id: golfGuestIdCounter++,
            oldPID: sharer.oldPID,
            newPID: sharer.newPID,
            name: sharer.name,
          });
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
    sharerIdCounter = 1;
    carIdCounter = 1;
    golfGuestIdCounter = 1;
    oneDayTripGuestIdCounter = 1;
    set({ booking: initialState });
  },
}));
