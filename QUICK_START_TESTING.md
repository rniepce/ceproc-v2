# CEPROC V2 - Quick Start Testing Guide

## Phase 1 Completion Status

✅ **Backend services implemented**: LLM, BPMN Processor, Export Service  
✅ **6 API route modules created**: Transcription, DPT, BPMN, KPI, Gargalos, Export  
✅ **All endpoints defined and ready for testing**  
✅ **Python syntax validated**: All files compile successfully

---

## Starting the Backend Server

### Prerequisites
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Configure environment (create .env file)
AZURE_OPENAI_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
DEBUG=true
```

### Start the Server
```bash
# Option 1: Direct with Uvicorn
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using npm script (from root)
npm run dev

# Option 3: Using Docker
docker-compose up
```

### Verify Server is Running
```bash
curl -X GET http://localhost:8000/api/health

# Expected response:
# {
#   "status": "ok",
#   "app_name": "CEPROC V2",
#   "version": "2.0.0",
#   "llm_connected": true,
#   "database_connected": true,
#   "timestamp": "2026-04-15T..."
# }
```

---

## API Testing Sequence

### 1. Health Check
```bash
curl -X GET http://localhost:8000/api/health
```
**Status**: ✅ Ready

---

### 2. API Overview
```bash
curl -X GET http://localhost:8000/api
```
**Expected**: List of available endpoints

---

### 3. Transcription - Text Input
```bash
curl -X POST http://localhost:8000/api/transcribe/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "O processo de análise de crédito começa quando recebemos uma solicitação...",
    "context": {
      "processo": "Análise de Crédito",
      "analista": "João Silva",
      "departamento": "Crédito"
    }
  }'
```
**Status**: ✅ Ready (Text accepted, returns confirmation)

---

### 4. DPT Extraction (REQUIRES AZURE OPENAI)
```bash
curl -X POST http://localhost:8000/api/dpt \
  -H "Content-Type: application/json" \
  -d '{
    "interview_text": "O processo começa com a recepção do formulário. O cliente preenche os dados básicos como nome, CPF e renda. Em seguida, verifica-se a documentação. Se completa, prossegue-se para análise de crédito...",
    "process_name": "Análise de Crédito",
    "analyst": "Sistema CEPROC",
    "department": "Crédito",
    "date": "2026-04-15"
  }'
```
**Status**: ✅ Ready (Requires valid Azure OpenAI credentials)
**Response**: 
```json
{
  "status": "success",
  "dpt": {
    "metadados": {...},
    "negocio": {...},
    ...
  },
  "validation": {
    "status": "passed",
    "errors": [],
    "fields_present": 16,
    "fields_total": 16
  },
  "message": "DPT extracted successfully (passed validation)"
}
```

---

### 5. BPMN Generation (REQUIRES AZURE OPENAI)
```bash
curl -X POST http://localhost:8000/api/bpmn \
  -H "Content-Type: application/json" \
  -d '{
    "dpt": {
      "metadados": {...},
      "negocio": {...},
      ...
    },
    "include_coordinates": true,
    "include_visualization": true
  }'
```
**Status**: ✅ Ready (Requires valid DPT and Azure OpenAI)
**Response**: BPMN JSON with validation results

---

### 6. KPI Generation (REQUIRES AZURE OPENAI)
```bash
curl -X POST http://localhost:8000/api/kpi \
  -H "Content-Type: application/json" \
  -d '{
    "dpt": {...},
    "process_name": "Análise de Crédito",
    "filter_by_criticality": "all",
    "focus_areas": ["eficiência", "risco"]
  }'
```
**Status**: ✅ Ready (Requires valid DPT and Azure OpenAI)
**Response**: List of KPIs with summary statistics

---

### 7. Bottleneck Analysis (REQUIRES AZURE OPENAI)
```bash
curl -X POST http://localhost:8000/api/gargalos \
  -H "Content-Type: application/json" \
  -d '{
    "dpt": {...},
    "bpmn": {...},
    "severity_threshold": "high"
  }'
```
**Status**: ✅ Ready (Requires valid DPT, BPMN, and Azure OpenAI)
**Response**: Bottleneck list with improvement recommendations

---

### 8. Validation Endpoints
```bash
# Validate DPT structure
curl -X POST http://localhost:8000/api/dpt/validate \
  -H "Content-Type: application/json" \
  -d '{"metadados": {...}, ...}'

# Validate BPMN structure
curl -X POST http://localhost:8000/api/bpmn/validate \
  -H "Content-Type: application/json" \
  -d '{"pools": [...], "activities": [...], ...}'

# Validate KPI structure
curl -X POST http://localhost:8000/api/kpi/validate \
  -H "Content-Type: application/json" \
  -d '{"indicador": "...", "objetivo": "...", ...}'
```
**Status**: ✅ Ready

---

### 9. Export Formats
```bash
# List available formats
curl -X GET http://localhost:8000/api/export/formats

# Export to DOCX
curl -X POST http://localhost:8000/api/export/docx \
  -H "Content-Type: application/json" \
  -d '{"dpt": {...}, "kpis": [...], "process_name": "Análise de Crédito"}' \
  -o "relatorio.docx"

# Export to XLSX
curl -X POST http://localhost:8000/api/export/xlsx \
  -H "Content-Type: application/json" \
  -d '{"kpis": [...]}' \
  -o "kpis.xlsx"

# Export to BPMN
curl -X POST http://localhost:8000/api/export/bpmn \
  -H "Content-Type: application/json" \
  -d '{"bpmn_json": {...}}' \
  -o "process.bpmn"

# Export to ZIP (all formats)
curl -X POST http://localhost:8000/api/export/zip \
  -H "Content-Type: application/json" \
  -d '{"dpt": {...}, "bpmn_json": {...}, "kpis": [...]}' \
  -o "ceproc_export.zip"
```
**Status**: ✅ Ready

---

## Test Data Sample

For testing without Azure OpenAI, use this sample DPT:

```json
{
  "metadados": {
    "processo": "Análise de Crédito",
    "analista": "Sistema CEPROC",
    "departamento": "Crédito",
    "data_analise": "2026-04-15"
  },
  "negocio": {
    "descricao": "Análise rápida e eficiente de solicitações de crédito",
    "objetivos": "Reduzir tempo de decisão, aumentar aprovação de bons clientes",
    "restricoes": "Conformidade com Lei Geral de Proteção de Dados"
  },
  "finalidade": {
    "objetivo_principal": "Automatizar análise de crédito",
    "escopo": "Pessoa física e jurídica"
  },
  "conceitos": ["Crédito", "Risco", "Documentação"],
  "clientes": ["Pessoa Física", "Pessoa Jurídica"],
  "normas": ["Lei 10.406/2002", "LGPD"],
  "entradas": [
    "Formulário de solicitação",
    "Documentação (RG, CPF, contracheques)",
    "Extrato bancário"
  ],
  "etapas": [
    {
      "titulo": "Recepção da Solicitação",
      "descricao": "Recebe e registra formulário"
    },
    {
      "titulo": "Validação de Documentação",
      "descricao": "Verifica completude dos documentos"
    },
    {
      "titulo": "Análise de Crédito",
      "descricao": "Análise de risco e capacidade de pagamento"
    },
    {
      "titulo": "Aprovação/Rejeição",
      "descricao": "Decisão final sobre a solicitação"
    }
  ],
  "saidas": ["Solicitação Aprovada", "Solicitação Rejustada"],
  "atores": [
    {
      "nome": "Cliente",
      "responsabilidades": "Preencher formulário e fornecer documentação"
    },
    {
      "nome": "Analista de Crédito",
      "responsabilidades": "Avaliar risco e fazer recomendação"
    },
    {
      "nome": "Gerente",
      "responsabilidades": "Aprovar ou rejeitar solicitação"
    }
  ],
  "sistemas": [
    {
      "nome": "Sistema de Cadastro",
      "descricao": "Registro de cliente e documentação"
    }
  ],
  "expectativas": ["Decisão em até 2 dias úteis", "Rastreabilidade completa"],
  "documentos": ["Formulário de Solicitação", "Relatório de Análise"],
  "indicadores": ["Tempo médio de decisão", "Taxa de aprovação"],
  "pontos_sensiveis": ["Validação de documentos", "Decisão de crédito"]
}
```

---

## OpenAPI Documentation

When the server is running, access the interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide:
- Full endpoint documentation
- Request/response schemas
- "Try it out" functionality
- Example requests

---

## Environment Variables Required

```bash
# .env file
AZURE_OPENAI_KEY=<your-azure-openai-api-key>
AZURE_OPENAI_ENDPOINT=<https://your-resource.openai.azure.com/>
AZURE_OPENAI_DEPLOYMENT=<gpt-4-or-gpt-35-turbo>
DEBUG=true
ALLOWED_ORIGINS=["http://localhost", "http://localhost:5173", "http://localhost:3000"]
```

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'openai'"
**Solution**: Install requirements: `pip install -r backend/requirements.txt`

### Issue: "Connection refused" on Azure OpenAI
**Solution**: Check credentials in .env file, ensure Azure OpenAI service is deployed

### Issue: "CORS error" from frontend
**Solution**: Verify ALLOWED_ORIGINS in settings includes frontend URL

### Issue: Large file export fails
**Solution**: Use streaming responses (already implemented), check server memory/disk

---

## Next Steps

1. **Install dependencies**: `pip install -r backend/requirements.txt`
2. **Configure Azure OpenAI**: Create .env file with credentials
3. **Start server**: `npm run dev` or `uvicorn`
4. **Test endpoints**: Use curl commands above or Swagger UI
5. **Monitor logs**: Watch server output for any errors
6. **Proceed to Phase 2**: Frontend implementation with wizard pages

---

## Phase 1 Completion Checklist

- ✅ LLM Service implemented (Azure OpenAI integration)
- ✅ BPMN Processor implemented (JSON to XML conversion)
- ✅ Export Service implemented (DOCX, XLSX, BPMN, ZIP)
- ✅ Transcription routes (placeholder for Azure Speech)
- ✅ DPT extraction routes with validation
- ✅ BPMN generation routes with validation
- ✅ KPI generation routes with filtering
- ✅ Bottleneck analysis routes
- ✅ Export routes for all formats
- ✅ Comprehensive error handling
- ✅ Request validation at all endpoints
- ✅ Logging framework configured
- ✅ CORS configured for frontend
- ✅ Static file serving configured

---

## Support

For issues or questions:
1. Check logs in server output
2. Review endpoint documentation in Swagger UI
3. Verify environment configuration
4. Check for Azure OpenAI service availability
5. Review IMPLEMENTATION_PHASE1.md for detailed architecture

---

**Ready for testing! 🚀**
