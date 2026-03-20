import { useCallback } from 'react';
import { useStore } from './store';
import type { PIDRecord } from './types';
import * as XLSX from 'xlsx';

// 智能 PID 显示逻辑
export function resolvePID(oldPID: string, newPID: string): string {
  const old = (oldPID || '').trim();
  const nw = (newPID || '').trim();
  
  // 过滤掉默认占位符 "New"
  const newIsReal = nw && nw.toLowerCase() !== 'new';
  const oldIsReal = old && old.toLowerCase() !== 'new';
  
  if (newIsReal) return nw;
  if (oldIsReal) return old;
  return 'New';
}

// 日期格式化
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day.toString().padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const ordinal = day + (day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${ordinal}-${months[date.getMonth()]}`;
}

// PID 搜索 Hook
export function usePIDSearch() {
  const { pidDatabase, setPIDDatabase } = useStore();
  
  const searchPID = useCallback((
    oldPID: string,
    newPID: string,
    onFound: (record: PIDRecord | null, searchedBy: 'old' | 'new' | null) => void
  ) => {
    if (!pidDatabase.loaded) {
      onFound(null, null);
      return;
    }
    
    const old = oldPID.trim();
    const nw = newPID.trim();
    
    if (!old && !nw) {
      onFound(null, null);
      return;
    }
    
    let result: PIDRecord | null = null;
    let searchedBy: 'old' | 'new' | null = null;
    
    // 优先搜索 Old PID
    if (old) {
      const uniqueID = pidDatabase.oldPIDIndex.get(old);
      if (uniqueID) {
        result = pidDatabase.records.get(uniqueID) || null;
        searchedBy = 'old';
      }
    }
    
    // 如果没找到，搜索 New PID
    if (!result && nw) {
      const uniqueID = pidDatabase.newPIDIndex.get(nw);
      if (uniqueID) {
        result = pidDatabase.records.get(uniqueID) || null;
        searchedBy = 'new';
      }
    }
    
    onFound(result, searchedBy);
  }, [pidDatabase]);
  
  const handleFileUpload = useCallback(async (file: File, onProgress: (progress: number) => void) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          const records = new Map<string, PIDRecord>();
          const oldPIDIndex = new Map<string, string>();
          const newPIDIndex = new Map<string, string>();
          let count = 0;
          
          // 分批处理
          const BATCH_SIZE = 5000;
          let index = 0;
          
          const processBatch = () => {
            const end = Math.min(index + BATCH_SIZE, jsonData.length);
            
            for (let i = index; i < end; i++) {
              const row = jsonData[i] as any;
              const oldPID = String(row['Old PID'] || '').trim();
              const newPID = String(row['New PID'] || '').trim();
              const name = String(row['Player Name'] || '').trim();
              
              if (name && (oldPID || newPID)) {
                const uniqueID = newPID || oldPID;
                
                records.set(uniqueID, {
                  oldPID: oldPID || null,
                  newPID: newPID || null,
                  name,
                });
                
                if (oldPID) oldPIDIndex.set(oldPID, uniqueID);
                if (newPID) newPIDIndex.set(newPID, uniqueID);
                
                count++;
              }
            }
            
            const progress = Math.round((end / jsonData.length) * 100);
            onProgress(progress);
            
            if (end < jsonData.length) {
              index = end;
              setTimeout(processBatch, 10);
            } else {
              setPIDDatabase(records, oldPIDIndex, newPIDIndex, count);
              resolve();
            }
          };
          
          processBatch();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, [setPIDDatabase]);
  
  return { searchPID, handleFileUpload, pidDatabase };
}
