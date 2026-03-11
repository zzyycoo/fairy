import type { Guest, PIDEntry } from '../types'

/**
 * Parse PID database from Excel data
 */
export const parsePIDDatabase = (jsonData: Record<string, unknown>[]): Map<string, PIDEntry> => {
  const db = new Map<string, PIDEntry>()

  jsonData.forEach((row) => {
    const oldPID = String(row['Old PID'] || '').trim()
    const newPID = String(row['New PID'] || '').trim()
    const name = String(row['Player Name'] || '').trim()

    if (name && (oldPID || newPID)) {
      const entry: PIDEntry = { oldPID, newPID, name }
      const key = newPID || oldPID
      db.set(key, entry)
      if (oldPID) db.set(oldPID, entry)
    }
  })

  return db
}

/**
 * Search PID in database
 */
export const searchPID = (
  db: Map<string, PIDEntry>,
  oldPID: string,
  newPID: string
): PIDEntry | null => {
  if (oldPID) {
    const result = db.get(oldPID)
    if (result) return result
  }
  if (newPID) {
    const result = db.get(newPID)
    if (result) return result
  }
  return null
}

/**
 * Get display PID for a guest
 */
export const getDisplayPID = (guest: Guest): string => {
  return guest.newPID !== 'New' ? guest.newPID : (guest.oldPID || 'New')
}
