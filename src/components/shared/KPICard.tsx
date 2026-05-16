import React from 'react'
import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  colorClass?: string
  onClick?: () => void
}

export default function KPICard({
  label,
  value,
  change,
  changeLabel,
  prefix,
  suffix,
  icon,
  colorClass = 'text-brand-500',
  onClick,
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div
      className={clsx('card flex flex-col gap-3', onClick && 'cursor-pointer hover:shadow-md transition-shadow')}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', colorClass, 'bg-current/10')}>
            <span className={colorClass}>{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-semibold" style={{ color: 'var(--color-muted)' }}>{prefix}</span>}
        <span className="metric">{value}</span>
        {suffix && <span className="text-lg font-semibold" style={{ color: 'var(--color-muted)' }}>{suffix}</span>}
      </div>

      {/* Trend */}
      {change !== undefined && (
        <div
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit text-sm font-medium',
            isPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
            isNegative && 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
            !isPositive && !isNegative && 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
          )}
        >
          {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
          <span>
            {change > 0 ? '+' : ''}{change}% {changeLabel ?? 'vs mês anterior'}
          </span>
        </div>