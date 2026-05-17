import type { GHLOpportunity, GHLPipeline, CEODecision, TaxClient } from '../types'

export function getMockOpportunities(): GHLOpportunity[] {
  return [
    { id: '1', name: 'TechStore LTDA', monetaryValue: 24000, status: 'open', stage: 's3', pipelineId: 'pipeline-1', pipelineStageId: 's3', pipelineStageName: 'Proposta', lastUpdated: '2026-05-02', createdAt: '2026-04-15', contactName: 'Ana Silva', assignedTo: 'Joao', source: 'Website' },
    { id: '2', name: 'Fashion Hub', monetaryValue: 18500, status: 'open', stage: 's4', pipelineId: 'pipeline-1', pipelineStageId: 's4', pipelineStageName: 'Negociacao', lastUpdated: '2026-05-12', createdAt: '2026-04-20', contactName: 'Carlos Melo', assignedTo: 'Maria', source: 'IndicaÃ§Ã£o' },
    { id: '3', name: 'E-Sports BR', monetaryValue: 32000, status: 'open', stage: 's2', pipelineId: 'pipeline-1', pipelineStageId: 's2', pipelineStageName: 'Qualificado', lastUpdated: '2026-04-25', createdAt: '2026-04-10', contactName: 'Pedro Costa', assignedTo: 'Joao', source: 'LinkedIn' },
    { id: '4', name: 'Moda Feminina', monetaryValue: 15000, status: 'open', stage: 's1', pipelineId: 'pipeline-1', pipelineStageId: 's1', pipelineStageName: 'Lead', lastUpdated: '2026-05-14', createdAt: '2026-05-01', contactName: 'Lucia Ferr', assignedTo: 'Maria', source: 'Website' },
    { id: '5', name: 'Eletronicos SA', monetaryValue: 45000, status: 'open', stage: 's3', pipelineId: 'pipeline-1', pipelineStageId: 's3', pipelineStageName: 'Proposta', lastUpdated: '2026-05-01', createdAt: '2026-04-05', contactName: 'Roberto Alv', assignedTo: 'Joao', source: 'Google Ads' },
    { id: '6', name: 'Pet Shop Online', monetaryValue: 12000, status: 'won', stage: 's5', pipelineId: 'pipeline-1', pipelineStageId: 's5', pipelineStageName: 'Fechado', lastUpdated: '2026-05-15', createdAt: '2026-04-25', contactName: 'Beatriz', assignedTo: 'Ana', source: 'IndicaÃ§Ã£o' },
    { id: '7', name: 'Casa e Deco', monetaryValue: 28000, status: 'open', stage: 's4', pipelineId: 'pipeline-1', pipelineStageId: 's4', pipelineStageName: 'Negociacao', lastUpdated: '2026-04-18', createdAt: '2026-04-01', contactName: 'Fernando', assignedTo: 'Maria', source: 'Website' },
    { id: '8', name: 'Bike Sports', monetaryValue: 9500, status: 'open', stage: 's2', pipelineId: 'pipeline-1', pipelineStageId: 's2', pipelineStageName: 'Qualificado', lastUpdated: '2026-05-11', createdAt: '2026-04-30', contactName: 'Camila', assignedTo: 'Joao', source: 'Google Ads' },
  ]
}

export function getMockPipeline(): GHLPipeline {
  return {
    id: 'pipeline-1',
    name: 'Pipeline Principal',
    stages: [
      { id: 's1', name: 'Lead', position: 0 },
      { id: 's2', name: 'Qualificado', position: 1 },
      { id: 's3', name: 'Proposta', position: 2 },
      { id: 's4', name: 'Negociacao', position: 3 },
      { id: 's5', name: 'Fechado', position: 4 },
    ],
  }
}

export function getMockTaxClients(): TaxClient[] {
  return [
    { id: 'tc1', name: 'TechStore LTDA', cnpj: '12.345.678/0001-90', regime: 'simples', mrr: 2400, dasStatus: 'ok', nextDasDate: '2026-06-20', taxSavings: 3200, pendingGuias: 0, effectiveRate: 7.2 },
    { id: 'tc2', name: 'Fashion Hub ME', cnpj: '98.765.432/0001-10', regime: 'simples', mrr: 1800, dasStatus: 'pending', nextDasDate: '2026-06-20', taxSavings: 1500, pendingGuias: 1, effectiveRate: 8.1 },
    { id: 'tc3', name: 'E-Sports BR LTDA', cnpj: '11.222.333/0001-44', regime: 'lucro_presumido', mrr: 4500, dasStatus: 'ok', nextDasDate: '2026-06-30', taxSavings: 8900, pendingGuias: 0, effectiveRate: 11.4 },
    { id: 'tc4', name: 'Eletronicos SA', cnpj: '55.666.777/0001-88', regime: 'lucro_real', mrr: 8900, dasStatus: 'overdue', nextDasDate: '2026-05-20', taxSavings: 12400, pendingGuias: 2, effectiveRate: 9.8 },
    { id: 'tc5', name: 'Pet Shop Online', cnpj: '33.444.555/0001-22', regime: 'simples', mrr: 1200, dasStatus: 'ok', nextDasDate: '2026-06-20', taxSavings: 980, pendingGuias: 0, effectiveRate: 6.5 },
    { id: 'tc6', name: 'Casa e Deco LTDA', cnpj: '77.888.999/0001-66', regime: 'simples', mrr: 1600, dasStatus: 'pending', nextDasDate: '2026-06-20', taxSavings: 2100, pendingGuias: 1, effectiveRate: 7.8 },
  ]
}

function fmtBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function generateCEODecisions(opps: GHLOpportunity[], taxClients: TaxClient[]): CEODecision[] {
  const decisions: CEODecision[] = []

  const stalled = findStalledOpportunities(opps, 15)
  if (stalled.length > 0) {
    decisions.push({
      id: 'd1', type: 'warning', severity: 'high',
      title: `${stalled.length} oportunidade(s) parada(s) hÃ¡ +15 dias`,
      description: stalled.slice(0, 3).map(o => o.name).join(', ') + ' precisam de acompanhamento.',
      impact: fmtBRL(stalled.reduce((s, o) => s + o.monetaryValue, 0)),
      action: 'Revisar e reagendar follow-ups no CRM',
      resolved: false, createdAt: new Date().toISOString(),
    })
  }

  const overdue = taxClients.filter(c => c.dasStatus === 'overdue')
  if (overdue.length > 0) {
    decisions.push({
      id: 'd2', type: 'critical', severity: 'critical',
      title: `${overdue.length} cliente(s) com DAS em atraso`,
      description: overdue.map(c => c.name).join(', ') + ' com obrigaÃ§Ãµes fiscais vencidas.',
      impact: 'Risco de multas e juros',
      action: 'Regularizar pagamentos imediatamente',
      resolved: false, createdAt: new Date().toISOString(),
    })
  }

  const highValue = opps.filter(o => o.monetaryValue > 20000 && o.status !== 'won' && o.status !== 'lost')
  if (highValue.length > 0) {
    decisions.push({
      id: 'd3', type: 'opportunity', severity: 'medium',
      title: `${highValue.length} oportunidade(s) de alto valor aguardando`,
      description: 'Acima de R$20k em aberto: ' + highValue.slice(0, 3).map(o => o.name).join(', ') + '.',
      impact: fmtBRL(highValue.reduce((s, o) => s + o.monetaryValue, 0)),
      action: 'Acompanhar pessoalmente estas oportunidades',
      resolved: false, createdAt: new Date().toISOString(),
    })
  }

  const pending = taxClients.filter(c => c.pendingGuias > 0)
  if (pending.length > 0) {
    decisions.push({
      id: 'd4', type: 'warning', severity: 'medium',
      title: `${pending.reduce((s, c) => s + c.pendingGuias, 0)} guia(s) fiscal(is) pendente(s)`,
      description: pending.map(c => c.name).join(', ') + ' com guias aguardando pagamento.',
      impact: 'Risco de multas por atraso',
      action: 'Verificar e pagar guias pendentes',
      resolved: false, createdAt: new Date().toISOString(),
    })
  }

  return decisions
}

export function computeStageStats(opps: GHLOpportunity[]): Record<string, { count: number; value: number }> {
  const stages: Record<string, { count: number; value: number }> = {}
  for (const o of opps) {
    const key = o.pipelineStageName || o.pipelineStageId || o.stage || 'Desconhecido'
    if (!stages[key]) stages[key] = { count: 0, value: 0 }
    stages[key].count++
    stages[key].value += o.monetaryValue
  }
  return stages
}

export function computeOverallConversion(opps: GHLOpportunity[]): number {
  if (opps.length === 0) return 0
  return (opps.filter(o => o.status === 'won').length / opps.length) * 100
}

export function forecastMonthlyRevenue(wonOpps: GHLOpportunity[]): number {
  return wonOpps.reduce((s, o) => s + o.monetaryValue, 0)
}

export function findStalledOpportunities(opps: GHLOpportunity[], days = 15): GHLOpportunity[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return opps.filter(o => {
    if (o.status === 'won' || o.status === 'lost') return false
    const lastChange = o.lastStageChangeAt || o.updatedAt || o.lastUpdated || o.createdAt
    return lastChange ? new Date(lastChange) < cutoff : false
  })
}

export function daysSince(dateStr?: string): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
