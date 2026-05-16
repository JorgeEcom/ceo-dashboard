import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import DecisionAlert from '../components/shared/DecisionAlert'
import { useDashboard } from '../context/DashboardContext'

export default function Decisions() {
  const { decisions, resolveDecision, loading } = useDashboard()

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div style={{ width: 36, height: 36, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>
  }

  const active = decisions.filter(d => !d.resolved)
  const resolved = decisions.filter(d => d.resolved)
  const critical = active.filter(d => d.type === 'critical').length
  const warning = active.filter(d => d.type === 'warning').length
  const opportunity = active.filter(d => d.type === 'opportunity').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Pontos de Decisao CEO</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Alertas e oportunidades identificadas por analise automatica</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: '#fef2f2', borderRadius: 12, padding: 20, border: '1px solid #fecaca', textAlign: 'center' }}>
          <AlertCircle size={20} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 28, fontWeight: 700, color: '#991b1b', margin: 0 }}>{critical}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', margin: '4px 0 0' }}>Criticos</p>
        </div>
        <div style={{ background: '#fffbeb', borderRadius: 12, padding: 20, border: '1px solid #fde68a', textAlign: 'center' }}>
          <AlertTriangle size={20} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 28, fontWeight: 700, color: '#92400e', margin: 0 }}>{warning}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', margin: '4px 0 0' }}>Atencao</p>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 20, border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <TrendingUp size={20} style={{ color: '#10b981', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 28, fontWeight: 700, color: '#065f46', margin: 0 }}>{opportunity}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#10b981', margin: '4px 0 0' }}>Oportunidades</p>
        </div>
      </div>

      {active.length === 0 ? (
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#065f46', margin: 0 }}>Tudo em ordem!</h2>
          <p style={{ fontSize: 14, color: '#10b981', marginTop: 8 }}>Nenhum ponto de decisao pendente no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Pendentes ({active.length})</p>
          {active.map(d => <DecisionAlert key={d.id} decision={d} onResolve={resolveDecision} />)}
        </div>
      )}

      {resolved.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Resolvidos ({resolved.length})</p>
          {resolved.map(d => (
            <div key={d.id} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', border: '1px solid #f3f4f6', opacity: 0.7, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>{d.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
