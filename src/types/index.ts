// Service types
export type Service = 'room' | 'car' | 'golf' | 'bus'

// Guest information
export interface Guest {
  oldPID: string
  newPID: string
  name: string
}

// Main booking data
export interface BookingData {
  service: Service
  agent: string
  hotel?: string
  roomType?: string  // 新增房型选择
  checkIn?: string
  checkOut?: string
  authorizer: string
  guests: Guest[]
  // Car service
  carType?: string
  carGuests?: number
  carPhone?: string
  carDate?: string
  carTime?: string
  carPickup?: string
  carDropoff?: string
  carPayment?: string
  // Golf service
  golfDateTime?: string
  golfPax?: number
  golfPayment?: string
  golfNote?: string
  golfAuthorizer?: string
  // Bus service
  busRoute?: 'hcmToHt' | 'htToHcm' | 'both'
  busTime?: string
  busDate?: string
  busSeats?: number
  busAuthorizer?: string
}

// PID database entry
export interface PIDEntry {
  oldPID: string
  newPID: string
  name: string
}

// Service option for UI
export interface ServiceOption {
  key: Service
  icon: string
  label: string
}
