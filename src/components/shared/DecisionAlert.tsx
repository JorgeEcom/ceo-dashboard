import { AlertTriangle, TrendingUp, AlertCircle, X } from 'lucide-react'
import type { CEODecision } from '../../types'

interface DecisionAlertProps {
  decision: CEODecision
  onResolve: (id: string) => void
}

export default function DecisionAlert({ decision, onResolve }: DecisionAlertProps) {
  if (decision.resolved) return null

  const configs = {
    warning:     { Icon: AlertTriangle, bg: '#fef3c7', border: '#f59e0b', color: '#d97706', label: 'Atencao' },
    critical:    { Icon: AlertCircle,   bg: '#fee2e2', border: '#ef4444', color: '#dc2626', label: 'Critico' },
    opportunity: { Icon: TrendingUp,    bg: '#d1fae5', border: '#10b981', color: '#059669', label: 'Oportunidade' },
  } as const

  const cfg = configs[decision.type]
  const Icon = cfg.Icon

  return (
    <div style={{ borderRadius: 12, padding: '16px', borderLeft: '4px solid ' + cfg.border, backgroundColor: cfg.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Icon size={18} style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: cfg.color }}>{cfg.label}</span>
          <p style={{ fontWeight: 600, color: '#111827', fontSize: 14, margin: '4px 0' }}>{decision.title}</p>
          <p style={{ color: '#6b7280', fontSize: 13 }}>{decision.description}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Impacto: <strong>{decision.impact}</strong> &bull; {decision.action}</p>
        </div>
      </div>
      <button onClick={() => onResolve(decision.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, flexShrink: 0 }}>
        <X size={16} />
      </button>
    </div>
  )
}
