import { AlertTriangle, AlertCircle, Lightbulb, CheckCircle } from 'lucide-react'
import type { CEODecision } from '../../types'
import { formatRelative } from '../../utils/formatters'
import { useDashboard } from '../../context/DashboardContext'
import clsx from 'clsx'

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    border: 'border-l-red-500',
    badge: 'badge-critical',
    label: '🚨 Urgente',
    bg: 'bg-red-50 dark:bg-red-900/10',
  },
  warning: {
    icon: AlertCircle,
    border: 'border-l-amber-500',
    badge: 'badge-warning',
    label: '⚠️ Atenção',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
  },
  opportunity: {
    icon: Lightbulb,
    border: 'border-l-emerald-500',
    badge: 'badge-success',
    label: '✅ Oportunidade',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  crm: 'CRM',
  tax: 'Tributário',
  financial: 'Financeiro',
  operations: 'Operações',
  marketing: 'Marketing',
}

interface Props {
  decision: CEODecision
  compact?: boolean
}

export default function DecisionAlert({ decision, compact = false }: Props) {
  const { resolveDecision } = useDashboard()
  const cfg = SEVERITY_CONFIG[decision.severity]
  const Icon = cfg.icon

  if (decision.resolved) return null

  return (
    <div
      className={clsx(
        'card border-l-4 transition-all',
        cfg.border,
        compact && 'p-3',
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={clsx(
          decision.severity === 'critical' && 'text-red-500',
          decision.severity === 'warning' && 'text-amber-500',
          decision.severity === 'opportunity' && 'text-emerald-500',
        )} />

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={cfg.badge}>{cfg.label}</span>
            <span className="badge-info">{CATEGORY_LABELS[decision.category] ?? decision.category}</span>
            {decision.metric && (
              <span className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                {decision.metric}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
            {decision.title}
          </h3>

          {!compact && (
            <>
              {/* Description */}
              <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
                {decision.description}
              </p>

              {/* Recommended action */}
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'var(--color-bg)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted)' }}>
                  Ação recomendada
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {decision.recommendedAction}
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {formatRelative(decision.detectedAt)}
            </span>
            <button
              onClick={() => resolveDecision(decision.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              <CheckCircle size={13} />
              Resolvido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
