// Google Sheets integration
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOpykMzPHrhi6pcthRdASWMQdjXO0VQJilRd9R67i1_GRqtBOPBcHDD8fJrHNjY1znCg/exec'

// Agent list
export const AGENTS = [
  'IM',
  'A03 Tun Naing',
  'A171 Pham Duc Huy',
  'Le Cong Ly Thanh',
  'Wang Kan',
  'Chen Cheng Chia'
]

// Authorizer list
export const AUTHORIZERS = ['Kevin Loh', 'IMHUYT', 'Nan.Hao', 'Kingz Chock', 'Jian.Xu']

// Car types
export const CAR_TYPES = [
  { value: 'Limo', label: 'Limo' },
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' }
]

// Golf payment options
export const GOLF_PAYMENTS = [
  { value: 'pro +600/1000 – post to room', label: 'Pro +600/1000 – post to room' },
  { value: 'Primary Comp', label: 'Primary Comp' },
  { value: 'GOA', label: 'GOA' }
]

// Bus routes
export const BUS_ROUTES = [
  { value: 'hcmToHt', label: 'HCM → HT' },
  { value: 'htToHcm', label: 'HT → HCM' },
  { value: 'both', label: 'Both' }
]

// Hotels
export const HOTELS = [
  { value: 'HIR', label: 'HIR' },
  { value: 'IC', label: 'IC' }
]

// Room types
export const ROOM_TYPES = [
  { value: 'Deluxe Room', label: 'Deluxe Room' },
  { value: 'Grand Deluxe Room', label: 'Grand Deluxe Room' },
  { value: 'Premier Suite', label: 'Premier Suite' },
  { value: 'Executive Suite', label: 'Executive Suite' },
  { value: 'Presidential Suite', label: 'Presidential Suite' }
]

// Service options for home page
export const SERVICE_OPTIONS = [
  { key: 'room' as const, icon: '🛏️', label: 'Room Booking' },
  { key: 'car' as const, icon: '🚗', label: 'Car Service' },
  { key: 'golf' as const, icon: '⛳', label: 'Golf Booking' },
  { key: 'bus' as const, icon: '🚌', label: 'Bus Service' }
]
