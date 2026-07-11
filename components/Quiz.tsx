import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAnswers, QuestionStep, DependentType } from '../types';
import { ProgressBar } from './ProgressBar';
import { ArrowRight, Check, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateProfile } from '../utils/logic';

interface Props {
  onComplete: (answers: UserAnswers) => void;
}

const questions: QuestionStep[] = [
  {
    id: 1,
    question: "Qual é o seu principal problema financeiro hoje?",
    type: 'textarea',
    field: 'mainProblem',
    note: "Seja específico. Quanto mais claro você for, melhor será seu diagnóstico."
  },
  {
    id: 2,
    question: "Você já tentou fazer algo para resolver esse problema?",
    type: 'radio',
    options: ['Sim', 'Não'],
    field: 'triedSolution',
    conditional: {
      triggerValue: 'Sim',
      field: 'triedSolutionDescription',
      question: "O que você já tentou fazer?",
      placeholder: "Descreva brevemente o que tentou e por que acredita que não funcionou.",
      note: "Descreva brevemente o que tentou e por que acredita que não funcionou."
    }
  },
  {
    id: 3,
    question: "Qual sua faixa de renda mensal?",
    type: 'radio',
    options: ['Até 10 mil reais', 'De 10 a 12 mil reais', 'De 12 a 14 mil reais', 'De 14 a 18 mil reais', 'Acima de 18 mil reais'],
    field: 'incomeRange',
    conditional: {
      triggerValue: 'Até 10 mil reais',
      field: 'subIncomeRange',
      question: "Especifique sua faixa de renda dentro de até 10 mil reais:",
      inputType: 'radio',
      options: ['Abaixo de 5 mil reais', 'De 5 a 8 mil reais', 'De 8 a 10 mil reais']
    }
  },
  {
    id: 4,
    question: "Qual sua profissão?",
    type: 'text',
    field: 'profession'
  },
  {
    id: 5,
    question: "Você possui cônjuge?",
    type: 'radio',
    options: ['Cônjuge', 'Sem cônjuge'],
    field: 'spouse'
  },
  {
    id: 6,
    question: "Você possui filhos?",
    type: 'radio',
    options: ['1 filho', '2 filhos', '3 ou mais filhos', 'Não possuo filhos'],
    field: 'children'
  },
  {
    id: 7,
    question: "Você possui outros dependentes?",
    type: 'radio',
    options: ['Possuo outros dependentes', 'Não possuo outros dependentes'],
    field: 'otherDependents',
    conditional: {
      triggerValue: 'Possuo outros dependentes',
      field: 'otherDependentsCount',
      question: "Quantos outros dependentes?",
      placeholder: "0",
      inputType: 'number'
    }
  },
  {
    id: 8,
    question: "Como você acredita que está sua vida financeira hoje?",
    type: 'radio',
    options: ['Desorganizada e preocupante', 'Vivendo dia após dia', 'Estável mas sem crescimento', 'Organizada mas quero evoluir', 'Muito bem estruturada'],
    field: 'financialState'
  },
  {
    id: 9,
    question: "Você possui metas financeiras claras?",
    type: 'radio',
    options: ['Não tenho metas definidas', 'Tenho metas mas não sei como alcançar', 'Tenho metas e estou tentando executar', 'Tenho metas e estratégia definida'],
    field: 'goals'
  },
  {
    id: 10,
    question: "Você possui cartão de crédito?",
    type: 'radio',
    options: ['Sim', 'Não'],
    field: 'hasCreditCard',
    conditional: {
      triggerValue: 'Sim',
      field: 'creditCardIsProblem',
      question: "Hoje o cartão de crédito está sendo um problema financeiro?",
      inputType: 'radio'
    }
  },
  {
    id: 11,
    question: "Se nada mudar agora, como imagina sua vida financeira daqui a 6 meses?",
    type: 'radio',
    options: ['Pior do que hoje', 'Igual ao que está', 'Um pouco melhor', 'Muito melhor', 'Não faço ideia'],
    field: 'futureOutlook'
  },
  {
    id: 12,
    question: "Você depende de outra pessoa para tomar uma decisão?",
    type: 'radio',
    options: ['Sim', 'Não'],
    field: 'dependsOnOthers',
    conditional: {
      triggerValue: 'Sim',
      field: 'dependsOnOthersReason',
      question: "Provavelmente a pessoa de quem você depende é uma pessoa importante para as decisões de mudança na sua vida. Porém, se essa pessoa falar NÃO para algo, VOCÊ DESISTE de investir em você?",
      inputType: 'radio'
    }
  },
  {
    id: 13,
    question: "O quanto você está comprometido com sua evolução financeira de 0 a 10?",
    type: 'scale',
    field: 'commitmentScale'
  }
];

export const Quiz: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [answers, setAnswers] = useState<UserAnswers>({
    mainProblem: '',
    triedSolution: '',
    triedSolutionDescription: '',
    incomeRange: '',
    subIncomeRange: '',
    profession: '',
    spouse: '',
    children: '',
    otherDependents: '',
    otherDependentsCount: undefined,
    financialState: '',
    goals: '',
    hasCreditCard: '',
    creditCardIsProblem: '',
    futureOutlook: '',
    dependsOnOthers: '',
    dependsOnOthersReason: '',
    commitmentScale: '',
  });
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const lastActionTimeRef = useRef(0);
  const [leadContact, setLeadContact] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

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

    setIsSubmitting(true);

    try {
      const finalAnswers = getFinalAnswers({
        ...answers,
        leadName: leadContact.name,
        leadEmail: leadContact.email,
        leadPhone: leadContact.phone,
        whatsapp: leadContact.phone,
      });

      const profile = calculateProfile(finalAnswers);

      // Salva o lead no banco com status de captação inicial
      const { error: dbError } = await supabase.from('leads').insert({
        name: leadContact.name,
        email: leadContact.email,
        phone: leadContact.phone,
        whatsapp: leadContact.phone,
        profile,
        answers: {
          ...finalAnswers,
          formType: 'personal'
        },
        action_type: 'Quiz Complete'
      });

      if (dbError) throw dbError;

      // Continua para carregar a página de resultado
      onComplete(finalAnswers);
    } catch (err) {
      console.error('Error saving lead:', err);
      setError('Ocorreu um erro ao salvar seus dados. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setIsTransitioning(false);
    isTransitioningRef.current = false;
  }, [step]);

  const [error, setError] = useState('');

  const currentQ = step < questions.length ? questions[step] : questions[questions.length - 1];

  const getFinalAnswers = (rawAnswers: UserAnswers): UserAnswers => {
    const finalAnswers = { ...rawAnswers };
    if (finalAnswers.incomeRange === 'Até 10 mil reais' && finalAnswers.subIncomeRange) {
      finalAnswers.incomeRange = finalAnswers.subIncomeRange as any;
    }
    return finalAnswers;
  };

  const handleBack = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 450) return;
    lastActionTimeRef.current = now;

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    if (step > 0) {
      setStep(prev => prev - 1);
      setError('');
    }
  };

  const handleNext = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 450) return;
    lastActionTimeRef.current = now;

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    // Validation
    const val = answers[currentQ.field];

    // Check main field
    if (
      (!val) ||
      (Array.isArray(val) && val.length === 0)
    ) {
      setError('Por favor, preencha este campo para continuar.');
      isTransitioningRef.current = false;
      setIsTransitioning(false);
      lastActionTimeRef.current = 0;
      return;
    }

    // Check conditional field if applicable
    if (currentQ.conditional && answers[currentQ.field] === currentQ.conditional.triggerValue) {
      const condVal = answers[currentQ.conditional.field];
      if (!condVal) {
        setError('Por favor, preencha o campo adicional para continuar.');
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }

      // Se for desqualificado por faixa de renda abaixo de 5 mil reais
      if (currentQ.conditional.field === 'subIncomeRange' && condVal === 'Abaixo de 5 mil reais') {
        setIsDisqualified(true);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        lastActionTimeRef.current = 0;
        return;
      }
    }

    setError('');
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      setStep(questions.length);
    }
  };

  const handleChange = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQ.field]: value }));
    if (error) setError('');
  };

  const handleOptionSelect = (value: string) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 450) return;
    lastActionTimeRef.current = now;

    const triggersConditional = currentQ.conditional && value === currentQ.conditional.triggerValue;

    if (triggersConditional) {
      setAnswers(prev => ({ ...prev, [currentQ.field]: value }));
      if (error) setError('');
      lastActionTimeRef.current = 0;
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    setAnswers(prev => ({ ...prev, [currentQ.field]: value }));
    if (error) setError('');

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(prev => prev + 1);
      } else {
        setStep(questions.length);
      }
    }, 350);
  };

  const handleConditionalChange = (value: string) => {
    if (currentQ.conditional) {
      let finalValue: string | number = value;
      if (currentQ.conditional.inputType === 'number') {
        finalValue = value === '' ? 0 : parseInt(value, 10);
        if (isNaN(finalValue as number)) finalValue = 0;
      }

      setAnswers(prev => ({ ...prev, [currentQ.conditional!.field]: finalValue }));
      if (error) setError('');
    }
  };

  // Keyboard support for Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step < questions.length && e.key === 'Enter' && currentQ.type !== 'textarea') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Removed dependency array to capture latest state, careful with performance but ok here

  const showNextButton =
    step < questions.length && (
      step === questions.length - 1 ||
      currentQ.type === 'text' ||
      currentQ.type === 'textarea' ||
      (currentQ.type === 'radio' && currentQ.conditional && answers[currentQ.field] === currentQ.conditional.triggerValue)
    );

  if (isDisqualified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-serif text-white font-bold">Obrigado pelo seu interesse!</h2>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            No momento, a nossa consultoria financeira foi estruturada especificamente para acelerar perfis que já se encontram na faixa de renda de <strong className="text-gold-400 font-bold">R$ 5.000,00 ou mais</strong>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            Para faixas inferiores a esta, o valor do investimento não traria o retorno proporcional que acreditamos ser justo para você. Recomendamos focar primeiro no aumento de sua renda ativa para que possamos trabalhar juntos no futuro.
          </p>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={() => {
              setAnswers(prev => ({
                ...prev,
                incomeRange: '',
                subIncomeRange: ''
              }));
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
              Para desbloquear sua análise de saúde financeira e liberar os canais de agendamento estratégico personalizado, por favor preencha os dados abaixo.
            </p>
          </div>
        </div>

        <form onSubmit={handleLeadSubmit} className="w-full bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-5 shadow-xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Seu Nome *</label>
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
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Seu E-mail *</label>
            <input
              type="email"
              required
              className="w-full bg-dark-950 border border-dark-850 focus:border-gold-500 rounded-xl text-white p-3 text-base outline-none transition-colors"
              placeholder="Ex: joao@email.com"
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
              placeholder="Ex: (11) 99999-9999"
              value={leadContact.phone}
              onChange={(e) => setLeadContact(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
            />
            <p className="text-[10px] text-gray-500 italic mt-1">Este número será utilizado para o envio do seu diagnóstico e contato para agendamentos.</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}

          <div className="pt-2 flex gap-4">
            <button
              type="button"
              onClick={() => {
                setStep(questions.length - 1);
                setError('');
              }}
              className="flex-1 py-3 bg-dark-800 hover:bg-dark-750 text-gray-300 font-bold rounded-xl transition-all cursor-pointer border border-dark-700"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-3 bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-gold-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Ver Diagnóstico</span>
                  <ArrowRight className="w-5 h-5" />
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
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-8 leading-snug">
            {currentQ.question}
          </h2>

          <div className="space-y-4">
            {currentQ.type === 'text' && (
              <input
                type="text"
                autoFocus
                className="w-full bg-dark-800 border-b-2 border-dark-600 focus:border-gold-500 text-white p-4 text-xl outline-none transition-colors"
                placeholder="Digite sua resposta..."
                value={answers[currentQ.field] as string}
                onChange={(e) => handleChange(e.target.value)}
              />
            )}

            {currentQ.type === 'textarea' && (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  className="w-full bg-dark-800 border-2 border-dark-600 focus:border-gold-500 rounded-lg text-white p-4 text-lg outline-none transition-colors min-h-[150px]"
                  placeholder="Digite sua resposta..."
                  value={answers[currentQ.field] as string}
                  onChange={(e) => handleChange(e.target.value)}
                />
                {currentQ.note && (
                  <p className="text-sm text-gray-400 italic">{currentQ.note}</p>
                )}
              </div>
            )}

            {currentQ.type === 'radio' && (
              <div className="space-y-4">
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left p-4 rounded-lg border font-semibold transition-all flex items-center group ${answers[currentQ.field] === opt
                      ? 'bg-gold-500/10 border-gold-500 text-white'
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

                {/* Conditional Field Rendering */}
                {currentQ.conditional && answers[currentQ.field] === currentQ.conditional.triggerValue && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 space-y-2"
                  >
                    <label className="block text-lg text-white mb-2 font-serif">
                      {currentQ.conditional.question}
                    </label>

                    {currentQ.conditional.inputType === 'radio' ? (
                      <div className={currentQ.conditional.options ? "flex flex-col gap-3 mt-2" : "flex gap-4 mt-2"}>
                        {(currentQ.conditional.options || ['Sim', 'Não']).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleConditionalChange(opt)}
                            className={currentQ.conditional.options
                              ? `w-full text-left p-4 rounded-lg border font-semibold transition-all flex items-center group ${answers[currentQ.conditional.field] === opt
                                ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50 hover:text-white'
                              }`
                              : `flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers[currentQ.conditional.field] === opt
                                ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'bg-dark-800 border-dark-600 text-gray-450 hover:border-gold-500/50'
                              }`
                            }
                          >
                            {currentQ.conditional.options && (
                              <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${answers[currentQ.conditional.field] === opt ? 'border-gold-500' : 'border-gray-500'}`}>
                                {answers[currentQ.conditional.field] === opt && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />}
                              </div>
                            )}
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    ) : currentQ.conditional.inputType === 'number' ? (
                      <input
                        type="number"
                        className="w-full bg-dark-800 border-2 border-dark-600 focus:border-gold-500 rounded-lg text-white p-4 text-lg outline-none transition-colors"
                        placeholder={currentQ.conditional.placeholder}
                        value={answers[currentQ.conditional.field] as string || ''}
                        onChange={(e) => handleConditionalChange(e.target.value)}
                      />
                    ) : (
                      <textarea
                        className="w-full bg-dark-800 border-2 border-dark-600 focus:border-gold-500 rounded-lg text-white p-4 text-lg outline-none transition-colors min-h-[100px]"
                        placeholder={currentQ.conditional.placeholder}
                        value={answers[currentQ.conditional.field] as string || ''}
                        onChange={(e) => handleConditionalChange(e.target.value)}
                      />
                    )}

                    {currentQ.conditional.note && (
                      <p className="text-sm text-gray-400 italic">{currentQ.conditional.note}</p>
                    )}
                  </motion.div>
                )}
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

            {showNextButton && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-white text-dark-950 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {step === questions.length - 1 ? 'Ver Resultado' : 'Próxima'}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};