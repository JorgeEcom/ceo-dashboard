export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatRelative(dateStr: string): string {
  const days = daysSince(dateStr)
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `${days} dias atrás`
  if (days < 30) return `${Math.floor(days / 7)} semanas atrás`
  return `${Math.floor(days / 30)} meses atrás`
}

export function trendColor(change: number): string {
  if (change > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (change < 0) return 'text-red-600 dark:text-red-400'
  return 'text-slate-500'
}

export function trendBg(change: number): string {
  if (change > 0) return 'bg-emerald-50 dark:bg-emerald-900/20'
  if (change < 0) return 'bg-red-50 dark:bg-red-900/20'
  return 'bg-slate-50 dark:bg-slate-800'
}
