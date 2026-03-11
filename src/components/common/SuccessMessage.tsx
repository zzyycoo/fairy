interface SuccessMessageProps {
  message: string
}

export const SuccessMessage = ({ message }: SuccessMessageProps) => {
  if (!message) return null

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      {message}
    </div>
  )
}
