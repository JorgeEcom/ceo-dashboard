import type { GHLOpportunity, GHLPipeline } from '../types'

const GHL_BASE = 'https://services.leadconnectorhq.com'

export interface GHLCRMData {
  opportunities: GHLOpportunity[]
  pipeline: GHLPipeline | null
  pipelines: GHLPipeline[]
}

export async function fetchAllCRMData(apiKey: string, locationId: string): Promise<GHLCRMData> {
  const headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  }

  // Fetch pipelines first to build stage name map
  const pipRes = await fetch(
    `${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`,
    { headers }
  )
  if (!pipRes.ok) throw new Error(`GHL Pipelines error ${pipRes.status}`)
  const pipData = await pipRes.json()

  const pipelines: GHLPipeline[] = (pipData.pipelines || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    stages: (p.stages || [])
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((s: any) => ({ id: s.id, name: s.name, position: s.position || 0 })),
  }))

  // Build stageId -> stageName map for all pipelines
  const stageNameMap: Record<string, string> = {}
  pipelines.forEach(p => p.stages.forEach(s => { stageNameMap[s.id] = s.name }))

  // Fetch all opportunities with pagination
  let allOpps: any[] = []
  let startAfterDate = ''
  let startAfterId = ''

  while (true) {
    let url = `${GHL_BASE}/opportunities/search?location_id=${locationId}&limit=100`
    if (startAfterDate) {
      url += `&startAfterDate=${encodeURIComponent(startAfterDate)}&startAfterId=${startAfterId}`
    }
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`GHL Opportunities error ${res.status}`)
    const data = await res.json()
    const batch: any[] = data.opportunities || []
    allOpps = allOpps.concat(batch)
    if (batch.length < 100) break
    const last = batch[batch.length - 1]
    startAfterDate = last.updatedAt || last.createdAt || ''
    startAfterId = last.id || ''
    if (!startAfterDate) break
  }

  const opportunities: GHLOpportunity[] = allOpps.map((o: any) => ({
    id: o.id,
    name: o.name || o.contact?.name || 'Sem nome',
    monetaryValue: o.monetaryValue || 0,
    status: o.status || 'open',
    stage: o.pipelineStageId || '',
    pipelineId: o.pipelineId || '',
    pipelineStageId: o.pipelineStageId || '',
    pipelineStageName: stageNameMap[o.pipelineStageId] || undefined,
    lastUpdated: o.updatedAt || o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt,
    lastStageChangeAt: o.lastStageChangeAt,
    createdAt: o.createdAt,
    contactName: o.contact?.name,
    assignedTo:
      typeof o.assignedTo === 'string'
        ? o.assignedTo
        : o.assignedTo?.name || undefined,
    source: o.source || o.contact?.source || undefined,
  }))

  return { opportunities, pipeline: pipelines[0] || null, pipelines }
}
