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
        <div className="flex min-h-screen">
          {/* Sidebar (fixed 256px) */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 ml-64 p-6 min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="max-w-6xl mx-auto">
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
