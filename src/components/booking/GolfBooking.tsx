import { GOLF_PAYMENTS, AUTHORIZERS } from '../../constants'
import type { BookingData } from '../../types'

interface GolfBookingProps {
  data: BookingData
  onUpdate: <K extends keyof BookingData>(field: K, value: BookingData[K]) => void
}

export const GolfBooking = ({ data, onUpdate }: GolfBookingProps) => {
  return (
    <div>
      <h3 className="font-semibold text-green-700 mb-3">⛳ Golf Booking</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="datetime-local"
          value={data.golfDateTime || ''}
          onChange={(e) => onUpdate('golfDateTime', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          placeholder="Pax"
          value={data.golfPax || ''}
          onChange={(e) => onUpdate('golfPax', parseInt(e.target.value) || undefined)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <select
          value={data.golfPayment || ''}
          onChange={(e) => onUpdate('golfPayment', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Payment</option>
          {GOLF_PAYMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <input
          type="text"
          placeholder="Note"
          value={data.golfNote || ''}
          onChange={(e) => onUpdate('golfNote', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <select
          value={data.golfAuthorizer || ''}
          onChange={(e) => onUpdate('golfAuthorizer', e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Authorizer</option>
          {AUTHORIZERS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  )
}
