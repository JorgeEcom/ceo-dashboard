import type { GHLOpportunity, GHLPipeline } from '../types'

export interface GHLCRMData {
  opportunities: GHLOpportunity[]
  pipeline: GHLPipeline | null
}

export async function fetchAllCRMData(apiKey: string, locationId: string): Promise<GHLCRMData> {
  const headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  }
  const [oppRes, pipRes] = await Promise.all([
    fetch('/api/ghl/opportunities/search?location_id=' + locationId + '&limit=100', { headers }),
    fetch('/api/ghl/opportunities/pipelines?locationId=' + locationId, { headers }),
  ])
  if (!oppRes.ok || !pipRes.ok) throw new Error('Failed to fetch GHL data')
  const oppData = await oppRes.json()
  const pipData = await pipRes.json()
  const opportunities: GHLOpportunity[] = (oppData.opportunities || []).map((o: any) => ({
    id: o.id,
    name: o.name || o.contact?.name || 'Unknown',
    monetaryValue: o.monetaryValue || 0,
    status: o.status || 'open',
    stage: o.pipelineStageId || 'Unknown',
    lastUpdated: o.updatedAt || new Date().toISOString(),
    contactName: o.contact?.name,
    assignedTo: o.assignedTo?.name,
  }))
  const pipeline: GHLPipeline | null = pipData.pipelines?.[0]
    ? { id: pipData.pipelines[0].id, name: pipData.pipelines[0].name, stages: (pipData.pipelines[0].stages || []).map((s: any) => ({ id: s.id, name: s.name, position: s.position || 0 })) }
    : null
  return { opportunities, pipeline }
}
