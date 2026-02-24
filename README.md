# Consultoria Financeira Premium - Quiz de Diagnóstico

Este projeto é uma aplicação web interativa desenvolvida para captar leads qualificados para uma consultoria financeira premium. Através de um quiz detalhado, o sistema diagnostica o perfil financeiro do usuário e oferece um relatório personalizado, incentivando o agendamento de uma conversa estratégica.

## 🚀 Funcionalidades

- **Quiz Interativo:** Formulário passo-a-passo com perguntas sobre situação financeira, renda, família e objetivos.
- **Lógica de Perfil:** Algoritmo que classifica o usuário em um dos 4 perfis financeiros baseados nas respostas.
- **Relatório Personalizado:** Geração dinâmica de texto persuasivo e diagnóstico baseado nas dores e aspirações do usuário.
- **Captura de Leads (Lead Gen):**
  - **Agendamento de Estratégia:** Formulário para captar Nome, Email e WhatsApp antes de redirecionar para o Google Meet.
  - **WhatsApp Direto:** Opção secundária para quem prefere contato direto, também captando dados.
  - **Fallback de Contato:** Opção final para solicitar contato passivo via WhatsApp.
- **UX/UI Premium:** Design sofisticado com tema escuro e dourado, utilizando animações suaves (Framer Motion) e layout responsivo.
- **Navegação Intuitiva:** Avanço automático em perguntas de múltipla escolha e botão de "Voltar" para correção.

## 🛠️ Tecnologias Utilizadas

- **React 19** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (Animações)
- **Lucide React** (Ícones)
- **Supabase** (Banco de dados e Auth)

## 📂 Estrutura do Projeto

```
/
├── components/         # Componentes React reutilizáveis
│   ├── Quiz.tsx        # Lógica principal do formulário
│   ├── Result.tsx      # Página de resultados e captura de leads
│   └── ProgressBar.tsx # Indicador de progresso
├── utils/
│   └── logic.ts        # Lógica de cálculo de perfil e geração de texto
├── types.ts            # Definições de tipos TypeScript
├── App.tsx             # Componente raiz
└── main.tsx            # Ponto de entrada
```

## 🚦 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Build para produção:**
   ```bash
   npm run build
   ```

## 📝 Detalhes de Implementação

- **Validação de Formulários:** Todos os campos de captura de lead são obrigatórios para garantir a qualidade dos dados.
- **Redirecionamento Seguro:** Links externos (WhatsApp, Google Meet) são abertos em nova aba para evitar bloqueios de iframe e melhorar a experiência do usuário.
- **Responsividade:** O layout se adapta perfeitamente a dispositivos móveis e desktops.

## 🚀 Implantação na Vercel

1. Importe o repositório na Vercel.
2. Adicione as seguintes **Environment Variables**:
   - `VITE_SUPABASE_URL`: Sua URL do projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Sua Anon Key do Supabase.
3. O arquivo `vercel.json` já está incluído para lidar com as rotas do dashboard.
