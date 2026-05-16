import { LucideIcon } from 'lucide-react'
import { formatBRL, formatPercent, formatNumber, trendColor, trendBg } from '@/utils/formatters'

interface KPICardProps {
  title: string
  value: number
  format?: 'currency' | 'percent' | 'number'
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconColor?: string
  subtitle?: string
  loading?: boolean
}

export default function KPICard({
  title,
  value,
  format = 'number',
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-brand-500',
  subtitle,
  loading = false,
}: KPICardProps) {
  const formattedValue =
    format === 'currency'
      ? formatBRL(value)
      : format === 'percent'
      ? formatPercent(value)
      : formatNumber(value)

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{formattedValue}</p>

      {change !== undefined && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${trendBg(change)} ${trendColor(change)}`}>
          <span>{change > 0 ? '\u25b2' : change < 0 ? '\u25bc' : '\u2013'}</span>
          <span>
            {change > 0 ? '+' : ''}{change}{'% '}{changeLabel !== undefined ? changeLabel : 'vs m\u00eas anterior'}
          </span>
        </div>
      )}
    </div>
  )
}
