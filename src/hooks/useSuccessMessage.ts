import { useState, useCallback } from 'react'

export const useSuccessMessage = () => {
  const [message, setMessage] = useState('')

  const show = useCallback((msg: string, duration = 4000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }, [])

  const clear = useCallback(() => {
    setMessage('')
  }, [])

  return { message, show, clear }
}
