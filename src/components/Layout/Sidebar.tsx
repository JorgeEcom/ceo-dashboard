import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, AlertCircle, Settings, RefreshCw, WifiOff, Wifi } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

const NAV = [
  { path: '/',          label: 'Overview',      Icon: LayoutDashboard },
  { path: '/crm',       label: 'CRM Pipeline',  Icon: Users },
  { path: '/tax',       label: 'Modulo Fiscal', Icon: FileText },
  { path: '/decisions', label: 'Decisoes CEO',  Icon: AlertCircle },
  { path: '/settings',  label: 'Configuracoes', Icon: Settings },
]

export default function Sidebar() {
  const { isDemo, lastRefresh, refresh, loading, decisions } = useDashboard()
  const pending = decisions.filter(d => !d.resolved).length

  return (
    <aside style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: 256, backgroundColor: '#1e1b4b', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>CEO Dashboard</h1>
        <p style={{ color: '#a5b4fc', fontSize: 12, margin: '4px 0 0' }}>Contabilidade E-commerce</p>
      </div>
      {isDemo && (
        <div style={{ margin: '12px 16px 0', padding: '8px 12px', borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <WifiOff size={12} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 12, color: '#f59e0b' }}>Modo Demo</span>
        </div>
      )}
      <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
              textDecoration: 'none', fontSize: 14, transition: 'all 0.15s',
              backgroundColor: isActive ? '#4f46e5' : 'transparent',
              color: isActive ? '#fff' : '#c7d2fe',
            })}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            {path === '/decisions' && pending > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
                {pending}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#818cf8' }}>
            {lastRefresh ? lastRefresh.toLocaleTimeString('pt-BR') : 'Carregando...'}
          </span>
          <button onClick={refresh} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', padding: 2 }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        {!isDemo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wifi size={12} style={{ color: '#34d399' }} />
            <span style={{ fontSize: 11, color: '#34d399' }}>GHL Conectado</span>
          </div>
        )}
      </div>
    </aside>
  )
}
