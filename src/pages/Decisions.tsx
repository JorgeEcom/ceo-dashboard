import React, { useState } from 'react'
import { Brain, AlertTriangle, AlertCircle, Lightbulb, Filter } from 'lucide-react'
import DecisionAlert from '../components/shared/DecisionAlert'
import { useDashboard } from '../context/DashboardContext'
import type { DecisionSeverity, DecisionCategory } from '../types'
import clsx from 'clsx'

const SEVERITY_FILTERS: { value: DecisionSeverity | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all',         label: 'Todas',        icon: <Filter size={14} />       },
  { value: 'critical',    label: 'Urgentes',     icon: <AlertTriangle size={14} /> },
  { value: 'warning',     label: 'Atenção',      icon: <AlertCircle size={14} />   },
  { value: 'opportunity', label: 'Oportunidades',icon: <Lightbulb size={14} />     },
]

const CATEGORY_FILTERS: { value: DecisionCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'Todas as Áreas' },
  { value: 'crm',        label: 'CRM'            },
  { value: 'tax',        label: 'Tributário'     },
  { value: 'financial',  label: 'Financeiro'     },
  { value: 'operations', label: 'Operações'      },
  { value: 'marketing',  label: 'Marketing'      },
]

// Decision point documentation (for CEO context)
const CEO_DECISION_POINTS = [
  {
    id: 'dp-1',
    icon: '👥',
    title: 'Ativação de SDR',
    when: 'Leads sem contato após 24h ou acúmulo em "Novo lead"',
    action: 'Cobrar SDR responsável ou redistribuir leads',
    impact: 'Diretamente afeta taxa de conversão e CAC',
  },
  {
    id: 'dp-2',
    icon: '📅',
    title: 'Follow-up de Proposta',
    when: 'Proposta enviada há +3 dias sem resposta',
    action: 'Closer faz follow-up por WhatsApp ou ligação',
    impact: 'Reduz ciclo de vendas e evita perda de contrato',
  },
  {
    id: 'dp-3',
    icon: '📊',
    title: 'Revisão do Pitch de Vendas',
    when: 'Taxa de conversão abaixo de 15%',
    action: 'Reunião com equipe de closers para revisar abordagem',
    impact: 'Cada 1% de melhora na conversão = mais receita mensal',
  },
  {
    id: 'dp-4',
    icon: '📋',
    title: 'Entrega de Guias Fiscais',
    when: 'Guias pendentes próximas ao vencimento',
    action: 'Priorizar equipe contábil para emissão urgente',
    impact: 'Multa do cliente por guia não entregue = risco de churn',
  },
  {
    id: 'dp-5',
    icon: '🏦',
    title: 'Planejamento Tributário',
    when: 'Cliente pagando próximo à alíquota nominal',
    action: 'Analisar créditos PIS/COFINS e enquadramento de regime',
    impact: 'Diferencial competitivo + retenção de clientes',
  },
  {
    id: 'dp-6',
    icon: '⚠️',
    title: 'Fechamento Contábil Atrasado',
    when: 'Fechamento mensal em atraso',
    action: 'Identificar gargalo (dados faltantes, equipe sobrecarregada)',
    impact: 'Impacta entrega de guias e satisfação do cliente',
  },
  {
    id: 'dp-7',
    icon: '📈',
    title: 'Onboarding de Novo Cliente',
    when: 'Proposta fechada sem onboarding iniciado',
    action: 'Acionar CS para iniciar coleta de documentos em 24h',
    impact: 'First Impression define retenção de longo prazo',
  },
  {
    id: 'dp-8',
    icon: '💰',
    title: 'Revisão de CAC',
    when: 'Custo de aquisição de cliente subindo mês a mês',
    action: 'Revisar canais de marketing e qualidade dos leads',
    impact: 'CAC alto corrói margem e escala do negócio',
  },
]

export default function Decisions() {
  const { decisions, refresh } = useDashboard()
  const [severityFilter, setSeverityFilter] = useState<DecisionSeverity | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<DecisionCategory | 'all'>('all')
  const [showResolved, setShowResolved] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'map'>('active')

  const filtered = decisions.filter(d => {
    if (!showResolved && d.resolved) return false
    if (severityFilter !== 'all' && d.severity !== severityFilter) return false
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
    return true
  })

  const criticalCount  = decisions.filter(d => !d.resolved && d.severity === 'critical').length
  const warningCount   = decisions.filter(d => !d.resolved && d.severity === 'warning').length
  const opportunityCount = decisions.filter(d => !d.resolved && d.severity === 'opportunity').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Brain size={24} className="text-brand-500" />
            Centro de Decisões CEO
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            IA analisando seus dados em tempo real — vocà decide, ela aponta
          </p>
        </div>
        <button onClick={refresh} className="btn-primary">
          Analisar agora
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
          <p className="label">Urgentes</p>
          <p className="metric text-red-600 dark:text-red-400">{criticalCount}</p>
        </div>
        <div className="card border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/10">
          <p className="label">Atenção</p>
          <p className="metric text-amber-600 dark:text-amber-400">{warningCount}</p>
        </div>
        <div className="card border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/10">
          <p className="label">Oportunidades</p>
          <p className="metric text-emerald-600 dark:text-emerald-400">{opportunityCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { id: 'active', label: 'Decisões da IA' },
          { id: 'map',    label: 'Mapa de Decisões do CEO' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'active' | 'map')}
            className={clsx(
              'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px',
              activeTab === tab.id
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent',
            )}
            style={{ color: activeTab === tab.id ? undefined : 'var(--color-muted)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'active' ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Severity filter */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg)' }}>
              {SEVERITY_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setSeverityFilter(f.value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    severityFilter === f.value
                      ? 'bg-brand-500 text-white shadow'
                      : 'hover:bg-white dark:hover:bg-slate-700',
                  )}
                  style={{ color: severityFilter === f.value ? 'white' : 'var(--color-muted)' }}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Resolved toggle */}
            <button
              onClick={() => setShowResolved(v => !v)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                showResolved ? 'bg-slate-700 text-white border-slate-700' : '',
              )}
              style={{
                borderColor: 'var(--color-border)',
                color: showResolved ? 'white' : 'var(--color-muted)',
              }}
            >
              {showResolved ? '✓ Mostrando resolvidas' : 'Mostrar resolvidas'}
            </button>
          </div>

          {/* Decision list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                  Tudo em ordem!
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                  Nenhuma decisão pendente com os filtros selecionados
                </p>
              </div>
            ) : (
              filtered.map(d => <DecisionAlert key={d.id} decision={d} />)
            )}
          </div>
        </>
      ) : (
        /* CEO Decision Map */
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Todos os pontos onde você, como CEO, toma decisões estratégicas. A IA monitora cada um deles automaticamente.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {CEO_DECISION_POINTS.map(dp => (
              <div key={dp.id} className="card">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{dp.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text)' }}>
                      {dp.title}
                    </h3>
                    <div className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                      <div>
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Quando aciona: </span>
                        {dp.when}
                      </div>
                      <div>
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Ação: </span>
                        {dp.action}
                      </div>
                      <div>
                        <span className="font-semibold text-brand-500">Impacto: </span>
                        {dp.impact}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>