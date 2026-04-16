# 🚀 Guia de Deployment CEPROC V2 - Railway

## Visão Geral
CEPROC V2 é uma aplicação monorepo com:
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + Azure OpenAI
- **Deployment**: Docker multi-stage build no Railway

O frontend é compilado durante o build do Docker e servido como arquivos estáticos pelo backend Python.

---

## 📋 Pré-requisitos

### 1. Conta Railway
- Criar conta em https://railway.app
- Conectar repositório GitHub
- Ter acesso de push ao repositório

### 2. Variáveis de Ambiente
Você já tem configuradas:
- `AZURE_OPENAI_API_KEY` - Chave da API Azure
- `AZURE_OPENAI_ENDPOINT` - Endpoint do Azure OpenAI
- `AZURE_OPENAI_DEPLOYMENT` - Nome da deployment Azure

---

## 🔧 Passo a Passo - Deployment Inicial

### Opção A: Deploy via Railway Dashboard (Recomendado)

#### 1. Conectar Repositório ao Railway
```bash
# 1. Vá para https://railway.app
# 2. Clique em "New Project"
# 3. Selecione "Deploy from GitHub"
# 4. Autorize e selecione seu repositório (rniepce/ceproc-v2)
# 5. Railway detectará automaticamente o Dockerfile
```

#### 2. Configurar Variáveis de Ambiente
```bash
# No Dashboard do Railway:
# 1. Vá para: Project → Variables
# 2. Adicione:

AZURE_OPENAI_API_KEY=seu_valor_aqui
AZURE_OPENAI_ENDPOINT=seu_endpoint_aqui
AZURE_OPENAI_DEPLOYMENT=seu_deployment_aqui
PORT=8000
```

#### 3. Trigger Deploy
```bash
# Opção 1: Push para main branch
git push origin master

# Opção 2: Manual trigger no Dashboard
# Railway → Deployments → Deploy
```

#### 4. Acompanhar o Build
```bash
# No Dashboard:
# 1. Vá para: Deployments
# 2. Acompanhe o log do build
# 3. Espere até ver: "Build successful"

# Tempo estimado: 3-5 minutos
```

---

### Opção B: Deploy via CLI do Railway

#### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
# ou
yarn global add @railway/cli
# ou
brew install railwayapp/railway/railway
```

#### 2. Login no Railway
```bash
railway login
# Abrirá navegador para autenticação
```

#### 3. Ligar ao Projeto
```bash
cd ceproc-v2
railway link
# Selecione o projeto CEPROC V2
```

#### 4. Definir Variáveis
```bash
railway variables set AZURE_OPENAI_API_KEY=seu_valor
railway variables set AZURE_OPENAI_ENDPOINT=seu_endpoint
railway variables set AZURE_OPENAI_DEPLOYMENT=seu_deployment
railway variables set PORT=8000
```

#### 5. Deploy
```bash
railway up
# Enviará código para Railway e iniciará build
```

---

## 🔍 Verificar o Deploy

### 1. Status do Build
```bash
# Via CLI
railway logs -s

# Via Dashboard
# Railway → Deployments → Logs
```

### 2. Testar Endpoints
```bash
# Substitua YOUR_DOMAIN pelo seu domínio Railway
curl https://YOUR_DOMAIN/api/health

# Resposta esperada:
# {"status":"healthy","llm_connected":true}
```

### 3. Acessar o Frontend
```
https://YOUR_DOMAIN/
```

Você deve ver:
- Header: "🔄 CEPROC V2 - Análise de Processos"
- Etapa 1/8 - Entrada
- Input de texto para entrevista

---

## 📊 Estrutura do Build Docker

```dockerfile
# Stage 1: Build Frontend (Node 18)
- npm ci (instala dependências)
- npm run build (compila React)
- Saída: /app/frontend/dist

# Stage 2: Backend Python + Frontend estático
- pip install (dependências Python)
- COPY --from=frontend-builder (copia dist para /static)
- CMD: uvicorn app.main:app
- Porta: 8000
```

### Arquivos Servidos
```
/                    → index.html (React SPA)
/api/*              → Backend FastAPI
/assets/            → CSS, JS, imagens do frontend
```

---

## 🔄 Ciclo de Desenvolvimento

### Fazer Alterações
```bash
# Frontend
nano frontend/src/pages/1-EntradaPage.jsx

# Backend
nano backend/app/routes/dpt.py

# Commit
git add .
git commit -m "Descrever mudanças"
git push origin master
```

### Railway Auto-Deploy
```
Push para GitHub → Railway Webhook → Build → Deploy
Tempo: 3-5 minutos
```

### Rollback (se necessário)
```bash
# Via CLI
railway deployments list
railway rollback DEPLOYMENT_ID

# Via Dashboard
# Deployments → Selecionar versão anterior → Redeploy
```

---

## 🚨 Troubleshooting

### Erro: "Build failed"
```bash
# 1. Verificar logs
railway logs -s

# 2. Verificar requirements.txt (backend)
cat backend/requirements.txt

# 3. Verificar package.json (frontend)
cat frontend/package.json

# 4. Verificar Dockerfile
cat Dockerfile

# 5. Fazer push de novo
git push origin master
```

### Erro: "Module not found"
```bash
# Backend: Reinstalar dependências
cd ceproc-v2
rm backend/requirements.txt.lock
pip freeze > backend/requirements.txt
git add backend/requirements.txt
git commit -m "Update dependencies"
git push origin master

# Frontend: Limpar node_modules
rm -rf frontend/node_modules
npm install
git add frontend/package-lock.json
git commit -m "Reinstall dependencies"
git push origin master
```

### Erro: "API request failed"
```bash
# Verificar variáveis de ambiente
railway variables list

# Se faltarem, adicionar:
railway variables set AZURE_OPENAI_API_KEY=valor
railway variables set AZURE_OPENAI_ENDPOINT=valor
railway variables set AZURE_OPENAI_DEPLOYMENT=valor

# Redeploy
railway up
```

### Erro: "Port in use"
```bash
# Railway automaticamente gerencia portas
# Não precisa se preocupar - é normal

# Se tiver problema de conexão:
# 1. Verificar se saúde do container
railway logs -s

# 2. Reiniciar container
railway redeploy
```

### Erro: "CORS issues"
```bash
# O frontend está servido do mesmo domínio
# Não deve haver problemas de CORS

# Se tiver, verificar backend CORS configuration:
cat backend/app/main.py | grep -A 5 "CORSMiddleware"

# Adicionar seu domínio se necessário
```

---

## 📈 Monitoramento

### Logs em Tempo Real
```bash
railway logs -s --follow
```

### Métricas
```bash
# Via Dashboard
# Railway → Metrics (CPU, Memória, Disco)
```

### Health Check
```bash
# Automático a cada 30 segundos
# Endpoint: GET /api/health
curl https://YOUR_DOMAIN/api/health
```

---

## 🔐 Segurança

### Variáveis Sensíveis
```bash
# NUNCA commitar em git:
# - AZURE_OPENAI_API_KEY
# - AZURE_OPENAI_ENDPOINT
# - Senhas / Tokens

# Sempre usar: railway variables set
```

### HTTPS
```bash
# Railway fornece automaticamente
# Todos os domínios têm HTTPS ativo
```

### Backup
```bash
# Não há persistência no Railway por padrão
# Se precisar salvar dados:
# - Usar banco de dados externo (PostgreSQL, MongoDB)
# - Usar armazenamento em nuvem (AWS S3, etc)
```

---

## 📊 Performance & Scaling

### Atual
- 1 replica (container único)
- 512 MB RAM
- 0.5 CPU

### Se Precisar Escalar
```bash
# Aumentar replicas (múltiplos containers)
railway variables set REPLICAS=3

# Aumentar memória (no dashboard)
# Railway → Settings → Resources
```

---

## 🎯 Próximos Passos

### Pós-Deploy
1. ✅ Teste todos os 8 passos do wizard
2. ✅ Teste exportação em todos os formatos
3. ✅ Teste integração com Azure OpenAI
4. ✅ Monitore logs por 24 horas
5. ✅ Configure alertas

### Melhorias Futuras
- [ ] Database para persistência (PostgreSQL)
- [ ] Autenticação de usuários (Auth0, Firebase)
- [ ] CDN para static assets (Cloudflare)
- [ ] Analytics (Sentry, DataDog)
- [ ] API Rate Limiting

---

## 📞 Suporte Railway

- **Documentação**: https://docs.railway.app
- **Status**: https://status.railway.app
- **Discord**: https://discord.gg/railway
- **Email**: support@railway.app

---

## ✅ Checklist Final

- [ ] Repositório GitHub conectado ao Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Dockerfile no repositório
- [ ] railway.json atualizado
- [ ] Build concluído com sucesso
- [ ] Frontend acessível em https://YOUR_DOMAIN/
- [ ] API respondendo em https://YOUR_DOMAIN/api/health
- [ ] Todos os 8 passos do wizard funcionando
- [ ] Testes de exportação (DOCX, XLSX, BPMN, ZIP) bem-sucedidos
- [ ] Logs monitorados

---

**Última Atualização**: April 16, 2026
**Versão**: 1.0
**Status**: Ready for Production ✅
