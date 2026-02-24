# Guia de Deploy

Este documento descreve como implantar a aplicação Consultoria Financeira Premium em produção.

## 🚀 Pré-requisitos

- **Node.js 18+**
- **npm 9+**
- **Acesso a um servidor ou plataforma de hospedagem (Vercel, Netlify, Cloud Run, etc.)**

## 📦 Build para Produção

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Gerar build otimizado:**
   ```bash
   npm run build
   ```
   Isso criará uma pasta `dist/` contendo os arquivos estáticos prontos para deploy.

## ☁️ Hospedagem (Exemplo: Vercel)

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   Siga as instruções na tela para configurar o projeto.

## ☁️ Hospedagem (Exemplo: Netlify)

1. **Instalar Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```
   Selecione a pasta `dist` quando solicitado.

## ☁️ Hospedagem (Exemplo: Docker)

1. **Construir imagem:**
   ```bash
   docker build -t consultoria-financeira .
   ```

2. **Rodar container:**
   ```bash
   docker run -p 3000:3000 consultoria-financeira
   ```

## 🔒 Variáveis de Ambiente

Certifique-se de configurar as variáveis de ambiente necessárias no seu provedor de hospedagem.
- `VITE_API_URL` (se houver backend)
- `VITE_ANALYTICS_ID` (se houver analytics)

## 🔄 CI/CD (GitHub Actions)

Recomendamos configurar um pipeline de CI/CD para automatizar o deploy a cada push na branch `main`.
Exemplo de workflow `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```
