import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAnswers, QuestionStep, Lead } from '../types';
import { ProgressBar } from './ProgressBar';
import { ArrowRight, Check, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onComplete: (answers: UserAnswers) => void;
}

// Interface customizada de perguntas para acomodar condicionais complexas
interface BusinessQuestion {
  id: number;
  question: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea' | 'scale' | 'currency';
  options?: string[];
  field: keyof UserAnswers;
  note?: string;
}

export const QuizBusiness: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const lastActionTimeRef = useRef(0);

  // Informações de contato do lead (coletados na última etapa)
  const [leadContact, setLeadContact] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
  });

  // Estado central de respostas
  const [answers, setAnswers] = useState<UserAnswers>({
    mainProblem: '',
    triedSolution: '',
    triedSolutionDescription: '',
    incomeRange: '',
    subIncomeRange: '',
    profession: 'Empresário', // Padrão corporativo
    spouse: '',
    children: '',
    otherDependents: '',
    financialState: '',
    goals: '',
    futureOutlook: '',
    whatsapp: '',
    formType: 'business',

    // Inicializar os campos do Business
    businessBranch: '',
    businessSize: '',
    businessPhase: '',
    businessDifficulty: '',
    businessTriedSolution: '',
    businessTriedSolutionDescription: '',
    mixesMoney: '',
    knowsMonthlyProfit: '',
    monthlyProfitValue: '',
    averageMonthlyRevenue: '',
    cashFlowUpdated: '',
    controlsBills: '',
    hasDeferredSales: '',
    deferredSalesCollector: '',
    regularReconciliation: '',
    emitsInvoices: '',
    invoiceSystemNFCe: '',
    invoiceNFSSe: '',
    invoiceNFSe: '',
    industryHasOwnStore: '',
    industryAlsoProvidesServices: '',
    commerceAlsoProvidesServices: '',
    servicesAlsoSellsProducts: '',
    analyzesResults: '',
    feelsSafeDecision: '',
    outlookSixMonths: '',
    hasFinancialManager: '',
    hasAccounting: '',
    whatToImprove: [],
    hasBusinessCard: '',
    businessCardIsProblem: '',
    usePersonalCardForBusiness: '',
    dependsOnOthersBusiness: '',
    dependsOnOthersBusinessReason: '',
    commitmentScale: '',
  });

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Lista sequencial das perguntas corporativas
  const questions: BusinessQuestion[] = [
    {
      id: 1,
      question: "Qual é o ramo principal da sua empresa?",
      type: 'radio',
      options: ['Comércio de mercadorias', 'Prestação de serviços', 'Indústria'],
      field: 'businessBranch'
    },
    {
      id: 2,
      question: "Qual é o porte da empresa?",
      type: 'radio',
      options: ['MEI', 'ME do Simples Nacional', 'Outros'],
      field: 'businessSize'
    },
    {
      id: 3,
      question: "Em qual fase você acredita que sua empresa está?",
      type: 'radio',
      options: ['Sobrevivência', 'Crescimento', 'Maturidade', 'Crise'],
      field: 'businessPhase'
    },
    {
      id: 4,
      question: "Qual é hoje a maior dificuldade financeira da empresa?",
      type: 'textarea',
      field: 'businessDifficulty',
      note: "Descreva com clareza a principal dor no caixa hoje."
    },
    {
      id: 5,
      question: "Você já tentou fazer algo para resolver esse problema?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'businessTriedSolution'
    },
    // Pergunta 5.1 (Condicional) - O que tentou fazer?
    {
      id: 6, // Identificador interno sequencial
      question: "O que você já tentou fazer?",
      type: 'textarea',
      field: 'businessTriedSolutionDescription',
      note: "Explique brevemente o que foi feito e por que não surtiu o efeito desejado."
    },
    {
      id: 7,
      question: "Você mistura dinheiro da empresa com dinheiro pessoal?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'mixesMoney',
      note: "Usar conta da PJ para despesas de casa ou transferir do pessoal para cobrir a empresa."
    },
    {
      id: 8,
      question: "Você sabe exatamente quanto sua empresa lucrou no último mês?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'knowsMonthlyProfit',
      note: "Considerando todas as receitas e abatendo rigorosamente todos os custos."
    },
    // Pergunta 8.1 (Condicional) - Qual foi o lucro?
    {
      id: 9,
      question: "Qual foi o valor do lucro estimado do último mês?",
      type: 'currency',
      field: 'monthlyProfitValue'
    },
    {
      id: 10,
      question: "Qual o faturamento médio mensal da empresa?",
      type: 'currency',
      field: 'averageMonthlyRevenue',
      note: "Pode ser um valor aproximado para termos uma noção do porte das operações."
    },
    {
      id: 11,
      question: "Seu fluxo de caixa está sempre atualizado?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'cashFlowUpdated',
      note: "Existe controle diário categorizando receitas e despesas para enxergar o destino do dinheiro."
    },
    {
      id: 11,
      question: "Você controla todas as contas a pagar/receber e cumpre o prazo de vencimento?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'controlsBills'
    },
    {
      id: 12,
      question: "Você faz vendas para recebimento posterior e precisa realizar cobranças?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'hasDeferredSales'
    },
    // Pergunta 12.1 (Condicional) - Responsável por Cobranças
    {
      id: 13,
      question: "Possui alguém para realizar a cobrança ou você mesmo foca nas cobranças?",
      type: 'radio',
      options: ['Possuo alguém', 'Eu mesmo faço'],
      field: 'deferredSalesCollector'
    },
    {
      id: 14,
      question: "Você realiza conciliação bancária regularmente?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'regularReconciliation',
      note: "Conferir o extrato com o controle de fluxo para validar se tudo bate centavo por centavo."
    },
    {
      id: 15,
      question: "Você emite notas fiscais em todas as vendas realizadas?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'emitsInvoices'
    },
    // Pergunta 15.1 (Condicional) - Sistema de Notas (Comércio/Indústria)
    {
      id: 16,
      question: "Possui sistema de emissão de NFC-e?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'invoiceSystemNFCe'
    },
    // Pergunta 15.2 (Condicional) - Emissão NFS-e (Serviços)
    {
      id: 17,
      question: "Emite NFS-e em todo trabalho realizado?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'invoiceNFSSe'
    },
    // Pergunta 15.3 (Condicional) - Emissão NF-e (Indústria)
    {
      id: 17.5,
      question: "Emite NF-e em toda venda realizada?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'invoiceNFSe'
    },
    {
      id: 18,
      question: "Você analisa os resultados financeiros da empresa com frequência?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'analyzesResults',
      note: "Olhar relatórios e indicadores para ajustar custos ou criar novas estratégias de ganho."
    },
    {
      id: 19,
      question: "Você sente segurança para tomar decisões financeiras?",
      type: 'radio',
      options: ['Sim', 'Não', 'Às vezes'],
      field: 'feelsSafeDecision',
      note: "Agir baseado em números reais em vez de palpites ou intuição."
    },
    {
      id: 20,
      question: "Se nada mudar agora, como imagina a vida financeira da empresa daqui a 6 meses?",
      type: 'radio',
      options: ['Pior do que hoje', 'Igual ao que está', 'Um pouco melhor', 'Muito melhor', 'Não faço ideia'],
      field: 'outlookSixMonths'
    },
    {
      id: 21,
      question: "Hoje você conta com alguém responsável pela gestão financeira?",
      type: 'radio',
      options: ['Sim (Eu mesmo)', 'Sim (Outra pessoa)', 'Não'],
      field: 'hasFinancialManager'
    },
    {
      id: 22,
      question: "A empresa possui acompanhamento contábil?",
      type: 'radio',
      options: ['Sim', 'Não', 'Apenas quando necessário'],
      field: 'hasAccounting'
    },
    {
      id: 23,
      question: "O que você gostaria de melhorar na gestão financeira?",
      type: 'checkbox',
      options: ['Fluxo de caixa', 'Lucratividade', 'Cobranças', 'Capital de giro', 'Contabilidade fiscal', 'Planejamento tributário', 'Organização geral'],
      field: 'whatToImprove'
    },
    {
      id: 24,
      question: "A empresa possui cartão de crédito empresarial?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'hasBusinessCard'
    },
    // Pergunta 24.1 (Condicional Sim) - Cartão de Crédito é um problema?
    {
      id: 25,
      question: "Hoje o cartão de crédito tem sido um problema para a empresa?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'businessCardIsProblem'
    },
    // Pergunta 24.2 (Condicional Não) - Cartão Pessoal para despesas corporativas
    {
      id: 26,
      question: "Você utiliza o cartão de crédito pessoal para despesas da empresa?",
      type: 'radio',
      options: [
        'Sim (e tem sido um problema)',
        'Sim (mas não é um problema)',
        'Não possuo cartão de crédito pessoal',
        'Não utilizo cartão de crédito pessoal para despesas da empresa'
      ],
      field: 'usePersonalCardForBusiness'
    },
    {
      id: 27,
      question: "Você depende de outra pessoa para tomar uma decisão para a empresa?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'dependsOnOthersBusiness'
    },
    // Pergunta 27.1 (Condicional Sim) - Decisão sob dependência
    {
      id: 28,
      question: "Provavelmente a pessoa de quem você depende é uma pessoa importante para as decisões de mudança na sua vida. Porém, se essa pessoa falar NÃO para algo, você desiste de investir em você?",
      type: 'radio',
      options: ['Sim', 'Não'],
      field: 'dependsOnOthersBusinessReason'
    },
    {
      id: 29,
      question: "O quanto você está comprometido com a evolução financeira da empresa de 0 a 10?",
      type: 'scale',
      field: 'commitmentScale'
    }
  ];

  // Identifica se um determinado passo sequencial deve ser ignorado com base nas respostas dadas
  const shouldSkipStep = (index: number): boolean => {
    const q = questions[index];
    if (!q) return false;

    // Sempre pulamos estes passos, pois agora eles são exibidos inline nos slides principais correspondentes
    if (
      q.field === 'businessTriedSolutionDescription' ||
      q.field === 'monthlyProfitValue' ||
      q.field === 'deferredSalesCollector' ||
      q.field === 'invoiceSystemNFCe' ||
      q.field === 'invoiceNFSSe' ||
      q.field === 'invoiceNFSe' ||
      q.field === 'industryHasOwnStore' ||
      q.field === 'industryAlsoProvidesServices' ||
      q.field === 'commerceAlsoProvidesServices' ||
      q.field === 'servicesAlsoSellsProducts' ||
      q.field === 'businessCardIsProblem' ||
      q.field === 'usePersonalCardForBusiness' ||
      q.field === 'dependsOnOthersBusinessReason'
    ) {
      return true;
    }

    return false;
  };

  // Encontra o próximo passo válido
  const getNextStepIndex = (current: number): number => {
    let next = current + 1;
    while (next < questions.length && shouldSkipStep(next)) {
      next++;
    }
    return next;
  };

  // Encontra o passo anterior válido
  const getPrevStepIndex = (current: number): number => {
    let prev = current - 1;
    while (prev >= 0 && shouldSkipStep(prev)) {
      prev--;
    }
    return prev;
  };

  const currentQ = questions[step];

  // Máscara monetária R$ 0,00 preenchimento pela casa decimal
  const formatCurrency = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    const num = parseInt(clean, 10) / 100;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof UserAnswers) => {
    const rawVal = e.target.value;
    const formatted = formatCurrency(rawVal);
    setAnswers(prev => ({ ...prev, [fieldName]: formatted }));
    if (error) setError('');
  };

  const handleNext = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 450) return;
    lastActionTimeRef.current = now;

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const val = answers[currentQ.field];

    // Validação de preenchimento
    if (currentQ.type === 'checkbox') {
      if (!val || (Array.isArray(val) && val.length === 0)) {
        setError('Por favor, selecione pelo menos uma opção para continuar.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    } else {
      if (!val) {
        setError('Por favor, preencha este campo para continuar.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    // Validações específicas de condicionais inline
    if (currentQ.field === 'businessTriedSolution' && val === 'Sim') {
      if (!answers.businessTriedSolutionDescription) {
        setError('Por favor, descreva o que você já tentou fazer para continuar.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    if (currentQ.field === 'knowsMonthlyProfit' && val === 'Sim') {
      if (!answers.monthlyProfitValue) {
        setError('Por favor, preencha o valor do lucro estimado para continuar.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    if (currentQ.field === 'hasDeferredSales' && (val === 'Sim' || val === 'Às vezes')) {
      if (!answers.deferredSalesCollector) {
        setError('Por favor, selecione quem realiza as cobranças para continuar.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    if (currentQ.field === 'emitsInvoices' && val) {
      if (answers.businessBranch === 'Indústria') {
        if (!answers.industryHasOwnStore) {
          setError('Por favor, responda se possui loja própria.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
        if (answers.industryHasOwnStore === 'Sim' && !answers.invoiceSystemNFCe) {
          setError('Por favor, responda se possui sistema de NFC-e.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
        if (!answers.industryAlsoProvidesServices) {
          setError('Por favor, responda se também presta serviços.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
        if (answers.industryAlsoProvidesServices === 'Sim' && !answers.invoiceNFSSe) {
          setError('Por favor, responda se emite NFS-e para os serviços realizados.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
      } else if (answers.businessBranch === 'Prestação de serviços') {
        if (!answers.servicesAlsoSellsProducts) {
          setError('Por favor, responda se também comercializa produtos.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
        if (answers.servicesAlsoSellsProducts === 'Sim' && !answers.invoiceSystemNFCe) {
          setError('Por favor, responda se possui sistema de NFC-e.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
      } else {
        if (!answers.invoiceSystemNFCe) {
          setError('Por favor, responda se possui sistema de NFC-e.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
        if (!answers.commerceAlsoProvidesServices) {
          setError('Por favor, responda se também presta serviços.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
        if (answers.commerceAlsoProvidesServices === 'Sim' && !answers.invoiceNFSSe) {
          setError('Por favor, responda se emite NFS-e para os serviços realizados.');
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastActionTimeRef.current = 0;
          return;
        }
      }
    }

    if (currentQ.field === 'hasBusinessCard') {
      if (val === 'Sim' && !answers.businessCardIsProblem) {
        setError('Por favor, responda se o cartão tem sido um problema.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
      if (val === 'Não' && !answers.usePersonalCardForBusiness) {
        setError('Por favor, responda se utiliza seu cartão de crédito pessoal.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    if (currentQ.field === 'dependsOnOthersBusiness' && val === 'Sim') {
      if (!answers.dependsOnOthersBusinessReason) {
        setError('Por favor, responda a pergunta sobre dependência de decisão.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    // Regra de desqualificação imediata para "Outros" no Porte (Pergunta 2)
    if (currentQ.field === 'businessSize' && val === 'Outros') {
      setIsDisqualified(true);
      isTransitioningRef.current = false;
      setIsTransitioning(false);
      lastActionTimeRef.current = 0;
      return;
    }

    setError('');
    const nextIdx = getNextStepIndex(step);

    if (nextIdx < questions.length) {
      setStep(nextIdx);
    } else {
      // Avança para a etapa final: Cadastro de Contato do Lead
      setStep(questions.length); // Indica tela de captação de dados
    }
  };

  const handleBack = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 450) return;
    lastActionTimeRef.current = now;

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setError('');
    if (step === questions.length) {
      setStep(questions.length - 1);
    } else {
      const prevIdx = getPrevStepIndex(step);
      if (prevIdx >= 0) {
        setStep(prevIdx);
      }
    }
  };

  const handleOptionSelect = (value: string) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 450) return;
    lastActionTimeRef.current = now;

    // Regra de desqualificação imediata para "Outros" no Porte (Pergunta 2)
    if (currentQ.field === 'businessSize' && value === 'Outros') {
      setIsDisqualified(true);
      lastActionTimeRef.current = 0;
      return;
    }

    // Condições que ativam condicionais inline (NÃO avançam automaticamente)
    const blocksAutoAdvance =
      (currentQ.field === 'businessTriedSolution' && value === 'Sim') ||
      (currentQ.field === 'knowsMonthlyProfit' && value === 'Sim') ||
      (currentQ.field === 'hasDeferredSales' && (value === 'Sim' || value === 'Às vezes')) ||
      (currentQ.field === 'emitsInvoices') ||
      (currentQ.field === 'hasBusinessCard') ||
      (currentQ.field === 'dependsOnOthersBusiness' && value === 'Sim');

    if (blocksAutoAdvance) {
      setAnswers(prev => {
        const updated = { ...prev, [currentQ.field]: value };
        if (currentQ.field === 'businessTriedSolution' && value === 'Não') {
          updated.businessTriedSolutionDescription = '';
        }
        if (currentQ.field === 'knowsMonthlyProfit' && value !== 'Sim') {
          updated.monthlyProfitValue = '';
        }
        if (currentQ.field === 'hasDeferredSales' && value === 'Não') {
          updated.deferredSalesCollector = '';
        }
        if (currentQ.field === 'emitsInvoices' && !value) {
          updated.invoiceSystemNFCe = '';
          updated.invoiceNFSSe = '';
          updated.invoiceNFSe = '';
          updated.industryHasOwnStore = '';
          updated.industryAlsoProvidesServices = '';
          updated.commerceAlsoProvidesServices = '';
          updated.servicesAlsoSellsProducts = '';
        }
        if (currentQ.field === 'hasBusinessCard') {
          if (value === 'Sim') updated.usePersonalCardForBusiness = '';
          else updated.businessCardIsProblem = '';
        }
        if (currentQ.field === 'dependsOnOthersBusiness' && value === 'Não') {
          updated.dependsOnOthersBusinessReason = '';
        }
        return updated;
      });
      if (error) setError('');
      lastActionTimeRef.current = 0;
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    setAnswers(prev => {
      const updated = { ...prev, [currentQ.field]: value };
      if (currentQ.field === 'businessBranch') {
        updated.invoiceSystemNFCe = '';
        updated.invoiceNFSSe = '';
        updated.invoiceNFSe = '';
        updated.industryHasOwnStore = '';
        updated.industryAlsoProvidesServices = '';
        updated.commerceAlsoProvidesServices = '';
        updated.servicesAlsoSellsProducts = '';
      }
      return updated;
    });
    if (error) setError('');

    setTimeout(() => {
      const nextIdx = getNextStepIndex(step);
      if (nextIdx < questions.length) {
        setStep(nextIdx);
      } else {
        setStep(questions.length);
      }
    }, 350);
  };

  const handleCheckboxToggle = (opt: string) => {
    const currentList = (answers.whatToImprove || []) as string[];
    let newList: string[];
    if (currentList.includes(opt)) {
      newList = currentList.filter(i => i !== opt);
    } else {
      newList = [...currentList, opt];
    }
    setAnswers(prev => ({ ...prev, whatToImprove: newList }));
    if (error) setError('');
  };

  // Tecla Enter para submeter formulários text/textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentQ && currentQ.type !== 'textarea') {
        // Se estiver na tela do questionário
        if (step < questions.length) {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(() => {
    setIsTransitioning(false);
    isTransitioningRef.current = false;
  }, [step]);

  // Função para calcular o perfil (ProfileType) com base nas respostas corporativas
  const calculateBusinessProfile = (data: UserAnswers) => {
    if (data.mixesMoney === 'Sim' || data.cashFlowUpdated === 'Não') {
      return 'Desorganização Estrutural';
    }
    if (data.knowsMonthlyProfit === 'Não' || data.regularReconciliation === 'Não') {
      return 'Potencial Travado';
    }
    if (data.feelsSafeDecision === 'Não' || data.feelsSafeDecision === 'Às vezes') {
      return 'Executor Sem Direção';
    }
    return 'Estruturado em Evolução';
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength <= 2) {
      return phoneNumberLength > 0 ? `(${phoneNumber}` : '';
    }
    if (phoneNumberLength <= 6) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    if (phoneNumberLength <= 10) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  // Finalizar a captação do lead e gravar no Supabase
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadContact.name || !leadContact.email || !leadContact.phone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!validateEmail(leadContact.email)) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }
    if (leadContact.phone.replace(/\D/g, '').length < 10) {
      setError('Por favor, informe um telefone/WhatsApp válido com DDD.');
      return;
    }
    setError('');
    setIsSaving(true);

    try {
      const finalAnswers: UserAnswers = {
        ...answers,
        whatsapp: leadContact.phone,
        formType: 'business',
      };

      const profile = calculateBusinessProfile(finalAnswers);

      const leadData = {
        name: leadContact.name,
        email: leadContact.email,
        phone: leadContact.phone,
        whatsapp: leadContact.phone,
        profile,
        answers: finalAnswers,
        action_type: 'Strategy Session' as const,
        status: 'Verificar' as const,
      };

      const { error: insertError } = await supabase
        .from('leads')
        .insert([leadData]);

      if (insertError) throw insertError;

      onComplete(finalAnswers);
    } catch (err: any) {
      console.error('Erro ao salvar lead corporativo:', err);
      setError('Ocorreu um erro ao salvar suas informações. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tela de desqualificação (Outros portes)
  if (isDisqualified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-serif text-white font-bold">Obrigado pelo seu interesse!</h2>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            No momento, a nossa consultoria e soluções de gestão financeira foram desenhadas e homologadas especificamente para atender empresas sob o enquadramento de <strong className="text-gold-400 font-bold">MEI</strong> ou <strong className="text-gold-400 font-bold">ME (Microempresa) enquadradas no Simples Nacional</strong>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            Para outros portes ou regimes tributários complexos, a nossa estrutura operacional e de sistemas ainda está em fase de expansão. Recomendamos buscar uma assessoria financeira dedicada ao seu segmento.
          </p>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={() => {
              setAnswers(prev => ({ ...prev, businessSize: '' }));
              setIsDisqualified(false);
            }}
            className="px-6 py-3 bg-dark-800 hover:bg-dark-750 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest border border-dark-700 transition-colors cursor-pointer"
          >
            Voltar e Corrigir
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-500/20 transition-colors cursor-pointer"
          >
            Encerrar
          </button>
        </div>
      </div>
    );
  }

  // Render da etapa final: Captação de Contato
  if (step === questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
        <div className="w-full text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-gold-500/10 text-gold-500 rounded-2xl flex items-center justify-center mx-auto border border-gold-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif text-white font-bold tracking-tight">Estamos prontos para gerar seu Diagnóstico Exclusivo!</h2>
            <p className="text-gray-450 text-sm font-light max-w-md mx-auto leading-relaxed">
              Para desbloquear a análise estratégica de saúde financeira e liberar os canais de agendamento personalizado para sua empresa, por favor confirme os dados de contato do responsável.
            </p>
          </div>
        </div>

        <form onSubmit={handleLeadSubmit} className="w-full bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-5 shadow-xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nome do Responsável *</label>
            <input
              type="text"
              required
              className="w-full bg-dark-950 border border-dark-850 focus:border-gold-500 rounded-xl text-white p-3 text-base outline-none transition-colors"
              placeholder="Ex: João da Silva"
              value={leadContact.name}
              onChange={(e) => setLeadContact(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">E-mail Corporativo *</label>
            <input
              type="email"
              required
              className="w-full bg-dark-950 border border-dark-850 focus:border-gold-500 rounded-xl text-white p-3 text-base outline-none transition-colors"
              placeholder="Ex: joao@empresa.com"
              value={leadContact.email}
              onChange={(e) => setLeadContact(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">WhatsApp *</label>
            <input
              type="tel"
              required
              className="w-full bg-dark-950 border border-dark-850 focus:border-gold-500 rounded-xl text-white p-3 text-base outline-none transition-colors"
              placeholder="Ex: (65) 99999-9999"
              value={leadContact.phone}
              onChange={(e) => setLeadContact(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
            />
            <p className="text-[10px] text-gray-500 italic mt-1">Este número será utilizado para o envio do seu diagnóstico e contato para agendamentos.</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-4 pt-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="flex-1 py-3 bg-dark-800 hover:bg-dark-750 text-gray-400 hover:text-white rounded-xl text-sm font-bold uppercase tracking-widest border border-dark-700 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-gold-500 text-dark-950 font-bold rounded-xl hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Gerar Perfil</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <div className="w-full mb-8">
        <ProgressBar current={step} total={questions.length} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <h2 className={`text-2xl md:text-3xl font-serif text-white leading-snug ${currentQ.note ? 'mb-2' : 'mb-8'}`}>
            {currentQ.question}
          </h2>

          {currentQ.note && (
            <p className="text-sm text-gray-400 italic mb-8 leading-relaxed">
              {currentQ.note}
            </p>
          )}

          <div className="space-y-4">
            {currentQ.type === 'text' && (
              <input
                type="text"
                autoFocus
                className="w-full bg-dark-800 border-b-2 border-dark-600 focus:border-gold-500 text-white p-4 text-xl outline-none transition-colors"
                placeholder="Digite sua resposta..."
                value={answers[currentQ.field] as string || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.field]: e.target.value }))}
              />
            )}

            {currentQ.type === 'textarea' && (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  className="w-full bg-dark-800 border-2 border-dark-600 focus:border-gold-500 rounded-lg text-white p-4 text-lg outline-none transition-colors min-h-[150px]"
                  placeholder="Digite sua resposta detalhadamente..."
                  value={answers[currentQ.field] as string || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.field]: e.target.value }))}
                />
              </div>
            )}

            {currentQ.type === 'currency' && (
              <div className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-dark-800 border-b-2 border-dark-600 focus:border-gold-500 text-white p-4 text-xl outline-none transition-colors"
                  placeholder="R$ 0,00"
                  value={answers[currentQ.field] as string || ''}
                  onChange={(e) => handleCurrencyChange(e, currentQ.field)}
                />
                <p className="text-sm text-gray-400 italic">Digite apenas os números, o valor é ajustado centavo por centavo.</p>
              </div>
            )}

            {currentQ.type === 'radio' && (
              <div className="space-y-4">
                <div className="space-y-4">
                  {currentQ.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-4 rounded-lg border font-semibold transition-all flex items-center group ${answers[currentQ.field] === opt
                        ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                        : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50 hover:text-white'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center ${answers[currentQ.field] === opt ? 'border-gold-500' : 'border-gray-500'
                        }`}>
                        {answers[currentQ.field] === opt && <div className="w-3 h-3 bg-gold-500 rounded-full" />}
                      </div>
                      <span className="text-lg">{opt}</span>
                    </button>
                  ))}
                </div>

                {/* 1. Pergunta Condicional Inline: O que já tentou fazer */}
                {currentQ.field === 'businessTriedSolution' && answers.businessTriedSolution === 'Sim' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 space-y-3"
                  >
                    <label className="block text-lg text-white font-serif mb-1">
                      O que você já tentou fazer?
                    </label>
                    <textarea
                      className="w-full bg-dark-800 border-2 border-dark-600 focus:border-gold-500 rounded-lg text-white p-4 text-base outline-none transition-colors min-h-[120px]"
                      placeholder="Explique brevemente o que foi feito (cursos, planilhas, sistemas, consultoria anterior...)"
                      value={answers.businessTriedSolutionDescription as string || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, businessTriedSolutionDescription: e.target.value }))}
                    />
                    <p className="text-xs text-gray-400 italic">Explique o que foi feito e por que acredita que não deu certo.</p>
                  </motion.div>
                )}

                {/* 2. Pergunta Condicional Inline: Qual o lucro estimado */}
                {currentQ.field === 'knowsMonthlyProfit' && answers.knowsMonthlyProfit === 'Sim' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 space-y-3"
                  >
                    <label className="block text-lg text-white font-serif mb-1">
                      Qual foi o valor do lucro estimado do último mês?
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-800 border-b-2 border-dark-600 focus:border-gold-500 text-white p-4 text-xl outline-none transition-colors"
                      placeholder="R$ 0,00"
                      value={answers.monthlyProfitValue as string || ''}
                      onChange={(e) => handleCurrencyChange(e, 'monthlyProfitValue')}
                    />
                    <p className="text-xs text-gray-400 italic">Digite apenas os números, o valor é ajustado centavo por centavo.</p>
                  </motion.div>
                )}

                {/* 3. Pergunta Condicional Inline: Responsável por Cobranças */}
                {currentQ.field === 'hasDeferredSales' && (answers.hasDeferredSales === 'Sim' || answers.hasDeferredSales === 'Às vezes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 space-y-3"
                  >
                    <label className="block text-lg text-white font-serif mb-2">
                      Possui alguém para realizar a cobrança ou você mesmo foca nas cobranças?
                    </label>
                    <div className="flex flex-col gap-3 mt-2">
                      {['Possuo alguém', 'Eu mesmo faço'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, deferredSalesCollector: opt }))}
                          className={`w-full text-left p-4 rounded-lg border font-semibold transition-all flex items-center group ${answers.deferredSalesCollector === opt
                            ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${answers.deferredSalesCollector === opt ? 'border-gold-500' : 'border-gray-500'}`}>
                            {answers.deferredSalesCollector === opt && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />}
                          </div>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. Pergunta Condicional Inline: Emissão de Notas */}
                {currentQ.field === 'emitsInvoices' && (answers.emitsInvoices === 'Sim' || answers.emitsInvoices === 'Não' || answers.emitsInvoices === 'Às vezes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 space-y-3"
                  >
                    {/* Ramo de Prestação de Serviços */}
                    {answers.businessBranch === 'Prestação de serviços' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-lg text-white font-serif mb-2">
                            Sendo prestadora de serviços, sua empresa também comercializa produtos?
                          </label>
                          <div className="flex gap-4 mt-2">
                            {['Sim', 'Não'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswers(prev => {
                                  const updated = { ...prev, servicesAlsoSellsProducts: opt };
                                  if (opt === 'Não') updated.invoiceSystemNFCe = '';
                                  return updated;
                                })}
                                className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.servicesAlsoSellsProducts === opt
                                  ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                  }`}
                              >
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {answers.servicesAlsoSellsProducts === 'Sim' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <label className="block text-lg text-white font-serif mb-2">
                              Possui sistema de emissão de NFC-e (Cupom Fiscal)?
                            </label>
                            <div className="flex gap-4 mt-2">
                              {['Sim', 'Não'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, invoiceSystemNFCe: opt }))}
                                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.invoiceSystemNFCe === opt
                                    ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                    }`}
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Ramo de Indústria */}
                    {answers.businessBranch === 'Indústria' && (
                      <div className="space-y-6">
                        {/* 1. Você possui loja própria e vende diretamente ao público final? */}
                        <div className="space-y-2">
                          <label className="block text-lg text-white font-serif mb-2">
                            Você possui loja própria e vende diretamente ao público final?
                          </label>
                          <div className="flex gap-4 mt-2">
                            {['Sim', 'Não'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswers(prev => {
                                  const updated = { ...prev, industryHasOwnStore: opt };
                                  if (opt === 'Não') updated.invoiceSystemNFCe = '';
                                  return updated;
                                })}
                                className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.industryHasOwnStore === opt
                                  ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                  }`}
                              >
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Possui sistema de emissão de NFC-e (Cupom Fiscal)? */}
                        {answers.industryHasOwnStore === 'Sim' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <label className="block text-lg text-white font-serif mb-2">
                              Possui sistema de emissão de NFC-e (Cupom Fiscal)?
                            </label>
                            <div className="flex gap-4 mt-2">
                              {['Sim', 'Não'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, invoiceSystemNFCe: opt }))}
                                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.invoiceSystemNFCe === opt
                                    ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                    }`}
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* 3. Sendo indústria, sua empresa também presta serviços? */}
                        {(answers.industryHasOwnStore === 'Não' || (answers.industryHasOwnStore === 'Sim' && answers.invoiceSystemNFCe)) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <label className="block text-lg text-white font-serif mb-2">
                              Sendo indústria, sua empresa também presta serviços?
                            </label>
                            <div className="flex gap-4 mt-2">
                              {['Sim', 'Não'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswers(prev => {
                                    const updated = { ...prev, industryAlsoProvidesServices: opt };
                                    if (opt === 'Não') updated.invoiceNFSSe = '';
                                    return updated;
                                  })}
                                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.industryAlsoProvidesServices === opt
                                    ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                    }`}
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* 4. Emite NFS-e para os serviços realizados? */}
                        {(answers.industryHasOwnStore === 'Não' || (answers.industryHasOwnStore === 'Sim' && answers.invoiceSystemNFCe)) && answers.industryAlsoProvidesServices === 'Sim' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <label className="block text-lg text-white font-serif mb-2">
                              Emite NFS-e para os serviços realizados?
                            </label>
                            <div className="flex gap-4 mt-2">
                              {['Sim', 'Não'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, invoiceNFSSe: opt }))}
                                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.invoiceNFSSe === opt
                                    ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                    }`}
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Ramo de Comércio */}
                    {answers.businessBranch !== 'Prestação de serviços' && answers.businessBranch !== 'Indústria' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-lg text-white font-serif mb-2">
                            Possui sistema de emissão de NFC-e (Cupom Fiscal)?
                          </label>
                          <div className="flex gap-4 mt-2">
                            {['Sim', 'Não'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswers(prev => ({ ...prev, invoiceSystemNFCe: opt }))}
                                className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.invoiceSystemNFCe === opt
                                  ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                  }`}
                              >
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {answers.invoiceSystemNFCe && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <label className="block text-lg text-white font-serif mb-2">
                              Sendo comércio, sua empresa também presta serviços?
                            </label>
                            <div className="flex gap-4 mt-2">
                              {['Sim', 'Não'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswers(prev => {
                                    const updated = { ...prev, commerceAlsoProvidesServices: opt };
                                    if (opt === 'Não') updated.invoiceNFSSe = '';
                                    return updated;
                                  })}
                                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.commerceAlsoProvidesServices === opt
                                    ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                    }`}
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {answers.invoiceSystemNFCe && answers.commerceAlsoProvidesServices === 'Sim' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <label className="block text-lg text-white font-serif mb-2">
                              Emite NFS-e para os serviços realizados?
                            </label>
                            <div className="flex gap-4 mt-2">
                              {['Sim', 'Não'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, invoiceNFSSe: opt }))}
                                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.invoiceNFSSe === opt
                                    ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                    }`}
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 5. Pergunta Condicional Inline: Cartão de Crédito */}
                {currentQ.field === 'hasBusinessCard' && (answers.hasBusinessCard === 'Sim' || answers.hasBusinessCard === 'Não') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 space-y-3"
                  >
                    {answers.hasBusinessCard === 'Sim' ? (
                      <>
                        <label className="block text-lg text-white font-serif mb-2">
                          Hoje o cartão de crédito tem sido um problema para a empresa?
                        </label>
                        <div className="flex gap-4 mt-2">
                          {['Sim', 'Não'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers(prev => ({ ...prev, businessCardIsProblem: opt }))}
                              className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.businessCardIsProblem === opt
                                ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                }`}
                            >
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-lg text-white font-serif mb-2">
                          Você utiliza seu cartão de crédito pessoal para despesas da empresa?
                        </label>
                        <div className="flex flex-col gap-3 mt-2">
                          {[
                            'Sim (e tem sido um problema)',
                            'Sim (mas não é um problema)',
                            'Não possuo cartão de crédito pessoal',
                            'Não utilizo cartão de crédito pessoal para despesas da empresa'
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers(prev => ({ ...prev, usePersonalCardForBusiness: opt }))}
                              className={`w-full text-left p-4 rounded-lg border font-semibold transition-all flex items-center group ${answers.usePersonalCardForBusiness === opt
                                ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                                }`}
                            >
                              <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${answers.usePersonalCardForBusiness === opt ? 'border-gold-500' : 'border-gray-500'}`}>
                                {answers.usePersonalCardForBusiness === opt && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />}
                              </div>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* 6. Pergunta Condicional Inline: Tomador de Decisão */}
                {currentQ.field === 'dependsOnOthersBusiness' && answers.dependsOnOthersBusiness === 'Sim' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 space-y-3"
                  >
                    <label className="block text-lg text-white font-serif mb-2">
                      Provavelmente a pessoa de quem você depende é uma pessoa importante para as decisões de mudança na sua empresa. Porém, se essa pessoa falar NÃO para algo, VOCÊ DESISTE de resolver esse problema financeiro?
                    </label>
                    <div className="flex gap-4 mt-2">
                      {['Sim', 'Não'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, dependsOnOthersBusinessReason: opt }))}
                          className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers.dependsOnOthersBusinessReason === opt
                            ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                            }`}
                        >
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentQ.type === 'checkbox' && (
              <div className="space-y-3">
                {currentQ.options?.map((opt) => {
                  const list = (answers[currentQ.field] || []) as string[];
                  const isChecked = list.includes(opt);
                  return (
                    <label
                      key={opt}
                      onClick={() => handleCheckboxToggle(opt)}
                      className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all group ${isChecked
                        ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                        : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center ${isChecked ? 'border-gold-500 bg-gold-500/10' : 'border-gray-500'
                        }`}>
                        {isChecked && <Check className="w-4 h-4 text-gold-500" />}
                      </div>
                      <span className="text-lg">{opt}</span>
                    </label>
                  );
                })}
                <p className="text-xs text-gray-500 italic">Você pode selecionar mais de uma opção.</p>
              </div>
            )}

            {currentQ.type === 'scale' && (
              <div className="space-y-6">
                <div className="grid grid-cols-11 gap-1 md:gap-2">
                  {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleOptionSelect(String(num))}
                      className={`h-12 w-full rounded-lg border text-center font-bold text-sm md:text-base flex items-center justify-center transition-all ${answers[currentQ.field] === String(num)
                        ? 'bg-gold-500 text-dark-950 border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50 hover:text-white'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-sans tracking-wide uppercase px-1">
                  <span>0 - Sem comprometimento</span>
                  <span>10 - Totalmente comprometido</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 mt-4 text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-8 flex justify-between items-center">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-white transition-colors text-sm underline underline-offset-4"
              >
                Voltar
              </button>
            ) : <div />}

            {(currentQ.type === 'text' ||
              currentQ.type === 'textarea' ||
              currentQ.type === 'currency' ||
              currentQ.type === 'checkbox' ||
              (currentQ.field === 'businessTriedSolution' && answers.businessTriedSolution === 'Sim') ||
              (currentQ.field === 'knowsMonthlyProfit' && answers.knowsMonthlyProfit === 'Sim') ||
              (currentQ.field === 'hasDeferredSales' && (answers.hasDeferredSales === 'Sim' || answers.hasDeferredSales === 'Às vezes')) ||
              (currentQ.field === 'emitsInvoices' && (answers.emitsInvoices === 'Sim' || answers.emitsInvoices === 'Não' || answers.emitsInvoices === 'Às vezes')) ||
              (currentQ.field === 'hasBusinessCard' && (answers.hasBusinessCard === 'Sim' || answers.hasBusinessCard === 'Não')) ||
              (currentQ.field === 'dependsOnOthersBusiness' && answers.dependsOnOthersBusiness === 'Sim')
            ) && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-dark-950 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>Próxima</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
