import { useState, useEffect } from 'react'
import { useDashboard } from '../context/DashboardContext'

export default function Configuracoes() {
  const { refresh, isDemo, error, lastRefresh, loading } = useDashboard()
  const [apiKey, setApiKey] = useState('')
  const [locationId, setLocationId] = useState('')
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    setApiKey(localStorage.getItem('ghl_api_key') || '')
    setLocationId(localStorage.getItem('ghl_location_id') || '')
  }, [])

  const handleSave = () => {
    localStorage.setItem('ghl_api_key', apiKey.trim())
    localStorage.setItem('ghl_location_id', locationId.trim())
    setSaved(true)
    refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClear = () => {
    localStorage.removeItem('ghl_api_key')
    localStorage.removeItem('ghl_location_id')
    setApiKey('')
    setLocationId('')
    refresh()
  }

  const hasOverride = !!localStorage.getItem('ghl_api_key')

  return (
    <div style={{ padding: 24, maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>ConfiguraÃ§Ãµes</h1>
        <p style={{ fontSize: 14, color: '#94a3b8' }}>Gerencie a conexÃ£o com o GoHighLevel</p>
      </div>

      {/* Status banner */}
      <div style={{
        background: isDemo ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
        border: `1px solid ${isDemo ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
        borderRadius: 10, padding: '14px 18px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{isDemo ? 'ð¡' : 'ð¢'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isDemo ? '#fbbf24' : '#34d399' }}>
              {isDemo ? 'Modo Demo â dados simulados' : 'Conectado ao GoHighLevel'}
            </div>
            {lastRefresh && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Ãltima sincronizaÃ§Ã£o: {lastRefresh.toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: '#1B4FCC', color: '#fff', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'â³ Carregando...' : 'ð Sincronizar'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#f87171',
        }}>
          â ï¸ {error}
        </div>
      )}

      {/* Credentials form */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 20 }}>
          ð Credenciais GoHighLevel
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>
            API Key (Private Integration Token)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 13,
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                outline: 'none', fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13,
                background: '#334155', color: '#94a3b8', border: 'none', cursor: 'pointer',
              }}
            >
              {showKey ? 'ð' : 'ðï¸'}
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 5 }}>
            Settings â Private Integrations â copie o token
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>
            Location ID
          </label>
          <input
            type="text"
            value={locationId}
            onChange={e => setLocationId(e.target.value)}
            placeholder="GS0MPCOqtgJUjUIIHuTx"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13,
              background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
              outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: 12, color: '#475569', marginTop: 5 }}>
            Settings â Business Profile â Location ID
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={!apiKey || !locationId}
            style={{
              padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: (!apiKey || !locationId) ? '#334155' : '#1B4FCC',
              color: (!apiKey || !locationId) ? '#64748b' : '#fff',
              border: 'none', cursor: (!apiKey || !locationId) ? 'not-allowed' : 'pointer',
            }}
          >
            {saved ? 'â Salvo e conectando...' : 'ð¾ Salvar e Conectar'}
          </button>
          {hasOverride && (
            <button
              onClick={handleClear}
              style={{
                padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer',
              }}
            >
              Resetar para padrÃ£o
            </button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>â¹ï¸ InformaÃ§Ãµes da conexÃ£o</div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
          <div>â¢ Os dados sÃ£o carregados em tempo real a cada abertura do dashboard</div>
          <div>â¢ As credenciais sÃ£o salvas localmente no navegador (localStorage)</div>
          <div>â¢ Use o botÃ£o Sincronizar para forÃ§ar uma atualizaÃ§Ã£o manual</div>
          <div>â¢ Se nÃ£o configurado, o sistema usa as credenciais padrÃ£o do CEO Suite</div>
        </div>
      </div>
    </div>
  )
}
