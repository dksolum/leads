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
    | 'coleta_informacoes_2'
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

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const [currentSlide, setCurrentSlide] = useState<SlideId>('intro');
  const [slideHistory, setSlideHistory] = useState<SlideId[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Controle de sub-passos na coleta de dados parte 1
  const [coletaStep, setColetaStep] = useState<number>(1);

  // Controle de sub-passos na decisão matrix
  const [matrixStep, setMatrixStep] = useState<number>(1);

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

    // Novos campos adicionados
    gastaMaisDoQueDeveria: lead.answers.meeting?.gastaMaisDoQueDeveria || '',
    comOQueGastaMais: lead.answers.meeting?.comOQueGastaMais || '',
    consegueGuardarDinheiro: lead.answers.meeting?.consegueGuardarDinheiro || '',
    guardaMensalmente: lead.answers.meeting?.guardaMensalmente || '',
    quantoGuardaMensalmente: lead.answers.meeting?.quantoGuardaMensalmente || '',
    quantoConseguiuGuardar: lead.answers.meeting?.quantoConseguiuGuardar || '',
    oQueImpedeDeGuardar: lead.answers.meeting?.oQueImpedeDeGuardar || '',
    quantoTemDeReserva: lead.answers.meeting?.quantoTemDeReserva || '',
    problemaAlemDoPrincipal: lead.answers.meeting?.problemaAlemDoPrincipal || '',
    quaisOutrosProblemas: lead.answers.meeting?.quaisOutrosProblemas || '',
    possuiDividas: lead.answers.meeting?.possuiDividas || '',
    dificuldadeLidarDividas: lead.answers.meeting?.dificuldadeLidarDividas || '',
    quaisDificuldadesDividas: lead.answers.meeting?.quaisDificuldadesDividas || '',
    possuiMetas: lead.answers.meeting?.possuiMetas || '',
    quaisTresMetas: lead.answers.meeting?.quaisTresMetas || '',
    porqueMetasImportantes: lead.answers.meeting?.porqueMetasImportantes || '',
    oQueFaltaParaDez: lead.answers.meeting?.oQueFaltaParaDez || '',
    vidaDaquiSeisMeses: lead.answers.meeting?.vidaDaquiSeisMeses || '',
    seisMesesAssustaOuConforta: lead.answers.meeting?.seisMesesAssustaOuConforta || '',
    animacaoResolverMetas: lead.answers.meeting?.animacaoResolverMetas || '',
    rotinaPoucoTempo: lead.answers.meeting?.rotinaPoucoTempo || '',

    // Finalidade do dinheiro guardado
    guardadoTemFinalidade: lead.answers.meeting?.guardadoTemFinalidade || '',
    guardadoQualFinalidade: lead.answers.meeting?.guardadoQualFinalidade || '',
  });

  // Função para formatar input para moeda brasileira (R$ 0,00) em tempo real
  const handleCurrencyChange = (field: keyof MeetingAnswers, rawValue: string) => {
    // Remove tudo o que não é dígito
    const digits = rawValue.replace(/\D/g, '');
    if (!digits) {
      setMeetingAnswers(prev => ({ ...prev, [field]: '' }));
      return;
    }

    // Converte para valor numérico
    const cents = parseInt(digits, 10);
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    setMeetingAnswers(prev => ({
      ...prev,
      [field]: formatted
    }));
  };

  const handleColetaNext = () => {
    if (coletaStep < 6) {
      setColetaStep(prev => prev + 1);
      scrollToTop();
    } else {
      handleSaveAndNavigate('coleta_informacoes_2');
    }
  };

  const handleColetaBack = () => {
    if (coletaStep > 1) {
      setColetaStep(prev => prev - 1);
      scrollToTop();
    } else {
      navigateBack();
    }
  };

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
    scrollToTop();
    if (nextSlide === 'decisao_matrix') {
      setMatrixStep(1);
    }
  };

  const navigateBack = () => {
    if (slideHistory.length > 0) {
      const previous = slideHistory[slideHistory.length - 1];
      setSlideHistory(prev => prev.slice(0, -1));
      setCurrentSlide(previous);
      scrollToTop();
      if (previous === 'decisao_matrix') {
        setMatrixStep(1);
      }
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
      'coleta_informacoes_2',
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
    <div ref={containerRef} className="fixed inset-0 z-50 bg-dark-950 text-slate-100 flex flex-col overflow-y-auto">

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
              onClick={() => setShowExitModal(true)}
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

      {/* Container Principal da Apresentação (Capa cheia na introdução e centralizado com largura máxima nas demais telas) */}
      <main className={currentSlide === 'intro' ? "flex-1 w-full flex flex-col justify-center overflow-hidden" : "flex-1 max-w-[90vw] xl:max-w-[1300px] w-full mx-auto p-4 md:p-8 flex flex-col justify-center my-6"}>
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
                className="relative w-full min-h-[calc(100vh-145px)] flex flex-col justify-between p-8 md:p-20 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `linear-gradient(rgba(9, 9, 11, 0.45), rgba(9, 9, 11, 0.95)), url(${DIAGNOSTICO_BG})` }}
              >
                <div className="space-y-5 max-w-3xl mt-12 md:mt-20">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-500" />
                    Apresentação Personalizada
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
                    Mais do que relatórios ou planilhas, a consultoria é focada em construir uma nova visão de prosperidade.
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

                {/* Seção: O que a Consultoria NÃO é apenas */}
                <div className="border-t border-dark-800/60 pt-8 mt-8 space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono text-center">
                    E o que a Consultoria NÃO é apenas:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Card Não 1 */}
                    <div className="bg-dark-900/40 backdrop-blur-sm border border-red-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg group hover:border-red-500/20 transition-all">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Apenas Investimentos</h3>
                        <p className="text-gray-450 text-sm font-light leading-relaxed">
                          Não é um serviço de recomendação cega de ações ou fundos. Focamos primeiro em estruturar sua base financeira e sua real capacidade de poupar.
                        </p>
                      </div>
                    </div>
                    {/* Card Não 2 */}
                    <div className="bg-dark-900/40 backdrop-blur-sm border border-red-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg group hover:border-red-500/20 transition-all">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Pagar Dívidas sem Método</h3>
                        <p className="text-gray-450 text-sm font-light leading-relaxed">
                          Não é só renegociar parcelas. É um plano estratégico para mudar sua relação com o consumo e cartões, blindando seu patrimônio para nunca mais voltar a dever.
                        </p>
                      </div>
                    </div>
                    {/* Card Não 3 */}
                    <div className="bg-dark-900/40 backdrop-blur-sm border border-red-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg group hover:border-red-500/20 transition-all">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Organização Sem Propósito</h3>
                        <p className="text-gray-450 text-sm font-light leading-relaxed">
                          Não é preencher planilhas complexas que você abandona na primeira semana. Construímos um sistema prático e diário voltado às suas metas e sonhos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
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
                    <h3 className="text-lg font-bold text-white">1. Confirmação e Aprofundamento</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Confirmar as informações que você já nos passou e detalhar os pontos cruciais do seu momento financeiro para uma análise sem lacunas.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">2. Como Posso Ajudar</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Apresentar as soluções estruturadas para o seu perfil e demonstrar como o método de consultoria elimina seus gargalos de forma prática.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">3. O Que Pode Ser Feito</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Explicar em detalhes o funcionamento da nossa consultoria de acompanhamento contínuo e definir os passos para iniciarmos o seu processo.
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

            {/* SLIDE 6: COLETA DE NOVAS INFORMAÇÕES (PARTE 1) */}
            {currentSlide === 'coleta_informacoes' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Aprofundamento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Coleta de Informações</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Diagnóstico Técnico: responda as perguntas abaixo em conjunto com o cliente durante a conversa.
                  </p>
                </div>

                {/* Barra de Progresso Interna da Coleta */}
                <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${coletaStep === step
                          ? 'bg-gold-500 text-dark-950 ring-4 ring-gold-500/20 shadow-lg scale-110 font-black'
                          : coletaStep > step
                            ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                            : 'bg-dark-950 border border-dark-800 text-gray-500'
                          }`}
                      >
                        {step}
                      </div>
                      {step < 6 && (
                        <div
                          className={`h-[2px] w-8 md:w-12 transition-all duration-300 ${coletaStep > step ? 'bg-gold-500/40' : 'bg-dark-800'
                            }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">

                  {/* PASSO 1: Gastos */}
                  {coletaStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                          1. Você acredita que gasta mais do que deveria?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('gastaMaisDoQueDeveria', 'Sim');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.gastaMaisDoQueDeveria === 'Sim'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('gastaMaisDoQueDeveria', 'Não');
                              handleInputChange('comOQueGastaMais', '');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.gastaMaisDoQueDeveria === 'Não'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      {meetingAnswers.gastaMaisDoQueDeveria === 'Sim' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                            Com o que você gasta mais?
                          </label>
                          <textarea
                            placeholder="Ex: Delivery, saídas aos finais de semana, compras supérfluas, parcelas de cartão..."
                            rows={3}
                            value={meetingAnswers.comOQueGastaMais}
                            onChange={(e) => handleInputChange('comOQueGastaMais', e.target.value)}
                            className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* PASSO 2: Guardar Dinheiro */}
                  {coletaStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                          2. Você consegue guardar dinheiro atualmente?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('consegueGuardarDinheiro', 'Sim');
                              handleInputChange('oQueImpedeDeGuardar', '');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.consegueGuardarDinheiro === 'Sim'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('consegueGuardarDinheiro', 'Não');
                              handleInputChange('guardaMensalmente', '');
                              handleInputChange('quantoGuardaMensalmente', '');
                              handleInputChange('quantoConseguiuGuardar', '');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.consegueGuardarDinheiro === 'Não'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      {meetingAnswers.consegueGuardarDinheiro === 'Sim' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 border-t border-dark-800/60 pt-4"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                              Você guarda dinheiro mensalmente (todos os meses)?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('guardaMensalmente', 'Sim');
                                }}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all ${meetingAnswers.guardaMensalmente === 'Sim'
                                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/30 shadow-sm'
                                  : 'bg-dark-950 border-dark-800 text-gray-500 hover:text-gray-400'
                                  }`}
                              >
                                Sim, mensalmente
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('guardaMensalmente', 'Não');
                                  handleInputChange('quantoGuardaMensalmente', '');
                                }}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all ${meetingAnswers.guardaMensalmente === 'Não'
                                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/30 shadow-sm'
                                  : 'bg-dark-950 border-dark-800 text-gray-500 hover:text-gray-400'
                                  }`}
                              >
                                Não, esporadicamente
                              </button>
                            </div>
                          </div>

                          {/* Se for mensalmente: abre quanto poupa por mês E quanto já guardou acumulado */}
                          {meetingAnswers.guardaMensalmente === 'Sim' && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                                  Quanto você consegue guardar mensalmente (R$)?
                                </label>
                                <input
                                  type="text"
                                  placeholder="R$ 0,00"
                                  value={meetingAnswers.quantoGuardaMensalmente}
                                  onChange={(e) => handleCurrencyChange('quantoGuardaMensalmente', e.target.value)}
                                  className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all font-mono font-bold"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                                  Quanto já conseguiu guardar acumulado até hoje (R$)?
                                </label>
                                <input
                                  type="text"
                                  placeholder="R$ 0,00"
                                  value={meetingAnswers.quantoConseguiuGuardar}
                                  onChange={(e) => handleCurrencyChange('quantoConseguiuGuardar', e.target.value)}
                                  className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all font-mono font-bold"
                                />
                              </div>
                            </motion.div>
                          )}

                          {/* Se for esporadicamente: abre apenas o quanto já conseguiu guardar acumulado */}
                          {meetingAnswers.guardaMensalmente === 'Não' && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2"
                            >
                              <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                                Quanto já conseguiu guardar acumulado até hoje (R$)?
                              </label>
                              <input
                                type="text"
                                placeholder="R$ 0,00"
                                value={meetingAnswers.quantoConseguiuGuardar}
                                onChange={(e) => handleCurrencyChange('quantoConseguiuGuardar', e.target.value)}
                                className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all font-mono font-bold"
                              />
                            </motion.div>
                          )}

                          {/* Pergunta de Finalidade se escolheu Sim/Não de mensalmente */}
                          {(meetingAnswers.guardaMensalmente === 'Sim' || meetingAnswers.guardaMensalmente === 'Não') && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4 border-t border-dark-800/40 pt-4"
                            >
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                                  Esse dinheiro que você guardou/guarda tem alguma finalidade específica?
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('guardadoTemFinalidade', 'Sim')}
                                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${meetingAnswers.guardadoTemFinalidade === 'Sim'
                                      ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                                      : 'bg-dark-950 border-dark-800 text-gray-500 hover:text-gray-400'
                                      }`}
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleInputChange('guardadoTemFinalidade', 'Não');
                                      handleInputChange('guardadoQualFinalidade', '');
                                    }}
                                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${meetingAnswers.guardadoTemFinalidade === 'Não'
                                      ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                                      : 'bg-dark-950 border-dark-800 text-gray-500 hover:text-gray-400'
                                      }`}
                                  >
                                    Não
                                  </button>
                                </div>
                              </div>

                              {meetingAnswers.guardadoTemFinalidade === 'Sim' && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-2"
                                >
                                  <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                                    Qual finalidade? (que não seja para reserva de emergência)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Troca de carro, compra de imóvel, viagem de férias..."
                                    value={meetingAnswers.guardadoQualFinalidade}
                                    onChange={(e) => handleInputChange('guardadoQualFinalidade', e.target.value)}
                                    className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all"
                                  />
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {meetingAnswers.consegueGuardarDinheiro === 'Não' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                            O que mais te impede de guardar dinheiro atualmente?
                          </label>
                          <textarea
                            placeholder="Ex: Custo de vida muito alto, dívidas com juros altos, falta de planejamento, compras por impulso..."
                            rows={3}
                            value={meetingAnswers.oQueImpedeDeGuardar}
                            onChange={(e) => handleInputChange('oQueImpedeDeGuardar', e.target.value)}
                            className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* PASSO 3: Reserva Financeira */}
                  {coletaStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                          3. Quanto você tem de reserva financeira hoje (R$)?
                        </label>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                          Considere o valor total disponível em poupança, investimentos de liquidez diária ou dinheiro em conta para emergências.
                        </p>
                        <input
                          type="text"
                          placeholder="R$ 0,00"
                          value={meetingAnswers.quantoTemDeReserva}
                          onChange={(e) => handleCurrencyChange('quantoTemDeReserva', e.target.value)}
                          className="w-full bg-dark-950 border border-dark-800 hover:border-dark-700 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* PASSO 4: Problema Além do Principal */}
                  {coletaStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                          4. Além do seu desafio principal, você sente que tem algum outro problema financeiro?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('problemaAlemDoPrincipal', 'Sim');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.problemaAlemDoPrincipal === 'Sim'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('problemaAlemDoPrincipal', 'Não');
                              handleInputChange('quaisOutrosProblemas', '');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.problemaAlemDoPrincipal === 'Não'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      {meetingAnswers.problemaAlemDoPrincipal === 'Sim' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                            Quais seriam esses outros problemas?
                          </label>
                          <textarea
                            placeholder="Ex: Desentendimento com parceiro(a), dificuldade em faturar mais na empresa, medo constante do futuro..."
                            rows={3}
                            value={meetingAnswers.quaisOutrosProblemas}
                            onChange={(e) => handleInputChange('quaisOutrosProblemas', e.target.value)}
                            className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* PASSO 5: Dívidas */}
                  {coletaStep === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                          5. Você possui dívidas atualmente?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('possuiDividas', 'Sim');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.possuiDividas === 'Sim'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('possuiDividas', 'Não');
                              handleInputChange('dificuldadeLidarDividas', '');
                              handleInputChange('quaisDificuldadesDividas', '');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.possuiDividas === 'Não'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                              }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      {meetingAnswers.possuiDividas === 'Sim' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 border-t border-dark-800/60 pt-4"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                              Você possui dificuldade para lidar com essas dívidas?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('dificuldadeLidarDividas', 'Sim');
                                }}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all ${meetingAnswers.dificuldadeLidarDividas === 'Sim'
                                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                                  : 'bg-dark-950 border-dark-800 text-gray-550'
                                  }`}
                              >
                                Sim, é difícil
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('dificuldadeLidarDividas', 'Não');
                                  handleInputChange('quaisDificuldadesDividas', '');
                                }}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all ${meetingAnswers.dificuldadeLidarDividas === 'Não'
                                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                                  : 'bg-dark-950 border-dark-800 text-gray-550'
                                  }`}
                              >
                                Não, sob controle
                              </button>
                            </div>
                          </div>

                          {meetingAnswers.dificuldadeLidarDividas === 'Sim' && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2"
                            >
                              <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                                Quais são as principais dificuldades com as dívidas?
                              </label>
                              <textarea
                                placeholder="Ex: Juros abusivos, parcelas que consomem toda a renda, ligações de cobrança..."
                                rows={3}
                                value={meetingAnswers.quaisDificuldadesDividas}
                                onChange={(e) => handleInputChange('quaisDificuldadesDividas', e.target.value)}
                                className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* PASSO 6: Metas */}
                  {coletaStep === 6 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                          6. Você possui metas claras que deseja alcançar nos próximos meses ou anos?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('possuiMetas', 'Sim');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.possuiMetas === 'Sim'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-550 hover:border-dark-700'
                              }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('possuiMetas', 'Não');
                              handleInputChange('quaisTresMetas', '');
                              handleInputChange('porqueMetasImportantes', '');
                            }}
                            className={`py-4 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] ${meetingAnswers.possuiMetas === 'Não'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg shadow-gold-500/5'
                              : 'bg-dark-950 border-dark-800 text-gray-550 hover:border-dark-700'
                              }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      {meetingAnswers.possuiMetas === 'Sim' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 border-t border-dark-800/60 pt-4"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                              Quais são as suas 3 principais metas?
                            </label>
                            <textarea
                              placeholder="Ex: 1. Comprar apartamento; 2. Fazer viagem internacional; 3. Ter R$ 100k investidos..."
                              rows={3}
                              value={meetingAnswers.quaisTresMetas}
                              onChange={(e) => handleInputChange('quaisTresMetas', e.target.value)}
                              className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                              Por que essas metas são tão importantes para você?
                            </label>
                            <textarea
                              placeholder="Descreva a importância e o impacto de realizá-las na sua qualidade de vida familiar..."
                              rows={3}
                              value={meetingAnswers.porqueMetasImportantes}
                              onChange={(e) => handleInputChange('porqueMetasImportantes', e.target.value)}
                              className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={handleColetaBack}
                    className="px-6 py-3 bg-dark-850 hover:bg-dark-800 border border-dark-800 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleColetaNext}
                    className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {coletaStep === 6 ? 'Ir para Parte 2' : 'Próxima Pergunta'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 6.2: COLETA DE DADOS - PARTE 2 */}
            {currentSlide === 'coleta_informacoes_2' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Aprofundamento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Coleta de Informações - Parte 2</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Mapeamento de ânimo, perspectiva e rotina para alinhamento estratégico.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">

                  {/* 1. Comprometimento inicial menor que 10 */}
                  {(() => {
                    const commitmentVal = lead.answers.commitmentScale ? parseInt(lead.answers.commitmentScale.replace(/\D/g, ''), 10) : 0;
                    if (commitmentVal > 0 && commitmentVal < 10) {
                      return (
                        <div className="space-y-3 p-5 bg-gold-500/5 border border-gold-500/10 rounded-2xl">
                          <label className="text-xs font-bold uppercase tracking-widest text-gold-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                            O seu comprometimento inicial foi avaliado como {lead.answers.commitmentScale}/10. O que falta para ser 10?
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Falta de tempo no dia a dia, medo do método ser complexo..."
                            value={meetingAnswers.oQueFaltaParaDez}
                            onChange={(e) => handleInputChange('oQueFaltaParaDez', e.target.value)}
                            className="w-full bg-dark-950 border border-dark-800 hover:border-dark-700 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* 2. Perspectiva de Futuro (Filtrada do Diagnóstico Inicial) */}
                  <div className="space-y-4 border-t border-dark-800/60 pt-4 first:border-0 first:pt-0">
                    <div className="p-5 bg-dark-950 border border-dark-850 rounded-2xl space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-gold-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                        Perspectiva de Futuro (Resgatada do Diagnóstico)
                      </label>
                      <p className="text-sm text-gray-300 font-light">
                        Você declarou no formulário de perfil que vê a sua realidade financeira daqui a 6 meses (se nada mudar no seu comportamento atual) como:
                      </p>
                      <div className="inline-block px-4 py-2 bg-gold-500/10 border border-gold-500/25 rounded-xl text-gold-400 text-sm font-bold">
                        {lead.answers.futureOutlook || 'Igual ao que está'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                        Esta projeção de futuro te assusta ou te conforta?
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('seisMesesAssustaOuConforta', 'Assusta')}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${meetingAnswers.seisMesesAssustaOuConforta === 'Assusta'
                            ? 'bg-red-500/10 text-red-400 border-red-500/40 shadow-lg'
                            : 'bg-dark-950 border-dark-800 text-gray-550 hover:text-gray-400'
                            }`}
                        >
                          😨 Me Assusta
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('seisMesesAssustaOuConforta', 'Conforta')}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${meetingAnswers.seisMesesAssustaOuConforta === 'Conforta'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-lg'
                            : 'bg-dark-950 border-dark-800 text-gray-550 hover:text-gray-400'
                            }`}
                        >
                          😌 Me Conforta
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Escala interativa de ânimo (0 a 10) */}
                  <div className="space-y-3 border-t border-dark-800/60 pt-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                      Imagina daqui a 1 ano, você conseguindo resolver os problemas financeiros que tem e alcançando as suas metas, o quanto isso te deixa animado?
                    </label>
                    <div className="flex flex-wrap gap-2 justify-between pt-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleInputChange('animacaoResolverMetas', String(num))}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center font-bold text-sm transition-all hover:scale-110 ${meetingAnswers.animacaoResolverMetas === String(num)
                            ? 'bg-gradient-to-br from-gold-500 to-amber-500 text-dark-950 border-gold-400 ring-4 ring-gold-500/20 shadow-md font-black'
                            : 'bg-dark-950 border-dark-800 text-gray-400 hover:border-dark-700 hover:text-white'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Rotina com pouco tempo */}
                  <div className="space-y-4 border-t border-dark-800/60 pt-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                        Sua rotina hoje é muito corrida e você sente que tem pouco tempo?
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('rotinaPoucoTempo', 'Sim')}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${meetingAnswers.rotinaPoucoTempo === 'Sim'
                            ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg'
                            : 'bg-dark-950 border-dark-800 text-gray-500 hover:text-gray-400'
                            }`}
                        >
                          Sim, é muito corrida
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('rotinaPoucoTempo', 'Não')}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${meetingAnswers.rotinaPoucoTempo === 'Não'
                            ? 'bg-gold-500/10 text-gold-400 border-gold-500/40 shadow-lg'
                            : 'bg-dark-950 border-dark-800 text-gray-550 hover:text-gray-400'
                            }`}
                        >
                          Não, tenho tempo normal
                        </button>
                      </div>
                    </div>

                    {/* Card Premium de Desconstrução de Tempo (Se Sim) */}
                    {meetingAnswers.rotinaPoucoTempo === 'Sim' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-gold-500/10 to-amber-500/5 border border-gold-500/20 rounded-2xl p-5 md:p-6 space-y-3"
                      >
                        <div className="flex items-center gap-2 text-gold-500 font-bold text-sm">
                          <Sparkle className="w-4 h-4 fill-current animate-spin-slow" />
                          A Consultoria cabe na sua rotina corrida
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Nosso método é direto ao ponto e focado em alta eficiência. Você precisará de apenas **1 a 2 reuniões mensais** e pequenas tarefas práticas de **15 minutos por semana**. Nós fazemos todo o trabalho pesado de consolidação e análise para que você dedique seu tempo apenas às decisões estratégicas de crescimento.
                        </p>
                      </motion.div>
                    )}

                    {/* Card Premium de Desconstrução de Tempo (Se Não) */}
                    {meetingAnswers.rotinaPoucoTempo === 'Não' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-5 md:p-6 space-y-3"
                      >
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <Sparkles className="w-4 h-4 text-emerald-400 fill-current animate-pulse" />
                          Excelente! O processo acelerará seus resultados
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Como você tem disponibilidade de tempo, o processo de consultoria será ainda mais dinâmico e integrado. Conseguiremos focar na consolidação de metas com maior rapidez, sem que isso interfira ou atrapalhe a rotina que você já tem estabelecida.
                        </p>
                      </motion.div>
                    )}
                  </div>

                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => {
                      navigateTo('coleta_informacoes');
                      setColetaStep(6);
                    }}
                    className="px-6 py-3 bg-dark-850 hover:bg-dark-800 border border-dark-800 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Voltar para Parte 1
                  </button>
                  <button
                    onClick={() => handleSaveAndNavigate('adequacao')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Avançar para Adequação
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">

                  {/* Para quem serve (4 Cards) */}
                  <div className="lg:col-span-7 bg-dark-900 border border-gold-500/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-gold-400 flex items-center gap-2">
                      <Check className="w-5 h-5 text-gold-500 animate-pulse" />
                      A Consultoria é perfeita para você se:
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card 1 */}
                      <div className="bg-dark-950 border border-dark-800/80 p-4 rounded-2xl flex gap-3 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Você tem dúvidas do quanto gasta por mês e para onde está indo seu dinheiro.
                        </p>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-dark-950 border border-dark-800/80 p-4 rounded-2xl flex gap-3 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Target className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Você sente que não estão bem definidos seus objetivos de vida com prazos e valores.
                        </p>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-dark-950 border border-dark-800/80 p-4 rounded-2xl flex gap-3 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Você possui dívidas que estão pesando seu orçamento ou deixando seu gastos durante o mês muito altos.
                        </p>
                      </div>

                      {/* Card 4 */}
                      <div className="bg-dark-950 border border-dark-800/80 p-4 rounded-2xl flex gap-3 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Você já investe ou gostaria de começar a investir, mas tem medo de fazer algo errado e perder dinheiro.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Problemas que resolve (Gargalos) */}
                  <div className="lg:col-span-5 bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                      Principais gargalos que eliminamos:
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-300 font-light">
                      <li className="flex items-start gap-3">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        <div>
                          <strong className="block text-white text-sm font-semibold">Desorganização Invisível</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            Falta de rastreabilidade de gastos e limites no cartão de crédito.
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        <div>
                          <strong className="block text-white text-sm font-semibold">Insegurança Futura</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            Ausência de uma reserva sólida para imprevistos de saúde ou trabalho.
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        <div>
                          <strong className="block text-white text-sm font-semibold">Paralisia de Análise</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            Não saber qual investimento escolher para as metas prioritárias.
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                        <div>
                          <strong className="block text-white text-sm font-semibold">Procrastinação Financeira</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            Adiar a organização por falta de cobrança positiva e suporte.
                          </span>
                        </div>
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
                    O nosso trabalho é estruturado para garantir que a organização e o crescimento ocorram com método e segurança.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  {/* Tópico 1: O que iremos fazer? */}
                  <div className="bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-gold-400 flex items-center gap-2 border-b border-dark-800/60 pb-3">
                      <Sparkles className="w-5 h-5 text-gold-500" />
                      O que iremos fazer?
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">1</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">Diagnóstico e Bloqueio de Gargalos</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Mapeamos todas as despesas invisíveis e ralos do cartão para recuperar capacidade financeira na primeira semana sem alterar o seu padrão de vida.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">2</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">Autorregulação e Orçamento Inteligente</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Desenhamos as regras de distribuição e contas separadas adaptadas com base nos seus objetivos com prazos e valores concretos.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">3</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">Recomendação de Portfólio Seguro</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Direcionamos você para os investimentos corretos de reserva de emergência e metas de curto/médio prazo, garantindo que não perca dinheiro.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">4</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">Acompanhamento e Suporte de Rotina</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Prestamos suporte diário via WhatsApp para tomadas de decisão rápidas e sessões de alinhamento focadas em acompanhamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tópico 2: Por que iremos fazer? */}
                  <div className="bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-dark-800/60 pb-3">
                      <Target className="w-5 h-5 text-gray-400" />
                      Por que iremos fazer?
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">Eliminar Ansiedade e Incerteza</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Para que você saiba exatamente para onde vai seu dinheiro e tenha total clareza do quanto está gastando e poupando mensalmente.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">Clareza no Propósito de Vida</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Para dar prazos e metas claras aos seus maiores objetivos (reserva, imóveis, viagens), criando um plano sustentável para realizá-los.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">Paz e Segurança Patrimonial</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Para reestruturar dívidas de forma inteligente, diminuindo o peso mensal das obrigações e blindando você contra escolhas erradas.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">Liberdade para Investir com Confiança</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            Para que você comece a rentabilizar seu dinheiro com segurança, sabendo que as escolhas estão validadas e protegendo seu capital.
                          </p>
                        </div>
                      </div>
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

                {/* O serviço principal */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-gold-500" />
                    O serviço principal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 hover:border-gold-500/35 rounded-3xl flex items-start gap-4 transition-all shadow-lg group">
                      <span className="p-3 bg-gold-500/15 text-gold-400 rounded-2xl border border-gold-500/20 shadow-inner group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base">Sessão de 1h 30min</h4>
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                          Encontro individual e online focado em abrir sua realidade financeira, identificar seus gargalos e traçar a rota do seu plano de ação.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 hover:border-gold-500/35 rounded-3xl flex items-start gap-4 transition-all shadow-lg group">
                      <span className="p-3 bg-gold-500/15 text-gold-400 rounded-2xl border border-gold-500/20 shadow-inner group-hover:scale-110 transition-transform">
                        <HeartHandshake className="w-6 h-6" />
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base">Acompanhamento de 30 dias</h4>
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                          Apoio contínuo e diário por WhatsApp para tirar dúvidas de rotina, além de um retorno exclusivo para analisar os resultados e o que ainda precisa ser verificado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Os bônus desse slide */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    Os bônus inclusos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-3xl flex flex-col justify-between shadow-md group transition-all">
                      <div className="space-y-4">
                        <span className="p-3 bg-dark-950 text-gold-500 rounded-2xl border border-dark-800/80 inline-flex group-hover:scale-110 transition-transform">
                          <Compass className="w-5 h-5" />
                        </span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">Ferramenta de controle financeiro</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            Acesso durante todo o acompanhamento da consultoria para registro e gerenciamento prático da sua vida financeira.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-3xl flex flex-col justify-between shadow-md group transition-all">
                      <div className="space-y-4">
                        <span className="p-3 bg-dark-950 text-gold-500 rounded-2xl border border-dark-800/80 inline-flex group-hover:scale-110 transition-transform">
                          <Target className="w-5 h-5" />
                        </span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">Diagnóstico Financeiro Personalizado</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            Mapeamento detalhado de dívidas existentes, levantamento preciso de Custo de Vida e a relação Tempo x Valor do seu trabalho.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-3xl flex flex-col justify-between shadow-md group transition-all">
                      <div className="space-y-4">
                        <span className="p-3 bg-dark-950 text-gold-500 rounded-2xl border border-dark-800/80 inline-flex group-hover:scale-110 transition-transform">
                          <TrendingDown className="w-5 h-5" />
                        </span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">Análise das despesas</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            Varredura das contas com ações práticas sugeridas para a redução imediata de gastos desnecessários que drenam seu orçamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destaque de Rodapé */}
                <div className="pt-6 border-t border-dark-800/60 text-center">
                  <p className="text-sm text-gold-450 font-serif italic max-w-2xl mx-auto leading-relaxed">
                    "É uma estrutura de entrega robusta, que poucas empresas conseguem entregar algo que seja parecido."
                  </p>
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

                {/* Exibição Progressiva da Decisão Matrix */}
                <div className="flex flex-col items-center justify-center min-h-[320px] pt-4">
                  {matrixStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center space-y-4 py-12"
                    >
                      <p className="text-gray-400 text-lg font-light max-w-md mx-auto leading-relaxed italic">
                        Duas pílulas, duas direções. Qual caminho você escolherá trilhar a partir de hoje?
                      </p>
                    </motion.div>
                  )}

                  {matrixStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center space-y-6 max-w-lg"
                    >
                      <img src="/images/pilulaazul.png" alt="Pílula Azul" className="w-40 h-auto object-contain" />
                      <div className="bg-dark-900 border border-blue-500/20 p-6 md:p-8 rounded-3xl text-left space-y-4 shadow-xl">
                        <h3 className="text-xl font-serif font-bold text-blue-400 border-b border-dark-800 pb-2">Pílula Azul: Continuar como está</h3>
                        <p className="text-sm text-gray-300 font-light leading-relaxed">
                          Ignorar a desorganização invisível, continuar sem saber para onde o dinheiro está indo, manter a insegurança de não ter reserva sólida e adiar o sonho dos investimentos por mais tempo.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {matrixStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl"
                    >
                      {/* Card Pílula Azul (Estático) */}
                      <div className="flex flex-col items-center space-y-6">
                        <img src="/images/pilulaazul.png" alt="Pílula Azul" className="w-36 h-auto object-contain" />
                        <div className="bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl text-left space-y-4 shadow-xl w-full min-h-[220px]">
                          <h3 className="text-lg font-serif font-bold text-blue-400 border-b border-dark-850 pb-2">Pílula Azul: Continuar como está</h3>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            Ignorar a desorganização invisível, continuar sem saber para onde o dinheiro está indo, manter a insegurança de não ter reserva sólida e adiar o sonho dos investimentos por mais tempo.
                          </p>
                        </div>
                      </div>

                      {/* Card Pílula Vermelha (Estático) */}
                      <div className="flex flex-col items-center space-y-6">
                        <img src="/images/pilulavermelha.png" alt="Pílula Vermelha" className="w-36 h-auto object-contain animate-pulse" />
                        <div className="bg-dark-900 border border-gold-500/20 p-6 md:p-8 rounded-3xl text-left space-y-4 shadow-xl w-full min-h-[220px]">
                          <h3 className="text-lg font-serif font-bold text-red-400 border-b border-dark-850 pb-2">Pílula Vermelha: Seguir com Método</h3>
                          <p className="text-xs text-gray-300 font-light leading-relaxed">
                            Tomar as rédeas do patrimônio, usar um método validado passo a passo, contar com suporte de um especialista de forma diária, investir com segurança e conquistar tranquilidade e liberdade financeira real.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Botões de Avanço do Slide */}
                <div className="flex justify-between items-center pt-6 border-t border-dark-800/40">
                  <button
                    onClick={() => {
                      if (matrixStep > 1) {
                        setMatrixStep(prev => prev - 1);
                      } else {
                        navigateBack();
                      }
                    }}
                    className="px-6 py-3 bg-dark-850 hover:bg-dark-800 border border-dark-800 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Voltar
                  </button>

                  <button
                    onClick={() => {
                      if (matrixStep < 3) {
                        setMatrixStep(prev => prev + 1);
                      } else {
                        handleSaveAndNavigate('confirmacao_sentido');
                      }
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {matrixStep === 3 ? 'Avançar' : 'Seguir'}
                    <ArrowRight className="w-4 h-4" />
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

                  {/* Imagem da Pílula Vermelha centralizada abaixo do título */}
                  <div className="flex justify-center pt-4">
                    <img src="/images/pilulavermelha.png" alt="Pílula Vermelha" className="w-44 h-auto object-contain" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
          onClick={() => {
            if (currentSlide === 'coleta_informacoes') {
              handleColetaBack();
            } else if (currentSlide === 'coleta_informacoes_2') {
              navigateTo('coleta_informacoes');
              setColetaStep(6);
            } else {
              navigateBack();
            }
          }}
          disabled={slideHistory.length === 0 && (currentSlide !== 'coleta_informacoes' || coletaStep === 1)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-200 ${slideHistory.length === 0 && (currentSlide !== 'coleta_informacoes' || coletaStep === 1)
            ? 'bg-dark-950 border-dark-900 text-gray-750 cursor-not-allowed'
            : 'bg-dark-800 hover:bg-dark-750 border-dark-700 text-gray-300 hover:text-white'
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Indicador de Passo Atual */}
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">
          Etapa: {currentSlide} {currentSlide === 'coleta_informacoes' && `(P${coletaStep}/6)`}
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
                setColetaStep(1);
              } else if (currentSlide === 'coleta_informacoes') {
                handleColetaNext();
              } else if (currentSlide === 'coleta_informacoes_2') {
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

      {/* Modal de Saída Premium */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop com blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>

            {/* Caixa do Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-2xl space-y-6 z-10 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Encerrar Apresentação?</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Você tem certeza de que deseja encerrar esta apresentação estratégica? As respostas salvas até o momento não serão perdidas, mas a sessão de apresentação será fechada.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="py-3 px-6 bg-dark-800 hover:bg-dark-750 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-widest border border-dark-700 transition-colors"
                >
                  Continuar
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    onClose();
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-red-650 to-red-550 hover:from-red-550 hover:to-red-450 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-red-500/10"
                >
                  Sim, Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
