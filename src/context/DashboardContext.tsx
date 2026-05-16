import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { GHLOpportunity, GHLPipeline, CEODecision, TaxClient } from '../types'
import { fetchAllCRMData } from '../services/ghl.service'
import { generateCEODecisions, getMockOpportunities, getMockPipeline, getMockTaxClients } from '../utils/aiAnalysis'

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
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([])
  const [pipeline, setPipeline] = useState<GHLPipeline | null>(null)
  const [taxClients, setTaxClients] = useState<TaxClient[]>([])
  const [decisions, setDecisions] = useState<CEODecision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const apiKey = localStorage.getItem('ghl_api_key') || ''
    const locationId = localStorage.getItem('ghl_location_id') || ''
    try {
      let opps: GHLOpportunity[]
      if (apiKey && locationId) {
        setIsDemo(false)
        const data = await fetchAllCRMData(apiKey, locationId)
        setOpportunities(data.opportunities)
        setPipeline(data.pipeline)
        opps = data.opportunities
      } else {
        setIsDemo(true)
        opps = getMockOpportunities()
        setOpportunities(opps)
        setPipeline(getMockPipeline())
      }
      const clients = getMockTaxClients()
      setTaxClients(clients)
      setDecisions(generateCEODecisions(opps, clients))
    } catch (err) {
      setIsDemo(true)
      const opps = getMockOpportunities()
      setOpportunities(opps)
      setPipeline(getMockPipeline())
      const clients = getMockTaxClients()
      setTaxClients(clients)
      setDecisions(generateCEODecisions(opps, clients))
      setError('Erro ao conectar GHL. Modo demo ativo.')
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
    <DashboardContext.Provider value={{ opportunities, pipeline, taxClients, decisions, loading, error, lastRefresh, isDemo, refresh: loadData, resolveDecision, updateTaxClients }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
