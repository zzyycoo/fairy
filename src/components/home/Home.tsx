import { SERVICE_OPTIONS } from '../../constants'
import type { Service } from '../../types'

interface HomeProps {
  selectedServices: Set<Service>
  onToggleService: (service: Service) => void
  onContinue: () => void
}

export const Home = ({ selectedServices, onToggleService, onContinue }: HomeProps) => {
  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 pb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-serif font-bold text-green-800 mb-4">
          Please Select Services to Book
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {SERVICE_OPTIONS.map(({ key, icon, label }) => (
            <div
              key={key}
              onClick={() => onToggleService(key)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center relative ${
                selectedServices.has(key)
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-yellow-400'
              }`}
            >
              <div className="text-3xl mb-1">{icon}</div>
              <div className="font-semibold text-green-700">{label}</div>
              {selectedServices.has(key) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          disabled={selectedServices.size === 0}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Continue Booking →
        </button>
      </div>
    </div>
  )
}
