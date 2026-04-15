# ✅ CEPROC V2 — Setup Summary

## 📦 O que foi criado

Um novo repositório **CEPROC V2** com estrutura completa para sistema inteligente de mapeamento de processos.

---

## 📂 Estrutura de Arquivos

```
ceproc-v2/
├── backend/
│   ├── app/
│   │   ├── __init__.py                  ✅ Inicialização do app
│   │   ├── main.py                      ✅ FastAPI orquestrador (8 endpoints)
│   │   ├── config.py                    ✅ Configuração (Azure OpenAI, DB, etc)
│   │   ├── models.py                    ✅ Schemas Pydantic (16+ schemas)
│   │   ├── prompts/
│   │   │   ├── dpt_extraction.md        ✅ Prompt para análise de DPT
│   │   │   ├── dpt_to_bpmn_json.md      ✅ Prompt para geração de BPMN
│   │   │   └── kpi_generation.md        ✅ Prompt para geração de KPIs
│   │   ├── routes/                      📝 TODO: Implementar rotas
│   │   ├── services/                    📝 TODO: Implementar serviços
│   │   └── utils/                       📝 TODO: Helpers
│   ├── Dockerfile                       ✅ Container backend
│   └── requirements.txt                 ✅ Dependências Python
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      ✅ Orquestrador principal (8 etapas)
│   │   ├── main.jsx                     ✅ Entry point React
│   │   ├── pages/
│   │   │   ├── EntradaPage.jsx          ✅ Etapa 1
│   │   │   ├── AnalisePage.jsx          ✅ Etapa 2
│   │   │   ├── DptPage.jsx              ✅ Etapa 3
│   │   │   ├── IndicadoresPage.jsx      ✅ Etapa 4
│   │   │   ├── BpmnPage.jsx             ✅ Etapa 5
│   │   │   ├── GargalosPage.jsx         ✅ Etapa 6
│   │   │   ├── MelhoriaPage.jsx         ✅ Etapa 7
│   │   │   └── DashboardPage.jsx        ✅ Etapa 8
│   │   ├── components/
│   │   │   ├── Header.jsx               ✅ Cabeçalho
│   │   │   ├── Stepper.jsx              ✅ Wizard de progresso
│   │   │   ├── BpmnSvgViewer.jsx        📝 TODO
│   │   │   ├── JsonEditor.jsx           📝 TODO
│   │   │   └── ExportButtons.jsx        📝 TODO
│   │   ├── hooks/                       📝 TODO: Custom hooks
│   │   ├── lib/                         📝 TODO: Utilitários
│   │   └── styles/
│   │       └── globals.css              ✅ Estilos base + Tailwind
│   ├── Dockerfile                       ✅ Container frontend
│   ├── package.json                     ✅ Dependências Node
│   ├── vite.config.js                   ✅ Configuração Vite
│   ├── tailwind.config.js               ✅ Configuração Tailwind
│   ├── postcss.config.js                ✅ Configuração PostCSS
│   └── index.html                       ✅ HTML entry point
│
├── docker-compose.yml                   ✅ Orquestração de containers
├── .env.example                         ✅ Template de variáveis
├── .gitignore                           ✅ Exclusões git
├── README.md                            ✅ Documentação principal
└── SETUP_SUMMARY.md                     ✅ Este arquivo
```

---

## 🚀 Próximos Passos

### Fase 1: Backend Essencial (Semana 1-2)

**Arquivos a completar:**

1. **`backend/app/services/llm_service.py`** (novo)
   - Integração com Azure OpenAI
   - Função `generate_dpt(transcription)` → chama LLM com `dpt_extraction.md`
   - Função `generate_bpmn(dpt_json)` → chama LLM com `dpt_to_bpmn_json.md`
   - Função `generate_kpis(dpt_json)` → chama LLM com `kpi_generation.md`
   - Função `analyze_gargalos(dpt_json, bpmn_json)` → análise Lean

2. **`backend/app/services/bpmn_processor.py`** (novo)
   - Converter BPMN JSON para XML válido Bizagi
   - Injeta fluxos faltantes de gateways
   - Calcula waypoints corretamente

3. **`backend/app/services/export_service.py`** (novo)
   - Gerar DOCX de DPT
   - Gerar XLSX de KPIs
   - Gerar BPMN XML
   - ZIP consolidado

4. **`backend/app/routes/transcription.py`** (novo)
   - POST `/api/transcribe` — integra Whisper

5. **`backend/app/routes/dpt.py`** (novo)
   - POST `/api/dpt` — chama LLM via llm_service
   - GET `/api/dpt/{id}` — recupera DPT
   - PUT `/api/dpt/{id}` — salva edições

6. **`backend/app/routes/bpmn.py`** (novo)
   - POST `/api/bpmn` — chama LLM + gera XML
   - GET `/api/bpmn/{id}`

7. **`backend/app/routes/kpi.py`** (novo)
   - POST `/api/kpi` — chama LLM de KPIs
   - GET `/api/kpi/{id}`

8. **`backend/app/routes/gargalos.py`** (novo)
   - POST `/api/analise-gargalos`

9. **`backend/app/routes/export.py`** (novo)
   - POST `/api/export/{format}` (docx, xlsx, bpmn, zip)

### Fase 2: Frontend (Semana 3)

**Implementar páginas 1-3:**

1. **`EntradaPage.jsx`**
   - Upload de áudio (drag-drop)
   - OU textarea para texto
   - Botão "Validar & Prosseguir" → chama `/api/transcribe`

2. **`AnalisePage.jsx`**
   - Spinner "Gerando DPT..."
   - Chamada `/api/dpt`
   - Preview do JSON retornado
   - Botão "Aprovar" → próxima etapa

3. **`DptPage.jsx`**
   - Preview estruturado (16 seções)
   - Abas: Preview | Editar JSON | Validação
   - Botão "[⬇ DOWNLOAD DPT_v1.docx]" → `/api/export/docx`
   - Botão "Próxima Etapa" → ir para Indicadores

### Fase 3: BPMN (Semana 4)

1. **`BpmnPage.jsx`**
   - Abas: SVG Viewer | BPMN-JS | Estrutura | Validação
   - Chamada `/api/bpmn`
   - Renderizar JSON em SVG (portar lógica do nosso `dpt_sistema_unificado.html`)
   - Download BPMN XML

2. **`components/BpmnSvgViewer.jsx`**
   - Renderizador SVG nativo
   - Pool + Lanes + Atividades + Gateways + Fluxos
   - Zoom / Reset / Download SVG

### Fase 4: KPI + Gargalos (Semana 5)

1. **`IndicadoresPage.jsx`**
   - Chamada `/api/kpi`
   - Preview tabela KPI
   - Download Excel

2. **`GargalosPage.jsx`**
   - Chamada `/api/analise-gargalos`
   - Preview: Gargalos + Melhorias propostas
   - Checkboxes para selecionar melhorias

### Fase 5: Iteração + Dashboard (Semana 6)

1. **`MelhoriaPage.jsx`**
   - Se user aprova melhorias:
     - Regenera DPT v2 (chamada `/api/dpt` com contexto)
     - Loop: volta a etapa 3 (DptPage) com v2
   - Se não aprova: segue para Dashboard

2. **`DashboardPage.jsx`**
   - Timeline: v1 → v2 → v3...
   - Comparação lado a lado
   - Downloads consolidados (ZIP)

---

## 🔧 Como Iniciar o Desenvolvimento

### 1. Clonar e Setup

```bash
cd ceproc-v2

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
# Editar .env com suas credenciais Azure

# Frontend
cd ../frontend
npm install
```

### 2. Rodar em Desenvolvimento

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Com Docker Compose

```bash
docker-compose up
```

---

## 📊 Checklist de Implementação

### Backend
- [ ] LLM Service (Azure OpenAI integration)
- [ ] BPMN Processor (JSON → XML)
- [ ] Export Service (DOCX, XLSX, BPMN)
- [ ] All 6 route files
- [ ] Database/persistence (SQLite ou PostgreSQL)
- [ ] Error handling e logging

### Frontend
- [ ] All 8 page components
- [ ] API client (axios + hooks)
- [ ] BPMN SVG Viewer
- [ ] JSON Editor com validação
- [ ] Comparison View (v1 vs v2)
- [ ] Export management

### Testing
- [ ] Unit tests (backend)
- [ ] E2E tests (frontend + backend)
- [ ] Prompts validation

---

## 📝 Notas Importantes

1. **Prompts versionados**: Estão em `/backend/app/prompts/` como `.md` — fácil atualizar sem redeployment

2. **Schemas Pydantic**: Todos os tipos estão definidos em `models.py` — use para validação rigorosa

3. **API Endpoints**: Já têm placeholder em `main.py` — completar com lógica real

4. **Frontend routing**: Usa estado global em `App.jsx` — pode ser evoluído para Zustand/Redux depois

5. **Docker**: Ambos têm Dockerfile + docker-compose pronto para dev

---

## 🎯 Meta Final

Um sistema completo, modular e testado que:
- Transforma entrevistas em DPT estruturado (JSON + DOCX)
- Gera BPMN 2.0 visual com waypoints corretos
- Cria KPIs e indicadores (Excel)
- Identifica gargalos
- Permite iteração com versionamento
- Compara antes vs depois
- Exporta tudo consolidado (ZIP)

**Status: ✅ Estrutura Pronta — Implementação em Progresso**
