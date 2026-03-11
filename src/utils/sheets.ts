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
 * Save booking data to Google Sheets via GET
 * 匹配 Google Apps Script doGet(e) 函数
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
    // GET 方式：将数据作为 URL 参数传递
    const url = `${GOOGLE_SCRIPT_URL}?data=${encodeURIComponent(JSON.stringify(data))}`
    
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
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
