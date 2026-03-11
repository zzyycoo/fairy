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
    // 使用 POST 方法，将数据放在 body 中
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data)
    })
    
    // no-cors 模式下无法读取响应，但请求会发送
    return { success: true }
  } catch (error) {
    console.error('Google Sheets save error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
