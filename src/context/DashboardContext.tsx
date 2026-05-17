import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { GHLOpportunity, GHLPipeline, CEODecision, TaxClient } from '../types'
import { fetchAllCRMData } from '../services/ghl.service'
import { generateCEODecisions, getMockOpportunities, getMockPipeline, getMockTaxClients } from '../utils/aiAnalysis'

// Default credentials â can be overridden via Settings (localStorage)
const DEFAULT_API_KEY = 'pit-a67227b7-3db3-435e-8875-bcdd271ef82b'
const DEFAULT_LOCATION_ID = 'GS0MPCOqtgJUjUIIHuTx'

interface DashboardState {
  opportunities: GHLOpportunity[]
  pipeline: GHLPipeline[]
  taxClients: TaxClient[]
  decisions: CEODecision[]h
  loading: boolean
  error: string | null
  lastRefresh: Date | null
  isDemo: boolean
  refresh: () => void
  resolveDecision: (id: string) => void
  updateTaxClients: (clients: TaxClient[]) => void
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([])
  const [pipeline, setPipeline] = useState<GHLPipeline[]>([])
  const [taxClients, setTaxClients] = useState<TaxClient[]>([])
  const [decisions, setDecisions] = useState<CEODecision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    // Use localStorage overrides, fall back to hardcoded defaults
    const apiKey = localStorage.getItem('ghl_api_key') || DEFAULT_API_KEY
    const locationId = localStorage.getItem('ghl_location_id') || DEFAULT_LOCATION_ID
    try {
      setIsDemo(false)
      const data = await fetchAllCRMData(apiKey, locationId)
      setOpportunities(data.opportunities)
      setPipeline(data.pipelines)
      const clients = getMockTaxClients()
      setTaxClients(clients)
      setDecisions(generateCEODecisions(data.opportunities, clients))
    } catch (err: any) {
      console.error('GHL fetch error:', err)
      setIsDemo(true)
      const opps = getMockOpportunities()
      setOpportunities(opps)
      setPipeline([getMockPipeline()])
      const clients = getMockTaxClients()
      setTaxClients(clients)
      setDecisions(generateCEODecisions(opps, clients))
      setError('Erro ao conectar GHL: ' + (err?.message || 'falha na requisiÃ§Ã£o'))
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const resolveDecision = useCallback((id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, resolved: true } : d))
  }, [])

  const updateTaxClients = useCallback((clients: TaxClient[]) => {
    setTaxClients(clients)
  }, [])

  return (
    <DashboardContext.Provider value={{
      opportunities, pipeline, taxClients, decisions,
      loading, error, lastRefresh, isDemo,
      refresh: loadData, resolveDecision, updateTaxClients,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
