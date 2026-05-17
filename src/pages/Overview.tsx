import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL } from '../utils/formatters'
import { computeOverallConversion, forecastMonthlyRevenue, findStalledOpportunities } from '../utils/aiAnalysis'

const monthlyTrend = [
  { month: 'Dez', receita: 11000 },
  { month: 'Jan', receita: 16500 },
  { month: 'Fev', receita: 14000 },
  { month: 'Mar', receita: 22000 },
  { month: 'Abr', receita: 19500 },
  { month: 'Mai', receita: 17000 },
]

const STAGE_COLORS = ['#1B4FCC', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10b981', '#8b5cf6']

function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const positive = value >= 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: positive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      color: positive ? '#34d399' : '#f87171',
    }}>
      {positive ? '▲' : '▼'} {positive ? '+' : ''}{value}{suffix} vs mês ant.
    </span>
  )
}

function KpiCard({
  icon, label, value, trend, color = '#10b981',
}: {
  icon: string; label: string; value: string; trend?: number; color?: string
}) {
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
      padding: 20, transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.4)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 36, height: 36, background: 'rgba(27,79,204,0.15)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 10 }}>{value}</div>
      {trend !== undefined && <TrendBadge value={trend} />}
    </div>
  )
}

function DecisionCard({ decision }: { decision: any }) {
  const colors: Record<string, string> = {
    critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981',
  }
  const labels: Record<string, string> = {
    critical: 'CRÍTICO', high: 'ALTO', medium: 'MÉDIO', low: 'BAIXO',
  }
  const bgLabels: Record<string, string> = {
    critical: 'rgba(239,68,68,0.15)', high: 'rgba(245,158,11,0.15)',
    medium: 'rgba(59,130,246,0.15)', low: 'rgba(16,185,129,0.15)',
  }
  const c = colors[decision.severity] ?? '#94a3b8'
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderLeft: `3px solid ${c}`, borderRadius: 10,
      padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{decision.title}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
          background: bgLabels[decision.severity] ?? 'rgba(148,163,184,0.15)',
          color: c,
        }}>
          {labels[decision.severity] ?? decision.severity.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>{decision.description}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: '#1B4FCC', color: '#fff', border: 'none', cursor: 'pointer',
        }}>
          Ver Detalhes
        </button>
        <button style={{
          padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: '#334155', color: '#cbd5e1', border: 'none', cursor: 'pointer',
        }}>
          Adiar
        </button>
      </div>
    </div>
  )
}

export default function Overview() {
  const { opportunities, taxClients, decisions } = useDashboard()

  const wonThisMonth = opportunities.filter(o => {
    if (o.status !== 'won') return false
    const d = new Date(o.updatedAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const revenueThisMonth = wonThisMonth.reduce((s, o) => s + (o.monetaryValue ?? 0), 0)
  const activeLeads = opportunities.filter(o => o.status === 'open').length
  const conversionRate = computeOverallConversion(opportunities)
  const stalled = findStalledOpportunities(opportunities, 5)
  const forecast = forecastMonthlyRevenue(opportunities.filter(o => o.status === 'won'))
  const totalTaxSavings = taxClients.reduce((s, c) => s + c.taxSavings, 0)
  const totalPendingGuias = taxClients.reduce((s, c) => s + c.pendingGuias, 0)
  const avgEffectiveRate = taxClients.length
    ? taxClients.reduce((s, c) => s + c.effectiveRate, 0) / taxClients.length
    : 0

  const activeDecisions = decisions.filter(d => !d.resolved)
  const criticalCount = activeDecisions.filter(d => d.severity === 'critical').length

  const stageMap: Record<string, number> = {}
  opportunities.forEach(o => {
    if (o.pipelineStageName) stageMap[o.pipelineStageName] = (stageMap[o.pipelineStageName] ?? 0) + 1
  })
  const funnelData = Object.entries(stageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, value }))

  const kpis = [
    { icon: '💰', label: 'Receita CRM (mês)',     value: formatBRL(revenueThisMonth), trend: 12,  color: '#10b981' },
    { icon: '👥', label: 'Leads Ativos',           value: String(activeLeads),         trend: 8,   color: '#60a5fa' },
    { icon: '📈', label: 'Taxa de Conversão',      value: `${conversionRate.toFixed(1)}%`, trend: conversionRate >= 15 ? 5 : -5, color: '#6366f1' },
    { icon: '⚠️', label: 'Leads Parados (+5d)',    value: String(stalled.length),      trend: stalled.length > 10 ? -15 : 3, color: stalled.length > 10 ? '#ef4444' : '#f59e0b' },
    { icon: '💸', label: 'Previsão do Mês',        value: formatBRL(forecast),         color: '#60a5fa' },
    { icon: '🏦', label: 'Economia Tributária',    value: formatBRL(totalTaxSavings),  trend: 3,   color: '#10b981' },
    { icon: '📋', label: 'Guias Pendentes',         value: String(totalPendingGuias),   color: totalPendingGuias > 0 ? '#f59e0b' : '#10b981' },
    { icon: '⚖️', label: 'Alíquota Efetiva Média', value: `${avgEffectiveRate.toFixed(1)}%`, color: '#a78bfa' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
          Bom dia, Jorge 👋
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8' }}>
          Resumo do seu negócio · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {criticalCount > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f87171' }}>
            {criticalCount} decisão(ões) crítica(s) esperando você
          </span>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24,
      }}>
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr',
        gap: 16, marginBottom: 24,
      }}>
        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>
            Receita CRM — Últimos 6 Meses
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            MRR em R$ · tendência de contratos fechados
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B4FCC" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1B4FCC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), 'Receita']}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="receita" stroke="#1B4FCC" strokeWidth={2.5}
                fill="url(#gradReceita)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>
            Funil de Vendas
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            Leads por estágio · pipeline ativo
          </div>
          {funnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              Sem dados de pipeline
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Decisões Pendentes</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Identificadas pela IA · ordenadas por prioridade</div>
          </div>
          <span style={{
            padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: 'rgba(27,79,204,0.2)', color: '#60a5fa',
          }}>
            {activeDecisions.length} pendentes
          </span>
        </div>
        {activeDecisions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600, color: '#94a3b8' }}>Tudo em ordem!</div>
            <div style={{ fontSize: 13 }}>Sem decisões pendentes agora</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 0 }}>
            {activeDecisions.slice(0, 6).map(d => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
   }
