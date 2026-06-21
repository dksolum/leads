import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAnswers, QuestionStep, DependentType } from '../types';
import { ProgressBar } from './ProgressBar';
import { ArrowRight, Check } from 'lucide-react';

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
    field: 'incomeRange'
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
      question: "Provavelmente a pessoa de quem você depende é uma pessoa importante para as decisões de mudança na sua vida. Porém, se essa pessoa falar NÃO para algo, você desiste de investir em você?",
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
  const [answers, setAnswers] = useState<UserAnswers>({
    mainProblem: '',
    triedSolution: '',
    triedSolutionDescription: '',
    incomeRange: '',
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

  const [error, setError] = useState('');

  const currentQ = questions[step];

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      setError('');
    }
  };

  const handleNext = () => {
    // Validation
    const val = answers[currentQ.field];

    // Check main field
    if (
      (!val) ||
      (Array.isArray(val) && val.length === 0)
    ) {
      setError('Por favor, preencha este campo para continuar.');
      return;
    }

    // Check conditional field if applicable
    if (currentQ.conditional && answers[currentQ.field] === currentQ.conditional.triggerValue) {
      const condVal = answers[currentQ.conditional.field];
      if (!condVal) {
        setError('Por favor, preencha o campo adicional para continuar.');
        return;
      }
    }

    setError('');
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete(answersRef.current);
    }
  };

  const handleChange = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQ.field]: value }));
    if (error) setError('');
  };

  const handleOptionSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.field]: value }));
    if (error) setError('');

    const triggersConditional = currentQ.conditional && value === currentQ.conditional.triggerValue;

    if (!triggersConditional) {
      setTimeout(() => {
        if (step < questions.length - 1) {
          setStep(prev => prev + 1);
        } else {
          onComplete({ ...answersRef.current, [currentQ.field]: value });
        }
      }, 350);
    }
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
      if (e.key === 'Enter' && currentQ.type !== 'textarea') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Removed dependency array to capture latest state, careful with performance but ok here

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
                  <label
                    key={opt}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all group ${answers[currentQ.field] === opt
                      ? 'bg-gold-500/10 border-gold-500 text-white'
                      : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                      }`}
                  >
                    <input
                      type="radio"
                      name={currentQ.field}
                      value={opt}
                      checked={answers[currentQ.field] === opt}
                      onChange={() => handleOptionSelect(opt)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center ${answers[currentQ.field] === opt ? 'border-gold-500' : 'border-gray-500'
                      }`}>
                      {answers[currentQ.field] === opt && <div className="w-3 h-3 bg-gold-500 rounded-full" />}
                    </div>
                    <span className="text-lg">{opt}</span>
                  </label>
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
                      <div className="flex gap-4 mt-2">
                        {['Sim', 'Não'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleConditionalChange(opt)}
                            className={`flex-1 py-3 px-4 rounded-lg border text-center font-semibold transition-all ${answers[currentQ.conditional.field] === opt
                              ? 'bg-gold-500/10 border-gold-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-gold-500/50'
                              }`}
                          >
                            {opt}
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

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-white text-dark-950 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {step === questions.length - 1 ? 'Ver Resultado' : 'Próxima'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};