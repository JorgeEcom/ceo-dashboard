import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Receipt,
  Brain,
  Settings,
  RefreshCw,
  AlertTriangle,
  Moon,
  Sun,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import clsx from 'clsx'

const navItems = [
  { to: '/',          label: 'Visão Geral',    icon: LayoutDashboard },
  { to: '/crm',       label: 'CRM & Vendas',   icon: Users           },
  { to: '/tax',       label: 'Tributário',     icon: Receipt         },
  { to: '/decisions', label: 'Decisões CEO',   icon: Brain           },
  { to: '/settings',  label: 'Configurações',  icon: Settings        },
]

export default function Sidebar() {
  const { decisions, loading, refresh, isDemo, lastRefresh, theme, toggleTheme } = useDashboard()
  const criticalCount = decisions.filter(d => d.severity === 'critical' && !d.resolved).length

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col w-64"
      style={{ backgroundColor: 'var(--color-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white text-lg">
          J
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">CEO Dashboard</p>
          <p className="text-white/50 text-xs">Contabilidade E-commerce</p>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <p className="text-amber-300 text-xs font-medium">
            Modo demonstração — configure a API nas Configurações
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx('sidebar-item', isActive && 'active')
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {to === '/decisions' && criticalCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {criticalCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-2 border-t border-white/10 pt-3">
        {/* Last refresh */}
        {lastRefresh && (
          <p className="text-white/30 text-xs px-4">
            Atualizado: {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* Refresh button */}
        <button
          onClick={refresh}
          disabled={loading}
          className="sidebar-item w-full"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Atualizando...' : 'Atualizar dados'}</span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="sidebar-item w-full">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* Alerts summary */}
        {criticalCount > 0 && (
          <NavLink to="/decisions" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-red-300 text-xs font-medium">
              {criticalCount} decisão(ões) urgente(s)
            </span>
          </NavLink>
        )}
      </div>
    </aside>
  )
}
