export type IncomeRange = 'Até 5 mil' | '5 a 6 mil' | '6 a 8 mil' | '8 a 10 mil' | 'Acima de 10 mil';

export type FinancialState =
  | 'Desorganizada e preocupante'
  | 'Sobrevivendo mês a mês'
  | 'Estável mas sem crescimento'
  | 'Organizada mas quero evoluir'
  | 'Muito bem estruturada';

export type FinancialGoals =
  | 'Não tenho metas definidas'
  | 'Tenho metas mas não sei como alcançar'
  | 'Tenho metas e estou tentando executar'
  | 'Tenho metas e estratégia definida';

export type FutureOutlook =
  | 'Pior do que hoje'
  | 'Igual ao que está'
  | 'Um pouco melhor'
  | 'Muito melhor'
  | 'Não faço ideia';

export type DependentType = 'Cônjuge' | '1 filho' | '2 filhos' | '3 ou mais filhos' | 'Outros dependentes' | 'Não possuo dependentes';

export interface UserAnswers {
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
  whatsapp?: string; // For the fallback
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  profile: ProfileType;
  answers: UserAnswers;
  action_type: 'Strategy Session' | 'WhatsApp Direct' | 'WhatsApp Contact';
  status: 'Verificar' | 'Agendado' | 'Consultoria' | 'Perdido';
}

export type ProfileType =
  | 'Desorganização Estrutural'
  | 'Potencial Travado'
  | 'Executor Sem Direção'
  | 'Estruturado em Evolução';

export interface QuestionStep {
  id: number;
  question: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea';
  options?: string[];
  field: keyof UserAnswers;
  note?: string;
  conditional?: {
    triggerValue: string;
    field: keyof UserAnswers;
    question: string;
    placeholder?: string;
    note?: string;
    inputType?: 'text' | 'textarea' | 'number';
  };
}