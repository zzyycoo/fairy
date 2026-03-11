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
 * Note: Due to no-cors mode, we can't verify success, but errors will be caught
 */
export const saveToGoogleSheets = async (bookingData: BookingData): Promise<{ success: boolean; error?: string }> => {
  const data: SaveToSheetsData = {
    agent: bookingData.agent,
    checkIn: bookingData.checkIn || '',
    authorizer: bookingData.authorizer,
    currentTime: getCurrentTime(),
    guests: bookingData.guests
  }

  try {
    const url = `${GOOGLE_SCRIPT_URL}?data=${encodeURIComponent(JSON.stringify(data))}`
    // no-cors mode means we can't read the response, but the request will be sent
    await fetch(url, { 
      method: 'GET', 
      mode: 'no-cors',
      cache: 'no-cache'
    })
    // Since we can't verify with no-cors, we assume success if no error thrown
    return { success: true }
  } catch (error) {
    console.error('Google Sheets save error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
