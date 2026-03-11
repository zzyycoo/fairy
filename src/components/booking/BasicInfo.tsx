import { AGENTS, AUTHORIZERS, HOTELS, ROOM_TYPES } from '../../constants'
import type { BookingData } from '../../types'

interface BasicInfoProps {
  data: BookingData
  showRoomFields: boolean
  onUpdate: <K extends keyof BookingData>(field: K, value: BookingData[K]) => void
}

export const BasicInfo = ({ data, showRoomFields, onUpdate }: BasicInfoProps) => {
  return (
    <div>
      <h2 className="text-xl font-serif font-bold text-green-800 mb-4">📝 Booking Information</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Agent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
          <select
            value={data.agent}
            onChange={(e) => onUpdate('agent', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select...</option>
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Hotel (Room only) */}
        {showRoomFields && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
            <select
              value={data.hotel}
              onChange={(e) => onUpdate('hotel', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select...</option>
              {HOTELS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        )}

        {/* Room Type (Room only) */}
        {showRoomFields && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select
              value={data.roomType}
              onChange={(e) => onUpdate('roomType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select...</option>
              {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        )}

        {/* Check In/Out (Room only) */}
        {showRoomFields && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
              <input
                type="date"
                value={data.checkIn}
                onChange={(e) => onUpdate('checkIn', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
              <input
                type="date"
                value={data.checkOut}
                onChange={(e) => onUpdate('checkOut', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {/* Authorizer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Authorizer</label>
          <select
            value={data.authorizer}
            onChange={(e) => onUpdate('authorizer', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {AUTHORIZERS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
