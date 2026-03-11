import { BUS_ROUTES, AUTHORIZERS } from '../../constants'
import type { BookingData } from '../../types'

interface BusServiceProps {
  data: BookingData
  onUpdate: <K extends keyof BookingData>(field: K, value: BookingData[K]) => void
}

export const BusService = ({ data, onUpdate }: BusServiceProps) => {
  return (
    <div>
      <h3 className="font-semibold text-green-700 mb-3">🚌 Bus Service</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          value={data.busRoute || ''}
          onChange={(e) => onUpdate('busRoute', e.target.value as BookingData['busRoute'])}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Route</option>
          {BUS_ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <input
          type="time"
          value={data.busTime || ''}
          onChange={(e) => onUpdate('busTime', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          value={data.busDate || ''}
          onChange={(e) => onUpdate('busDate', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          placeholder="Seats"
          value={data.busSeats || ''}
          onChange={(e) => onUpdate('busSeats', parseInt(e.target.value) || undefined)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <select
          value={data.busAuthorizer || ''}
          onChange={(e) => onUpdate('busAuthorizer', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Authorizer</option>
          {AUTHORIZERS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  )
}
