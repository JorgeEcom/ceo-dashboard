import { useState, useEffect } from 'react'
import { Key, MapPin, CheckCircle, Eye, EyeOff, RefreshCw, Info } from 'lucide-react'

export default function Settings() {
  const [apiKey, setApiKey]         = useState('')
  const [locationId, setLocationId] = useState('')
  const [showKey, setShowKey]       = useState(false)
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    setApiKey(localStorage.getItem('ghl_api_key') ?? '')
    setLocationId(localStorage.getItem('ghl_location_id') ?? '')
  }, [])

  const handleSave = () => {
    localStorage.setItem('ghl_api_key', apiKey)
    localStorage.setItem('ghl_location_id', locationId)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      window.location.reload()
    }, 1500)
  }

  const handleClear = () => {
    localStorage.removeItem('ghl_api_key')
    localStorage.removeItem('ghl_location_id')
    setApiKey('')
    setLocationId('')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Configurações</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Configure sua API do GoHighLevel para conectar dados reais
        </p>
      </div>

      {/* How to get API key */}
      <div className="card border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Como obter suas credenciais do GoHighLevel:
            </p>
            <ol className="space-y-1.5" style={{ color: 'var(--color-muted)' }}>
              <li>1. Acesse seu GHL → <strong>Settings → Private Integrations</strong></li>
              <li>2. Clique em <strong>"Add New Integration"</strong></li>
              <li>3. Selecione as permissões: <strong>Contacts (read), Opportunities (read), Pipelines (read)</strong></li>
              <li>4. Copie o token gerado e cole abaixo</li>
              <li>5. O <strong>Location ID</strong> está em Settings → Business Profile → Location ID</li>
            </ol>
          </div>
        </div>
      </div>

      {/* API Config Card */}
      <div className="card space-y-5">
        <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
          GoHighLevel API v2
        </h2>

        {/* API Key */}
        <div>
          <label className="label block mb-2 flex items-center gap-1.5">
            <Key size={13} />
            Private Integration Token (API Key)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500 pr-12"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
              }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-muted)' }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Location ID */}
        <div>
          <label className="label block mb-2 flex items-center gap-1.5">
            <MapPin size={13} />
            Location ID (Sub-account)
          </label>
          <input
            type="text"
            value={locationId}
            onChange={e => setLocationId(e.target.value)}
            placeholder="7HFhsiPqomIHYV0aJHpI"
            className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!apiKey || !locationId}
            className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <><CheckCircle size={16} /> Salvo! Recarregando...</>
            ) : (
              <><RefreshCw size={16} /> Salvar e Conectar</>
            )}
          </button>
          <button onClick={handleClear} className="btn-ghost border px-4" style={{ borderColor: 'var(--color-border)' }}>
            Limpar
          </button>
        </div>
      </div>

      {/* Security note */}
      <div className="card" style={{ backgroundColor: 'var(--color-bg)' }}>
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>
          Segurança
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Suas credenciais são armazenadas apenas no <strong>localStorage do seu navegador</strong> —
          nunca são enviadas para nenhum servidor externo além da API do GoHighLevel.
          Para produção, recomenda-se configurar as variáveis de ambiente <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">VITE_GHL_API_KEY</code> e <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">VITE_GHL_LOCATION_ID</code> no servidor.
        </p>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
          Sobre este Dashboard
        </h3>
        <div className="text-sm space-y-1.5" style={{ color: 'var(--color-muted)' }}>
          <p><strong>Versão:</strong> 1.0.0</p>
          <p><strong>Stack:</strong> React 18 + TypeScript + Tailwind CSS + Recharts</p>
          <p><strong>API:</strong> GoHighLevel v2 (somente leitura)</p>
          <p><strong>Atualização:</strong> Automática a cada 5 minutos</p>
          <p><strong>Dados tributários:</strong> Entrada manual com análise de IA</p>
        </div>
      </div>
    </div>
  )
}
