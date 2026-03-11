import { useState, useCallback } from 'react'

export const useClipboard = () => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      return true
    } catch {
      return false
    }
  }, [])

  return { copied, copy }
}
