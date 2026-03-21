// 类型定义 - 严格遵循 Booking V2.0.42

export interface Guest {
  id: number;
  oldPID: string;
  newPID: string;
  name: string;
  roomType?: string;
  // V2.0.40: 多Sharer支持
  sharers: Sharer[];
}

export interface Sharer {
  id: number;
  oldPID: string;
  newPID: string;
  name: string;
}

export interface CarService {
  id: number;
  oldPID: string;
  newPID: string;
  name: string;
  carType: 'limo' | 'sedan' | 'SUV';
  guests: number;
  phone: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  payment: string;
  authorizer: string;
}

export interface GolfGuest {
  id: number;
  oldPID: string;
  newPID: string;
  name: string;
}

export interface GolfBooking {
  dateTime: string;
  pax: number;
  authorizer: string;
  payment: string;
  note: string;
  guests: GolfGuest[];
}

export interface BusRoute {
  hcmToHt: boolean;
  htToHcm: boolean;
  hcmToHtDetails?: {
    time: string;
    date: string;
    seats: number;
  };
  htToHcmDetails?: {
    time: string;
    date: string;
    seats: number;
  };
}

export interface BusService {
  oldPID: string;
  newPID: string;
  passenger: string;
  authorizer: string;
  routes: BusRoute;
}

export interface OneDayTripGuest {
  id: number;
  oldPID: string;
  newPID: string;
  name: string;
}

export interface OneDayTrip {
  agent: string;
  date: string;
  subjectType: 'patron' | 'oneday';
  guests: OneDayTripGuest[];
}

export type ServiceType = 'room' | 'car' | 'golf' | 'bus';

export interface BookingState {
  // 服务选择
  selectedServices: Set<ServiceType>;
  isOneDayTripMode: boolean;
  
  // Room Booking
  roomBooking: {
    agent: string;
    hotel: 'HIR' | 'IC' | '';
    checkIn: string;
    checkOut: string;
    authorizer: string;
    rateCode: string;
    deposit: string;
    guests: Guest[];
  } | null;
  
  // Car Service
  carServices: CarService[];
  
  // Golf Booking
  golfBooking: GolfBooking | null;
  
  // Bus Service
  busService: BusService | null;
  
  // One Day Trip
  oneDayTrip: OneDayTrip | null;
  
  // 生成的邮件
  generatedEmail: string | null;
  emailSubject: string | null;
  
  // V2.0.24: 表单验证状态
  validationErrors: Record<string, string>;
  
  // V2.0.24: 进度
  formProgress: number;
}

// PID 数据库类型
export interface PIDRecord {
  oldPID: string | null;
  newPID: string | null;
  name: string;
}

export interface PIDDatabase {
  records: Map<string, PIDRecord>; // key: uniqueID (优先newPID，否则oldPID)
  oldPIDIndex: Map<string, string>; // oldPID -> uniqueID
  newPIDIndex: Map<string, string>; // newPID -> uniqueID
  loaded: boolean;
  count: number;
}
