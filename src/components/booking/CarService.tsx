import { CAR_TYPES } from '../../constants'
import type { BookingData } from '../../types'

interface CarServiceProps {
  data: BookingData
  onUpdate: <K extends keyof BookingData>(field: K, value: BookingData[K]) => void
}

export const CarService = ({ data, onUpdate }: CarServiceProps) => {
  return (
    <div>
      <h3 className="font-semibold text-green-700 mb-3">🚗 Car Service</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          value={data.carType}
          onChange={(e) => onUpdate('carType', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Car Type</option>
          {CAR_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input
          type="number"
          placeholder="Guests"
          value={data.carGuests || ''}
          onChange={(e) => onUpdate('carGuests', parseInt(e.target.value) || undefined)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={data.carPhone || ''}
          onChange={(e) => onUpdate('carPhone', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          value={data.carDate || ''}
          onChange={(e) => onUpdate('carDate', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="time"
          value={data.carTime || ''}
          onChange={(e) => onUpdate('carTime', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Pick Up"
          value={data.carPickup || ''}
          onChange={(e) => onUpdate('carPickup', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Drop Off"
          value={data.carDropoff || ''}
          onChange={(e) => onUpdate('carDropoff', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Payment"
          value={data.carPayment || ''}
          onChange={(e) => onUpdate('carPayment', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  )
}
