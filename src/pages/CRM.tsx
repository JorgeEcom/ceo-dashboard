import { Users, TrendingUp, Clock, AlertTriangle, Target } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import KPICard from '../components/shared/KPICard'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL, formatPercent, daysSince } from '../utils/formatters'
import { computeStageStats, computeOverallConversion, findStalledOpportunities } from '../utils/aiAnalysis'
import { FUNNEL_STAGES, NEGATIVE_STAGES } from '../types'
import clsx from 'clsx'

const STAGE_COLORS: Record<string, string> = {
  'Novo lead':        '#1B4FCC',
  'Em contato':       '#2563EB',
  'Agendamento':      '#3B82F6',
  'Agendou':          '#0EA5E9',
  'Proposta enviada': '#8B5CF6',
  'Em andamento':     '#6366F1',
  'Proposta fechada': '#10B981',
  'Desqualificado':   '#EF4444',
  'Sem retorno':      '#F59E0B',
  'Sem interesse':    '#6B7280',
}

export default function CRM() {
  const { opportunities, pipeline } = useDashboard()

  const stageStats = computeStageStats(opportunities, pipeline)
  const convRate = computeOverallConversion(opportunities)
  const stalled = findStalledOpportunities(opportunities, 5)
  const openOpps = opportunities.filter(o => o.status === 'open')
  const wonOpps  = opportunities.filter(o => o.status === 'won')
  const totalValue = openOpps.reduce((s, o) => s + (o.monetaryValue ?? 0), 0)

  // SDR performance (grouped by assignedTo)
  const sdrMap = new Map<string, { name: string; scheduled: number; noReturn: number; disqualified: number; total: number }>()
  for (const opp of opportunities) {
    const name = opp.assignedTo ?? 'Não atribuído'
    if (!sdrMap.has(name)) {
      sdrMap.set(name, { name, scheduled: 0, noReturn: 0, disqualified: 0, total: 0 })
    }
    const s = sdrMap.get(name)!
    s.total++
    const stageName = opp.pipelineStageName ?? ''
    if (stageName === 'Agendou' || stageName === 'Proposta fechada') s.scheduled++
    if (stageName === 'Sem retorno') s.noReturn++
    if (stageName === 'Desqualificado') s.disqualified++
  }
  const sdrList = [...sdrMap.values()].sort((a, b) => b.scheduled - a.scheduled)

  // Funnel stats (positive stages only)
  const funnelStats = stageStats.filter(s => FUNNEL_STAGES.includes(s.stageName as any))
  // Negative stages
  const negativeStats = stageStats.filter(s => NEGATIVE_STAGES.includes(s.stageName as any))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>CRM & Vendas</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Pipeline GoHighLevel · Tempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total em Negociação"
          value={openOpps.length}
          icon={<Users size={18} />}
          colorClass="text-brand-500"
        />
        <KPICard
          label="Valor Total no Pipeline"
          value={formatBRL(totalValue)}
          icon={<Target size={18} />}
          colorClass="text-emerald-500"
        />
        <KPICard
          label="Taxa de Conversão"
          value={`${convRate}%`}
          icon={<TrendingUp size={18} />}
          colorClass={convRate >= 15 ? 'text-emerald-500' : 'text-red-500'}
        />
        <KPICard
          label="Leads Parados (+5 dias)"
          value={stalled.length}
          icon={<AlertTriangle size={18} />}
          colorClass={stalled.length > 5 ? 'text-red-500' : 'text-amber-500'}
        />
      </div>

      {/* Pipeline by stage */}
      <div className="card">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--color-text)' }}>
          Pipeline por Estágio
        </h2>
        <div className="space-y-3">
          {stageStats.map(stage => {
            const maxCount = Math.max(...stageStats.map(s => s.count), 1)
            const pct = Math.round((stage.count / maxCount) * 100)
            const color = STAGE_COLORS[stage.stageName] ?? '#94A3B8'
            const isNegative = NEGATIVE_STAGES.includes(stage.stageName as any)

            return (
              <div key={stage.stageId} className={clsx('p-3 rounded-xl', isNegative && 'opacity-60')} style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {stage.stageName}
                    </span>
                    {isNegative && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500">
                        Negativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                      {stage.count}
                    </span>
                    {stage.totalValue > 0 && (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatBRL(stage.totalValue)}
                      </span>
                    )}
                    {stage.avgDaysInStage > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                        <Clock size={11} />
                        {stage.avgDaysInStage}d avg
                      </span>
                    )}
                    {stage.conversionRate !== undefined && (
                      <span className={clsx('text-xs font-medium', stage.conversionRate >= 50 ? 'text-emerald-600' : 'text-amber-600')}>
                        → {stage.conversionRate}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bar chart */}
      <div className="card">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
          Volume por Estágio (gráfico)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stageStats} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
            <XAxis
              dataKey="stageName"
              tick={{ fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(v: number) => [v, 'Leads']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {stageStats.map((entry) => (
                <Cell key={entry.stageId} fill={STAGE_COLORS[entry.stageName] ?? '#94A3B8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SDR Performance Table */}
      <div className="card">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
          Performance dos SDRs / Closers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Responsável', 'Total Leads', 'Agendados', 'Sem Retorno', 'Desqualificados', 'Taxa Agend.'].map(h => (
                  <th key={h} className="text-left py-3 px-2 label">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sdrList.map((sdr, i) => {
                const agendRate = sdr.total > 0 ? Math.round((sdr.scheduled / sdr.total) * 100) : 0
                return (
                  <tr
                    key={sdr.name}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                          {sdr.name.charAt(0)}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{sdr.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold" style={{ color: 'var(--color-text)' }}>{sdr.total}</td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sdr.scheduled}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{sdr.noReturn}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-red-600 dark:text-red-400">{sdr.disqualified}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${agendRate}%` }}
                          />
                        </div>
                        <span className={clsx('font-semibold text-xs', agendRate >= 30 ? 'text-emerald-600' : 'text-red-600')}>
                          {agendRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stalled leads */}
      {stalled.length > 0 && (
        <div className="card border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-bold text-base text-red-700 dark:text-red-400">
              Leads Parados (sem atualização há +5 dias)
            </h2>
          </div>
          <div className="space-y-2">
            {stalled.slice(0, 10).map(opp => (
              <div
                key={opp.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg)' }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{opp.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {opp.pipelineStageName} · {opp.assignedTo ?? 'Não atribuído'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                    {daysSince(opp.updatedAt)} dias parado
                  </p>
                  {opp.monetaryValue > 0 && (
                    <p className="text-xs text-emerald-600">{formatBRL(opp.monetaryValue)}</p>
                  )}
                </div>
              </div>
            ))}
            {stalled.length > 10 && (
              <p className="text-sm text-center py-2" style={{ color: 'var(--color-muted)' }}>
                + {stalled.length - 10} leads não exibidos
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
