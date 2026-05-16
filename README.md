# CEO Dashboard — Contabilidade E-commerce

Dashboard estratégico para CEO de escritório de contabilidade focado em e-commerce e marketplaces. Integra dados do CRM GoHighLevel com gestão tributária e análise de KPIs com IA.

## Funcionalidades

- **Visão Geral**: KPIs principais do negócio em tempo real
- **CRM & Vendas**: Pipeline GoHighLevel, performance de SDRs e closers, leads parados
- **Tributário**: Carga tributária, alíquota efetiva vs nominal, economia por cliente
- **Centro de Decisões CEO**: IA identifica automaticamente onde o CEO deve agir
- **Dark/Light Mode**: Alternância de tema

## Stack Tecnológica

- React 18 + TypeScript
- Tailwind CSS
- Recharts (gráficos)
- GoHighLevel API v2 (somente leitura)
- Vite (build)

## Setup

### 1. Instalar dependências

```bash
cd ceo-dashboard
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:
```
VITE_GHL_API_KEY=seu_token_private_integration
VITE_GHL_LOCATION_ID=seu_location_id
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

> **Sem credenciais configuradas**: o dashboard roda em modo demonstração com dados fictícios realistas.

## Como obter credenciais do GoHighLevel

1. Acesse GHL → **Settings → Private Integrations**
2. Clique em **"Add New Integration"**
3. Permissões necessárias: `Contacts (read)`, `Opportunities (read)`, `Pipelines (read)`
4. Copie o token gerado → `VITE_GHL_API_KEY`
5. **Location ID**: Settings → Business Profile → Location ID → `VITE_GHL_LOCATION_ID`

## Deploy no Vercel (recomendado para GitHub)

1. Push este repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) → Import Project
3. Configure as variáveis de ambiente no painel do Vercel
4. Deploy automático a cada push na `main`

## Estrutura do Projeto

```
src/
├── context/
│   └── DashboardContext.tsx    # Estado global + busca de dados
├── services/
│   └── ghl.service.ts          # Integração API GoHighLevel
├── utils/
│   ├── aiAnalysis.ts           # Motor de análise de IA
│   └── formatters.ts           # Formatadores (BRL, datas, etc.)
├── components/
│   ├── Layout/Sidebar.tsx      # Menu lateral
│   └── shared/
│       ├── KPICard.tsx         # Cards de métricas
│       └── DecisionAlert.tsx   # Alertas de decisão
├── pages/
│   ├── Overview.tsx            # Visão geral CEO
│   ├── CRM.tsx                 # CRM & Pipeline
│   ├── Tax.tsx                 # Tributário
│   ├── Decisions.tsx           # Centro de Decisões
│   └── Settings.tsx            # Configurações API
└── types/index.ts              # Tipos TypeScript
```

## Pontos de Decisão do CEO (monitorados pela IA)

| # | Ponto de Decisão | Gatilho | Impacto |
|---|---|---|---|
| 1 | Ativação de SDR | Leads sem contato +24h | Taxa de conversão |
| 2 | Follow-up de Proposta | Proposta enviada +3 dias | Ciclo de vendas |
| 3 | Revisão do Pitch | Conversão < 15% | Receita mensal |
| 4 | Entrega de Guias | Guias próximas ao vencimento | Retenção do cliente |
| 5 | Planejamento Tributário | Cliente pagando alíquota nominal | Diferencial competitivo |
| 6 | Fechamento Contábil | Fechamento em atraso | Satisfação do cliente |
| 7 | Onboarding | Proposta fechada sem CS | Retenção longo prazo |
| 8 | Revisão de CAC | CAC subindo mês a mês | Margem do negócio |

## Pipeline GoHighLevel (estágios monitorados)

Novo lead → Em contato → Agendamento → Agendou → Proposta enviada → Em andamento → **Proposta fechada**

Estágios negativos monitorados: Desqualificado, Sem retorno, Sem interesse
