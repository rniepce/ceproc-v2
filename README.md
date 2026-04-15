# 📋 CEPROC V2 — Plataforma Inteligente para Mapeamento de Processos

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

> Sistema inteligente que transforma entrevistas e descrições de processos em documentação estruturada (DPT, BPMN, KPIs) com apoio de IA (Azure OpenAI).

## 🎯 O que é CEPROC V2?

**CEPROC V2** é uma plataforma **modular e orientada por etapas** que:

1. **Captura** entrada (áudio ou texto)
2. **Analisa** com LLM (GPT-4) para extrair informações estruturadas
3. **Gera automaticamente**:
   - 📋 **DPT** (Descrição do Processo de Trabalho) em Word
   - 📊 **BPMN 2.0** (diagrama visual para Bizagi)
   - 📈 **KPIs** (planilha de indicadores em Excel)
4. **Identifica** gargalos e ineficiências (análise Lean)
5. **Permite iteração** — aprova melhorias e regenera versão otimizada (v2)
6. **Compara** antes vs depois com dashboard integrado

### Fluxo Principal (8 Etapas)

```
1️⃣ Entrada       → Upload áudio ou text
2️⃣ Análise       → LLM extrai JSON DPT estruturado
3️⃣ DPT           → Preview e edição do documento
4️⃣ Indicadores   → Geração automática de KPIs
5️⃣ BPMN          → Diagrama visual + SVG viewer
6️⃣ Gargalos      → Análise de ineficiências
7️⃣ Melhoria      → Aprovação de otimizações
8️⃣ Dashboard     → Comparação v1 vs v2 + exports
```

---

## 🚀 Quick Start

### Pré-requisitos

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **Docker** (opcional, para containerização)
- **Azure OpenAI API Key** (para IA)

### 1. Clone o repositório

```bash
git clone <repo-url> ceproc-v2
cd ceproc-v2
```

### 2. Setup Backend

```bash
# Criar ambiente virtual
python -m venv backend/venv
source backend/venv/bin/activate  # Windows: backend\venv\Scripts\activate

# Instalar dependências
pip install -r backend/requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env e adicionar suas credenciais Azure OpenAI
```

### 3. Setup Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Volta para raiz
cd ..
```

### 4. Rodar Localmente

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
# Acesso: http://localhost:8000/docs (Swagger UI)
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Acesso: http://localhost:5173
```

### 5. Com Docker Compose

```bash
docker-compose up
```

Servirá:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

---

## 📁 Estrutura do Projeto

```
ceproc-v2/
├── backend/
│   ├── app/
│   │   ├── main.py              # Orquestrador FastAPI
│   │   ├── config.py            # Configurações
│   │   ├── models.py            # Schemas Pydantic (DPT, BPMN, KPI, etc.)
│   │   ├── routes/              # Endpoints (TODO)
│   │   ├── services/            # Lógica de negócio (TODO)
│   │   ├── prompts/             # Prompts versionados em .md
│   │   │   ├── dpt_extraction.md
│   │   │   ├── dpt_to_bpmn_json.md
│   │   │   └── kpi_generation.md
│   │   └── utils/               # Helpers
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # 8 páginas do wizard
│   │   │   ├── EntradaPage.jsx
│   │   │   ├── AnalisePage.jsx
│   │   │   ├── DptPage.jsx
│   │   │   ├── IndicadoresPage.jsx
│   │   │   ├── BpmnPage.jsx
│   │   │   ├── GargalosPage.jsx
│   │   │   ├── MelhoriaPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── Header.jsx
│   │   │   ├── Stepper.jsx
│   │   │   ├── BpmnSvgViewer.jsx (TODO)
│   │   │   ├── JsonEditor.jsx (TODO)
│   │   │   ├── ComparisonView.jsx (TODO)
│   │   │   └── ExportButtons.jsx (TODO)
│   │   ├── hooks/               # Custom React hooks (TODO)
│   │   ├── lib/                 # Utilidades
│   │   │   ├── api.js          # Axios client
│   │   │   └── schemas.js      # Zod validators
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx              # Orquestrador principal
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── index.html
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md (este arquivo)
```

---

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Transcription (Áudio → Texto)
```
POST /api/transcribe
Body: { mode: "audio" | "text", text?: string }
Response: { transcription, confidence, timestamp }
```

### DPT Analysis (Texto → JSON estruturado)
```
POST /api/dpt
Body: { transcription: string, edit_instructions?: string }
Response: { success, dpt_json: DPTSchema, version, timestamp }
```

### BPMN Generation (DPT → BPMN JSON + XML)
```
POST /api/bpmn
Body: { dpt_id: string, dpt_json: DPTSchema }
Response: { success, bpmn_json, bpmn_xml, version, timestamp }
```

### KPI Generation (DPT → Indicadores)
```
POST /api/kpi
Body: { dpt_id: string, dpt_json: DPTSchema }
Response: { success, kpis: [KPISchema], total_count, alta_criticidade, timestamp }
```

### Exports (Gerar arquivos)
```
POST /api/export/{format}
Query: { dpt_id, format: "docx" | "xlsx" | "bpmn" | "zip", version? }
Response: File download
```

Ver **[API Documentation](http://localhost:8000/docs)** para detalhes completos.

---

## 📊 Estrutura de Dados

### DPT JSON

```json
{
  "metadados": {
    "nome_processo": "Processamento do Sinistro",
    "nome_unidade": "COTRANS",
    "elaborado_por": "Usuario",
    "versao": "v1"
  },
  "negocio": { "descricao": "...", "lista": [...] },
  "finalidade": { "descricao": "...", "lista": [...] },
  "principais_etapas": [
    {
      "etapa": "Nome da etapa",
      "responsavel": "Ator",
      "tempo_estimado": "30 min",
      "criticidade": "Alta"
    }
  ],
  "atores": { "lista": ["Motorista", "Setor", "Oficina"] },
  "sistemas_e_infraestrutura": { "lista": ["SEI", "Sistema X"] },
  "documentos_e_indicadores": {
    "documentos": { "lista": [...] },
    "indicadores": { "lista": [...] }
  },
  // ... 16 campos total
}
```

### BPMN JSON

```json
{
  "metadata": { "processo": "...", "versao": "v1", ... },
  "lanes": [ { "id": "lane_1", "nome": "Motorista", "x": 0, "y": 0, ... } ],
  "events": [ { "id": "event_start", "tipo": "start", ... } ],
  "activities": [ { "id": "activity_1", "nome": "...", "lane_id": "lane_1", ... } ],
  "gateways": [ { "id": "gateway_1", "nome": "Decisão?", "outgoing": [...] } ],
  "sequence_flows": [ { "id": "flow_1", "source": "...", "target": "...", "waypoints": [...] } ]
}
```

### KPI Schema

```json
{
  "indicador": "Tempo Médio de Análise",
  "objetivo": "Medir velocidade da análise",
  "processo": "Processamento de Sinistro",
  "cliente": "Setor Jurídico",
  "metadados": ["data_inicio", "data_fim"],
  "fonte_extracao": "Sistema SEI",
  "formula_calculo": "SUM(data_fim - data_inicio) / COUNT(...)",
  "unidade": "Dias",
  "meta": "< 5 dias",
  "periodicidade": "Mensal",
  "polaridade": "↓",
  "responsavel": "Gerente",
  "criticidade": "🔴 Alta"
}
```

---

## 🔐 Autenticação (TODO)

O sistema usar **Azure OpenAI** para processamento de IA.

**Configurar em `.env`:**
```env
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

---

## 🧪 Testing (TODO)

```bash
# Backend
cd backend
pytest tests/

# Frontend
cd frontend
npm run test
```

---

## 📚 Documentação

- **[Guia de Prompts](./backend/app/prompts/README.md)** — Detalhes sobre cada prompt
- **[API Docs](http://localhost:8000/docs)** — Swagger UI (em desenvolvimento)
- **[BPMN Specification](./docs/BPMN_SPEC.md)** — Regras de coordenadas e waypoints
- **[KPI Framework](./docs/KPI_FRAMEWORK.md)** — Modelo de indicadores

---

## 🔄 Ciclo de Desenvolvimento

### Fase 1 (Semana 1-2)
- [ ] Backend: Endpoints base + LLM integration
- [ ] Prompts versionados em `/backend/app/prompts/`

### Fase 2 (Semana 3)
- [ ] Frontend: Páginas 1-3 (Entrada, Análise, DPT)
- [ ] Integração básica com backend

### Fase 3 (Semana 4)
- [ ] BPMN Generator + SVG Viewer
- [ ] Frontend: Páginas 4-5

### Fase 4 (Semana 5)
- [ ] KPI Generator
- [ ] Gargalos Analyzer

### Fase 5 (Semana 6)
- [ ] Iteração e Versionamento
- [ ] Dashboard Final

### Fase 6 (Semana 7)
- [ ] Testes E2E
- [ ] Documentação
- [ ] Deploy

---

## 🤝 Contribuir

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit as mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob licença MIT. Veja [LICENSE](LICENSE) para detalhes.

---

## 📧 Contato

Para dúvidas ou sugestões:
- 📧 Email: support@ceproc.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ceproc-v2/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/ceproc-v2/discussions)

---

**Built with ❤️ for intelligent process mapping**
