# Guia de Testes

Este documento descreve as estratégias e ferramentas de teste para o projeto Consultoria Financeira Premium.

## 🧪 Estratégia de Testes

### Testes Unitários (Jest + React Testing Library)
- **Objetivo:** Verificar a lógica de componentes isolados e funções utilitárias.
- **Cobertura:**
  - `utils/logic.ts`: Testar `calculateProfile` com diferentes combinações de respostas.
  - `components/Quiz.tsx`: Testar renderização de perguntas, validação de campos e navegação.
  - `components/Result.tsx`: Testar exibição correta do perfil e formulários de lead.

### Testes de Integração (Cypress / Playwright)
- **Objetivo:** Verificar o fluxo completo do usuário, desde o início do quiz até a página de resultados.
- **Cenários:**
  - Preenchimento completo do quiz -> Resultado correto.
  - Tentativa de avançar sem preencher campos obrigatórios -> Mensagem de erro.
  - Preenchimento do formulário de lead -> Redirecionamento correto.

## 🛠️ Ferramentas Recomendadas

- **Jest:** Framework de testes unitários.
- **React Testing Library:** Utilitários para testar componentes React de forma acessível.
- **Cypress:** Framework de testes E2E (End-to-End).

## 📝 Exemplo de Teste Unitário (`logic.test.ts`)

```typescript
import { calculateProfile } from './logic';
import { UserAnswers } from '../types';

describe('calculateProfile', () => {
  it('should return "Desorganização Estrutural" for low scores', () => {
    const answers: UserAnswers = {
      financialState: 'Desorganizada e preocupante',
      goals: 'Não tenho metas definidas',
      // ... outras respostas
    };
    expect(calculateProfile(answers)).toBe('Desorganização Estrutural');
  });
});
```

## 🚀 Como Executar Testes

1. **Instalar dependências de teste:**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   ```

2. **Configurar script de teste:**
   No `package.json`:
   ```json
   "scripts": {
     "test": "jest"
   }
   ```

3. **Rodar testes:**
   ```bash
   npm test
   ```
