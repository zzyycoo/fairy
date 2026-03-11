import { useState } from 'react'
import type { Service } from './types'
import { useBookingData, useClipboard, useSuccessMessage, usePIDDatabase } from './hooks'
import { generateEmailContent, saveToGoogleSheets } from './utils'
import { 
  PIDImport, 
  SuccessMessage, 
  EmailPreview,
  Home,
  GuestForm,
  BasicInfo,
  CarService,
  GolfBooking,
  BusService,
  ActionButtons
} from './components'

type View = 'home' | 'booking'

function App() {
  // State
  const [view, setView] = useState<View>('home')
  const [selectedServices, setSelectedServices] = useState<Set<Service>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' })

  // Hooks
  const { 
    bookingData, 
    updateField, 
    addGuest, 
    removeGuest, 
    updateGuest, 
    setGuest 
  } = useBookingData()
  
  const { pidLoaded, pidDatabase, loadFromFile, lookupPID } = usePIDDatabase()
  const { copy } = useClipboard()
  const { message: successMsg, show: showSuccess } = useSuccessMessage()

  // Handlers
  const handleToggleService = (service: Service) => {
    const newServices = new Set(selectedServices)
    if (newServices.has(service)) {
      newServices.delete(service)
    } else {
      newServices.add(service)
    }
    setSelectedServices(newServices)
  }

  const handlePIDImport = async (file: File) => {
    try {
      const count = await loadFromFile(file)
      showSuccess(`✅ Loaded ${count} PIDs`, 3000)
    } catch {
      showSuccess('❌ Failed to load PID database', 3000)
    }
  }

  const handleSearchPID = (oldPID: string, newPID: string, index: number) => {
    const result = lookupPID(oldPID, newPID)
    if (result) {
      setGuest(index, { 
        ...result, 
        oldPID: result.oldPID || '', 
        newPID: result.newPID || 'New' 
      })
    }
  }

  const handleGenerateEmail = () => {
    const { subject, body } = generateEmailContent(bookingData, selectedServices)
    setGeneratedEmail({ subject, body })
    setShowPreview(true)
  }

  const handleCopyEmail = async () => {
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`
    const success = await copy(text)
    if (success) {
      showSuccess('✓ Copied to clipboard!', 3000)
    }
  }

  const handleSaveToSheets = async () => {
    const result = await saveToGoogleSheets(bookingData)
    if (result.success) {
      showSuccess(`✅ Successfully saved ${bookingData.guests.length} guest(s) to Google Sheets!`, 4000)
    } else {
      showSuccess(`❌ Save failed: ${result.error || 'Unknown error'}`, 3000)
    }
  }

  const handleBack = () => {
    setView('home')
    setShowPreview(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white py-6 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-serif font-bold">A KANG'S TOOL</h1>
        <p className="text-sm opacity-90 mt-1">Email Booking Generator V2.1.0</p>
      </div>

      {/* PID Import */}
      <PIDImport 
        pidLoaded={pidLoaded}
        pidCount={pidDatabase.size}
        onImport={handlePIDImport}
      />

      {/* Home View */}
      {view === 'home' && (
        <Home
          selectedServices={selectedServices}
          onToggleService={handleToggleService}
          onContinue={() => setView('booking')}
        />
      )}

      {/* Booking View */}
      {view === 'booking' && (
        <div className="max-w-4xl mx-auto mt-6 px-4 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Basic Info */}
            <BasicInfo
              data={bookingData}
              showRoomFields={selectedServices.has('room')}
              onUpdate={updateField}
            />

            {/* Guest Form */}
            <GuestForm
              guests={bookingData.guests}
              onAddGuest={addGuest}
              onRemoveGuest={removeGuest}
              onUpdateGuest={updateGuest}
              onSearchPID={handleSearchPID}
            />

            {/* Car Service */}
            {selectedServices.has('car') && (
              <CarService data={bookingData} onUpdate={updateField} />
            )}

            {/* Golf Booking */}
            {selectedServices.has('golf') && (
              <GolfBooking data={bookingData} onUpdate={updateField} />
            )}

            {/* Bus Service */}
            {selectedServices.has('bus') && (
              <BusService data={bookingData} onUpdate={updateField} />
            )}

            {/* Action Buttons */}
            <ActionButtons
              onBack={handleBack}
              onGenerateEmail={handleGenerateEmail}
              onCopyEmail={handleCopyEmail}
              onSaveToSheets={handleSaveToSheets}
            />

            {/* Success Message */}
            {successMsg && <SuccessMessage message={successMsg} />}

            {/* Email Preview */}
            {showPreview && (
              <EmailPreview 
                subject={generatedEmail.subject} 
                body={generatedEmail.body} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
