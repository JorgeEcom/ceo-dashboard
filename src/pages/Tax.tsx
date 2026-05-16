import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import KPICard from '../components/shared/KPICard'
import { useDashboard } from '../context/DashboardContext'
import { formatBRL } from '../utils/formatters'
import type { TaxClient } from '../types'

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

type DasStatus = 'ok' | 'pending' | 'overdue'
const STATUS_CFG: Record<DasStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle }> = {
  ok:      { label: 'Em dia',   color: '#059669', bg: '#d1fae5', Icon: CheckCircle },
  pending: { label: 'Pendente', color: '#d97706', bg: '#fef3c7', Icon: Clock },
  overdue: { label: 'Vencido',  color: '#dc2626', bg: '#fee2e2', Icon: AlertCircle },
}

export default function Tax() {
  const { taxClients, loading } = useDashboard()

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div style={{ width: 36, height: 36, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>
  }

  const totalMrr = taxClients.reduce((s, c) => s + c.mrr, 0)
  const okCount = taxClients.filter(c => c.dasStatus === 'ok').length
  const pendingCount = taxClients.filter(c => c.dasStatus === 'pending').length
  const overdueCount = taxClients.filter(c => c.dasStatus === 'overdue').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Modulo Fiscal</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Gestao tributaria — Simples Nacional e regimes especiais</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard title="MRR Fiscal" value={totalMrr} format="brl" subtitle={taxClients.length + ' clientes'} icon={FileText} color="#6366f1" />
        <KPICard title="Em Dia" value={okCount} format="number" icon={CheckCircle} color="#10b981" />
        <KPICard title="Pendentes" value={pendingCount} format="number" icon={Clock} color="#f59e0b" />
        <KPICard title="Vencidos" value={overdueCount} format="number" icon={AlertCircle} color="#ef4444" />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Clientes — Status Fiscal</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Cliente', 'CNPJ', 'Regime', 'MRR', 'DAS Status', 'Prox. Venc.'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taxClients.map((client: TaxClient) => {
              const cfg = STATUS_CFG[client.dasStatus]
              const Icon = cfg.Icon
              return (
                <tr key={client.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 500, color: '#111827' }}>{client.name}</td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}>{client.cnpj}</td>
                  <td style={{ padding: '10px 12px 10px 0', color: '#6b7280' }}>{REGIME_LABEL[client.regime]}</td>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 700 }}>{formatBRL(client.mrr)}</td>
                  <td style={{ padding: '10px 12px 10px 0' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: cfg.bg, color: cfg.color }}>
                      <Icon size={11} />{cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0', color: '#6b7280' }}>{new Date(client.nextDasDate).toLocaleDateString('pt-BR')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#eef2ff', borderRadius: 12, padding: 20, border: '1px solid #c7d2fe' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#3730a3', margin: '0 0 12px' }}>Calendario Fiscal — DAS Simples Nacional vence todo dia 20</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m => (
            <div key={m} style={{ background: '#fff', borderRadius: 8, padding: '10px 8px', textAlign: 'center', border: '1px solid #c7d2fe' }}>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{m}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5', margin: '2px 0 0' }}>dia 20</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
