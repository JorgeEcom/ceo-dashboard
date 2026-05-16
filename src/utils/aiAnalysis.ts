import type { GHLOpportunity, GHLPipeline, CEODecision, TaxClient } from '../types'

export function getMockOpportunities(): GHLOpportunity[] {
  return [
    { id: '1', name: 'TechStore LTDA', monetaryValue: 24000, status: 'open', stage: 'Proposta', lastUpdated: '2026-05-02', contactName: 'Ana Silva', assignedTo: 'Joao' },
    { id: '2', name: 'Fashion Hub', monetaryValue: 18500, status: 'open', stage: 'Negociacao', lastUpdated: '2026-05-12', contactName: 'Carlos Melo', assignedTo: 'Maria' },
    { id: '3', name: 'E-Sports BR', monetaryValue: 32000, status: 'open', stage: 'Qualificado', lastUpdated: '2026-04-25', contactName: 'Pedro Costa', assignedTo: 'Joao' },
    { id: '4', name: 'Moda Feminina', monetaryValue: 15000, status: 'open', stage: 'Lead', lastUpdated: '2026-05-14', contactName: 'Lucia Ferr', assignedTo: 'Maria' },
    { id: '5', name: 'Eletronicos SA', monetaryValue: 45000, status: 'open', stage: 'Proposta', lastUpdated: '2026-05-01', contactName: 'Roberto Alv', assignedTo: 'Joao' },
    { id: '6', name: 'Pet Shop Online', monetaryValue: 12000, status: 'open', stage: 'Fechado', lastUpdated: '2026-05-15', contactName: 'Beatriz', assignedTo: 'Ana' },
    { id: '7', name: 'Casa e Deco', monetaryValue: 28000, status: 'open', stage: 'Negociacao', lastUpdated: '2026-04-18', contactName: 'Fernando', assignedTo: 'Maria' },
    { id: '8', name: 'Bike Sports', monetaryValue: 9500, status: 'open', stage: 'Qualificado', lastUpdated: '2026-05-11', contactName: 'Camila', assignedTo: 'Joao' },
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
    ]
  }
}

export function getMockTaxClients(): TaxClient[] {
  return [
    { id: 'tc1', name: 'TechStore LTDA', cnpj: '12.345.678/0001-90', regime: 'simples', mrr: 2400, dasStatus: 'ok', nextDasDate: '2026-06-20' },
    { id: 'tc2', name: 'Fashion Hub ME', cnpj: '98.765.432/0001-10', regime: 'simples', mrr: 1800, dasStatus: 'pending', nextDasDate: '2026-06-20' },
    { id: 'tc3', name: 'E-Sports BR LTDA', cnpj: '11.222.333/0001-44', regime: 'lucro_presumido', mrr: 4500, dasStatus: 'ok', nextDasDate: '2026-06-30' },
    { id: 'tc4', name: 'Eletronicos SA', cnpj: '55.666.777/0001-88', regime: 'lucro_real', mrr: 8900, dasStatus: 'overdue', nextDasDate: '2026-05-20' },
    { id: 'tc5', name: 'Pet Shop Online', cnpj: '33.444.555/0001-22', regime: 'simples', mrr: 1200, dasStatus: 'ok', nextDasDate: '2026-06-20' },
    { id: 'tc6', name: 'Casa e Deco LTDA', cnpj: '77.888.999/0001-66', regime: 'simples', mrr: 1600, dasStatus: 'pending', nextDasDate: '2026-06-20' },
  ]
}

function fmtBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function generateCEODecisions(opps: GHLOpportunity[], taxClients: TaxClient[]): CEODecision[] {
  const decisions: CEODecision[] = []
  const stalled = findStalledOpportunities(opps)
  if (stalled.length > 0) {
    decisions.push({
      id: 'd1', type: 'warning',
      title: stalled.length + ' oportunidades paradas ha +15 dias',
      description: stalled.slice(0,3).map(o => o.name).join(', ') + ' precisam de acompanhamento.',
      impact: fmtBRL(stalled.reduce((s, o) => s + o.monetaryValue, 0)),
      action: 'Revisar e reagendar follow-ups no CRM',
      resolved: false, createdAt: new Date().toISOString()
    })
  }
  const overdue = taxClients.filter(c => c.dasStatus === 'overdue')
  if (overdue.length > 0) {
    decisions.push({
      id: 'd2', type: 'critical',
      title: overdue.length + ' cliente(s) com DAS em atraso',
      description: overdue.map(c => c.name).join(', ') + ' com obrigacoes fiscais vencidas.',
      impact: 'Risco de multas e juros',
      action: 'Regularizar pagamentos imediatamente',
      resolved: false, createdAt: new Date().toISOString()
    })
  }
  const highValue = opps.filter(o => o.monetaryValue > 20000 && o.stage === 'Proposta')
  if (highValue.length > 0) {
    decisions.push({
      id: 'd3', type: 'opportunity',
      title: highValue.length + ' proposta(s) de alto valor aguardando',
      description: 'Propostas acima de R$20k em aberto: ' + highValue.map(o => o.name).join(', ') + '.',
      impact: fmtBRL(highValue.reduce((s, o) => s + o.monetaryValue, 0)),
      action: 'Acompanhar pessoalmente estas oportunidades',
      resolved: false, createdAt: new Date().toISOString()
    })
  }
  return decisions
}

export function computeStageStats(opps: GHLOpportunity[]): Record<string, { count: number; value: number }> {
  const stages: Record<string, { count: number; value: number }> = {}
  for (const o of opps) {
    if (!stages[o.stage]) stages[o.stage] = { count: 0, value: 0 }
    stages[o.stage].count++
    stages[o.stage].value += o.monetaryValue
  }
  return stages
}

export function computeOverallConversion(opps: GHLOpportunity[]): number {
  if (opps.length === 0) return 0
  return (opps.filter(o => o.stage === 'Fechado').length / opps.length) * 100
}

export function forecastMonthlyRevenue(opps: GHLOpportunity[]): number {
  return opps.filter(o => ['Proposta', 'Negociacao', 'Fechado'].includes(o.stage))
    .reduce((s, o) => s + o.monetaryValue * 0.4, 0)
}

export function findStalledOpportunities(opps: GHLOpportunity[]): GHLOpportunity[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 15)
  return opps.filter(o => new Date(o.lastUpdated) < cutoff && !['Fechado', 'Perdido'].includes(o.stage))
}
