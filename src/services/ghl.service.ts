import axios from 'axios'
import type { GHLContact, GHLOpportunity, GHLPipeline } from '../types'

// ─── Base Config ────────────────────────────────────────────────────────────────
// In dev: Vite proxy routes /api/ghl → https://services.leadconnectorhq.com
// In prod: set VITE_GHL_BASE_URL to a serverless proxy you deploy
const BASE_URL = import.meta.env.VITE_GHL_BASE_URL || '/api/ghl'

function getHeaders() {
  const token = localStorage.getItem('ghl_api_key') || import.meta.env.VITE_GHL_API_KEY || ''
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  }
}

function getLocationId(): string {
  return localStorage.getItem('ghl_location_id') || import.meta.env.VITE_GHL_LOCATION_ID || ''
}

// ─── Contacts ───────────────────────────────────────────────────────────────────

export async function fetchContacts(limit = 100): Promise<GHLContact[]> {
  const locationId = getLocationId()
  const res = await axios.get(`${BASE_URL}/contacts/`, {
    headers: getHeaders(),
    params: { locationId, limit },
  })
  return res.data.contacts ?? []
}

// ─── Opportunities ──────────────────────────────────────────────────────────────

export async function fetchOpportunities(limit = 100): Promise<GHLOpportunity[]> {
  const locationId = getLocationId()
  const res = await axios.get(`${BASE_URL}/opportunities/search`, {
    headers: getHeaders(),
    params: { location_id: locationId, limit },
  })
  return res.data.opportunities ?? []
}

// ─── Pipelines ──────────────────────────────────────────────────────────────────

export async function fetchPipelines(): Promise<GHLPipeline[]> {
  const locationId = getLocationId()
  const res = await axios.get(`${BASE_URL}/opportunities/pipelines`, {
    headers: getHeaders(),
    params: { locationId },
  })
  return res.data.pipelines ?? []
}

// ─── All CRM data (parallel) ────────────────────────────────────────────────────

export async function fetchAllCRMData() {
  const [contacts, opportunities, pipelines] = await Promise.all([
    fetchContacts(),
    fetchOpportunities(),
    fetchPipelines(),
  ])
  return { contacts, opportunities, pipelines }
}
