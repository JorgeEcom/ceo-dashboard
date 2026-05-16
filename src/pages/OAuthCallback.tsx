import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTokens, loadTokens } from '../utils/pkce'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Autorizando com GoHighLevel...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const locationId = params.get('locationId') || localStorage.getItem('ghl_location_id') || ''

    if (error) {
      setStatus('error')
      setMessage('Autorizacao negada: ' + error)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('Codigo de autorizacao nao encontrado.')
      return
    }

    const verifier = sessionStorage.getItem('ghl_code_verifier')
    const clientId = localStorage.getItem('ghl_client_id') || ''

    if (!verifier || !clientId) {
      setStatus('error')
      setMessage('Sessao expirada. Tente conectar novamente.')
      return
    }

    fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: window.location.origin + '/oauth/callback',
        client_id: clientId,
        code_verifier: verifier,
      }).toString()
    })
    .then(r => r.json())
    .then(data => {
      if (data.access_token) {
        const expiresAt = Date.now() + (data.expires_in || 86400) * 1000
        saveTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token || '',
          expires_at: expiresAt,
          location_id: data.locationId || locationId,
        })
        sessionStorage.removeItem('ghl_code_verifier')
        setStatus('success')
        setMessage('Conectado com sucesso!')
        setTimeout(() => navigate('/'), 1500)
      } else {
        setStatus('error')
        setMessage('Erro ao obter token: ' + (data.message || JSON.stringify(data)))
      }
    })
    .catch(err => {
      setStatus('error')
      setMessage('Erro de conexao: ' + err.message)
    })
  }, [navigate])

  const color = status === 'success' ? '#059669' : status === 'error' ? '#dc2626' : '#6366f1'
  const icon = status === 'success' ? '✓' : status === 'error' ? '✗' : '◌'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, color, marginBottom: 16, animation: status === 'loading' ? 'spin 1s linear infinite' : 'none' }}>{icon}</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>GoHighLevel OAuth</h2>
        <p style={{ fontSize: 14, color: '#6b7280' }}>{message}</p>
        {status === 'error' && (
          <button onClick={() => window.location.href = '/settings'} style={{ marginTop: 20, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 14 }}>
            Voltar para Configuracoes
          </button>
        )}
      </div>
    </div>
  )
}
