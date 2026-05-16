import type { GHLOpportunity, GHLPipeline, CEODecision, StageStats, TaxClient } from '../types'
import { daysSince } from './formatters'

// ─── Compute Stage Statistics ───────────────────────────────────────────────────

export function computeStageStats(
  opportunities: GHLOpportunity[],
  pipeline: GHLPipeline | null,
): StageStats[] {
  if (!pipeline) return []

  const stageMap = new Map<string, StageStats>()

  for (const stage of pipeline.stages) {
    stageMap.set(stage.id, {
      stageId: stage.id,
      stageName: stage.name,
      count: 0,
      totalValue: 0,
      avgDaysInStage: 0,
    })
  }

  const daysMap = new Map<string, number[]>()

  for (const opp of opportunities) {
    const stat = stageMap.get(opp.pipelineStageId)
    if (stat) {
      stat.count++
      stat.totalValue += opp.monetaryValue ?? 0
      if (!daysMap.has(opp.pipelineStageId)) daysMap.set(opp.pipelineStageId, [])
      daysMap.get(opp.pipelineStageId)!.push(daysSince(opp.updatedAt))
    }
  }

  // Compute avgDaysInStage and conversionRate between sequential stages
  const stages = [...stageMap.values()].sort((a, b) => {
    const posA = pipeline.stages.find(s => s.id === a.stageId)?.position ?? 0
    const posB = pipeline.stages.find(s => s.id === b.stageId)?.position ?? 0
    return posA - posB
  })

  for (let i = 0; i < stages.length; i++) {
    const days = daysMap.get(stages[i].stageId) || []
    stages[i].avgDaysInStage = days.length
      ? Math.round(days.reduce((a, b) => a + b, 0) / days.length)
      : 0

    if (i < stages.length - 1 && stages[i].count > 0) {
      stages[i].conversionRate = Math.round((stages[i + 1].count / stages[i].count) * 100)
    }
  }

  return stages
}

// ─── Compute Conversion Rate (end-to-end) ───────────────────────────────────────

export function computeOverallConversion(opportunities: GHLOpportunity[]): number {
  const total = opportunities.length
  const won = opportunities.filter(o => o.status === 'won').length
  if (total === 0) return 0
  return Math.round((won / total) * 100)
}

// ─── Stalled Opportunities ───────────────────────────────────────────────────────

export function findStalledOpportunities(
  opportunities: GHLOpportunity[],
  thresholdDays = 5,
): GHLOpportunity[] {
  return opportunities.filter(o => {
    if (o.status !== 'open') return false
    return daysSince(o.updatedAt) >= thresholdDays
  })
}

// ─── Revenue Forecast (simple linear trend) ─────────────────────────────────────

export function forecastMonthlyRevenue(wonOpps: GHLOpportunity[]): number {
  const now = new Date()
  const thisMonth = wonOpps.filter(o => {
    const d = new Date(o.updatedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const daysElapsed = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentRevenue = thisMonth.reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0)
  return daysElapsed > 0 ? Math.round((currentRevenue / daysElapsed) * daysInMonth) : 0
}

// ─── AI Decision Generator ───────────────────────────────────────────────────────

export function generateCEODecisions(
  opportunities: GHLOpportunity[],
  pipeline: GHLPipeline | null,
  taxClients: TaxClient[],
): CEODecision[] {
  const decisions: CEODecision[] = []
  const now = new Date().toISOString()

  // 1. Stalled leads (no update in 5+ days)
  const stalled = findStalledOpportunities(opportunities, 5)
  if (stalled.length > 0) {
    decisions.push({
      id: 'stalled-leads',
      severity: 'critical',
      category: 'crm',
      title: 'Leads parados no pipeline',
      description: `${stalled.length} oportunidade(s) sem atualização há mais de 5 dias.`,
      recommendedAction: 'Cobrar SDRs/Closers para registrar atividade ou reclassificar o lead.',
      metric: `${stalled.length} oportunidades paradas`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 2. High volume in "Novo lead" not contacted
  const novosLeads = opportunities.filter(o =>
    o.pipelineStageName?.toLowerCase().includes('novo lead'),
  )
  if (novosLeads.length >= 30) {
    decisions.push({
      id: 'new-leads-backlog',
      severity: 'critical',
      category: 'crm',
      title: 'Acúmulo de novos leads sem contato',
      description: `${novosLeads.length} leads em "Novo lead" aguardando primeiro contato.`,
      recommendedAction: 'Acionar SDRs para iniciar contato imediatamente. Considere aumentar capacidade.',
      metric: `${novosLeads.length} leads em fila`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 3. Proposals not followed up (5+ days)
  const proposals = opportunities.filter(o => {
    const inProposal = o.pipelineStageName?.toLowerCase().includes('proposta enviada')
    return inProposal && daysSince(o.updatedAt) >= 3
  })
  if (proposals.length > 0) {
    decisions.push({
      id: 'proposals-no-followup',
      severity: 'warning',
      category: 'crm',
      title: 'Propostas sem follow-up',
      description: `${proposals.length} proposta(s) enviada(s) há mais de 3 dias sem resposta registrada.`,
      recommendedAction: 'Closers devem fazer follow-up agora. Proposta esquecida = contrato perdido.',
      metric: `${proposals.length} propostas aguardando`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 4. Low overall conversion rate
  const convRate = computeOverallConversion(opportunities)
  if (convRate > 0 && convRate < 15) {
    decisions.push({
      id: 'low-conversion',
      severity: 'warning',
      category: 'crm',
      title: 'Taxa de conversão abaixo de 15%',
      description: `Taxa atual: ${convRate}%. Referência mínima saudável: 15%-20%.`,
      recommendedAction: 'Revisar pitch dos closers, qualificação dos SDRs e fontes de leads.',
      metric: `${convRate}% de conversão`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 5. High volume in scheduling stage — opportunity for closers
  const agendados = opportunities.filter(o =>
    o.pipelineStageName?.toLowerCase().includes('agendou'),
  )
  if (agendados.length >= 10) {
    decisions.push({
      id: 'high-scheduled',
      severity: 'opportunity',
      category: 'crm',
      title: 'Alto volume de reuniões agendadas',
      description: `${agendados.length} leads agendados aguardando reunião com closers.`,
      recommendedAction: 'Garantir que closers estejam preparados e com agenda disponível. Momento de fechar contratos.',
      metric: `${agendados.length} reuniões na fila`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 6. Tax: pending guias
  const criticalTax = taxClients.filter(c => c.pendingGuias > 0)
  if (criticalTax.length > 0) {
    const totalPending = criticalTax.reduce((s, c) => s + c.pendingGuias, 0)
    decisions.push({
      id: 'pending-guias',
      severity: criticalTax.some(c => c.status === 'critical') ? 'critical' : 'warning',
      category: 'tax',
      title: 'Guias fiscais pendentes de entrega',
      description: `${totalPending} guia(s) em ${criticalTax.length} cliente(s) ainda não entregues.`,
      recommendedAction: 'Priorizar equipe fiscal para emissão e entrega das guias. Risco de multa para cliente.',
      metric: `${totalPending} guias pendentes`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 7. Tax: late closings
  const lateClosings = taxClients.filter(c => c.status === 'late' || c.status === 'critical')
  if (lateClosings.length > 0) {
    decisions.push({
      id: 'late-closings',
      severity: 'critical',
      category: 'tax',
      title: 'Fechamentos contábeis atrasados',
      description: `${lateClosings.length} cliente(s) com fechamento contábil/fiscal em atraso.`,
      recommendedAction: 'Reunir equipe contábil, identificar gargalos e priorizar clientes em risco de multa.',
      metric: `${lateClosings.length} clientes em atraso`,
      detectedAt: now,
      resolved: false,
    })
  }

  // 8. Tax: high effective rate (savings opportunity)
  const highRateClients = taxClients.filter(
    c => c.effectiveRate > c.nominalRate * 0.95 && c.taxSavings < 500,
  )
  if (highRateClients.length > 0) {
    decisions.push({
      id: 'tax-savings-opportunity',
      severity: 'opportunity',
      category: 'tax',
      title: 'Oportunidade de planejamento tributário',
      description: `${highRateClients.length} cliente(s) pagando próximo à alíquota nominal — possível redução.`,
      recommendedAction: 'Analisar enquadramento tributário e possíveis créditos PIS/COFINS. Economia potencial.',
      metric: `${highRateClients.length} clientes a analisar`,
      detectedAt: now,
      resolved: false,
    })
  }

  // Sort: critical first, then warning, then opportunity
  const order: Record<string, number> = { critical: 0, warning: 1, opportunity: 2 }
  return decisions.sort((a, b) => order[a.severity] - order[b.severity])
}

// ─── Mock data for demo (when API not connected) ─────────────────────────────────

export function getMockOpportunities(): GHLOpportunity[] {
  const stages = [
    { id: 'stage-1', name: 'Novo lead' },
    { id: 'stage-2', name: 'Em contato' },
    { id: 'stage-3', name: 'Agendamento' },
    { id: 'stage-4', name: 'Agendou' },
    { id: 'stage-5', name: 'Proposta enviada' },
    { id: 'stage-6', name: 'Em andamento' },
    { id: 'stage-7', name: 'Proposta fechada' },
    { id: 'stage-8', name: 'Desqualificado' },
    { id: 'stage-9', name: 'Sem retorno' },
    { id: 'stage-10', name: 'Sem interesse' },
  ]

  const counts = [45, 32, 18, 15, 12, 8, 6, 20, 14, 10]
  const values = [0, 0, 0, 0, 2500, 2500, 3000, 0, 0, 0]

  const opps: GHLOpportunity[] = []
  const now = Date.now()

  stages.forEach((stage, si) => {
    for (let i = 0; i < counts[si]; i++) {
      const daysOld = Math.floor(Math.random() * 14)
      opps.push({
        id: `opp-${stage.id}-${i}`,
        name: `Lead ${i + 1}`,
        pipelineId: 'pipeline-1',
        pipelineStageId: stage.id,
        pipelineStageName: stage.name,
        status: stage.name === 'Proposta fechada' ? 'won' : 'open',
        monetaryValue: values[si] + Math.random() * 500,
        contactId: `contact-${si}-${i}`,
        assignedTo: ['SDR Maria', 'SDR João', 'SDR Carlos'][i % 3],
        createdAt: new Date(now - (daysOld + 5) * 86400000).toISOString(),
        updatedAt: new Date(now - daysOld * 86400000).toISOString(),
      })
    }
  })

  return opps
}

export function getMockPipeline(): GHLPipeline {
  return {
    id: 'pipeline-1',
    name: 'Pipeline Contabilidade',
    stages: [
      { id: 'stage-1', name: 'Novo lead', position: 1 },
      { id: 'stage-2', name: 'Em contato', position: 2 },
      { id: 'stage-3', name: 'Agendamento', position: 3 },
      { id: 'stage-4', name: 'Agendou', position: 4 },
      { id: 'stage-5', name: 'Proposta enviada', position: 5 },
      { id: 'stage-6', name: 'Em andamento', position: 6 },
      { id: 'stage-7', name: 'Proposta fechada', position: 7 },
      { id: 'stage-8', name: 'Desqualificado', position: 8 },
      { id: 'stage-9', name: 'Sem retorno', position: 9 },
      { id: 'stage-10', name: 'Sem interesse', position: 10 },
    ],
  }
}

export function getMockTaxClients(): TaxClient[] {
  return [
    {
      id: '1', name: 'E-commerce Alpha Ltda', cnpj: '12.345.678/0001-90',
      regime: 'simples', monthlyRevenue: 85000, effectiveRate: 7.2,
      nominalRate: 8.0, taxSavings: 680, pendingGuias: 0,
      lastClosing: '2026-04-30', status: 'ok',
    },
    {
      id: '2', name: 'Marketplace Beta S.A.', cnpj: '98.765.432/0001-10',
      regime: 'presumido', monthlyRevenue: 320000, effectiveRate: 11.5,
      nominalRate: 13.33, taxSavings: 5856, pendingGuias: 2,
      lastClosing: '2026-03-31', status: 'late',
    },
    {
      id: '3', name: 'Loja Gama EIRELI', cnpj: '11.222.333/0001-44',
      regime: 'simples', monthlyRevenue: 42000, effectiveRate: 5.8,
      nominalRate: 6.5, taxSavings: 294, pendingGuias: 1,
      lastClosing: '2026-04-30', status: 'ok',
    },
    {
      id: '4', name: 'Digital Delta ME', cnpj: '44.555.666/0001-77',
      regime: 'real', monthlyRevenue: 680000, effectiveRate: 22.1,
      nominalRate: 34.0, taxSavings: 81260, pendingGuias: 0,
      lastClosing: '2026-04-30', status: 'ok',
    },
    {
      id: '5', name: 'Shop Épsilon Ltda', cnpj: '77.888.999/0001-22',
      regime: 'simples', monthlyRevenue: 18000, effectiveRate: 4.0,
      nominalRate: 4.5, taxSavings: 90, pendingGuias: 3,
      lastClosing: '2026-02-28', status: 'critical',
    },
  ]
}
