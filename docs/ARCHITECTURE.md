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

## 🔄 Fluxo de Dados

1. **Início:** O usuário inicia o quiz.
2. **Perguntas:** O usuário responde às perguntas sequencialmente.
3. **Validação:** Cada resposta é validada antes de avançar.
4. **Conclusão:** Ao finalizar o quiz, as respostas são passadas para o componente `Result`.
5. **Cálculo:** O perfil é calculado e o relatório é gerado.
6. **Captura:** O usuário preenche um formulário de contato (Nome, Email, WhatsApp).
7. **Ação:** Os dados são enviados (simulado via `console.log`) e o usuário é redirecionado para a ação desejada (Google Meet ou WhatsApp).

## 🚀 Otimizações

- **Lazy Loading:** Componentes pesados podem ser carregados sob demanda (futuro).
- **Memoização:** Funções de cálculo podem ser memoizadas para evitar reprocessamento desnecessário.
- **Acessibilidade:** Melhorias na acessibilidade (ARIA labels, foco) para garantir que todos os usuários possam utilizar a aplicação.
