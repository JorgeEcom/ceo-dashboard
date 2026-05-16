import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { GHLOpportunity, GHLPipeline, CEODecision, TaxClient } from '../types'
import { fetchAllCRMData } from '../services/ghl.service'
import {
  generateCEODecisions,
  getMockOpportunities,
  getMockPipeline,
  getMockTaxClients,
} from '../utils/aiAnalysis'

interface DashboardState {
  opportunities: GHLOpportunity[]
  pipeline: GHLPipeline | null
  taxClients: TaxClient[]
  decisions: CEODecision[]
  loading: boolean
  error: string | null
  lastRefresh: Date | null
  isDemo: boolean
  refresh: () => void
  resolveDecision: (id: string) => void
  updateTaxClients: (clients: TaxClient[]) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([])
  const [pipeline, setPipeline] = useState<GHLPipeline | null>(null)
  const [taxClients, setTaxClients] = useState<TaxClient[]>(getMockTaxClients())
  const [decisions, setDecisions] = useState<CEODecision[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isDemo, setIsDemo] = useState(true)

  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  const [theme, setTheme] = useState<'light' | 'dark'>(savedTheme ?? 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  const refresh = useCallback(async () => {
    const apiKey = localStorage.getItem('ghl_api_key') || import.meta.env.VITE_GHL_API_KEY
    const locationId = localStorage.getItem('ghl_location_id') || import.meta.env.VITE_GHL_LOCATION_ID

    // If no credentials configured, use demo data
    if (!apiKey || !locationId) {
      const mockOpps = getMockOpportunities()
      const mockPipeline = getMockPipeline()
      setOpportunities(mockOpps)
      setPipeline(mockPipeline)
      setDecisions(generateCEODecisions(mockOpps, mockPipeline, taxClients))
      setLastRefresh(new Date())
      setIsDemo(true)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { opportunities: opps, pipelines } = await fetchAllCRMData()
      const mainPipeline = pipelines[0] ?? null
      // Enrich opportunities with stage name
      const enriched = opps.map(o => ({
        ...o,
        pipelineStageName: mainPipeline?.stages.find(s => s.id === o.pipelineStageId)?.name,
      }))
      setOpportunities(enriched)
      setPipeline(mainPipeline)
      setDecisions(generateCEODecisions(enriched, mainPipeline, taxClients))
      setLastRefresh(new Date())
      setIsDemo(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar dados do CRM'
      setError(msg)
      // Fall back to demo data
      const mockOpps = getMockOpportunities()
      const mockPipeline = getMockPipeline()
      setOpportunities(mockOpps)
      setPipeline(mockPipeline)
      setDecisions(generateCEODecisions(mockOpps, mockPipeline, taxClients))
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [taxClients])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5 * 60 * 1000) // refresh every 5 min
    return () => clearInterval(interval)
  }, [refresh])

  const resolveDecision = (id: string) => {
    setDecisions(prev => prev.map(d => (d.id === id ? { ...d, resolved: true } : d)))
  }

  const updateTaxClients = (clients: TaxClient[]) => {
    setTaxClients(clients)
    setDecisions(generateCEODecisions(opportunities, pipeline, clients))
  }

  return (
    <DashboardContext.Provider
      value={{
        opportunities,
        pipeline,
        taxClients,
        decisions,
        loading,
        error,
        lastRefresh,
        isDemo,
        refresh,
        resolveDecision,
        updateTaxClients,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
