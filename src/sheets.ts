// Google Sheets 保存功能 - V2.0.24 真实集成
import { useStore } from './store';
import { formatDate } from './utils';

// Google Sheets Web App URL - 需要用户配置自己的部署URL
const GOOGLE_SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';

export interface SheetRecord {
  timestamp: string;
  agent: string;
  guestName: string;
  oldPID: string;
  newPID: string;
  roomType: string;
  hotel: string;
  checkIn: string;
  checkOut: string;
  sharerNames: string;
  sharerOldPIDs: string;
  sharerNewPIDs: string;
  authorizer: string;
  rateCode: string;
  deposit: string;
}

export function useGoogleSheets() {
  const { booking } = useStore();
  
  const saveToGoogleSheets = async (): Promise<{ success: boolean; message: string; records: SheetRecord[] }> => {
    try {
      const rb = booking.roomBooking;
      if (!rb) {
        return { success: false, message: 'No room booking data', records: [] };
      }
      
      const validGuests = rb.guests.filter(g => g.name);
      if (validGuests.length === 0) {
        return { success: false, message: 'No guests to save', records: [] };
      }
      
      const checkIn = formatDate(rb.checkIn);
      const checkOut = formatDate(rb.checkOut);
      const timestamp = new Date().toISOString();
      
      // 构建保存的数据 - V2.0.40: 支持多sharers
      const records: SheetRecord[] = validGuests.map((guest) => {
        // 收集所有sharer信息
        const sharerNames = guest.sharers?.filter(s => s.name).map(s => s.name).join(', ') || '';
        const sharerOldPIDs = guest.sharers?.filter(s => s.oldPID).map(s => s.oldPID).join(', ') || '';
        const sharerNewPIDs = guest.sharers?.filter(s => s.newPID).map(s => s.newPID).join(', ') || '';
        
        return {
          timestamp,
          agent: rb.agent,
          guestName: guest.name,
          oldPID: guest.oldPID || '',
          newPID: guest.newPID || '',
          roomType: guest.roomType || '',
          hotel: rb.hotel,
          checkIn,
          checkOut,
          sharerNames,
          sharerOldPIDs,
          sharerNewPIDs,
          authorizer: rb.authorizer,
          rateCode: rb.rateCode,
          deposit: rb.deposit,
        };
      });
      
      // 检查是否配置了Google Sheets URL
      if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL === 'YOUR_SCRIPT_ID') {
        console.log('Google Sheets URL not configured. Records:', records);
        return { 
          success: true, // 模拟成功，用于测试
          message: `Ready to save ${records.length} guest(s). Configure VITE_GOOGLE_SHEETS_URL for real integration.`,
          records 
        };
      }
      
      // 使用 fetch API 发送数据
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return { 
        success: true, 
        message: result.message || `Successfully saved ${records.length} guest(s)`,
        records 
      };
    } catch (error) {
      console.error('Google Sheets save error:', error);
      return { 
        success: false, 
        message: `Save failed: ${error instanceof Error ? error.message : String(error)}`,
        records: [] 
      };
    }
  };
  
  return { saveToGoogleSheets };
}

// Google Apps Script 代码模板（需要部署到 Google Apps Script）
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `
/**
 * Google Apps Script for Fairy React Booking System
 * 
 * 部署步骤：
 * 1. 访问 https://script.google.com/
 * 2. 创建新项目
 * 3. 粘贴以下代码
 * 4. 部署为 Web App（执行权限：任何人）
 * 5. 复制 Web App URL 到 .env 文件的 VITE_GOOGLE_SHEETS_URL
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const records = data.records;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No records provided'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 获取活动表格
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getActiveSheet();
    
    // 如果表格为空，添加表头
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Agent',
        'Guest Name',
        'Old PID',
        'New PID',
        'Room Type',
        'Hotel',
        'Check In',
        'Check Out',
        'Sharer Names',
        'Sharer Old PIDs',
        'Sharer New PIDs',
        'Authorizer',
        'Rate Code',
        'Deposit'
      ];
      sheet.appendRow(headers);
      
      // 格式化表头
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4a5568');
      headerRange.setFontColor('white');
    }
    
    // 添加记录
    records.forEach(record => {
      sheet.appendRow([
        record.timestamp,
        record.agent,
        record.guestName,
        record.oldPID,
        record.newPID,
        record.roomType,
        record.hotel,
        record.checkIn,
        record.checkOut,
        record.sharerNames,
        record.sharerOldPIDs,
        record.sharerNewPIDs,
        record.authorizer,
        record.rateCode,
        record.deposit
      ]);
    });
    
    // 自动调整列宽
    sheet.autoResizeColumns(1, 15);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Successfully saved ' + records.length + ' record(s)',
      count: records.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS 支持
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}
`;
