import { useState, useCallback } from 'react'
import type { BookingData, Guest } from '../types'
import { getToday, getTomorrow } from '../utils/date'

const createDefaultGuest = (): Guest => ({
  oldPID: '',
  newPID: 'New',
  name: ''
})

const createDefaultBookingData = (): BookingData => ({
  service: 'room',
  agent: '',
  hotel: '',
  checkIn: getToday(),
  checkOut: getTomorrow(),
  authorizer: 'Jian.Xu',
  guests: [createDefaultGuest()]
})

export const useBookingData = () => {
  const [bookingData, setBookingData] = useState<BookingData>(createDefaultBookingData())

  const updateField = useCallback(<K extends keyof BookingData>(
    field: K,
    value: BookingData[K]
  ) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }, [])

  const addGuest = useCallback(() => {
    setBookingData(prev => ({
      ...prev,
      guests: [...prev.guests, createDefaultGuest()]
    }))
  }, [])

  const removeGuest = useCallback((index: number) => {
    setBookingData(prev => {
      if (prev.guests.length === 1) return prev
      return {
        ...prev,
        guests: prev.guests.filter((_, i) => i !== index)
      }
    })
  }, [])

  const updateGuest = useCallback((index: number, field: keyof Guest, value: string) => {
    setBookingData(prev => {
      const newGuests = [...prev.guests]
      newGuests[index] = { ...newGuests[index], [field]: value }
      return { ...prev, guests: newGuests }
    })
  }, [])

  const setGuest = useCallback((index: number, guest: Guest) => {
    setBookingData(prev => {
      const newGuests = [...prev.guests]
      newGuests[index] = guest
      return { ...prev, guests: newGuests }
    })
  }, [])

  const resetData = useCallback(() => {
    setBookingData(createDefaultBookingData())
  }, [])

  return {
    bookingData,
    setBookingData,
    updateField,
    addGuest,
    removeGuest,
    updateGuest,
    setGuest,
    resetData
  }
}
