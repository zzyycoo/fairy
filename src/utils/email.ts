import type { BookingData, Guest } from '../types'
import { getDisplayPID } from './pid'

/**
 * Generate email content based on booking data
 */
export const generateEmailContent = (
  bookingData: BookingData,
  selectedServices: Set<string>
): { subject: string; body: string } => {
  const { agent, hotel, checkIn, checkOut, authorizer, guests } = bookingData
  const firstGuest = guests[0]
  const displayPID = getDisplayPID(firstGuest)

  let subject = ''
  let body = ''

  // Room booking
  if (selectedServices.has('room')) {
    subject = `[${agent}] ${displayPID} ${firstGuest.name} ${hotel} Hotel Room Booking on ${checkIn}`
    body = `Dear RC team,

Kindly assist us make room booking as below:

Guest name: ${formatGuestList(guests)}

Hotel: ${hotel}
Room type: ${bookingData.roomType || 'Not specified'}
Check in: ${checkIn}
Check out: ${checkOut}
Rate code: CASBAR
Deposit: No
Trip authorizer: ${authorizer}`
  }

  // Car service
  if (selectedServices.has('car')) {
    const { carType, carGuests, carPhone, carDate, carTime, carPickup, carDropoff, carPayment } = bookingData
    body += `\n\n---\n\nDear @Concierge Services\n\nPlease kindly arrange a VIP car as the followings:\n\nCar Type: ${carType}\nName: ${firstGuest.name}\nNumber of guests: ${carGuests}\nPhone: ${carPhone}\nDate & time: ${carTime} ${carDate}\nPick up point: ${carPickup}\nDrop off point: ${carDropoff}\nPayment: ${carPayment}\nAuthorizer: ${authorizer}`
    if (!subject) {
      subject = `[${agent}] ${displayPID} ${firstGuest.name} Car Service ${carDate}`
    }
  }

  // Golf booking
  if (selectedServices.has('golf')) {
    const { golfDateTime, golfPax, golfPayment, golfNote, golfAuthorizer } = bookingData
    body += `\n\n---\n\nDear @The Bluffs Ho Tram - Bookings\n\nGuest's name:\n${formatGuestList(guests)}\n\nDate & Time: ${golfDateTime}\nNo. of pax: ${golfPax}\nNote: ${golfNote}\nPayment: ${golfPayment}\nAuthorizer: ${golfAuthorizer}`
    if (!subject) {
      subject = `[${agent}] ${displayPID} ${firstGuest.name} Golf Booking ${golfDateTime?.split('T')[0]}`
    }
  }

  // Bus service
  if (selectedServices.has('bus')) {
    const { busRoute, busTime, busDate, busSeats, busAuthorizer } = bookingData
    const route = busRoute === 'both' ? 'HCM ↔ HT' : busRoute === 'hcmToHt' ? 'HCM → HT' : 'HT → HCM'
    body += `\n\n---\n\nHi @Grand Service\n\nPlease help to arrange bus seats as below:\n\nName: ${firstGuest.name}\nRoute: ${route} ${busTime} ${busDate}\nSeats: ${busSeats}\nAuthorizer: ${busAuthorizer}`
    if (!subject) {
      subject = `[${agent}] ${displayPID} ${firstGuest.name} Bus Service ${busDate}`
    }
  }

  return { subject, body }
}

/**
 * Format guest list for email
 */
const formatGuestList = (guests: Guest[]): string => {
  return guests.map(g => `${g.name} - ${getDisplayPID(g)}`).join('\n')
}
