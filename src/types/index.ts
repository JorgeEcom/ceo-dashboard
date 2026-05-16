export interface GHLOpportunity {
  id: string
  name: string
  monetaryValue: number
  status: string
  stage: string
  lastUpdated: string
  contactName?: string
  assignedTo?: string
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
}

export const FUNNEL_STAGES = ['Lead', 'Qualificado', 'Proposta', 'Negociacao', 'Fechado']
export const NEGATIVE_STAGES = ['Perdido', 'Cancelado', 'Sem interesse']
