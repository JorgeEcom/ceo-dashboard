import { Users, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import KPICard from '../components/shared/KPICard'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL, daysSince } from '../utils/formatters'
import { computeStageStats, computeOverallConversion, findStalledOpportunities } from '../utils/aiAnalysis'
import { FUNNEL_STAGES } from '../types'

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981']

export default function CRM() {
  const { opportunities, loading } = useDashboard()

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div style={{ width: 36, height: 36, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>
  }

  const stageStats = computeStageStats(opportunities)
  const conversion = computeOverallConversion(opportunities)
  const stalled = findStalledOpportunities(opportunities)
  const totalValue = opportunities.reduce((s, o) => s + o.monetaryValue, 0)
  const pieData = FUNNEL_STAGES.map((stage, i) => ({ name: stage, value: opportunities.filter(o => o.stage === stage).length, color: COLORS[i] })).filter(d => d.value > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>CRM Pipeline</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>{opportunities.length} oportunidades ativas</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard title="Pipeline Total" value={totalValue} format="brl" icon={Target} color="#6366f1" />
        <KPICard title="Conversao" value={conversion} format="percent" icon={TrendingUp} color="#10b981" />
        <KPICard title="Oportunidades" value={opportunities.length} format="number" icon={Users} color="#8b5cf6" />
        <KPICard title="Paradas +15d" value={stalled.length} format="number" icon={AlertTriangle} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Distribuicao por Etapa</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val: number) => [val, 'Oportunidades']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Por Etapa</h2>
          {FUNNEL_STAGES.map(stage => {
            const stats = stageStats[stage] || { count: 0, value: 0 }
            return (
              <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{stage}</span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{formatBRL(stats.value)}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{stats.count} oport.</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Todas as Oportunidades</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Nome', 'Etapa', 'Valor', 'Responsavel', 'Dias s/ mov.'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opportunities.map(opp => {
              const days = daysSince(opp.lastUpdated)
              const warn = days > 15 && !['Fechado', 'Perdido'].includes(opp.stage)
              return (
                <tr key={opp.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 500, color: '#111827' }}>{opp.name}</td>
                  <td style={{ padding: '10px 12px 10px 0' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: opp.stage === 'Fechado' ? '#d1fae5' : '#f3f4f6', color: opp.stage === 'Fechado' ? '#059669' : '#6b7280' }}>
                      {opp.stage}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 700 }}>{formatBRL(opp.monetaryValue)}</td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#6b7280' }}>{opp.assignedTo || '—'}</td>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: warn ? '#ef4444' : '#6b7280' }}>{days}d {warn ? '⚠' : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
