import { useState, useCallback } from 'react'
import type { PIDEntry } from '../types'
import { parsePIDDatabase, searchPID } from '../utils/pid'

export const usePIDDatabase = () => {
  const [pidDatabase, setPidDatabase] = useState<Map<string, PIDEntry>>(new Map())
  const [pidLoaded, setPidLoaded] = useState(false)

  const loadFromFile = useCallback((file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(sheet)
          
          const db = parsePIDDatabase(jsonData as Record<string, unknown>[])
          setPidDatabase(db)
          setPidLoaded(true)
          resolve(db.size)
        } catch (err) {
          reject(err)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const lookupPID = useCallback((oldPID: string, newPID: string): PIDEntry | null => {
    return searchPID(pidDatabase, oldPID, newPID)
  }, [pidDatabase])

  return {
    pidDatabase,
    pidLoaded,
    loadFromFile,
    lookupPID
  }
}

// Need to import xlsx
import * as XLSX from 'xlsx'
