import { TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import KPICard from '../components/shared/KPICard'
import DecisionAlert from '../components/shared/DecisionAlert'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL } from '../utils/formatters'
import { computeOverallConversion, forecastMonthlyRevenue, findStalledOpportunities } from '../utils/aiAnalysis'
import { FUNNEL_STAGES } from '../types'

export default function Overview() {
  const { opportunities, decisions, taxClients, loading, resolveDecision, isDemo } = useDashboard()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const totalPipeline = opportunities.reduce((s, o) => s + o.monetaryValue, 0)
  const conversion = computeOverallConversion(opportunities)
  const forecast = forecastMonthlyRevenue(opportunities)
  const stalled = findStalledOpportunities(opportunities)
  const activeDecisions = decisions.filter(d => !d.resolved)
  const taxPending = taxClients.filter(c => c.dasStatus !== 'ok').length

  const funnelData = FUNNEL_STAGES.map(stage => ({
    stage: stage.substring(0, 7),
    value: opportunities.filter(o => o.stage === stage).reduce((s, o) => s + o.monetaryValue, 0),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Visao Geral</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
          {isDemo ? 'Modo demonstracao — dados simulados' : 'Dados em tempo real via GoHighLevel'}
        </p>
      </div>

      {activeDecisions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Pontos de Decisao CEO</p>
          {activeDecisions.slice(0, 3).map(d => <DecisionAlert key={d.id} decision={d} onResolve={resolveDecision} />)}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard title="Pipeline Total" value={totalPipeline} format="brl" subtitle={opportunities.length + ' oportunidades'} trend={8.3} icon={DollarSign} color="#6366f1" />
        <KPICard title="Conversao Geral" value={conversion} format="percent" subtitle="fechados vs total" trend={2.1} icon={Target} color="#10b981" />
        <KPICard title="Previsao Mensal" value={forecast} format="brl" subtitle="proximos 30 dias" trend={5.7} icon={TrendingUp} color="#f59e0b" />
        <KPICard title="Parados +15d" value={stalled.length} format="number" subtitle={taxPending + ' DAS pendentes'} trend={-3.2} icon={AlertTriangle} color="#ef4444" />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Funil de Vendas</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={funnelData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => 'R$' + (v/1000).toFixed(0) + 'k'} />
            <Tooltip formatter={(val: number) => [formatBRL(val), 'Valor']} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Top Oportunidades</h2>
        {opportunities.sort((a, b) => b.monetaryValue - a.monetaryValue).slice(0, 5).map(opp => (
          <div key={opp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
            <div>
              <p style={{ fontWeight: 500, color: '#111827', fontSize: 14, margin: 0 }}>{opp.name}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{opp.stage} &bull; {opp.assignedTo || '—'}</p>
            </div>
            <span style={{ fontWeight: 700, color: '#111827' }}>{formatBRL(opp.monetaryValue)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
