# Arquitetura do Projeto

Este documento descreve a arquitetura e as decisões de design do projeto Consultoria Financeira Premium.

## 🏗️ Visão Geral

O projeto é uma aplicação web de página única (SPA) construída com React, TypeScript e Vite. O objetivo principal é captar leads qualificados através de um quiz interativo e oferecer um relatório personalizado.

## 🧩 Componentes Principais

### `App.tsx`
O componente raiz da aplicação. Gerencia o estado global do quiz (início, progresso, conclusão) e renderiza os componentes principais (`Quiz`, `Result`).

### `components/Quiz.tsx`
Responsável pela lógica do formulário passo-a-passo.
- **Estado:** Gerencia o passo atual (`step`) e as respostas do usuário (`answers`).
- **Validação:** Verifica se os campos obrigatórios foram preenchidos antes de avançar.
- **Navegação:** Permite avançar e voltar entre as perguntas.
- **Renderização Condicional:** Exibe campos adicionais com base nas respostas anteriores (ex: "Outros dependentes").

### `components/Result.tsx`
Exibe o resultado do quiz e os formulários de captura de leads.
- **Cálculo de Perfil:** Utiliza a função `calculateProfile` para determinar o perfil financeiro do usuário.
- **Geração de Relatório:** Utiliza a função `generateReportText` para criar um texto personalizado.
- **Captura de Leads:** Gerencia os formulários de "Conversa Estratégica", "WhatsApp Direto" e "Fallback".

### `utils/logic.ts`
Contém a lógica de negócio pura, separada da interface do usuário.
- **`calculateProfile`:** Algoritmo de pontuação para classificar o perfil financeiro.
- **`generateReportText`:** Constrói o texto do relatório com base nas respostas do usuário.

## 🎨 Estilização e Design

- **Tailwind CSS:** Utilizado para estilização rápida e consistente.
- **Tema Escuro:** A paleta de cores é baseada em tons escuros (`bg-dark-950`) com acentos dourados (`text-gold-500`) para transmitir sofisticação e exclusividade.
- **Responsividade:** O layout é fluido e se adapta a diferentes tamanhos de tela.

## 🔄 Fluxo de Dados e Persistência

1. **Início e Respostas:** Processo padrão de quiz.
2. **Cálculo:** Perfil determinado via `utils/logic.ts`.
3. **Persistência (Supabase):** Ao submeter o formulário de captura no `Result.tsx`, os dados são enviados para a tabela `leads` no Supabase via `@supabase/supabase-js`.
4. **Gestão (Painel Admin):** Administradores autenticados podem visualizar e editar o `status` dos leads via `AdminDashboard.tsx`.

## 🛡️ Segurança e Infraestrutura

- **Supabase Auth:** Autenticação gerenciada para o acesso administrativo.
- **Variáveis de Ambiente:** Chaves do Supabase gerenciadas via `import.meta.env` para segurança no deploy (Vercel).
- **SPA Routing:** Configurado via `vercel.json` para suportar rotas virtuais.
- **GitHub:** Sincronização automática para CI/CD.
