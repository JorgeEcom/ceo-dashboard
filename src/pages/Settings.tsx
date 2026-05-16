import { useState } from 'react'
import { Save, Eye, EyeOff, Wifi, WifiOff, LogOut } from 'lucide-react'
import { generateCodeVerifier, generateCodeChallenge, clearTokens, loadTokens } from '../utils/pkce'

const GHL_AUTH_URL = 'https://marketplace.leadconnectorhq.com/oauth/chooselocation'

export default function Settings() {
  const tokens = loadTokens()
  const isConnected = Boolean(tokens?.access_token || localStorage.getItem('ghl_api_key'))
  const redirectUri = window.location.origin + '/oauth/callback'

  const [clientId, setClientId] = useState(() => localStorage.getItem('ghl_client_id') || '')
  const [locationId, setLocationId] = useState(() => localStorage.getItem('ghl_location_id') || 'GS0MPCOqtgJUjUIIHuTx')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ghl_api_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState<'oauth' | 'apikey'>('oauth')

  const handleOAuthConnect = async () => {
    if (!clientId) { alert('Insira o Client ID do seu app GHL.'); return }
    localStorage.setItem('ghl_client_id', clientId)
    localStorage.setItem('ghl_location_id', locationId)
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    sessionStorage.setItem('ghl_code_verifier', verifier)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'contacts.readonly opportunities.readonly opportunities.write pipelines.readonly',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    window.location.href = GHL_AUTH_URL + '?' + params.toString()
  }

  const handleApiKeySave = () => {
    localStorage.setItem('ghl_api_key', apiKey)
    localStorage.setItem('ghl_location_id', locationId)
    setSaved(true)
    setTimeout(() => { setSaved(false); window.location.reload() }, 1500)
  }

  const handleDisconnect = () => {
    clearTokens()
    localStorage.removeItem('ghl_client_id')
    window.location.reload()
  }

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: 13, fontWeight: 600 as const, color: '#374151', display: 'block' as const, marginBottom: 6 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Configuracoes</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Conecte sua conta GoHighLevel para dados em tempo real</p>
      </div>

      <div style={{ borderRadius: 12, padding: 16, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: isConnected ? '#bbf7d0' : '#e5e7eb', backgroundColor: isConnected ? '#f0fdf4' : '#f9fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isConnected
            ? <Wifi size={18} style={{ color: '#10b981' }} />
            : <WifiOff size={18} style={{ color: '#9ca3af' }} />}
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: isConnected ? '#065f46' : '#374151' }}>
              {isConnected ? 'Conectado ao GoHighLevel' : 'Nao conectado — modo demo'}
            </p>
            <p style={{ fontSize: 12, margin: '2px 0 0', color: isConnected ? '#10b981' : '#9ca3af' }}>
              {isConnected ? ('Location: ' + (localStorage.getItem('ghl_location_id') || '—')) : 'Configure abaixo para ativar dados reais'}
            </p>
          </div>
        </div>
        {isConnected && (
          <button onClick={handleDisconnect} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={13} /> Desconectar
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, backgroundColor: '#f3f4f6', borderRadius: 10 }}>
        {(['oauth', 'apikey'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, backgroundColor: mode === m ? '#fff' : 'transparent', color: mode === m ? '#6366f1' : '#6b7280', boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {m === 'oauth' ? 'Conectar via OAuth' : 'API Key manual'}
          </button>
        ))}
      </div>

      {mode === 'oauth' ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>OAuth 2.0 + PKCE</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Autorizacao segura — sem expor credenciais</p>
          </div>
          <div>
            <label style={lbl}>Client ID (app no GHL Marketplace)</label>
            <input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Ex: 6789abc123def..." style={inp} />
          </div>
          <div>
            <label style={lbl}>Location ID</label>
            <input value={locationId} onChange={e => setLocationId(e.target.value)} style={inp} />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Da URL: /v2/location/<strong>GS0MPCOqtgJUjUIIHuTx</strong>/...</p>
          </div>
          <button onClick={handleOAuthConnect} style={{ padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Wifi size={16} /> Conectar com GoHighLevel
          </button>
          <div style={{ background: '#eef2ff', borderRadius: 10, padding: 16, border: '1px solid #c7d2fe' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#3730a3', margin: '0 0 10px' }}>Como obter o Client ID:</p>
            {[
              'Acesse marketplace.gohighlevel.com',
              'My Apps > Create App > preencha o nome',
              'Em Redirect URI cole: ' + redirectUri,
              'Copie o Client ID e cole no campo acima',
              'Clique em Conectar — sera redirecionado ao GHL'
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</span>
                <p style={{ fontSize: 12, color: '#4338ca', margin: 0 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>API Key (Bearer Token)</h2>
          <div>
            <label style={lbl}>Bearer Token</label>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Cole seu token aqui..." style={{ ...inp, paddingRight: 40 }} />
              <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>GHL Settings &rarr; Company &rarr; API Keys</p>
          </div>
          <div>
            <label style={lbl}>Location ID</label>
            <input value={locationId} onChange={e => setLocationId(e.target.value)} style={inp} />
          </div>
          <button onClick={handleApiKeySave} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff', backgroundColor: saved ? '#10b981' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Save size={16} />{saved ? 'Salvo!' : 'Salvar e Conectar'}
          </button>
        </div>
      )}
    </div>
  )
}
