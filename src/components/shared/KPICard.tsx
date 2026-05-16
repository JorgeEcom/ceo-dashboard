import { LucideIcon } from 'lucide-react'
import { formatBRL, formatPercent, formatNumber, trendColor } from '../../utils/formatters'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  format?: 'brl' | 'percent' | 'number' | 'text'
  icon?: LucideIcon
  color?: string
}

export default function KPICard({ title, value, subtitle, trend, format = 'text', icon: Icon, color = '#6366f1' }: KPICardProps) {
  const display = () => {
    if (typeof value === 'string') return value
    if (format === 'brl') return formatBRL(value as number)
    if (format === 'percent') return formatPercent(value as number)
    if (format === 'number') return formatNumber(value as number)
    return String(value)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{title}</span>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} style={{ color }} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{display()}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {trend !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, color: trendColor(trend) }}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
        {subtitle && <span style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</span>}
      </div>
    </div>
  )
}
