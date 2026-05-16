import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardProvider } from './context/DashboardContext'
import Sidebar from './components/Layout/Sidebar'
import Overview  from './pages/Overview'
import CRM       from './pages/CRM'
import Tax       from './pages/Tax'
import Decisions from './pages/Decisions'
import Settings  from './pages/Settings'

export default function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: 256, padding: 32, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <Routes>
                <Route path="/"          element={<Overview  />} />
                <Route path="/crm"       element={<CRM       />} />
                <Route path="/tax"       element={<Tax       />} />
                <Route path="/decisions" element={<Decisions />} />
                <Route path="/settings"  element={<Settings  />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </DashboardProvider>
  )
}
