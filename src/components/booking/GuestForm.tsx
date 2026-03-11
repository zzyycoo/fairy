import { Plus, Trash2 } from 'lucide-react'
import type { Guest } from '../../types'

interface GuestFormProps {
  guests: Guest[]
  onAddGuest: () => void
  onRemoveGuest: (index: number) => void
  onUpdateGuest: (index: number, field: keyof Guest, value: string) => void
  onSearchPID: (oldPID: string, newPID: string, index: number) => void
}

export const GuestForm = ({ 
  guests, 
  onAddGuest, 
  onRemoveGuest, 
  onUpdateGuest,
  onSearchPID 
}: GuestFormProps) => {
  return (
    <div>
      <h3 className="font-semibold text-green-700 mb-3">👥 Guest Information</h3>
      {guests.map((guest, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Guest #{index + 1}</span>
            {guests.length > 1 && (
              <button 
                onClick={() => onRemoveGuest(index)} 
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Old PID"
              value={guest.oldPID}
              onChange={(e) => onUpdateGuest(index, 'oldPID', e.target.value)}
              onBlur={() => onSearchPID(guest.oldPID, guest.newPID, index)}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="New PID"
              value={guest.newPID}
              onChange={(e) => onUpdateGuest(index, 'newPID', e.target.value)}
              onBlur={() => onSearchPID(guest.oldPID, guest.newPID, index)}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Guest Name"
              value={guest.name}
              onChange={(e) => onUpdateGuest(index, 'name', e.target.value.toUpperCase())}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      ))}
      <button 
        onClick={onAddGuest} 
        className="text-green-600 font-medium flex items-center gap-1"
      >
        <Plus size={18} /> Add Guest
      </button>
    </div>
  )
}
