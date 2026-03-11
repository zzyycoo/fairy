interface EmailPreviewProps {
  subject: string
  body: string
}

export const EmailPreview = ({ subject, body }: EmailPreviewProps) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-green-700 mb-2">👀 Email Preview</h3>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
        {`Subject: ${subject}\n\n${body}`}
      </pre>
    </div>
  )
}
