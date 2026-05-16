// ─── GoHighLevel Types ─────────────────────────────────────────────────────────

export interface GHLContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tags: string[]
  dateAdded: string
  assignedTo?: string
  source?: string
}

export interface GHLOpportunity {
  id: string
  name: string
  pipelineId: string
  pipelineStageId: string
  pipelineStageName?: string
  status: 'open' | 'won' | 'lost' | 'abandoned'
  monetaryValue: number
  contactId: string
  contact?: GHLContact
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface GHLPipelineStage {
  id: string
  name: string
  position: number
}

export interface GHLPipeline {
  id: string
  name: string
  stages: GHLPipelineStage[]
}

// ─── Dashboard Types ────────────────────────────────────────────────────────────

export interface KPIMetric {
  label: string
  value: string | number
  change?: number   // percentage change vs last period
  changeLabel?: string
  icon?: string
  color?: 'green' | 'red' | 'amber' | 'blue' | 'purple'
  prefix?: string   // e.g. "R$"
  suffix?: string   // e.g. "%"
}

export interface StageStats {
  stageId: string
  stageName: string
  count: number
  totalValue: number
  avgDaysInStage: number
  conversionRate?: number  // to next stage
}

export interface SDRPerformance {
  name: string
  assignedTo: string
  totalContacts: number
  scheduled: number
  noReturn: number
  disqualified: number
  conversionRate: number
}

// ─── Tax Types ──────────────────────────────────────────────────────────────────

export type TaxRegime = 'simples' | 'presumido' | 'real'

export interface TaxClient {
  id: string
  name: string
  cnpj: string
  regime: TaxRegime
  monthlyRevenue: number
  effectiveRate: number    // % rate actually paid
  nominalRate: number      // % rate expected
  taxSavings: number       // R$ saved vs nominal
  pendingGuias: number     // guias awaiting delivery
  lastClosing?: string     // last accounting closing date
  status: 'ok' | 'late' | 'critical'
}

export interface TaxSummary {
  totalClients: number
  totalMonthlyRevenue: number
  avgEffectiveRate: number
  totalTaxSavings: number
  pendingGuiasTotal: number
  lateClosingsCount: number
}

// ─── AI Decision Types ──────────────────────────────────────────────────────────

export type DecisionSeverity = 'critical' | 'warning' | 'opportunity'
export type DecisionCategory = 'crm' | 'tax' | 'financial' | 'operations' | 'marketing'

export interface CEODecision {
  id: string
  severity: DecisionSeverity
  category: DecisionCategory
  title: string
  description: string
  recommendedAction: string
  metric?: string           // e.g. "23 leads parados"
  detectedAt: string
  resolved: boolean
  snoozedUntil?: string
}

// ─── App Settings ───────────────────────────────────────────────────────────────

export interface AppSettings {
  ghlApiKey: string
  ghlLocationId: string
  theme: 'light' | 'dark' | 'system'
  refreshIntervalMs: number
  currency: 'BRL'
}

// ─── Pipeline Stage Names (as used in GHL) ──────────────────────────────────────

export const PIPELINE_STAGES = [
  'Novo lead',
  'Em contato',
  'Agendamento',
  'Proposta enviada',
  'Desqualificado',
  'Agendou',
  'Sem retorno',
  'Em andamento',
  'Sem interesse',
  'Proposta fechada',
] as const

export type PipelineStageName = (typeof PIPELINE_STAGES)[number]

// Stage order for funnel
export const FUNNEL_STAGES: PipelineStageName[] = [
  'Novo lead',
  'Em contato',
  'Agendamento',
  'Agendou',
  'Proposta enviada',
  'Em andamento',
  'Proposta fechada',
]

// Negative stages (excluded from funnel)
export const NEGATIVE_STAGES: PipelineStageName[] = [
  'Desqualificado',
  'Sem retorno',
  'Sem interesse',
]
