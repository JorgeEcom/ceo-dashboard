import { useState, useMemo } from 'react'
import { TrendingUp, AlertTriangle, BarChart2, DollarSign, Users, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import KPICard from '../components/shared/KPICard'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL, daysSince } from '../utils/formatters'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6']
const TOOLTIP_STYLE = { background: '#1a1d2e', border: '1px solid #2d3045', borderRadius: 8, color: '#e8eaf0', fontSize: 12 }

type Tab = 'funnel' | 'closers' | 'sources' | 'stalled'

export default function CRM() {
  const { opportunities, pipeline, loading } = useDashboard()
  const [activePipelineIdx, setActivePipelineIdx] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('funnel')

  const analytics = useMemo(() => {
    if (!opportunities?.length) return null
    const pipelines = Array.isArray(pipeline) ? pipeline : (pipeline ? [pipeline] : [])

    // Per pipeline breakdown
    const byPipeline = pipelines.map((p: any) => {
      const opps = opportunities.filter((o: any) => o.pipelineId === p.id)
      const byStage = (p.stages || []).map((s: any) => ({
        name: s.name?.length > 14 ? s.name.substring(0, 14) + '…' : s.name,
        fullName: s.name,
        id: s.id,
        count: opps.filter((o: any) => o.pipelineStageId === s.id).length,
        stalled15: opps.filter((o: any) => o.pipelineStageId === s.id && daysSince(o.lastStageChangeAt || o.createdAt) >= 15).length,
      })).filter((s: any) => s.count > 0)
      const won = opps.filter((o: any) => o.status === 'won').length
      const totalValue = opps.reduce((acc: number, o: any) => acc + (o.monetaryValue || 0), 0)
      return { ...p, opps, byStage, won, total: opps.length, totalValue, convRate: opps.length ? (won / opps.length) * 100 : 0 }
    }).filter((p: any) => p.total > 0)

    // Closer ranking
    const closerMap: Record<string, any> = {}
    opportunities.forEach((o: any) => {
      const key = o.assignedTo || '__unassigned'
      if (!closerMap[key]) closerMap[key] = { id: key, total: 0, won: 0, value: 0 }
      closerMap[key].total++
      if (o.status === 'won') closerMap[key].won++
      closerMap[key].value += o.monetaryValue || 0
    })
    const closers = Object.values(closerMap)
      .map((c: any) => ({ ...c, rate: c.total ? (c.won / c.total) * 100 : 0 }))
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)

    // Lead sources
    const srcMap: Record<string, number> = {}
    opportunities.forEach((o: any) => { const s = o.source || 'Orgânico'; srcMap[s] = (srcMap[s] || 0) + 1 })
    const sources = Object.entries(srcMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)

    // Stalled leads
    const stalled = opportunities
      .map((o: any) => ({ ...o, days: daysSince(o.lastStageChangeAt || o.createdAt) }))
      .filter((o: any) => o.days >= 7)
      .sort((a: any, b: any) => b.days - a.days)
      .slice(0, 20)

    // Global KPIs
    const totalValue = opportunities.reduce((acc: number, o: any) => acc + (o.monetaryValue || 0), 0)
    const stalled15 = opportunities.filter((o: any) => daysSince(o.lastStageChangeAt || o.createdAt) >= 15).length
    const won = opportunities.filter((o: any) => o.status === 'won').length
    const globalConv = opportunities.length ? (won / opportunities.length) * 100 : 0

    return { byPipeline, closers, sources, stalled, totalValue, stalled15, globalConv }
  }, [opportunities, pipeline])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (!analytics) return <div style={{ padding: 32, color: '#8b8fa8' }}>Sem dados disponíveis.</div>

  const { byPipeline, closers, sources, stalled, totalValue, stalled15, globalConv } = analytics
  const activePipeline = byPipeline[activePipelineIdx] || byPipeline[0]

  const card = (style?: any) => ({
    background: '#1a1d2e', border: '1px solid #2d3045', borderRadius: 12, ...style
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'funnel', label: '📊 Funil por Estágio' },
    { key: 'closers', label: '👥 Ranking Closers' },
    { key: 'sources', label: '🎯 Origem dos Leads' },
    { key: 'stalled', label: '⏰ Leads Parados' },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8eaf0' }}>CRM Pipeline</h1>
        <p style={{ fontSize: 13, color: '#8b8fa8', marginTop: 4 }}>
          Dados em tempo real via GoHighLevel · {opportunities.length} oportunidades · {byPipeline.length} pipelines
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard title="Valor no Pipeline" value={formatBRL(totalValue)} subtitle={`${opportunities.length} oportunidades`} icon={<DollarSign size={20} />} trend={{ value: 0, label: '' }} />
        <KPICard title="Conversão Geral" value={`${globalConv.toFixed(1)}%`} subtitle="fechados vs total" icon={<TrendingUp size={20} />} trend={{ value: 0, label: '' }} />
        <KPICard title="Parados +15 dias" value={String(stalled15)} subtitle="leads exigem ação imediata" icon={<AlertTriangle size={20} />} trend={{ value: 0, label: '' }} />
        <KPICard title="Pipelines Ativos" value={String(byPipeline.length)} subtitle="SGTAX · SG3 · DIGITAL" icon={<BarChart2 size={20} />} trend={{ value: 0, label: '' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2d3045' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '9px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13,
            borderBottom: activeTab === t.key ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === t.key ? '#e8eaf0' : '#8b8fa8',
            fontWeight: activeTab === t.key ? 600 : 400, marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── FUNIL ── */}
      {activeTab === 'funnel' && activePipeline && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pipeline Selector */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {byPipeline.map((p: any, i: number) => (
              <button key={p.id} onClick={() => setActivePipelineIdx(i)} style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                border: `1px solid ${i === activePipelineIdx ? '#6366f1' : '#2d3045'}`,
                background: i === activePipelineIdx ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: i === activePipelineIdx ? '#e8eaf0' : '#8b8fa8',
              }}>
                {p.name}
              </button>
            ))}
          </div>

          {/* Pipeline Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Oportunidades', val: activePipeline.total, color: '#e8eaf0' },
              { label: 'Valor Total', val: formatBRL(activePipeline.totalValue), color: '#10b981' },
              { label: 'Conversão', val: `${activePipeline.convRate.toFixed(1)}%`, color: '#6366f1' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...card({ padding: 16 }) }}>
                <div style={{ fontSize: 11, color: '#8b8fa8', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Stage Chart */}
          <div style={{ ...card({ padding: 20 }) }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0', marginBottom: 16 }}>
              Oportunidades por Estágio — {activePipeline.name}
            </div>
            <ResponsiveContainer width="100%" height={Math.max(200, activePipeline.byStage.length * 36)}>
              <BarChart data={activePipeline.byStage} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3045" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8b8fa8', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8b8fa8', fontSize: 11 }} width={110} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, name: string) => [v, name === 'count' ? 'Oportunidades' : '+15 dias parado']} />
                <Bar dataKey="count" name="Oportunidades" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="stalled15" name="+15d parado" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              {[['#6366f1', 'Oportunidades'], ['#ef4444', 'Paradas +15 dias']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 11, color: '#8b8fa8' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CLOSERS ── */}
      {activeTab === 'closers' && (
        <div style={{ ...card({ overflow: 'hidden' }) }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d3045', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0' }}>Ranking por Responsável</div>
            <div style={{ fontSize: 12, color: '#8b8fa8' }}>{closers.length} responsáveis · {opportunities.length} oportunidades</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#12141f' }}>
                {['#', 'Responsável', 'Opps', 'Ganhos', 'Valor Pipeline', 'Taxa Conversão'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: h === '#' ? 'center' : 'left', fontSize: 10, fontWeight: 700, color: '#8b8fa8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {closers.map((c: any, i: number) => (
                <tr key={c.id} style={{ borderTop: '1px solid #2d3045' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#8b8fa8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e8eaf0', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${COLORS[i % COLORS.length]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                        {(c.id === '__unassigned' ? 'N/A' : c.id).substring(0, 2).toUpperCase()}
                      </div>
                      {c.id === '__unassigned' ? 'Não atribuído' : c.id}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e8eaf0' }}>{c.total}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#10b981', fontWeight: 600 }}>{c.won}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6366f1' }}>{formatBRL(c.value)}</td>
                  <td style={{ padding: '12px 16px', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: '#12141f', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(c.rate, 100)}%`, height: '100%', background: c.rate >= 20 ? '#10b981' : c.rate >= 10 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#8b8fa8', width: 36 }}>{c.rate.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SOURCES ── */}
      {activeTab === 'sources' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ ...card({ padding: 20 }) }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0', marginBottom: 16 }}>Leads por Origem</div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sources.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8b8fa8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...card({ padding: 20 }) }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0', marginBottom: 16 }}>Volume por Canal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sources.map((s: any, i: number) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#8b8fa8', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  <div style={{ flex: 1, background: '#12141f', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${(s.value / (sources[0]?.value || 1)) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e8eaf0', width: 28, textAlign: 'right' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STALLED ── */}
      {activeTab === 'stalled' && (
        <div style={{ ...card({ overflow: 'hidden' }) }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d3045', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0' }}>Leads Parados — Exigem Ação do CEO</div>
            <span style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '3px 12px', borderRadius: 20, fontWeight: 600 }}>
              {stalled.length} leads em risco
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#12141f' }}>
                {['Lead / Contato', 'Pipeline', 'Estágio', 'Parado há', 'Valor', 'Responsável'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#8b8fa8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stalled.map((o: any, i: number) => {
                const pipe = byPipeline.find((p: any) => p.id === o.pipelineId)
                const stage = (pipe?.stages || []).find((s: any) => s.id === o.pipelineStageId)
                const days = o.days
                const urgencyColor = days >= 30 ? '#ef4444' : days >= 15 ? '#f59e0b' : '#e8eaf0'
                const urgencyBg = days >= 30 ? 'rgba(239,68,68,0.1)' : days >= 15 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)'
                return (
                  <tr key={o.id} style={{ borderTop: '1px solid #2d3045' }}>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#e8eaf0', fontWeight: 500 }}>
                      {o.name || o.contact?.name || '—'}
                      {o.contact?.name && o.name && o.name !== o.contact.name && (
                        <div style={{ fontSize: 11, color: '#8b8fa8', marginTop: 2 }}>{o.contact.name}</div>
                      )}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#8b8fa8' }}>{pipe?.name || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#8b8fa8' }}>{stage?.name || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: urgencyColor, background: urgencyBg, padding: '3px 10px', borderRadius: 6 }}>
                        {days}d
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: o.monetaryValue ? '#6366f1' : '#8b8fa8' }}>
                      {o.monetaryValue ? formatBRL(o.monetaryValue) : '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#8b8fa8' }}>
                      {o.assignedTo || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
  }
