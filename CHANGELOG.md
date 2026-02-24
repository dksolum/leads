# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [Unreleased]

### Adicionado
- **Formulário de Estratégia:** Adicionado formulário de captura de leads (Nome, Email, WhatsApp) antes do redirecionamento para o Google Meet.
- **Formulário de WhatsApp Direto:** Adicionado botão e formulário para quem prefere contato direto via WhatsApp, posicionado abaixo do botão principal.
- **Formulário de Fallback:** Opção final para solicitar contato passivo via WhatsApp.
- **Validação de Campos:** Todos os formulários exigem preenchimento obrigatório de Nome, Email e WhatsApp.
- **Botão Voltar:** Implementado botão "Voltar" no quiz para permitir correção de respostas anteriores.
- **Avanço Automático:** Implementado avanço automático ao selecionar opções de rádio no quiz (com delay de 350ms).
- **Lógica de Dependentes:** Atualizada a lógica da pergunta sobre dependentes para incluir cônjuge, filhos e outros dependentes de forma detalhada.
- **Redirecionamento Seguro:** Links externos (WhatsApp, Google Meet) agora abrem em nova aba (`_blank`) para evitar bloqueios de iframe.

### Alterado
- **Layout do Resultado:** Reorganização dos botões de ação (CTA) para priorizar a conversa estratégica, seguida pelo contato direto via WhatsApp e, por último, o fallback.
- **Estilização:** Ajustes nas cores dos botões (Dourado para Estratégia, Amarelo para WhatsApp Direto, Vermelho Claro para Fallback) para melhor hierarquia visual.
- **Texto do Relatório:** Refinamento na geração do texto do relatório para incluir detalhes sobre a composição familiar (cônjuge, filhos, outros dependentes).
- **Scripts:** Adicionado script de linting (`npm run lint`) ao `package.json`.

### Corrigido
- **Erro de Referência:** Corrigido erro `Uncaught ReferenceError: showDirectWhatsappInput is not defined` restaurando variáveis de estado perdidas.
- **Redirecionamento WhatsApp:** Corrigido problema onde o link `wa.me` não abria corretamente dentro do ambiente de preview (iframe).
