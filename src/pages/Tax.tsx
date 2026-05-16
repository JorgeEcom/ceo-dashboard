import { useState } from 'react'
import { Receipt, TrendingDown, CheckCircle, AlertTriangle, PlusCircle, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import KPICard from '../components/shared/KPICard'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL, formatPercent, formatDate } from '../utils/formatters'
import type { TaxClient, TaxRegime } from '../types'
import clsx from 'clsx'

const REGIME_LABELS: Record<TaxRegime, string> = {
  simples:  'Simples Nacional',
  presumido: 'Lucro Presumido',
  real:     'Lucro Real',
}

const REGIME_COLORS: Record<TaxRegime, string> = {
  simples:  '#1B4FCC',
  presumido: '#8B5CF6',
  real:     '#10B981',
}

const STATUS_CONFIG = {
  ok:       { label: '✅ Em dia',    badge: 'badge-success' },
  late:     { label: '⚠️ Atrasado',  badge: 'badge-warning' },
  critical: { label: '🚨 Crítico',   badge: 'badge-critical' },
}

const EMPTY_CLIENT: Omit<TaxClient, 'id'> = {
  name: '', cnpj: '', regime: 'simples',
  monthlyRevenue: 0, effectiveRate: 0, nominalRate: 0,
  taxSavings: 0, pendingGuias: 0, status: 'ok',
}

export default function Tax() {
  const { taxClients, updateTaxClients } = useDashboard()
  const [showForm, setShowForm] = useState(false)
  const [newClient, setNewClient] = useState({ ...EMPTY_CLIENT })

  // Summary KPIs
  const totalRevenue    = taxClients.reduce((s, c) => s + c.monthlyRevenue, 0)
  const totalSavings    = taxClients.reduce((s, c) => s + c.taxSavings, 0)
  const totalPending    = taxClients.reduce((s, c) => s + c.pendingGuias, 0)
  const lateCount       = taxClients.filter(c => c.status !== 'ok').length
  const avgEffRate      = taxClients.length
    ? taxClients.reduce((s, c) => s + c.effectiveRate, 0) / taxClients.length
    : 0

  // Chart data
  const chartData = taxClients.map(c => ({
    name: c.name.split(' ').slice(0, 2).join(' '),
    efetiva: c.effectiveRate,
    nominal: c.nominalRate,
    economia: parseFloat((c.taxSavings / 1000).toFixed(1)),
    regime: c.regime,
  }))

  // Add client
  const handleAddClient = () => {
    if (!newClient.name || !newClient.cnpj) return
    const client: TaxClient = { ...newClient, id: Date.now().toString() }
    updateTaxClients([...taxClients, client])
    setNewClient({ ...EMPTY_CLIENT })
    setShowForm(false)
  }

  // Remove client
  const handleRemove = (id: string) => {
    updateTaxClients(taxClients.filter(c => c.id !== id))
  }

  // Toggle guia resolved
  const handleDeliverGuia = (id: string) => {
    updateTaxClients(taxClients.map(c =>
      c.id === id ? { ...c, pendingGuias: Math.max(0, c.pendingGuias - 1) } : c,
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Tributário</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Carga tributária, alíquota efetiva e economia dos seus clientes
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} />
          Novo Cliente
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Clientes Ativos"
          value={taxClients.length}
          icon={<CheckCircle size={18} />}
          colorClass="text-brand-500"
        />
        <KPICard
          label="Economia Total (mês)"
          value={formatBRL(totalSavings)}
          change={+5}
          icon={<TrendingDown size={18} />}
          colorClass="text-emerald-500"
        />
        <KPICard
          label="Guias Pendentes"
          value={totalPending}
          icon={<Receipt size={18} />}
          colorClass={totalPending > 0 ? 'text-amber-500' : 'text-emerald-500'}
        />
        <KPICard
          label="Clientes em Atraso"
          value={lateCount}
          icon={<AlertTriangle size={18} />}
          colorClass={lateCount > 0 ? 'text-red-500' : 'text-emerald-500'}
        />
      </div>

      {/* Tax Chart */}
      <div className="card">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
          Alíquota Efetiva vs Nominal por Cliente
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(v: number, name: string) => [`${v}%`, name === 'efetiva' ? 'Alíq. Efetiva' : 'Alíq. Nominal']}
            />
            <Legend
              formatter={(v) => v === 'efetiva' ? 'Alíquota Efetiva' : 'Alíquota Nominal'}
            />
            <Bar dataKey="nominal" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="efetiva" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={REGIME_COLORS[entry.regime]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Client Table */}
      <div className="card">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
          Clientes — Detalhes Tributários
        </h2>
        <div className="space-y-3">
          {taxClients.map(client => (
            <div
              key={client.id}
              className="p-4 rounded-2xl border transition-all"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Client info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                      {client.name}
                    </h3>
                    <span className={STATUS_CONFIG[client.status].badge}>
                      {STATUS_CONFIG[client.status].label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ backgroundColor: REGIME_COLORS[client.regime] }}
                    >
                      {REGIME_LABELS[client.regime]}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
                    CNPJ: {client.cnpj}
                    {client.lastClosing && ` · Último fechamento: ${formatDate(client.lastClosing)}`}
                  </p>

                  {/* Metrics row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="label text-xs">Faturamento Mensal</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--color-text)' }}>
                        {formatBRL(client.monthlyRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="label text-xs">Alíq. Efetiva</p>
                      <p className={clsx('font-bold text-sm mt-0.5',
                        client.effectiveRate <= client.nominalRate * 0.85 ? 'text-emerald-600' : 'text-amber-600'
                      )}>
                        {formatPercent(client.effectiveRate)}
                      </p>
                    </div>
                    <div>
                      <p className="label text-xs">Alíq. Nominal</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {formatPercent(client.nominalRate)}
                      </p>
                    </div>
                    <div>
                      <p className="label text-xs">Economia (mês)</p>
                      <p className="font-bold text-sm mt-0.5 text-emerald-600 dark:text-emerald-400">
                        {formatBRL(client.taxSavings)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  {client.pendingGuias > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="badge-warning">{client.pendingGuias} guia(s) pendente(s)</span>
                      <button
                        onClick={() => handleDeliverGuia(client.id)}
                        className="text-xs px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-200 transition-colors"
                      >
                        Entregou 1
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(client.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XCircle size={13} />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}

          {taxClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>Nenhum cliente cadastrado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Clique em "Novo Cliente" para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg space-y-4" style={{ backgroundColor: 'var(--color-card)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Novo Cliente Tributário</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nome da Empresa', key: 'name', type: 'text', full: true },
                { label: 'CNPJ', key: 'cnpj', type: 'text' },
                { label: 'Faturamento Mensal (R$)', key: 'monthlyRevenue', type: 'number' },
                { label: 'Alíquota Efetiva (%)', key: 'effectiveRate', type: 'number' },
                { label: 'Alíquota Nominal (%)', key: 'nominalRate', type: 'number' },
                { label: 'Economia Tributária (R$)', key: 'taxSavings', type: 'number' },
                { label: 'Guias Pendentes', key: 'pendingGuias', type: 'number' },
              ].map(({ label, key, type, full }) => (
                <div key={key} className={clsx(full && 'col-span-2')}>
                  <label className="label block mb-1">{label}</label>
                  <input
                    type={type}
                    value={(newClient as Record<string, unknown>)[key] as string}
                    onChange={e => setNewClient(prev => ({
                      ...prev,
                      [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
                    }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                  />
                </div>
              ))}

              <div>
                <label className="label block mb-1">Regime</label>
                <select
                  value={newClient.regime}
                  onChange={e => setNewClient(prev => ({ ...prev, regime: e.target.value as TaxRegime }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  <option value="simples">Simples Nacional</option>
                  <option value="presumido">Lucro Presumido</option>
                  <option value="real">Lucro Real</option>
                </select>
              </div>

              <div>
                <label className="label block mb-1">Status</label>
                <select
                  value={newClient.status}
                  onChange={e => setNewClient(prev => ({ ...prev, status: e.target.value as TaxClient['status'] }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  <option value="ok">Em dia</option>
                  <option value="late">Atrasado</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 border" style={{ borderColor: 'var(--color-border)' }}>
                Cancelar
              </button>
              <button onClick={handleAddClient} className="btn-primary flex-1">
                Adicionar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
