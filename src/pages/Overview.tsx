import {
  Handshake, Users, DollarSign, TrendingUp, UserCheck,
  AlertTriangle, BarChart3, Receipt,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
} from 'recharts'
import KPICard from '../components/shared/KPICard'
import DecisionAlert from '../components/shared/DecisionAlert'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL, formatPercent } from '../utils/formatters'
import { computeOverallConversion, forecastMonthlyRevenue, findStalledOpportunities } from '../utils/aiAnalysis'
import { FUNNEL_STAGES } from '../types'

// Mock monthly trend data
const monthlyTrend = [
  { month: 'Dez', contratos: 4, receita: 11000 },
  { month: 'Jan', contratos: 6, receita: 16500 },
  { month: 'Fev', contratos: 5, receita: 14000 },
  { month: 'Mar', contratos: 8, receita: 22000 },
  { month: 'Abr', contratos: 7, receita: 19500 },
  { month: 'Mai', contratos: 6, receita: 17000 },
]

const FUNNEL_COLORS = ['#1B4FCC', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']

export default function Overview() {
  const { opportunities, taxClients, decisions } = useDashboard()

  // CRM KPIs
  const wonThisMonth = opportunities.filter(o => {
    if (o.status !== 'won') return false
    const d = new Date(o.updatedAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const contractsThisMonth = wonThisMonth.length
  const revenueThisMonth = wonThisMonth.reduce((s, o) => s + (o.monetaryValue ?? 0), 0)
  const conversionRate = computeOverallConversion(opportunities)
  const forecast = forecastMonthlyRevenue(opportunities.filter(o => o.status === 'won'))
  const stalled = findStalledOpportunities(opportunities, 5)
  const activeDecisions = decisions.filter(d => !d.resolved)
  const criticalDecisions = activeDecisions.filter(d => d.severity === 'critical')

  // Tax KPIs
  const totalTaxSavings = taxClients.reduce((s, c) => s + c.taxSavings, 0)
  const totalPendingGuias = taxClients.reduce((s, c) => s + c.pendingGuias, 0)
  const avgEffectiveRate = taxClients.length
    ? taxClients.reduce((s, c) => s + c.effectiveRate, 0) / taxClients.length
    : 0

  // Funnel data
  const funnelData = FUNNEL_STAGES.map((stageName, i) => ({
    name: stageName,
    value: opportunities.filter(o => o.pipelineStageName === stageName).length,
    fill: FUNNEL_COLORS[i] ?? '#1B4FCC',
  })).filter(d => d.value > 0)

  // Total leads in active stages
  const activeLeads = opportunities.filter(o => o.status === 'open').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Bom dia, Jorge 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Aqui está o resumo do seu negócio agora
        </p>
      </div>

      {/* Critical alerts strip */}
      {criticalDecisions.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-400 text-sm">
              {criticalDecisions.length} decisão(ões) urgente(s) esperando você
            </span>
          </div>
          <div className="space-y-2">
            {criticalDecisions.slice(0, 2).map(d => (
              <DecisionAlert key={d.id} decision={d} compact />
            ))}
          </div>
        </div>
      )}

      {/* KPI Row 1 — CRM */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
          <BarChart3 size={14} /> CRM & Vendas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Contratos Fechados (mês)"
            value={contractsThisMonth}
            change={+20}
            icon={<Handshake size={18} />}
            colorClass="text-brand-500"
          />
          <KPICard
            label="Leads Ativos no Pipeline"
            value={activeLeads}
            change={+8}
            icon={<Users size={18} />}
            colorClass="text-blue-500"
          />
          <KPICard
            label="Taxa de Conversão"
            value={`${conversionRate}%`}
            change={conversionRate >= 15 ? 5 : -5}
            icon={<TrendingUp size={18} />}
            colorClass={conversionRate >= 15 ? 'text-emerald-500' : 'text-red-500'}
          />
          <KPICard
            label="Leads Parados (+5 dias)"
            value={stalled.length}
            change={stalled.length > 10 ? -15 : 0}
            icon={<AlertTriangle size={18} />}
            colorClass={stalled.length > 10 ? 'text-red-500' : 'text-amber-500'}
          />
        </div>
      </div>

      {/* KPI Row 2 — Financial & Tax */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
          <Receipt size={14} /> Financeiro & Tributário
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Receita CRM (mês)"
            value={formatBRL(revenueThisMonth)}
            change={+12}
            icon={<DollarSign size={18} />}
            colorClass="text-emerald-500"
          />
          <KPICard
            label="Previsão do Mês"
            value={formatBRL(forecast)}
            icon={<TrendingUp size={18} />}
            colorClass="text-blue-500"
          />
          <KPICard
            label="Economia Tributária Total"
            value={formatBRL(totalTaxSavings)}
            change={+3}
            icon={<Receipt size={18} />}
            colorClass="text-emerald-500"
          />
          <KPICard
            label="Alíquota Efetiva Média"
            value={`${avgEffectiveRate.toFixed(1)}%`}
            icon={<UserCheck size={18} />}
            colorClass="text-purple-500"
          />
        </div>
      </div>

      {/* Main content row: Funnel + Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="card">
          <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
            Funil de Vendas
          </h2>
          {funnelData.length > 0 ? (
            <div className="space-y-2">
              {funnelData.map((stage, i) => {
                const maxVal = funnelData[0]?.value ?? 1
                const pct = Math.round((stage.value / maxVal) * 100)
                return (
                  <div key={stage.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {stage.name}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                        {stage.value}
                      </span>
                    </div>
                    <div className="h-7 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: FUNNEL_COLORS[i] }}
                      >
                        {pct > 20 && (
                          <span className="text-white text-xs font-semibold">{pct}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center py-8" style={{ color: 'var(--color-muted)' }}>Sem dados de pipeline</p>
          )}
        </div>

        {/* AI Decisions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
              Decisões Pendentes
            </h2>
            <span className="badge-info">{activeDecisions.length} pendentes</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activeDecisions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>Tudo em ordem!</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Sem decisões pendentes agora</p>
              </div>
            ) : (
              activeDecisions.slice(0, 4).map(d => (
                <DecisionAlert key={d.id} decision={d} compact />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="card">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
          Tendência de Contratos e Receita (6 meses)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4FCC" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1B4FCC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number, name: string) => [
                name === 'receita' ? formatBRL(v) : v,
                name === 'receita' ? 'Receita' : 'Contratos',
              ]}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="#1B4FCC"
              strokeWidth={2.5}
              fill="url(#colorReceita)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Guias pending strip */}
      {totalPendingGuias > 0 && (
        <div className="card border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-bold" style={{ color: 'var(--color-text)' }}>
                {totalPendingGuias} guia(s) fiscal(is) pendente(s) de entrega
              </p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Verifique a seção Tributário para detalhes por cliente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
