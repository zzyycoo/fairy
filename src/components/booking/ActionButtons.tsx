import { Home, FileText, Copy, Save } from 'lucide-react'

interface ActionButtonsProps {
  onBack: () => void
  onGenerateEmail: () => void
  onCopyEmail: () => void
  onSaveToSheets: () => void
}

export const ActionButtons = ({ 
  onBack, 
  onGenerateEmail, 
  onCopyEmail, 
  onSaveToSheets 
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t">
      <button
        onClick={onBack}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
      >
        <Home size={18} /> Back
      </button>
      <button
        onClick={onGenerateEmail}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
      >
        <FileText size={18} /> Generate Email
      </button>
      <button
        onClick={onCopyEmail}
        className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-amber-600 flex items-center gap-2"
      >
        <Copy size={18} /> Copy
      </button>
      <button
        onClick={onSaveToSheets}
        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2"
      >
        <Save size={18} /> Save to Sheets
      </button>
    </div>
  )
}
