export type IncomeRange =
  | 'Até 10 mil reais'
  | 'Abaixo de 5 mil reais'
  | 'De 5 a 8 mil reais'
  | 'De 8 a 10 mil reais'
  | 'De 10 a 12 mil reais'
  | 'De 12 a 14 mil reais'
  | 'De 14 a 18 mil reais'
  | 'Acima de 18 mil reais';

export type FinancialState =
  | 'Desorganizada e preocupante'
  | 'Vivendo dia após dia'
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
  subIncomeRange?: 'Abaixo de 5 mil reais' | 'De 5 a 8 mil reais' | 'De 8 a 10 mil reais' | '';
  profession: string;
  spouse: 'Cônjuge' | 'Sem cônjuge' | '';
  children: '1 filho' | '2 filhos' | '3 ou mais filhos' | 'Não possuo filhos' | '';
  otherDependents: 'Possuo outros dependentes' | 'Não possuo outros dependentes' | '';
  otherDependentsCount?: number;
  financialState: FinancialState | '';
  goals: FinancialGoals | '';
  hasCreditCard?: 'Sim' | 'Não' | '';
  creditCardIsProblem?: 'Sim' | 'Não' | '';
  futureOutlook: FutureOutlook | '';
  dependsOnOthers?: 'Sim' | 'Não' | '';
  dependsOnOthersReason?: string;
  commitmentScale?: string;
  whatsapp?: string; // For the fallback
  meeting?: MeetingAnswers;
  formType?: 'personal' | 'business' | 'complete';
  selectedPricingId?: string;
  pricingSelections?: {
    consultoriaPackageId?: string;
    consultoriaVista?: string;
    consultoriaParcelado?: string;
    especialPackageId?: string;
    especialVista?: string;
    especialParcelado?: string;
    entradaPackageId?: string;
    entradaVista?: string;
    entradaParcelado?: string;
  };
}

export interface MeetingAnswers {
  monthlySavings?: string;      // Quanto consegue poupar por mês
  financialPriority?: string;   // Prioridade financeira atual (Reserva, Investimentos, etc.)
  biggestWaste?: string;        // Maior ralo/desperdício de dinheiro
  hasReserve?: 'Sim' | 'Não' | ''; // Possui reserva de emergência
  reserveMonths?: string;       // Meses de reserva se tiver
  timeCommitment?: string;      // Tempo de dedicação semanal
  matrixDecision?: 'blue' | 'red' | '';
  initialSolutionSense?: 'Sim' | 'Não' | '';
  investmentChoice?: 'Vista' | 'Parcelado' | 'Recusou' | '';
  negotiationChoice?: 'Vista' | 'Parcelado' | 'Recusou' | '';
  downsellChoice?: 'Vista' | 'Parcelado' | 'Recusou' | '';
  notes?: string;
  meetingDate?: string;

  // Novas perguntas de Coleta de Informações 1
  gastaMaisDoQueDeveria?: 'Sim' | 'Não' | '';
  comOQueGastaMais?: string;
  consegueGuardarDinheiro?: 'Sim' | 'Não' | '';
  guardaMensalmente?: 'Sim' | 'Não' | '';
  quantoGuardaMensalmente?: string;
  quantoConseguiuGuardar?: string;
  oQueImpedeDeGuardar?: string;
  quantoTemDeReserva?: string;
  problemaAlemDoPrincipal?: 'Sim' | 'Não' | '';
  quaisOutrosProblemas?: string;
  possuiDividas?: 'Sim' | 'Não' | '';
  dificuldadeLidarDividas?: 'Sim' | 'Não' | '';
  quaisDificuldadesDividas?: string;
  possuiMetas?: 'Sim' | 'Não' | '';
  quaisTresMetas?: string;
  porqueMetasImportantes?: string;

  // Novas perguntas de Coleta Emocional 2
  oQueFaltaParaDez?: string;
  vidaDaquiSeisMeses?: string;
  seisMesesAssustaOuConforta?: 'Assusta' | 'Conforta' | '';
  animacaoResolverMetas?: string; // Nota de 0 a 10
  rotinaPoucoTempo?: 'Sim' | 'Não' | '';

  // Finalidade do dinheiro guardado
  guardadoTemFinalidade?: 'Sim' | 'Não' | '';
  guardadoQualFinalidade?: string;
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
  status: 'Verificar' | 'Agendado' | 'Consultoria' | 'Downsell' | 'Perdido';
}

export type ProfileType =
  | 'Desorganização Estrutural'
  | 'Potencial Travado'
  | 'Executor Sem Direção'
  | 'Estruturado em Evolução';

export interface QuestionStep {
  id: number;
  question: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea' | 'scale';
  options?: string[];
  field: keyof UserAnswers;
  note?: string;
  conditional?: {
    triggerValue: string;
    field: keyof UserAnswers;
    question: string;
    placeholder?: string;
    note?: string;
    inputType?: 'text' | 'textarea' | 'number' | 'radio';
    options?: string[];
  };
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'administrador' | 'vendedor' | 'secretario';
  created_at?: string;
}

export interface PaymentOption {
  label: string;
  description: string;
  link: string;
  isCard?: boolean;
  installments?: number;
  installmentValue?: string;
  value?: string;
  checkoutType?: 'link' | 'pix' | 'maquininha';
}

export interface PricingPackage {
  id: string;
  name: string;
  value: string;
  payment_options: PaymentOption[];
  presentation_type?: 'personal' | 'business' | 'complete';
  product_moment?: 'consultoria' | 'especial' | 'entrada';
  created_at?: string;
}