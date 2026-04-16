#!/bin/bash

# 🚀 CEPROC V2 Deployment Script
# Este script facilita o deployment para Railway

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Script principal
print_header "CEPROC V2 - Railway Deployment"

# Passo 1: Verificar Git
print_info "Verificando status do Git..."
if [ -z "$(git status --porcelain)" ]; then
    print_success "Repositório limpo"
else
    print_error "Repositório tem mudanças não commitadas"
    echo -e "${YELLOW}Mudanças:${NC}"
    git status --short
    read -p "Deseja commitar essas mudanças? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Mensagem de commit: " commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        print_error "Abortando deployment"
        exit 1
    fi
fi

# Passo 2: Verificar dependências
print_info "Verificando dependências..."

if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado"
    exit 1
fi
print_success "npm encontrado"

if ! command -v git &> /dev/null; then
    print_error "git não está instalado"
    exit 1
fi
print_success "git encontrado"

# Passo 3: Instalar dependências locais
print_info "Instalando dependências do frontend..."
cd frontend
npm ci
cd ..
print_success "Dependências do frontend instaladas"

# Passo 4: Build do frontend
print_info "Compilando frontend..."
cd frontend
npm run build
cd ..
print_success "Frontend compilado com sucesso"

# Passo 5: Verificar arquivo .env
print_info "Verificando variáveis de ambiente..."
if [ ! -f "backend/.env" ]; then
    print_error "Arquivo backend/.env não encontrado"
    echo -e "${YELLOW}Variáveis necessárias:${NC}"
    echo "- AZURE_OPENAI_API_KEY"
    echo "- AZURE_OPENAI_ENDPOINT"
    echo "- AZURE_OPENAI_DEPLOYMENT"
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    print_success "Arquivo .env encontrado"
fi

# Passo 6: Commit de mudanças (se houver)
print_info "Preparando para push..."
if [ -z "$(git status --porcelain)" ]; then
    print_info "Nenhuma mudança para commitar"
else
    print_info "Arquivos modificados encontrados"
    git add .
    git commit -m "Deploy: frontend build updated"
    print_success "Mudanças commitadas"
fi

# Passo 7: Push para GitHub
print_info "Fazendo push para GitHub..."
git push origin master
print_success "Push concluído"

# Passo 8: Instruções finais
print_header "Próximos Passos"

echo -e "${GREEN}O deployment foi iniciado no Railway!${NC}\n"

echo -e "${YELLOW}1. Acompanhe o build em:${NC}"
echo "   https://railway.app → Seu Projeto → Deployments\n"

echo -e "${YELLOW}2. Teste a aplicação em:${NC}"
echo "   https://YOUR_DOMAIN/ (substitua YOUR_DOMAIN)\n"

echo -e "${YELLOW}3. Teste a API em:${NC}"
echo "   https://YOUR_DOMAIN/api/health\n"

echo -e "${YELLOW}4. Tempo estimado de deploy:${NC}"
echo "   3-5 minutos\n"

echo -e "${GREEN}Obrigado por usar CEPROC V2!${NC}"
print_header "✅ Script finalizado com sucesso!"
