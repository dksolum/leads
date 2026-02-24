# Documentação da API

Este documento descreve a estrutura de dados e os endpoints esperados para a integração com o backend.

## 📡 Endpoints

### `POST /api/leads` (Simulado)

Este endpoint receberia os dados do lead capturados no formulário de "Conversa Estratégica" ou "WhatsApp Direto".

#### Requisição

```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com",
  "phone": "(11) 99999-9999",
  "source": "strategy_session" // ou "direct_whatsapp", "fallback_whatsapp"
}
```

#### Resposta (Sucesso)

```json
{
  "status": "success",
  "message": "Lead capturado com sucesso",
  "redirectUrl": "https://calendar.app.google/Fh6dNbVXyvQEc9Pw5" // Opcional, se o backend controlar o redirecionamento
}
```

#### Resposta (Erro)

```json
{
  "status": "error",
  "message": "Erro ao salvar lead. Tente novamente mais tarde."
}
```

## 📦 Estrutura de Dados

### `UserAnswers`

Objeto contendo todas as respostas do usuário no quiz.

```typescript
interface UserAnswers {
  mainProblem: string;
  triedSolution: string;
  triedSolutionDescription?: string;
  incomeRange: IncomeRange | '';
  profession: string;
  spouse: 'Cônjuge' | 'Sem cônjuge' | '';
  children: '1 filho' | '2 filhos' | '3 ou mais filhos' | 'Não possuo filhos' | '';
  otherDependents: 'Possuo outros dependentes' | 'Não possuo outros dependentes' | '';
  otherDependentsCount?: number;
  financialState: FinancialState | '';
  goals: FinancialGoals | '';
  futureOutlook: FutureOutlook | '';
}
```

### `ProfileType`

Enumeração dos perfis financeiros possíveis.

```typescript
type ProfileType = 
  | 'Desorganização Estrutural' 
  | 'Potencial Travado' 
  | 'Executor Sem Direção' 
  | 'Estruturado em Evolução';
```

## 🔒 Segurança

- **HTTPS:** Todas as comunicações devem ser feitas via HTTPS.
- **Validação:** O backend deve validar todos os campos recebidos para evitar injeção de código ou dados inválidos.
- **Autenticação:** Se houver área administrativa, deve ser protegida por autenticação (JWT, OAuth).
