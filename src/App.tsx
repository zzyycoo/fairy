import { useState } from 'react'
import * as XLSX from 'xlsx'
import { FileText, Save, Home, Plus, Trash2, Copy } from 'lucide-react'

// Types
type Service = 'room' | 'car' | 'golf' | 'bus'

interface Guest {
  oldPID: string
  newPID: string
  name: string
}

interface BookingData {
  service: Service
  agent: string
  hotel?: string
  checkIn?: string
  checkOut?: string
  authorizer: string
  guests: Guest[]
  carType?: string
  carGuests?: number
  carPhone?: string
  carDate?: string
  carTime?: string
  carPickup?: string
  carDropoff?: string
  carPayment?: string
  golfDateTime?: string
  golfPax?: number
  golfPayment?: string
  golfNote?: string
  golfAuthorizer?: string
  busRoute?: 'hcmToHt' | 'htToHcm' | 'both'
  busTime?: string
  busDate?: string
  busSeats?: number
  busAuthorizer?: string
}

// Google Sheets Integration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOpykMzPHrhi6pcthRdASWMQdjXO0VQJilRd9R67i1_GRqtBOPBcHDD8fJrHNjY1znCg/exec'

const AGENTS = ['IM', 'A03 Tun Naing', 'A171 Pham Duc Huy', 'Le Cong Ly Thanh', 'Wang Kan', 'Chen Cheng Chia']
const AUTHORIZERS = ['Kevin Loh', 'IMHUYT', 'Nan.Hao', 'Kingz Chock', 'Jian.Xu']

// Helper functions
const getToday = () => new Date().toISOString().split('T')[0]
const getTomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function App() {
  const [view, setView] = useState<'home' | 'booking'>('home')
  const [selectedServices, setSelectedServices] = useState<Set<Service>>(new Set())
  const [bookingData, setBookingData] = useState<BookingData>({
    service: 'room',
    agent: '',
    hotel: '',
    checkIn: getToday(),
    checkOut: getTomorrow(),
    authorizer: 'Jian.Xu',
    guests: [{ oldPID: '', newPID: 'New', name: '' }]
  })
  const [pidDatabase, setPidDatabase] = useState<Map<string, { oldPID: string; newPID: string; name: string }>>(new Map())
  const [pidLoaded, setPidLoaded] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Load PID database
  const handlePIDFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      const db = new Map()
      jsonData.forEach((row: any) => {
        const oldPID = String(row['Old PID'] || '').trim()
        const newPID = String(row['New PID'] || '').trim()
        const name = String(row['Player Name'] || '').trim()
        if (name && (oldPID || newPID)) {
          const key = newPID || oldPID
          db.set(key, { oldPID, newPID, name })
          if (oldPID) db.set(oldPID, { oldPID, newPID, name })
        }
      })

      setPidDatabase(db)
      setPidLoaded(true)
      alert(`✅ Loaded ${db.size} PIDs`)
    }
    reader.readAsArrayBuffer(file)
  }

  // Search PID
  const searchPID = (oldPID: string, newPID: string, guestIndex: number) => {
    let result = null
    if (oldPID) result = pidDatabase.get(oldPID)
    if (!result && newPID) result = pidDatabase.get(newPID)

    if (result) {
      const newGuests = [...bookingData.guests]
      newGuests[guestIndex] = { ...result, oldPID: result.oldPID || '', newPID: result.newPID || 'New' }
      setBookingData({ ...bookingData, guests: newGuests })
      return true
    }
    return false
  }

  // Generate email
  const generateEmail = () => {
    const { agent, hotel, checkIn, checkOut, authorizer, guests } = bookingData
    const firstGuest = guests[0]
    const displayPID = firstGuest.newPID !== 'New' ? firstGuest.newPID : (firstGuest.oldPID || 'New')

    let subject = ''
    let body = ''

    if (selectedServices.has('room')) {
      subject = `[${agent}] ${displayPID} ${firstGuest.name} ${hotel} Hotel Room Booking on ${checkIn}`
      body = `Dear RC team,

Kindly assist us make room booking as below:

Guest name: ${guests.map(g => `${g.name} - ${g.newPID !== 'New' ? g.newPID : (g.oldPID || 'New')}`).join('\n')}

Room type: ${hotel}
Check in: ${checkIn}
Check out: ${checkOut}
Rate code: CASBAR
Deposit: No
Trip authorizer: ${authorizer}`
    }

    if (selectedServices.has('car')) {
      const { carType, carGuests, carPhone, carDate, carTime, carPickup, carDropoff, carPayment } = bookingData
      body += `\n\n---\n\nDear @Concierge Services\n\nPlease kindly arrange a VIP car as the followings:\n\nCar Type: ${carType}\nName: ${firstGuest.name}\nNumber of guests: ${carGuests}\nPhone: ${carPhone}\nDate & time: ${carTime} ${carDate}\nPick up point: ${carPickup}\nDrop off point: ${carDropoff}\nPayment: ${carPayment}\nAuthorizer: ${authorizer}`
      if (!subject) subject = `[${agent}] ${displayPID} ${firstGuest.name} Car Service ${carDate}`
    }

    if (selectedServices.has('golf')) {
      const { golfDateTime, golfPax, golfPayment, golfNote, golfAuthorizer } = bookingData
      body += `\n\n---\n\nDear @The Bluffs Ho Tram - Bookings\n\nGuest's name:\n${guests.map(g => `${g.name} - ${g.newPID !== 'New' ? g.newPID : (g.oldPID || 'New')}`).join('\n')}\n\nDate & Time: ${golfDateTime}\nNo. of pax: ${golfPax}\nNote: ${golfNote}\nPayment: ${golfPayment}\nAuthorizer: ${golfAuthorizer}`
      if (!subject) subject = `[${agent}] ${displayPID} ${firstGuest.name} Golf Booking ${golfDateTime?.split('T')[0]}`
    }

    if (selectedServices.has('bus')) {
      const { busRoute, busTime, busDate, busSeats, busAuthorizer } = bookingData
      const route = busRoute === 'both' ? 'HCM ↔ HT' : busRoute === 'hcmToHt' ? 'HCM → HT' : 'HT → HCM'
      body += `\n\n---\n\nHi @Grand Service\n\nPlease help to arrange bus seats as below:\n\nName: ${firstGuest.name}\nRoute: ${route} ${busTime} ${busDate}\nSeats: ${busSeats}\nAuthorizer: ${busAuthorizer}`
      if (!subject) subject = `[${agent}] ${displayPID} ${firstGuest.name} Bus Service ${busDate}`
    }

    setGeneratedEmail(`Subject: ${subject}\n\n${body}`)
    setShowPreview(true)
  }

  // Copy email
  const copyEmail = () => {
    navigator.clipboard.writeText(generatedEmail)
    setSuccessMsg('✓ Copied to clipboard!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Save to Google Sheets
  const saveToSheets = async () => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    const data = {
      agent: bookingData.agent,
      checkIn: bookingData.checkIn || '',
      authorizer: bookingData.authorizer,
      currentTime,
      guests: bookingData.guests
    }

    try {
      const url = `${GOOGLE_SCRIPT_URL}?data=${encodeURIComponent(JSON.stringify(data))}`
      await fetch(url, { method: 'GET', mode: 'no-cors' })
      setSuccessMsg(`✅ Successfully saved ${data.guests.length} guest(s) to Google Sheets!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch {
      alert('❌ Save failed')
    }
  }

  // Add/Remove guest
  const addGuest = () => {
    setBookingData({
      ...bookingData,
      guests: [...bookingData.guests, { oldPID: '', newPID: 'New', name: '' }]
    })
  }

  const removeGuest = (index: number) => {
    if (bookingData.guests.length === 1) return
    const newGuests = bookingData.guests.filter((_, i) => i !== index)
    setBookingData({ ...bookingData, guests: newGuests })
  }

  // Toggle service
  const toggleService = (service: Service) => {
    const newServices = new Set(selectedServices)
    if (newServices.has(service)) {
      newServices.delete(service)
    } else {
      newServices.add(service)
    }
    setSelectedServices(newServices)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white py-6 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-serif font-bold">A KANG'S TOOL</h1>
        <p className="text-sm opacity-90 mt-1">Email Booking Generator V2.0.23</p>
      </div>

      {/* PID Database Import */}
      <div className="max-w-4xl mx-auto mt-4 px-4">
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              📊 PID Database
            </h3>
            <p className="text-sm text-gray-500">
              {pidLoaded ? `✅ ${pidDatabase.size} records loaded` : 'No database loaded. Import Excel to enable auto-fill.'}
            </p>
          </div>
          <label className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-yellow-600 hover:to-amber-600 transition">
            <span className="flex items-center gap-2">📤 Import Excel</span>
            <input type="file" accept=".xlsx,.xls" onChange={handlePIDFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Home - Service Selection */}
      {view === 'home' && (
        <div className="max-w-2xl mx-auto mt-6 px-4 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-serif font-bold text-green-800 mb-4">Please Select Services to Book</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'room', icon: '🛏️', label: 'Room Booking' },
                { key: 'car', icon: '🚗', label: 'Car Service' },
                { key: 'golf', icon: '⛳', label: 'Golf Booking' },
                { key: 'bus', icon: '🚌', label: 'Bus Service' }
              ].map(({ key, icon, label }) => (
                <div
                  key={key}
                  onClick={() => toggleService(key as Service)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    selectedServices.has(key as Service)
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-400'
                  }`}
                >
                  <div className="text-3xl mb-1">{icon}</div>
                  <div className="font-semibold text-green-700">{label}</div>
                  {selectedServices.has(key as Service) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setView('booking')}
              disabled={selectedServices.size === 0}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Continue Booking →
            </button>
          </div>
        </div>
      )}

      {/* Booking Form */}
      {view === 'booking' && (
        <div className="max-w-4xl mx-auto mt-6 px-4 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-serif font-bold text-green-800 mb-4">📝 Booking Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                  <select
                    value={bookingData.agent}
                    onChange={(e) => setBookingData({ ...bookingData, agent: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select...</option>
                    {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                {selectedServices.has('room') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                    <select
                      value={bookingData.hotel}
                      onChange={(e) => setBookingData({ ...bookingData, hotel: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="HIR">HIR</option>
                      <option value="IC">IC</option>
                    </select>
                  </div>
                )}
                {selectedServices.has('room') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                      <input
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                      <input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorizer</label>
                  <select
                    value={bookingData.authorizer}
                    onChange={(e) => setBookingData({ ...bookingData, authorizer: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {AUTHORIZERS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div>
              <h3 className="font-semibold text-green-700 mb-3">👥 Guest Information</h3>
              {bookingData.guests.map((guest, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Guest #{index + 1}</span>
                    {bookingData.guests.length > 1 && (
                      <button onClick={() => removeGuest(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Old PID"
                      value={guest.oldPID}
                      onChange={(e) => {
                        const newGuests = [...bookingData.guests]
                        newGuests[index].oldPID = e.target.value
                        setBookingData({ ...bookingData, guests: newGuests })
                      }}
                      onBlur={() => searchPID(guest.oldPID, guest.newPID, index)}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="New PID"
                      value={guest.newPID}
                      onChange={(e) => {
                        const newGuests = [...bookingData.guests]
                        newGuests[index].newPID = e.target.value
                        setBookingData({ ...bookingData, guests: newGuests })
                      }}
                      onBlur={() => searchPID(guest.oldPID, guest.newPID, index)}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={guest.name}
                      onChange={(e) => {
                        const newGuests = [...bookingData.guests]
                        newGuests[index].name = e.target.value.toUpperCase()
                        setBookingData({ ...bookingData, guests: newGuests })
                      }}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
              <button onClick={addGuest} className="text-green-600 font-medium flex items-center gap-1">
                <Plus size={18} /> Add Guest
              </button>
            </div>

            {/* Car Service */}
            {selectedServices.has('car') && (
              <div>
                <h3 className="font-semibold text-green-700 mb-3">🚗 Car Service</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={bookingData.carType}
                    onChange={(e) => setBookingData({ ...bookingData, carType: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Car Type</option>
                    <option value="Limo">Limo</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Guests"
                    value={bookingData.carGuests}
                    onChange={(e) => setBookingData({ ...bookingData, carGuests: parseInt(e.target.value) })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={bookingData.carDate}
                    onChange={(e) => setBookingData({ ...bookingData, carDate: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="time"
                    value={bookingData.carTime}
                    onChange={(e) => setBookingData({ ...bookingData, carTime: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Golf Service */}
            {selectedServices.has('golf') && (
              <div>
                <h3 className="font-semibold text-green-700 mb-3">⛳ Golf Booking</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input
                    type="datetime-local"
                    value={bookingData.golfDateTime}
                    onChange={(e) => setBookingData({ ...bookingData, golfDateTime: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Pax"
                    value={bookingData.golfPax}
                    onChange={(e) => setBookingData({ ...bookingData, golfPax: parseInt(e.target.value) })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={bookingData.golfPayment}
                    onChange={(e) => setBookingData({ ...bookingData, golfPayment: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Payment</option>
                    <option value="pro +600/1000 – post to room">pro +600/1000 – post to room</option>
                    <option value="Primary Comp">Primary Comp</option>
                    <option value="GOA">GOA</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Note"
                    value={bookingData.golfNote}
                    onChange={(e) => setBookingData({ ...bookingData, golfNote: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Bus Service */}
            {selectedServices.has('bus') && (
              <div>
                <h3 className="font-semibold text-green-700 mb-3">🚌 Bus Service</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={bookingData.busRoute}
                    onChange={(e) => setBookingData({ ...bookingData, busRoute: e.target.value as any })}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Route</option>
                    <option value="hcmToHt">HCM → HT</option>
                    <option value="htToHcm">HT → HCM</option>
                    <option value="both">Both</option>
                  </select>
                  <input
                    type="time"
                    value={bookingData.busTime}
                    onChange={(e) => setBookingData({ ...bookingData, busTime: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={bookingData.busDate}
                    onChange={(e) => setBookingData({ ...bookingData, busDate: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Seats"
                    value={bookingData.busSeats}
                    onChange={(e) => setBookingData({ ...bookingData, busSeats: parseInt(e.target.value) })}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button
                onClick={() => setView('home')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <Home size={18} /> Back
              </button>
              <button
                onClick={generateEmail}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                <FileText size={18} /> Generate Email
              </button>
              <button
                onClick={copyEmail}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-amber-600 flex items-center gap-2"
              >
                <Copy size={18} /> Copy
              </button>
              <button
                onClick={saveToSheets}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2"
              >
                <Save size={18} /> Save to Sheets
              </button>
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {successMsg}
              </div>
            )}

            {/* Email Preview */}
            {showPreview && (
              <div className="mt-6">
                <h3 className="font-semibold text-green-700 mb-2">👀 Email Preview</h3>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                  {generatedEmail}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
