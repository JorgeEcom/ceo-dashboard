export interface GHLOpportunity {
  id: string
  name: string
  monetaryValue: number
  status: string
  stage: string
  pipelineId: string
  pipelineStageId: string
  pipelineStageName?: string
  lastUpdated: string
  updatedAt?: string
  lastStageChangeAt?: string
  createdAt?: string
  contactName?: string
  assignedTo?: string
  source?: string
}

export interface GHLStage {
  id: string
  name: string
  position: number
}

export interface GHLPipeline {
  id: string
  name: string
  stages: GHLStage[]
}

export interface CEODecision {
  id: string
  type: 'warning' | 'opportunity' | 'critical'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  action: string
  resolved: boolean
  createdAt: string
}

export interface TaxClient {
  id: string
  name: string
  cnpj: string
  regime: 'simples' | 'lucro_presumido' | 'lucro_real'
  mrr: number
  dasStatus: 'ok' | 'pending' | 'overdue'
  nextDasDate: string
  taxSavings: number
  pendingGuias: number
  effectiveRate: number
}

export const FUNNEL_STAGES = ['Lead', 'Qualificado', 'Proposta', 'Negociacao', 'Fechado']
export const NEGATIVE_STAGES = ['Perdido', 'Cancelado', 'Sem interesse']
