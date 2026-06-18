import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Sparkles, Check, 
  HelpCircle, AlertCircle, Image as ImageIcon, Save,
  Users, Award, TrendingUp, ShieldCheck, Play, ArrowRight,
  TrendingDown, CheckCircle2, RefreshCw, HeartHandshake, Brain,
  Compass, Eye, Target, Sparkle
} from 'lucide-react';
import { Lead, MeetingAnswers } from '../types';
import { supabase } from '../lib/supabase';

interface PresentationProps {
  lead: Lead;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

// Imagem padrão de fundo fixa para a capa fornecida pelo usuário
const DIAGNOSTICO_BG = '/images/diagnostico.webp';

export const PresentationFlow: React.FC<PresentationProps> = ({ lead, onClose, onUpdateLead }) => {
  // Estado para controlar o slide atual
  type SlideId = 
    | 'intro'
    | 'do_que_se_trata'
    | 'objetivo_conversa'
    | 'institucional'
    | 'confirmacao_dados'
    | 'coleta_informacoes'
    | 'adequacao'
    | 'provas_sociais'
    | 'como_ajuda'
    | 'como_funciona'
    | 'decisao_matrix'
    | 'confirmacao_sentido'
    | 'reforco_valor'
    | 'investimento_padrao'
    | 'condicao_especial'
    | 'downsell'
    | 'proximos_passos'
    | 'proximos_passos_downsell'
    | 'agradecimento_final';

  const [currentSlide, setCurrentSlide] = useState<SlideId>('intro');
  const [slideHistory, setSlideHistory] = useState<SlideId[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Estados dos novos dados de reunião coletados interativamente
  const [meetingAnswers, setMeetingAnswers] = useState<MeetingAnswers>({
    monthlySavings: lead.answers.meeting?.monthlySavings || '',
    financialPriority: lead.answers.meeting?.financialPriority || '',
    biggestWaste: lead.answers.meeting?.biggestWaste || '',
    hasReserve: lead.answers.meeting?.hasReserve || '',
    reserveMonths: lead.answers.meeting?.reserveMonths || '',
    timeCommitment: lead.answers.meeting?.timeCommitment || '',
    matrixDecision: lead.answers.meeting?.matrixDecision || '',
    initialSolutionSense: lead.answers.meeting?.initialSolutionSense || '',
    investmentChoice: lead.answers.meeting?.investmentChoice || '',
    negotiationChoice: lead.answers.meeting?.negotiationChoice || '',
    downsellChoice: lead.answers.meeting?.downsellChoice || '',
    notes: lead.answers.meeting?.notes || '',
  });

  // Salvar automaticamente as respostas locais sempre que houver mudanças nos dados de inputs
  const handleInputChange = (field: keyof MeetingAnswers, value: any) => {
    setMeetingAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Persistir dados no Supabase e atualizar estado do pai
  const saveToSupabase = async (updatedAnswers: MeetingAnswers) => {
    setIsSaving(true);
    try {
      const updatedUserAnswers = {
        ...lead.answers,
        meeting: {
          ...updatedAnswers,
          meetingDate: updatedAnswers.meetingDate || new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('leads')
        .update({ answers: updatedUserAnswers })
        .eq('id', lead.id);

      if (error) {
        console.error('Erro ao atualizar lead no Supabase:', error);
      } else {
        onUpdateLead({
          ...lead,
          answers: updatedUserAnswers
        });
      }
    } catch (e) {
      console.error('Erro de conexão ao salvar lead:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Controlar navegação manual e registrar no histórico
  const navigateTo = (nextSlide: SlideId) => {
    setSlideHistory(prev => [...prev, currentSlide]);
    setCurrentSlide(nextSlide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (slideHistory.length > 0) {
      const previous = slideHistory[slideHistory.length - 1];
      setSlideHistory(prev => prev.slice(0, -1));
      setCurrentSlide(previous);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Suporte a tecla Esc para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Salvar dados no Supabase quando avançar de slides importantes
  const handleSaveAndNavigate = async (nextSlide: SlideId) => {
    await saveToSupabase(meetingAnswers);
    navigateTo(nextSlide);
  };

  // Efeitos visuais de animação para slides
  const slideVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  // Calcula a porcentagem do progresso indireto da reunião
  const getProgressPercent = (): number => {
    const slideOrder: SlideId[] = [
      'intro',
      'do_que_se_trata',
      'objetivo_conversa',
      'institucional',
      'confirmacao_dados',
      'coleta_informacoes',
      'adequacao',
      'provas_sociais',
      'como_ajuda',
      'como_funciona',
      'decisao_matrix',
      'confirmacao_sentido',
      'reforco_valor',
      'investimento_padrao',
      'proximos_passos',
      'agradecimento_final'
    ];
    
    const index = slideOrder.indexOf(currentSlide);
    if (index === -1) {
      // Se for condicional/ramificação (ex: condicao_especial, downsell) calcula próximo do preço
      if (currentSlide === 'condicao_especial') return 80;
      if (currentSlide === 'downsell') return 85;
      if (currentSlide === 'proximos_passos_downsell') return 92;
      return 50;
    }
    return Math.round(((index + 1) / slideOrder.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950 text-slate-100 flex flex-col overflow-y-auto">
      
      {/* Header Fixo com Controles */}
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md border-b border-dark-800 px-6 py-4 flex flex-col justify-between relative">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse"></div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">{lead.name}</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                Reunião Estratégica • {lead.profile}
              </p>
            </div>
          </div>

          {/* Indicador de Sincronização e Fechar */}
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-[10px] text-gold-500 flex items-center gap-1 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Sincronizando...
              </span>
            )}

            <button
              onClick={() => {
                if (window.confirm('Deseja realmente encerrar a apresentação e retornar ao painel?')) {
                  onClose();
                }
              }}
              className="p-2 bg-dark-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors border border-dark-700"
              title="Fechar apresentação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso Sutil Horizontal no topo (grudada abaixo do header) */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[3px] bg-dark-950 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold-600 via-amber-500 to-gold-400 transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercent()}%` }}
          ></div>
        </div>
      </header>

      {/* Container Principal da Apresentação (Aumentado a largura máxima para max-w-7xl ou 90vw para usar mais espaço da tela) */}
      <main className="flex-1 max-w-[90vw] xl:max-w-[1300px] w-full mx-auto p-4 md:p-8 flex flex-col justify-center my-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            
            {/* TELA 1: INTRODUÇÃO / CAPA */}
            {currentSlide === 'intro' && (
              <div 
                className="relative min-h-[75vh] md:min-h-[78vh] rounded-3xl overflow-hidden flex flex-col justify-between p-8 md:p-16 border border-dark-800 bg-cover bg-center shadow-2xl shadow-gold-500/5 transition-all duration-700"
                style={{ backgroundImage: `linear-gradient(rgba(9, 9, 11, 0.45), rgba(9, 9, 11, 0.95)), url(${DIAGNOSTICO_BG})` }}
              >
                <div className="space-y-5 max-w-3xl mt-12 md:mt-20">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-500" />
                    Apresentação de Alto Padrão
                  </div>
                  <h1 className="font-serif font-extrabold text-5xl md:text-7xl lg:text-8xl text-white tracking-tight drop-shadow-lg leading-none">
                    Consultoria <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-amber-500 to-gold-400">
                      Financeira
                    </span>
                  </h1>
                  <p className="text-gray-350 text-base md:text-lg lg:text-xl max-w-xl font-light leading-relaxed">
                    Uma experiência de transformação e controle patrimonial sob medida para sua realidade.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 md:mt-16 border-t border-dark-800/40 pt-6">
                  <button
                    onClick={() => navigateTo('do_que_se_trata')}
                    className="w-full sm:w-auto px-10 py-4.5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-xl shadow-gold-500/10 hover:shadow-gold-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 uppercase tracking-widest text-xs"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Conversa
                  </button>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest text-center sm:text-left">
                    Use os botões inferiores ou as ações de tela para navegar.
                  </p>
                </div>
              </div>
            )}

            {/* TELA 2: DO QUE SE TRATA A CONSULTORIA (NOVO SLIDE) */}
            {currentSlide === 'do_que_se_trata' && (
              <div className="space-y-8 md:space-y-12">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Conceito</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">Do que se trata a Consultoria?</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                    Mais do que relatórios e planilhas de investimentos, a consultoria é focada em construir uma nova visão de prosperidade.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
                  {/* Card 1 */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 hover:border-gold-500/30 p-6 md:p-8 rounded-3xl space-y-5 transition-all duration-300 shadow-xl group">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">Relação com o Dinheiro</h3>
                      <p className="text-gray-450 text-sm font-light leading-relaxed">
                        Ir na raiz do comportamento de consumo. Aprender a planejar os gastos de forma que o dinheiro sirva aos seus valores e objetivos, sem culpa ou restrições extremas.
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 hover:border-gold-500/30 p-6 md:p-8 rounded-3xl space-y-5 transition-all duration-300 shadow-xl group">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">Melhores Decisões</h3>
                      <p className="text-gray-450 text-sm font-light leading-relaxed">
                        Ter clareza analítica em cada escolha patrimonial. Saber avaliar juros, oportunidades de crédito, financiamentos, seguros e investimentos ideais de maneira autônoma.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 hover:border-gold-500/30 p-6 md:p-8 rounded-3xl space-y-5 transition-all duration-300 shadow-xl group">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">Qualidade de Vida</h3>
                      <p className="text-gray-450 text-sm font-light leading-relaxed">
                        Garantir paz mental e segurança familiar. Ter um fluxo financeiro estruturado que permita deitar a cabeça no travesseiro sabendo que o futuro está sob controle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('objetivo_conversa')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Objetivo da Conversa
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TELA 3: OBJETIVO PRINCIPAL DA CONVERSA (NOVO SLIDE) */}
            {currentSlide === 'objetivo_conversa' && (
              <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Direcionamento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">Nosso Objetivo de Hoje</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                    Antes de apresentar qualquer solução prática, precisamos entender o cenário completo.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 items-center">
                  
                  {/* Lado Esquerdo - Mensagem Principal */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-4 text-gray-300 font-light text-sm md:text-base leading-relaxed">
                      <h3 className="text-xl md:text-2xl font-serif text-white font-bold">
                        Como vamos construir a sua solução?
                      </h3>
                      <p>
                        Para entregar um plano de ação que funcione na prática, eu vou precisar entender a fundo como está estruturada a sua vida financeira hoje.
                      </p>
                      <p>
                        Juntos, vamos analisar se existem problemas crônicos envolvendo dinheiro, compreender quais desafios você enfrenta no cotidiano, as áreas específicas que deseja melhorar e o tamanho das suas metas patrimoniais.
                      </p>
                      <p className="text-gold-400 font-semibold">
                        Com este diagnóstico preciso, conseguiremos direcionar o método exatamente para o que se encaixa na sua realidade.
                      </p>
                    </div>
                  </div>

                  {/* Lado Direito - Blocos de Diagnóstico (Visualmente elegante) */}
                  <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                    <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/20 transition-all shadow-md">
                      <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-bold shrink-0">
                        01
                      </div>
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold">Diagnóstico</h4>
                        <p className="text-xs text-white font-medium">Mapear a Vida Financeira Atual</p>
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/20 transition-all shadow-md">
                      <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-bold shrink-0">
                        02
                      </div>
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold">Identificação</h4>
                        <p className="text-xs text-white font-medium">Pontuar Problemas e Gargalos</p>
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/20 transition-all shadow-md">
                      <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-bold shrink-0">
                        03
                      </div>
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold">Planejamento</h4>
                        <p className="text-xs text-white font-medium">Entender Desafios e Metas Ativas</p>
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-gold-500/20 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/30 transition-all shadow-lg">
                      <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-black shrink-0">
                        04
                      </div>
                      <div>
                        <h4 className="text-xs text-gold-500 uppercase tracking-widest font-black">Entrega</h4>
                        <p className="text-xs text-white font-black">Direcionamento sob Medida</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('institucional')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Ver Roteiro do Encontro
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TELA 4: ALINHAMENTO INSTITUCIONAL ("Como será a nossa jornada hoje?") */}
            {currentSlide === 'institucional' && (
              <div className="space-y-8 md:space-y-12">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Roteiro</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">Como será a nossa jornada hoje?</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                    O alinhamento é a chave para o sucesso. Nosso encontro tem uma agenda clara para construirmos a sua clareza financeira.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">1. Alinhamento de Visão</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Entender os seus objetivos prioritários de vida e mapear o que realmente importa para você e sua família no curto e longo prazo.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">2. Diagnóstico Técnico</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Confirmar e aprofundar os seus dados financeiros de maneira ética e segura para termos a real dimensão dos desafios e oportunidades.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">3. Plano de Decisão</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Apresentar as ferramentas e o método de acompanhamento estruturado para decidir o melhor caminho a seguir na sua organização.
                    </p>
                  </div>
                </div>

                <div className="bg-gold-500/5 border border-gold-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between mt-8">
                  <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-white font-bold text-sm">Nosso Objetivo Principal</h4>
                    <p className="text-gray-400 text-xs font-light">
                      Fazer com que você saia desta reunião com um norte claro e absoluto sobre a sua vida financeira.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('confirmacao_dados')}
                    className="px-6 py-3 bg-dark-800 hover:bg-dark-750 text-gold-500 hover:text-gold-400 border border-dark-700 hover:border-gold-500/20 font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
                  >
                    Avançar para Diagnóstico
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 5: CONFIRMAÇÃO DE DADOS EXISTENTES */}
            {currentSlide === 'confirmacao_dados' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Dados Captados</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Validação de Diagnóstico Inicial</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Confirmemos as informações coletadas no seu formulário de perfil para garantir a precisão da consultoria.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider border-b border-dark-800 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold-500" />
                    Ficha do Perfil de {lead.name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Desafio Prioritário</p>
                      <p className="text-sm text-white font-medium italic">"{lead.answers.mainProblem}"</p>
                    </div>

                    <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Situação Financeira Atual</p>
                      <p className="text-sm text-gold-500 font-semibold">{lead.answers.financialState}</p>
                    </div>

                    <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Renda Mensal Declarada</p>
                      <p className="text-sm text-white font-medium">{lead.answers.incomeRange}</p>
                    </div>

                    <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Profissão e Família</p>
                      <p className="text-sm text-white font-medium">
                        {lead.answers.profession} • {lead.answers.spouse} • {lead.answers.children}
                      </p>
                    </div>

                    <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Meta / Objetivo Financeiro</p>
                      <p className="text-sm text-white font-medium">{lead.answers.goals}</p>
                    </div>

                    <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Decisão e Comprometimento</p>
                      <p className="text-sm text-white font-medium">
                        Comprometimento: <span className="text-gold-500 font-bold">{lead.answers.commitmentScale || '0'}/10</span>
                        {lead.answers.dependsOnOthers === 'Sim' && ' • Depende de cônjuge/sócio'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('coleta_informacoes')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Aprofundar Diagnóstico (Coleta)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 6: COLETA DE NOVAS INFORMAÇÕES (INTERATIVO) */}
            {currentSlide === 'coleta_informacoes' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Aprofundamento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Coleta de Informações Estratégicas</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    O consultor deve preencher as respostas adicionais em conjunto com o cliente durante a conversa. Elas serão salvas no banco de dados.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  
                  {/* Pergunta 1: Maior Ralo Financeiro */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                      1. Qual é o seu maior ralo financeiro hoje (desperdício)?
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Assinaturas não usadas, saídas excessivas, falta de limite no cartão..."
                      value={meetingAnswers.biggestWaste}
                      onChange={(e) => handleInputChange('biggestWaste', e.target.value)}
                      className="w-full bg-dark-950 border border-dark-800 hover:border-dark-700 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pergunta 2: Capacidade de Poupança */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                        2. Quanto consegue poupar de forma consistente hoje?
                      </label>
                      <select
                        value={meetingAnswers.monthlySavings}
                        onChange={(e) => handleInputChange('monthlySavings', e.target.value)}
                        className="w-full bg-dark-950 border border-dark-800 hover:border-dark-700 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all cursor-pointer font-medium"
                      >
                        <option value="">Selecione...</option>
                        <option value="Nada / Fico no zero a zero">Nada / Fico no zero a zero</option>
                        <option value="Menos de R$ 300 por mês">Menos de R$ 300 por mês</option>
                        <option value="R$ 300 a R$ 1.000 por mês">R$ 300 a R$ 1.000 por mês</option>
                        <option value="R$ 1.000 a R$ 3.000 por mês">R$ 1.000 a R$ 3.000 por mês</option>
                        <option value="Acima de R$ 3.000 por mês">Acima de R$ 3.000 por mês</option>
                      </select>
                    </div>

                    {/* Pergunta 3: Prioridade Financeira */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                        3. Qual é o seu objetivo financeiro prioritário?
                      </label>
                      <select
                        value={meetingAnswers.financialPriority}
                        onChange={(e) => handleInputChange('financialPriority', e.target.value)}
                        className="w-full bg-dark-950 border border-dark-800 hover:border-dark-700 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all cursor-pointer font-medium"
                      >
                        <option value="">Selecione...</option>
                        <option value="Montar Reserva de Emergência">Montar Reserva de Emergência</option>
                        <option value="Sair das Dívidas / Organização Básica">Sair das Dívidas / Organização Básica</option>
                        <option value="Começar a Investir Inteligente">Começar a Investir Inteligente</option>
                        <option value="Acelerar Patrimônio e Liberdade">Acelerar Patrimônio e Liberdade</option>
                        <option value="Planejamento de Aposentadoria / Sucessão">Planejamento de Aposentadoria / Sucessão</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-dark-800/60 pt-6">
                    {/* Pergunta 4: Reserva de Emergência */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                        4. Possui reserva financeira de emergência?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleInputChange('hasReserve', 'Sim')}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${meetingAnswers.hasReserve === 'Sim'
                            ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-md'
                            : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-755 hover:text-gray-400'
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('hasReserve', 'Não');
                            handleInputChange('reserveMonths', '');
                          }}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${meetingAnswers.hasReserve === 'Não'
                            ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-md'
                            : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-755 hover:text-gray-400'
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    </div>

                    {/* Pergunta 4.1: Condicional de meses da reserva */}
                    {meetingAnswers.hasReserve === 'Sim' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gold-500 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                          Quantos meses do seu custo de vida ela cobre?
                        </label>
                        <select
                          value={meetingAnswers.reserveMonths}
                          onChange={(e) => handleInputChange('reserveMonths', e.target.value)}
                          className="w-full bg-dark-950 border border-gold-500/30 text-white rounded-xl p-4 text-sm outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
                        >
                          <option value="">Selecione...</option>
                          <option value="Menos de 1 mês">Menos de 1 mês</option>
                          <option value="1 a 3 meses">1 a 3 meses</option>
                          <option value="3 a 6 meses">3 a 6 meses</option>
                          <option value="Mais de 6 meses">Mais de 6 meses</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Pergunta 5: Comprometimento Semanal */}
                  <div className="space-y-2 border-t border-dark-800/60 pt-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                      5. Quantas horas semanais você está disposto a dedicar ao seu planejamento financeiro?
                    </label>
                    <select
                      value={meetingAnswers.timeCommitment}
                      onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                      className="w-full bg-dark-950 border border-dark-800 hover:border-dark-700 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="">Selecione...</option>
                      <option value="Menos de 1 hora por semana">Menos de 1 hora por semana</option>
                      <option value="1 a 2 horas por semana (Ideal e Recomendado)">1 a 2 horas por semana (Ideal e Recomendado)</option>
                      <option value="2 a 4 horas por semana">2 a 4 horas por semana</option>
                      <option value="Mais de 4 horas por semana">Mais de 4 horas por semana</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveAndNavigate('adequacao')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Salvar e Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 7: ADEQUAÇÃO / FIT */}
            {currentSlide === 'adequacao' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Público Alvo</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">A Consultoria é adequada para você?</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Buscamos trabalhar com clientes focados na transformação de longo prazo. Entenda onde a solução gera maior valor.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Para quem serve */}
                  <div className="bg-dark-900 border border-gold-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-gold-400 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Para quem a Consultoria é perfeita:
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300 font-light">
                      <li className="flex items-start gap-2">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        Profissionais liberais e CLT com boa renda que sentem que o dinheiro sumiu no final do mês.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        Pessoas que desejam construir uma reserva de emergência e começar a investir sem perder tempo.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        Famílias que buscam alinhar os planos do casal e dar segurança estruturada aos filhos.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        Quem valoriza tempo e quer um método passo a passo com suporte profissional diário.
                      </li>
                    </ul>
                  </div>

                  {/* Problemas que resolve */}
                  <div className="bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                      Principais gargalos que eliminamos:
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300 font-light">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold shrink-0 mt-0.5">•</span>
                        <strong>Desorganização Invisível</strong>: Falta de rastreabilidade de gastos e limites no cartão de crédito.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold shrink-0 mt-0.5">•</span>
                        <strong>Insegurança Futura</strong>: Ausência de uma reserva sólida para imprevistos de saúde ou trabalho.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold shrink-0 mt-0.5">•</span>
                        <strong>Paralisia de Análise</strong>: Não saber qual investimento escolher para as metas prioritárias.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold shrink-0 mt-0.5">•</span>
                        <strong>Procrastinação Financeira</strong>: Adiar a organização por falta de cobrança positiva e suporte.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('provas_sociais')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Ver Provas Sociais
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 8: PROVAS SOCIAIS */}
            {currentSlide === 'provas_sociais' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Resultados</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Casos de Sucesso e Transformação</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Veja os resultados práticos de clientes que seguiram o método estruturado de consultoria patrimonial.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {/* Caso 1 */}
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                    <div className="h-44 bg-dark-950 flex items-center justify-center border-b border-dark-850 relative text-gray-500">
                      <span className="text-xs font-mono uppercase tracking-wider text-gray-600 flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8" />
                        [Foto/Resultado Cliente 1]
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h4 className="text-base font-bold text-white">Carlos & Mariana (Médico & Advogada)</h4>
                      <p className="text-xs text-gold-500 font-bold uppercase tracking-wider">Resultado: Reserva de R$ 50k em 6 meses</p>
                      <p className="text-xs text-gray-400 font-light leading-relaxed italic">
                        "Mesmo com alta renda, estávamos sempre zerados no fim do mês. A consultoria nos trouxe regras claras e paz no orçamento."
                      </p>
                    </div>
                  </div>

                  {/* Caso 2 */}
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                    <div className="h-44 bg-dark-950 flex items-center justify-center border-b border-dark-850 relative text-gray-500">
                      <span className="text-xs font-mono uppercase tracking-wider text-gray-600 flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8" />
                        [Foto/Resultado Cliente 2]
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h4 className="text-base font-bold text-white">Fernanda Ramos (Designer Autônoma)</h4>
                      <p className="text-xs text-gold-500 font-bold uppercase tracking-wider">Resultado: Quitação de R$ 35k em dívidas</p>
                      <p className="text-xs text-gray-400 font-light leading-relaxed italic">
                        "Eu vivia no cheque especial por desorganização do fluxo de caixa. Com o método, estruturei minhas contas físicas e jurídicas."
                      </p>
                    </div>
                  </div>

                  {/* Caso 3 */}
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                    <div className="h-44 bg-dark-950 flex items-center justify-center border-b border-dark-850 relative text-gray-500">
                      <span className="text-xs font-mono uppercase tracking-wider text-gray-600 flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8" />
                        [Foto/Resultado Cliente 3]
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h4 className="text-base font-bold text-white">Rodrigo Almeida (Gerente Geral)</h4>
                      <p className="text-xs text-gold-500 font-bold uppercase tracking-wider">Resultado: Primeiros R$ 100k Investidos</p>
                      <p className="text-xs text-gray-400 font-light leading-relaxed italic">
                        "Sabia poupar, mas tinha pânico de perder na bolsa. A carteira recomendada na consultoria me deu segurança para investir sério."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('como_ajuda')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Como a Consultoria Ajuda
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 9: COMO A CONSULTORIA AJUDA */}
            {currentSlide === 'como_ajuda' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">O Processo</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Como a Consultoria gera valor prático?</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    O nosso trabalho é estruturado em fases integradas para que a organização financeira ocorra com naturalidade e consistência.
                  </p>
                </div>

                <div className="space-y-6 pt-4 max-w-4xl mx-auto">
                  <div className="flex items-start gap-4 p-5 bg-dark-900 border border-dark-800 rounded-2xl">
                    <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-extrabold text-sm flex items-center justify-center shrink-0 border border-gold-500/20">
                      1
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Diagnóstico e Bloqueio de Gargalos</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Mapeamos todas as despesas invisíveis e ralo de cartões para recuperar de 10% a 20% do seu orçamento mensal na primeira semana sem alterar o seu padrão de vida.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-dark-900 border border-dark-800 rounded-2xl">
                    <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-extrabold text-sm flex items-center justify-center shrink-0 border border-gold-500/20">
                      2
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Autorregulação e Orçamento Inteligente</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Desenhamos regras de alocação de acordo com suas metas. Criamos contas distintas e automatizamos processos para que você gaste com tranquilidade e poupe com segurança.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-dark-900 border border-dark-800 rounded-2xl">
                    <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-extrabold text-sm flex items-center justify-center shrink-0 border border-gold-500/20">
                      3
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Recomendação de Portfólio Personalizado</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Direcionamos você para os investimentos ideais para sua reserva de emergência e metas de curto/médio prazo. Chega de dúvidas sobre Tesouro Direto, CDBs ou fundos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-dark-900 border border-dark-800 rounded-2xl">
                    <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-extrabold text-sm flex items-center justify-center shrink-0 border border-gold-500/20">
                      4
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Acompanhamento e Suporte de Rotina</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Temos reuniões quinzenais para ajustes finos e suporte direto no WhatsApp para tirar dúvidas de decisões imediatas (ex: comprar à vista ou parcelado, avaliar propostas de seguros).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('como_funciona')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Ver Entregáveis e Benefícios
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 10: COMO FUNCIONA / BENEFÍCIOS */}
            {currentSlide === 'como_funciona' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Entregáveis</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Tudo o que você recebe</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    A estrutura de acompanhamento que garante a execução prática sem procrastinação.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="p-6 bg-dark-900 border border-dark-800 rounded-3xl flex items-start gap-4">
                    <span className="p-3 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20 shadow-inner">
                      <Check className="w-5 h-5" />
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white">4 Sessões Individuais Online</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Encontros individuais focados em implementar o plano, analisar o orçamento atual e sugerir soluções rápidas para otimizar os seus ganhos.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-dark-900 border border-dark-800 rounded-3xl flex items-start gap-4">
                    <span className="p-3 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20 shadow-inner">
                      <Check className="w-5 h-5" />
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white">Suporte Diário via WhatsApp</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Canal direto com o seu consultor para validar dúvidas, envio de alertas de contas e auxílio na tomada de decisão financeira rápida do dia a dia.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-dark-900 border border-dark-800 rounded-3xl flex items-start gap-4">
                    <span className="p-3 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20 shadow-inner">
                      <Check className="w-5 h-5" />
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white">Planilhas e Dashboards de Bordo</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Ferramentas limpas e automatizadas criadas sob medida para o controle de fluxo de caixa sem a complexidade de sistemas robustos e demorados.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-dark-900 border border-dark-800 rounded-3xl flex items-start gap-4">
                    <span className="p-3 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20 shadow-inner">
                      <Check className="w-5 h-5" />
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white">Relatório de Recomendações</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Documento oficial contendo o diagnóstico de gargalos, plano estratégico de metas e carteira recomendada para a sua segurança de investimentos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('decisao_matrix')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Avançar para a Decisão
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 11: DECISÃO MATRIX */}
            {currentSlide === 'decisao_matrix' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Reflexão</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">O Momento da Escolha</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Assim como no Matrix, você se depara com duas realidades possíveis para a sua vida financeira daqui para frente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Pílula Azul */}
                  <button
                    onClick={() => {
                      handleInputChange('matrixDecision', 'blue');
                      navigateTo('confirmacao_sentido');
                    }}
                    className={`p-6 md:p-8 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between space-y-6 ${meetingAnswers.matrixDecision === 'blue'
                      ? 'bg-blue-950/20 border-blue-500/80 shadow-2xl shadow-blue-500/10'
                      : 'bg-dark-900 border-dark-800 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-blue-400">Pílula Azul: Continuar como está</h3>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Ignorar a desorganização invisível, continuar sem saber para onde o dinheiro está indo, manter a insegurança de não ter reserva sólida e adiar o sonho dos investimentos por mais tempo.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest pt-4">
                      Escolher esta opção
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Pílula Vermelha */}
                  <button
                    onClick={() => {
                      handleInputChange('matrixDecision', 'red');
                      navigateTo('confirmacao_sentido');
                    }}
                    className={`p-6 md:p-8 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between space-y-6 ${meetingAnswers.matrixDecision === 'red'
                      ? 'bg-red-950/20 border-red-500/80 shadow-2xl shadow-red-500/10'
                      : 'bg-dark-900 border-dark-800 hover:border-red-500/30'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-red-400">Pílula Vermelha: Seguir com Método</h3>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Tomar as rédeas do patrimônio, usar um método validado passo a passo, contar com suporte de um especialista diário, investir com segurança e conquistar tranquilidade e liberdade financeira real.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest pt-4">
                      Escolher esta opção
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 12: CONFIRMAÇÃO INTERATIVA */}
            {currentSlide === 'confirmacao_sentido' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Confirmação</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Essa solução faz sentido para você?</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light">
                    O caminho da pílula vermelha exige comprometimento. Deseja seguir com a transformação da sua vida financeira hoje?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {/* RESPOSTA SIM */}
                  <button
                    onClick={async () => {
                      handleInputChange('initialSolutionSense', 'Sim');
                      await saveToSupabase({
                        ...meetingAnswers,
                        initialSolutionSense: 'Sim'
                      });
                      navigateTo('reforco_valor');
                    }}
                    className={`p-6 rounded-2xl border text-center transition-all duration-300 font-bold ${meetingAnswers.initialSolutionSense === 'Sim'
                      ? 'bg-gold-500/10 border-gold-500 text-gold-400 shadow-xl'
                      : 'bg-dark-900 border-dark-800 text-gray-300 hover:border-gold-500/30 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                    <span className="block text-base">Sim, faz total sentido!</span>
                    <span className="text-[10px] text-gray-500 font-light block mt-1">Desejo iniciar a transformação hoje.</span>
                  </button>

                  {/* RESPOSTA NÃO */}
                  <button
                    onClick={async () => {
                      handleInputChange('initialSolutionSense', 'Não');
                      await saveToSupabase({
                        ...meetingAnswers,
                        initialSolutionSense: 'Não'
                      });
                      navigateTo('agradecimento_final');
                    }}
                    className={`p-6 rounded-2xl border text-center transition-all duration-300 font-bold ${meetingAnswers.initialSolutionSense === 'Não'
                      ? 'bg-red-500/10 border-red-500 text-red-400 shadow-xl'
                      : 'bg-dark-900 border-dark-800 text-gray-300 hover:border-red-500/30 hover:text-white'
                    }`}
                  >
                    <X className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <span className="block text-base">Não quero seguir agora.</span>
                    <span className="text-[10px] text-gray-500 font-light block mt-1">Prefiro continuar no caminho atual.</span>
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 13: REFORÇO DE VALOR */}
            {currentSlide === 'reforco_valor' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Alinhamento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Valor vs. Preço</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
                    Antes de apresentarmos os números do investimento, é fundamental reforçar que o principal objetivo desta consultoria é gerar <strong>resultados reais e duradouros</strong>.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-lg text-sm text-gray-300 font-light leading-relaxed">
                  <p>
                    O valor da consultoria deve ser visto como uma <strong>ferramenta de retorno financeiro</strong>. A média dos nossos mentorados recupera o valor do investimento nas primeiras 6 a 8 semanas, apenas bloqueando perdas invisíveis que mapeamos no diagnóstico.
                  </p>
                  <p>
                    Queremos que esse passo seja <strong>totalmente saudável</strong> dentro do seu orçamento, gerando fôlego de caixa imediatamente, e não mais preocupações.
                  </p>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => navigateTo('investimento_padrao')}
                    className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Conhecer Investimento
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 14: PREÇO PADRÃO */}
            {currentSlide === 'investimento_padrao' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Investimento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Consultoria Estruturada</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Escolha a opção de pagamento que melhor se adequa ao seu planejamento atual.
                  </p>
                </div>

                <div className="bg-dark-900 border border-gold-500/20 max-w-lg mx-auto rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">
                  <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gold-500 text-dark-950 text-[10px] font-black rounded-full uppercase tracking-widest">
                    Melhor Opção
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm text-gray-500 uppercase tracking-widest font-bold">Programa Completo</h4>
                    <div className="text-3xl md:text-4xl font-serif font-extrabold text-white">
                      12x de <span className="text-gold-500">R$ 61,74</span>
                    </div>
                    <p className="text-xs text-gray-400 font-light">ou R$ 597 à vista com desconto especial</p>
                  </div>

                  <ul className="text-xs text-gray-400 space-y-2 py-4 border-t border-b border-dark-800 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      4 Sessões Individuais e Online
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Suporte via WhatsApp por 60 dias
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Planilhas e Material Didático
                    </li>
                  </ul>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* À Vista */}
                    <button
                      onClick={async () => {
                        handleInputChange('investmentChoice', 'Vista');
                        await saveToSupabase({
                          ...meetingAnswers,
                          investmentChoice: 'Vista'
                        });
                        navigateTo('proximos_passos');
                      }}
                      className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-dark-950 font-black rounded-xl transition-all uppercase tracking-widest text-[11px]"
                    >
                      Seguir com Pagamento à Vista
                    </button>

                    {/* Parcelado */}
                    <button
                      onClick={async () => {
                        handleInputChange('investmentChoice', 'Parcelado');
                        await saveToSupabase({
                          ...meetingAnswers,
                          investmentChoice: 'Parcelado'
                        });
                        navigateTo('proximos_passos');
                      }}
                      className="w-full py-3.5 bg-dark-800 hover:bg-dark-750 text-white font-bold rounded-xl border border-dark-700 hover:border-gold-500/20 transition-all uppercase tracking-widest text-[11px]"
                    >
                      Seguir com Pagamento Parcelado
                    </button>

                    {/* Recusou */}
                    <button
                      onClick={async () => {
                        handleInputChange('investmentChoice', 'Recusou');
                        await saveToSupabase({
                          ...meetingAnswers,
                          investmentChoice: 'Recusou'
                        });
                        navigateTo('condicao_especial');
                      }}
                      className="w-full py-2.5 text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest text-[9px] font-bold"
                    >
                      Não é viável neste valor
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 15: CONDIÇÃO ESPECIAL */}
            {currentSlide === 'condicao_especial' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono">Negociação</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Condição Especial Sob Medida</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Existem situações onde abrimos vagas especiais com menor suporte ou em projetos pilotos para viabilizar o orçamento do cliente.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 max-w-lg mx-auto rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">
                  
                  <div className="p-4 bg-dark-950 rounded-xl border border-dark-850 text-left space-y-2 text-xs text-gray-300 font-light">
                    <p className="font-bold text-white text-sm">Condição Especial: Vaga Estrutural</p>
                    <p>
                      Para viabilizar a sua entrada agora, podemos flexibilizar a mentoria. A entrega será feita com encontros em grupo ou reduziremos para 2 encontros de onboarding individual mais acompanhamento simplificado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm text-gray-500 uppercase tracking-widest font-bold">Investimento Promocional</h4>
                    <div className="text-3xl md:text-4xl font-serif font-extrabold text-gold-400">
                      Entrada de R$ 147 + 1x de R$ 450
                    </div>
                    <p className="text-xs text-gray-400 font-light">ou parcelado em Boleto em até 3x de R$ 210</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* Aceitou à Vista */}
                    <button
                      onClick={async () => {
                        handleInputChange('negotiationChoice', 'Vista');
                        await saveToSupabase({
                          ...meetingAnswers,
                          negotiationChoice: 'Vista'
                        });
                        navigateTo('proximos_passos');
                      }}
                      className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-dark-950 font-black rounded-xl transition-all uppercase tracking-widest text-[11px]"
                    >
                      Aceitar Condição Especial (Entrada + 1x)
                    </button>

                    {/* Aceitou Parcelado */}
                    <button
                      onClick={async () => {
                        handleInputChange('negotiationChoice', 'Parcelado');
                        await saveToSupabase({
                          ...meetingAnswers,
                          negotiationChoice: 'Parcelado'
                        });
                        navigateTo('proximos_passos');
                      }}
                      className="w-full py-3.5 bg-dark-800 hover:bg-dark-750 text-white font-bold rounded-xl border border-dark-700 hover:border-gold-500/20 transition-all uppercase tracking-widest text-[11px]"
                    >
                      Aceitar Condição Especial (Boleto Parcelado)
                    </button>

                    {/* Ainda Não */}
                    <button
                      onClick={async () => {
                        handleInputChange('negotiationChoice', 'Recusou');
                        await saveToSupabase({
                          ...meetingAnswers,
                          negotiationChoice: 'Recusou'
                        });
                        navigateTo('downsell');
                      }}
                      className="w-full py-2.5 text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest text-[9px] font-bold"
                    >
                      Ainda não é viável para mim
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 16: DOWNSELL */}
            {currentSlide === 'downsell' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Produto de Entrada</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Sessão Expresso de Direcionamento</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Uma alternativa mais acessível para dar os primeiros passos e estruturar suas metas imediatas de organização.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 max-w-lg mx-auto rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">
                  
                  <div className="p-4 bg-dark-950 rounded-xl border border-dark-850 text-left space-y-2 text-xs text-gray-300 font-light">
                    <p className="font-bold text-white text-sm">Entrega do Produto Expresso</p>
                    <p>
                      Consiste em 1 única sessão individual de 1h30m focado puramente em estancar vazamento de caixa, mais a planilha automatizada para controle. Sem suporte diário, mas com direcionamento prático.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm text-gray-500 uppercase tracking-widest font-bold">Investimento Acessível</h4>
                    <div className="text-3xl md:text-4xl font-serif font-extrabold text-white">
                      R$ 197 <span className="text-xs text-gray-400 font-light">à vista</span>
                    </div>
                    <p className="text-xs text-gray-400 font-light">ou parcelado no cartão em até 3x de R$ 71,22</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* Aceitou à Vista */}
                    <button
                      onClick={async () => {
                        handleInputChange('downsellChoice', 'Vista');
                        await saveToSupabase({
                          ...meetingAnswers,
                          downsellChoice: 'Vista'
                        });
                        navigateTo('proximos_passos_downsell');
                      }}
                      className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-dark-950 font-black rounded-xl transition-all uppercase tracking-widest text-[11px]"
                    >
                      Adquirir Sessão Expresso (À Vista)
                    </button>

                    {/* Aceitou Parcelado */}
                    <button
                      onClick={async () => {
                        handleInputChange('downsellChoice', 'Parcelado');
                        await saveToSupabase({
                          ...meetingAnswers,
                          downsellChoice: 'Parcelado'
                        });
                        navigateTo('proximos_passos_downsell');
                      }}
                      className="w-full py-3.5 bg-dark-800 hover:bg-dark-750 text-white font-bold rounded-xl border border-dark-700 hover:border-gold-500/20 transition-all uppercase tracking-widest text-[11px]"
                    >
                      Adquirir Sessão Expresso (Parcelado)
                    </button>

                    {/* Recusou definitivo */}
                    <button
                      onClick={async () => {
                        handleInputChange('downsellChoice', 'Recusou');
                        await saveToSupabase({
                          ...meetingAnswers,
                          downsellChoice: 'Recusou'
                        });
                        navigateTo('agradecimento_final');
                      }}
                      className="w-full py-2.5 text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest text-[9px] font-bold"
                    >
                      Prefiro não seguir agora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 17: PRÓXIMOS PASSOS (FECHAMENTO PADRÃO / ESPECIAL) */}
            {currentSlide === 'proximos_passos' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Boas Vindas</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Próximos Passos</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light">
                    Parabéns pela decisão de iniciar sua consultoria! O seu caminho para a transformação começa agora.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="grid grid-cols-1 gap-6 text-sm">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        1
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Aprovação do Link de Pagamento</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          O consultor enviará o link correspondente à opção escolhida (à vista ou parcelado) para aprovação e transação segura.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        2
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Contrato e Onboarding</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Você receberá por e-mail/WhatsApp o contrato digital de prestação de serviços e o questionário complementar de onboarding.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        3
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Agendamento da 1ª Sessão</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Bloquearemos na agenda o horário da sua primeira sessão oficial para iniciarmos o mapeamento detalhado dos gargalos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => navigateTo('agradecimento_final')}
                    className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Encerrar Reunião
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 18: PRÓXIMOS PASSOS (DOWNSELL) */}
            {currentSlide === 'proximos_passos_downsell' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Boas Vindas</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Próximos Passos da Sessão Expresso</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light">
                    Parabéns pela decisão de iniciar sua organização financeira com o direcionamento expresso!
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="grid grid-cols-1 gap-6 text-sm">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        1
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Link de Pagamento (R$ 197)</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Enviaremos o link para transação do produto simplificado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        2
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Agendamento de Data Única</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Faremos o agendamento da nossa sessão individual de 1h30m focada em planilhamento rápido.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        3
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Entrega de Planilha de Apoio</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Você receberá a planilha de controle de fluxo de caixa diretamente no seu WhatsApp antes do encontro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => navigateTo('agradecimento_final')}
                    className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Encerrar Reunião
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 19: TELA FINAL DE AGRADECIMENTO */}
            {currentSlide === 'agradecimento_final' && (
              <div className="space-y-8 max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Encerramento</h3>
                  <h1 className="font-serif font-bold text-4xl md:text-5xl text-white">Muito obrigado pela conversa!</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto">
                    Agradeço imensamente pelo seu tempo e pela confiança em compartilhar a sua realidade. Nosso canal de comunicação continuará sempre aberto para novas oportunidades e dúvidas.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onClose}
                    className="px-8 py-4 bg-dark-800 hover:bg-dark-750 text-gold-500 hover:text-gold-400 border border-dark-700 hover:border-gold-500/20 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                  >
                    Voltar ao Painel de Leads
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer sticky de Navegação Fina */}
      <footer className="sticky bottom-0 z-30 bg-dark-900/90 backdrop-blur-md border-t border-dark-800 px-6 py-4 flex items-center justify-between">
        
        {/* Botão de Voltar */}
        <button
          onClick={navigateBack}
          disabled={slideHistory.length === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-200 ${slideHistory.length === 0
            ? 'bg-dark-950 border-dark-900 text-gray-750 cursor-not-allowed'
            : 'bg-dark-800 hover:bg-dark-750 border-dark-700 text-gray-300 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Indicador de Passo Atual */}
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">
          Etapa: {currentSlide}
        </span>

        {/* Botão de Avançar */}
        {currentSlide !== 'agradecimento_final' && 
         currentSlide !== 'confirmacao_sentido' && 
         currentSlide !== 'investimento_padrao' && 
         currentSlide !== 'condicao_especial' && 
         currentSlide !== 'downsell' && 
         currentSlide !== 'proximos_passos' && 
         currentSlide !== 'proximos_passos_downsell' ? (
          <button
            onClick={() => {
              if (currentSlide === 'intro') {
                navigateTo('do_que_se_trata');
              } else if (currentSlide === 'do_que_se_trata') {
                navigateTo('objetivo_conversa');
              } else if (currentSlide === 'objetivo_conversa') {
                navigateTo('institucional');
              } else if (currentSlide === 'institucional') {
                navigateTo('confirmacao_dados');
              } else if (currentSlide === 'confirmacao_dados') {
                navigateTo('coleta_informacoes');
              } else if (currentSlide === 'coleta_informacoes') {
                handleSaveAndNavigate('adequacao');
              } else if (currentSlide === 'adequacao') {
                navigateTo('provas_sociais');
              } else if (currentSlide === 'provas_sociais') {
                navigateTo('como_ajuda');
              } else if (currentSlide === 'como_ajuda') {
                navigateTo('como_funciona');
              } else if (currentSlide === 'como_funciona') {
                navigateTo('decisao_matrix');
              } else if (currentSlide === 'decisao_matrix') {
                navigateTo('confirmacao_sentido');
              }
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-dark-950 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200"
          >
            Avançar
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-20"></div> // Placeholder para balancear o layout
        )}
      </footer>

    </div>
  );
};
