import { useState } from 'react'
import { Save, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react'

export default function Settings() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ghl_api_key') || '')
  const [locationId, setLocationId] = useState(() => localStorage.getItem('ghl_location_id') || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const isConnected = Boolean(apiKey && locationId)

  const handleSave = () => {
    localStorage.setItem('ghl_api_key', apiKey)
    localStorage.setItem('ghl_location_id', locationId)
    setSaved(true)
    setTimeout(() => { setSaved(false); window.location.reload() }, 1500)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 13, fontWeight: 600 as const, color: '#374151', display: 'block' as const, marginBottom: 6 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Configuracoes</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Conecte sua conta GoHighLevel para dados em tempo real</p>
      </div>

      <div style={{ borderRadius: 12, padding: 16, border: '1px solid', display: 'flex', alignItems: 'center', gap: 12, borderColor: isConnected ? '#bbf7d0' : '#e5e7eb', backgroundColor: isConnected ? '#f0fdf4' : '#f9fafb' }}>
        {isConnected
          ? <><Wifi size={18} style={{ color: '#10b981' }} /><div><p style={{ fontWeight: 600, color: '#065f46', fontSize: 14, margin: 0 }}>Conectado ao GoHighLevel</p><p style={{ fontSize: 12, color: '#10b981', margin: '2px 0 0' }}>Dados em tempo real ativos</p></div></>
          : <><WifiOff size={18} style={{ color: '#9ca3af' }} /><div><p style={{ fontWeight: 600, color: '#374151', fontSize: 14, margin: 0 }}>Modo demonstracao</p><p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Configure sua API Key para dados reais</p></div></>
        }
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>GoHighLevel API v2</h2>
        <div>
          <label style={labelStyle}>API Key (Bearer Token)</label>
          <div style={{ position: 'relative' }}>
            <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Bearer token da API GHL..." style={{ ...inputStyle, paddingRight: 40 }} />
            <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>GHL Settings &rarr; API Keys &rarr; criar nova chave</p>
        </div>
        <div>
          <label style={labelStyle}>Location ID</label>
          <input type="text" value={locationId} onChange={e => setLocationId(e.target.value)} placeholder="Ex: GS0MPCOqtgJUjUIIHuTx" style={inputStyle} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Encontrado na URL: app.gruposg3.com.br/v2/location/<strong>ID</strong>/...</p>
        </div>
        <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#fff', backgroundColor: saved ? '#10b981' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
          <Save size={16} />
          {saved ? 'Salvo com sucesso!' : 'Salvar e Conectar'}
        </button>
      </div>

      <div style={{ background: '#eef2ff', borderRadius: 12, padding: 20, border: '1px solid #c7d2fe' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#3730a3', margin: '0 0 12px' }}>Como Conectar</h3>
        {['Acesse GHL Settings > Company > API Keys', 'Crie uma nova API Key e copie o Bearer token', 'Seu Location ID ja esta preenchido: GS0MPCOqtgJUjUIIHuTx', 'Cole o Bearer token no campo acima e clique Salvar', 'O dashboard vai recarregar com seus dados reais'].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <p style={{ fontSize: 13, color: '#4338ca', margin: 0 }}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
