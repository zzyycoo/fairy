import { GOOGLE_SCRIPT_URL } from '../constants'
import { getCurrentTime } from './date'
import type { BookingData } from '../types'

interface SaveToSheetsData {
  agent: string
  checkIn: string
  authorizer: string
  currentTime: string
  guests: BookingData['guests']
}

/**
 * Save booking data to Google Sheets
 */
export const saveToGoogleSheets = async (bookingData: BookingData): Promise<boolean> => {
  const data: SaveToSheetsData = {
    agent: bookingData.agent,
    checkIn: bookingData.checkIn || '',
    authorizer: bookingData.authorizer,
    currentTime: getCurrentTime(),
    guests: bookingData.guests
  }

  try {
    const url = `${GOOGLE_SCRIPT_URL}?data=${encodeURIComponent(JSON.stringify(data))}`
    await fetch(url, { method: 'GET', mode: 'no-cors' })
    return true
  } catch {
    return false
  }
}
