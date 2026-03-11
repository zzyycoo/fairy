import { FileText } from 'lucide-react'

interface PIDImportProps {
  pidLoaded: boolean
  pidCount: number
  onImport: (file: File) => Promise<void>
}

export const PIDImport = ({ pidLoaded, pidCount, onImport }: PIDImportProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onImport(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4">
      <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-green-700 flex items-center gap-2">
            📊 PID Database
          </h3>
          <p className="text-sm text-gray-500">
            {pidLoaded 
              ? `✅ ${pidCount} records loaded` 
              : 'No database loaded. Import Excel to enable auto-fill.'}
          </p>
        </div>
        <label className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-yellow-600 hover:to-amber-600 transition">
          <span className="flex items-center gap-2">
            <FileText size={18} /> Import Excel
          </span>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </label>
      </div>
    </div>
  )
}
