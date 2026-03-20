import { useState } from 'react'
import Home from './pages/Home'

function App() {
  const [, setService] = useState<string | null>(null)
  return <Home onSelectService={setService} />
}

export default App
