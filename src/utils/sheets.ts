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
 * Save booking data to Google Sheets via POST
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
    // POST 方式发送数据
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Google Sheets save error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
