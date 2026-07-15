import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Sparkles, Check,
  HelpCircle, AlertCircle, Image as ImageIcon, Save,
  Users, Award, TrendingUp, ShieldCheck, Play, ArrowRight,
  TrendingDown, CheckCircle2, RefreshCw, HeartHandshake, Brain,
  Compass, Eye, Target, Sparkle, Coins, CreditCard, Info, ExternalLink,
  Copy, Link,
  GiftIcon,
  Building2, FileText, ArrowDown
} from 'lucide-react';
import { Lead, MeetingAnswers, PricingPackage } from '../types';
import { supabase } from '../lib/supabase';

interface PresentationProps {
  lead: Lead;
  pricingPackages?: PricingPackage[];
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

// Imagem padrão de fundo fixa para a capa fornecida pelo usuário
const DIAGNOSTICO_BG = '/images/diagnostico.webp';

// Lista extensível de imagens de depoimentos (public/testimonials)
const TESTIMONIAL_IMAGES = [
  '/testimonials/Felipe1.jpg',
  '/testimonials/Felipe2.jpg',
  '/testimonials/Felipe3.jpg',
  '/testimonials/Felipe31.jpg',
  '/testimonials/Felipe32.jpg',
  '/testimonials/Felipe41.jpg',
  '/testimonials/Moises1.jpg',
  '/testimonials/Moises2.jpg',
  '/testimonials/Moises3.jpg',
  '/testimonials/Moises4.jpg',
  '/testimonials/Ronaldo1.jpeg',
  '/testimonials/higor1.jpeg'
];

export const PresentationFlow: React.FC<PresentationProps> = ({ lead, pricingPackages = [], onClose, onUpdateLead }) => {
  // Estado para controlar o slide atual
  type SlideId =
    | 'intro'
    | 'do_que_se_trata'
    | 'fluxo_empresarial'
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
    | 'justica_valor'
    | 'investimento_padrao'
    | 'argumentacao_especial'
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
  const [justicaOption, setJusticaOption] = useState<'sim' | 'nao' | null>(null);
  // Controle de exibição de detalhes de formas de pagamento (negociação)
  const [paymentDetailsModal, setPaymentDetailsModal] = useState<'padrao' | 'especial' | 'downsell' | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeCopyMenu, setActiveCopyMenu] = useState<'padrao' | 'especial' | 'downsell' | null>(null);
  const [revelarPrecoPadrao, setRevelarPrecoPadrao] = useState(false);
  const [revelarPrecoEspecial, setRevelarPrecoEspecial] = useState(false);
  const [revelarPrecoDownsell, setRevelarPrecoDownsell] = useState(false);
  const [confirmarEncerramentoModal, setConfirmarEncerramentoModal] = useState(false);
  const [fluxoIdealRevelado, setFluxoIdealRevelado] = useState(false);

  useEffect(() => {
    setRevelarPrecoPadrao(false);
    setRevelarPrecoEspecial(false);
    setRevelarPrecoDownsell(false);
    setConfirmarEncerramentoModal(false);
    setFluxoIdealRevelado(false);
  }, [currentSlide]);

  const handleCopyLink = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  // Lógica de precificação ativa dinamicamente
  const currentPricingId = lead.answers?.selectedPricingId;
  const activePricing = (pricingPackages && currentPricingId)
    ? pricingPackages.find(p => p.id === currentPricingId)
    : null;

  // Fallback padrão se não houver pacote selecionado ou se a tabela estiver vazia
  const DEFAULT_PAYMENT_OPTIONS = [
    { label: '1', description: 'Até 12x de R$ 61,74 no Cartão de Crédito', link: 'https://hotm.io/solum-consultoria' },
    { label: '2', description: 'À vista por R$ 597', link: 'https://hotm.io/solum-consultoria' },
    { label: '3', description: 'Até 2x de R$ 314,22 no Boleto Parcelado', link: 'https://hotm.io/solum-consultoria-parcelado' },
    { label: '4', description: 'Entrada de R$ 147 + 1x de R$ 450', link: 'https://mpago.li/2PY7vuj' },
    { label: '5', description: 'Boleto Parcelado (PARCELEX) - Última tentativa', link: 'https://hotm.io/solum-consultoria-parcelex' },
    { label: '6', description: 'R$ 47 (GARANTIR A VAGA) + 1x de R$ 550 (NO DIA DO FECHAMENTO)', link: 'https://mpago.li/2gVs1Rb' },
  ];

  const currentOptions = activePricing ? activePricing.payment_options : DEFAULT_PAYMENT_OPTIONS;

  const selections = lead.answers?.pricingSelections || {};
  const leadFormType = lead.answers?.formType || 'personal';

  // 1. Consultoria Estruturada (Padrão)
  const consultoriaPackage = selections.consultoriaPackageId
    ? pricingPackages.find(p => p.id === selections.consultoriaPackageId)
    : pricingPackages.find(p => p.presentation_type === leadFormType && p.product_moment === 'consultoria');
  const consultoriaOptions = consultoriaPackage ? consultoriaPackage.payment_options : currentOptions;

  let consultoriaVistaOption = selections.consultoriaVista
    ? consultoriaOptions.find(o => o.label === selections.consultoriaVista)
    : null;
  if (!consultoriaVistaOption) {
    consultoriaVistaOption = consultoriaOptions.find(o => !o.isCard && !o.description?.toLowerCase().includes('cartão'))
      || consultoriaOptions.find(o => o.label === '2')
      || consultoriaOptions[0];
  }

  let consultoriaParceladoOption = selections.consultoriaParcelado
    ? consultoriaOptions.find(o => o.label === selections.consultoriaParcelado)
    : null;
  if (!consultoriaParceladoOption) {
    consultoriaParceladoOption = consultoriaOptions.find(o => o.isCard || o.description?.toLowerCase().includes('cartão'))
      || consultoriaOptions.find(o => o.label === '1')
      || consultoriaOptions[1]
      || consultoriaOptions[0];
  }

  // 2. Condição Especial
  const especialPackage = selections.especialPackageId
    ? pricingPackages.find(p => p.id === selections.especialPackageId)
    : pricingPackages.find(p => p.presentation_type === leadFormType && p.product_moment === 'especial');
  const especialOptions = especialPackage ? especialPackage.payment_options : currentOptions;

  let especialVistaOption = selections.especialVista
    ? especialOptions.find(o => o.label === selections.especialVista)
    : null;
  if (!especialVistaOption) {
    const vistaOpts = especialOptions.filter(o => !o.isCard && !o.description?.toLowerCase().includes('cartão'));
    especialVistaOption = vistaOpts[0]
      || especialOptions.find(o => o.label === '4')
      || especialOptions[0];
  }

  let especialParceladoOption = selections.especialParcelado
    ? especialOptions.find(o => o.label === selections.especialParcelado)
    : null;
  if (!especialParceladoOption) {
    const parceladaOpts = especialOptions.filter(o => o.isCard || o.description?.toLowerCase().includes('cartão'));
    especialParceladoOption = parceladaOpts[0]
      || especialOptions.find(o => o.label === '5')
      || especialOptions[1]
      || especialOptions[0];
  }

  // 3. Produto de Entrada (Downsell)
  const entradaPackage = selections.entradaPackageId
    ? pricingPackages.find(p => p.id === selections.entradaPackageId)
    : pricingPackages.find(p => p.presentation_type === leadFormType && p.product_moment === 'entrada');
  const entradaOptions = entradaPackage ? entradaPackage.payment_options : currentOptions;

  let entradaVistaOption = selections.entradaVista
    ? entradaOptions.find(o => o.label === selections.entradaVista)
    : null;
  if (!entradaVistaOption) {
    entradaVistaOption = entradaOptions.find(o => !o.isCard && !o.description?.toLowerCase().includes('cartão'))
      || entradaOptions.find(o => o.label === '2')
      || entradaOptions[0];
  }

  let entradaParceladoOption = selections.entradaParcelado
    ? entradaOptions.find(o => o.label === selections.entradaParcelado)
    : null;
  if (!entradaParceladoOption) {
    entradaParceladoOption = entradaOptions.find(o => o.isCard || o.description?.toLowerCase().includes('cartão'))
      || entradaOptions.find(o => o.label === '1')
      || entradaOptions[1]
      || entradaOptions[0];
  }

  // Função auxiliar para extrair e formatar o valor de forma limpa na apresentação
  const formatPaymentOptionValue = (option: any, isParceladoFallback = false) => {
    if (!option) return '';

    // Se for parcelado (possui parcelas e valor da parcela) ou se for explicitamente cartão
    if (option.isCard || (option.installments && option.installmentValue)) {
      const inst = option.installments || 12;
      const val = option.installmentValue || option.value || '';
      return `${inst}x de ${val}`;
    }

    // Se for à vista ou pagamento único com valor cadastrado
    if (option.value) {
      return option.value;
    }

    // Se for parcelado implícito por ter parcelas e valor parcelado sem a flag isCard
    if (isParceladoFallback && option.installments && option.installmentValue) {
      return `${option.installments}x de ${option.installmentValue}`;
    }

    return option.description || '';
  };

  // Formatar valores para exibição nos cards
  const displayParcelado = consultoriaParceladoOption
    ? formatPaymentOptionValue(consultoriaParceladoOption, true)
    : (leadFormType === 'business' ? '12x de R$ 199,70' : '12x de R$ 61,74');
  const displayAVista = consultoriaVistaOption
    ? formatPaymentOptionValue(consultoriaVistaOption)
    : (leadFormType === 'business' ? 'R$ 1.997,00' : 'R$ 597,00');
  const displayEspecial1 = especialVistaOption
    ? formatPaymentOptionValue(especialVistaOption)
    : (leadFormType === 'business' ? 'R$ 1.497,00' : 'R$ 450,00');
  const displayEspecial2 = especialParceladoOption
    ? formatPaymentOptionValue(especialParceladoOption, true)
    : (leadFormType === 'business' ? '12x de R$ 149,70' : '12x de R$ 46,55');

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

  // Timeout para controle do Debounce
  const saveTimeoutRef = React.useRef<any>(null);

  // Persistir dados no Supabase e atualizar estado do pai (Imediato)
  const saveToSupabase = async (updatedAnswers: MeetingAnswers) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
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

  // Versão Debounced para digitação e seleções rápidas
  const saveToSupabaseDebounced = (updatedAnswers: MeetingAnswers) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(updatedAnswers);
    }, 1000); // 1 segundo de debounce
  };

  // Função para formatar input para moeda brasileira (R$ 0,00) em tempo real
  const handleCurrencyChange = (field: keyof MeetingAnswers, rawValue: string) => {
    // Remove tudo o que não é dígito
    const digits = rawValue.replace(/\D/g, '');
    if (!digits) {
      setMeetingAnswers(prev => {
        const updated = { ...prev, [field]: '' };
        saveToSupabaseDebounced(updated);
        return updated;
      });
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

    setMeetingAnswers(prev => {
      const updated = {
        ...prev,
        [field]: formatted
      };
      saveToSupabaseDebounced(updated);
      return updated;
    });
  };

  const handleColetaNext = () => {
    // Força salvamento imediato do estado atual antes de passar de sub-passo
    saveToSupabase(meetingAnswers);
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
    setMeetingAnswers(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      saveToSupabaseDebounced(updated);
      return updated;
    });
  };

  // Controlar navegação manual e registrar no histórico
  const navigateTo = (nextSlide: SlideId) => {
    setSlideHistory(prev => [...prev, currentSlide]);
    setCurrentSlide(nextSlide);
    scrollToTop();
    setActiveCopyMenu(null);
    if (nextSlide === 'decisao_matrix') {
      setMatrixStep(1);
    }
    if (nextSlide === 'justica_valor') {
      setJusticaOption(null);
    }
  };

  const navigateBack = () => {
    if (slideHistory.length > 0) {
      const previous = slideHistory[slideHistory.length - 1];
      setSlideHistory(prev => prev.slice(0, -1));
      setCurrentSlide(previous);
      scrollToTop();
      setActiveCopyMenu(null);
      if (previous === 'decisao_matrix') {
        setMatrixStep(1);
      }
      if (previous === 'justica_valor') {
        setJusticaOption(null);
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
      ...(leadFormType === 'business' ? ['fluxo_empresarial' as SlideId] : []),
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
      'justica_valor',
      'investimento_padrao',
      'argumentacao_especial',
      'condicao_especial',
      'proximos_passos',
      'agradecimento_final'
    ];

    const index = slideOrder.indexOf(currentSlide);
    if (index === -1) {
      // Se for condicional/ramificação (ex: downsell) calcula próximo do preço
      if (currentSlide === 'downsell') return 88;
      if (currentSlide === 'proximos_passos_downsell') return 94;
      return 50;
    }
    return Math.round(((index + 1) / slideOrder.length) * 100);
  };

  const renderParceladoPremium = (displayStr: string, sizeClass = "text-2xl md:text-3xl") => {
    if (!displayStr) return null;

    // Tenta capturar a quantidade de parcelas e o valor (ex: "12x de R$ 57,68")
    const match = displayStr.match(/(\d+)\s*x\s+de\s+([R$\d\s,.]+)/i);
    let installments = 12;
    let valueStr = displayStr;

    if (match) {
      installments = parseInt(match[1], 10);
      valueStr = match[2].trim();
    } else {
      const priceMatch = displayStr.match(/R\$\s*\d+[\d,.]*/i);
      if (priceMatch) {
        valueStr = priceMatch[0];
      }
    }

    // Limpa a string de valor para converter em número
    const clean = valueStr.replace(/[^\d,.]/g, '').replace(',', '.');
    const numericVal = parseFloat(clean);
    let dailyStr = "";
    if (!isNaN(numericVal)) {
      // Divide por 30 dias e arredonda para baixo (casas decimais truncadas a centavos múltiplos de 10)
      const daily = Math.floor((numericVal / 30) * 10) / 10;
      dailyStr = `(Menos de ${daily.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por dia)`;
    }

    return (
      <div className="flex flex-col items-center">
        {dailyStr && (
          <span className="text-xs md:text-sm text-sky-400/80 font-medium font-mono mb-1">{dailyStr}</span>
        )}
        <div className={`${sizeClass} font-serif font-extrabold text-sky-400 flex items-center justify-center gap-2 tracking-wide`}>
          <span>{displayStr}</span>
        </div>
      </div>
    );
  };

  const renderPaymentOption = (opt: any, labelColor: 'white' | 'gold') => {
    const isMaquininha = opt.checkoutType === 'maquininha';
    const displayValue = formatPaymentOptionValue(opt, true);

    if (isMaquininha) {
      return (
        <div
          key={opt.label}
          className="block p-3.5 bg-dark-950/40 border border-dark-800 rounded-xl transition-all"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  Opção {opt.label}
                </span>
                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-bold uppercase tracking-wider">
                  Maquininha
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-450 font-medium mt-0.5 leading-relaxed">
                {opt.description} {displayValue && displayValue !== opt.description ? `— ${displayValue}` : ''}
              </p>
            </div>
          </div>
        </div>
      );
    }

    const isExternalLink = opt.link?.startsWith('http://') || opt.link?.startsWith('https://');
    const optTypeLabel = opt.checkoutType === 'pix' ? 'Pix' : 'Checkout';
    const badgeColor = opt.checkoutType === 'pix'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-gold-500/10 text-gold-400 border-gold-500/20';

    return (
      <div
        key={opt.label}
        className="block p-3.5 bg-dark-950 border border-dark-800 rounded-xl transition-all"
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Opção {opt.label}
              </span>
              <span className={`px-1.5 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                {optTypeLabel}
              </span>
            </div>
            <p className={`text-xs md:text-sm font-medium mt-0.5 leading-relaxed ${labelColor === 'gold' ? 'text-gold-400' : 'text-white'}`}>
              {opt.description} {displayValue && displayValue !== opt.description ? `— ${displayValue}` : ''}
            </p>
            {opt.link && (
              <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[250px]" title={opt.link}>
                {opt.link}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {opt.link && (
              <button
                type="button"
                onClick={() => handleCopyLink(opt.link || '', `Opção ${opt.label}`)}
                className="p-1.5 bg-dark-900 hover:bg-dark-850 text-gray-400 hover:text-gold-400 rounded-lg border border-dark-800 transition-colors cursor-pointer"
                title={`Copiar ${optTypeLabel}`}
              >
                {copiedText === `Opção ${opt.label}` ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            {isExternalLink && (
              <a
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-dark-900 hover:bg-dark-850 text-gray-400 hover:text-gold-400 rounded-lg border border-dark-800 transition-colors"
                title="Abrir Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
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
                <div className="space-y-5 max-w-2xl mt-12 md:mt-20 md:ml-auto text-left flex flex-col items-start">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-500" />
                    Atendimento Personalizado
                  </div>
                  <h1 className="font-serif font-extrabold text-5xl md:text-7xl lg:text-8xl text-white tracking-tight drop-shadow-lg leading-none">
                    {lead.answers?.formType === 'business' ? 'Consultoria,' : 'Consultoria'} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-amber-500 to-gold-400">
                      {lead.answers?.formType === 'business' ? 'Assistência e Contabilidade Empresarial' : lead.answers?.formType === 'complete' ? 'Gestão Completa' : 'Financeira'}
                    </span>
                  </h1>
                  <p className="text-gray-350 text-base md:text-lg lg:text-xl max-w-xl font-light leading-relaxed">
                    {lead.answers?.formType === 'business'
                      ? 'Uma experiência de transformação, organização de fluxo de caixa e crescimento sob medida para sua empresa.'
                      : lead.answers?.formType === 'complete'
                        ? 'Planejamento integrado de finanças pessoais e empresariais para maximizar seus lucros e patrimônio.'
                        : 'Uma experiência de transformação e controle patrimonial sob medida para sua realidade.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 md:mt-16 border-t border-dark-800/40 pt-6 w-full md:justify-end">
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">Do que se trata a {leadFormType === 'business' ? 'Assistência?' : 'Consultoria?'}</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                    {leadFormType === 'business'
                      ? 'É a organização financeira da empresa no dia a dia. Um trabalho contínuo que mantém as informações corretas, facilita a tomada de decisões e fornece uma base confiável para a contabilidade.'
                      : 'Mais do que números, é mais controle sobre sua vida. Clareza para tomar melhores decisões e construir patrimônio com segurança.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
                  {/* Card 1 */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 hover:border-gold-500/30 p-6 md:p-8 rounded-3xl space-y-5 transition-all duration-300 shadow-xl group">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">{leadFormType === 'business' ? 'Organização Financeira' : 'Melhorar relação com o dinheiro'}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">
                        {leadFormType === 'business'
                          ? 'Classificação e organização das movimentações financeiras para que o empresário saiba exatamente de onde vem e para onde vai o dinheiro da empresa.'
                          : 'Entenda para onde seu dinheiro vai e faça escolhas alinhadas aos seus objetivos.'}
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 hover:border-gold-500/30 p-6 md:p-8 rounded-3xl space-y-5 transition-all duration-300 shadow-xl group">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">{leadFormType === 'business' ? 'Controle do Fluxo de Caixa' : 'Tomar melhores decisões'}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">
                        {leadFormType === 'business'
                          ? 'Conciliação bancária, acompanhamento das entradas e saídas e identificação das movimentações que realmente representam faturamento, custos, despesas e transferências.'
                          : 'Tenha clareza para decidir o melhor caminho que impacta no seu bolso e no seu patrimônio.'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 hover:border-gold-500/30 p-6 md:p-8 rounded-3xl space-y-5 transition-all duration-300 shadow-xl group">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">
                        {leadFormType === 'business' ? 'Base para a Contabilidade' : 'Ter mais qualidade de vida'}
                      </h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">
                        {leadFormType === 'business'
                          ? 'Uma contabilidade eficiente depende de informações organizadas. A assistência financeira reduz erros, facilita o cumprimento das obrigações fiscais e evita retrabalho.'
                          : 'Mais tranquilidade no presente e mais segurança para o seu futuro e o da sua família.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seção: O que a Consultoria NÃO é apenas */}
                <div className="border-t border-dark-800/60 pt-8 mt-8 space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono text-center">
                    {leadFormType === 'business' ? 'Sem organização financeira, surgem problemas que impactam diretamente a empresa.' : 'Ou seja, a Consultoria NÃO é apenas sobre:'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Card Não 1 */}
                    <div className="bg-dark-900/40 backdrop-blur-sm border border-red-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg group hover:border-red-500/20 transition-all">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">
                          {leadFormType === 'business' ? 'Misturar dinheiro pessoal com o da empresa' : 'Investimentos'}
                        </h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed">
                          {leadFormType === 'business'
                            ? 'Quando as movimentações não são separadas, fica difícil identificar o lucro real e tomar decisões com segurança.'
                            : 'Antes de investir, é preciso organizar, planejar e construir uma base sólida.'}
                        </p>
                      </div>
                    </div>
                    {/* Card Não 2 */}
                    <div className="bg-dark-900/40 backdrop-blur-sm border border-red-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg group hover:border-red-500/20 transition-all">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">
                          {leadFormType === 'business' ? 'Considerar toda entrada bancária como faturamento' : 'Pagar Dívidas'}
                        </h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed">
                          {leadFormType === 'business'
                            ? 'Nem todo valor que entra na conta representa venda. Empréstimos, transferências, aportes e estornos precisam ser classificados corretamente.'
                            : 'Criamos estratégias para evitar que os mesmos problemas voltem a acontecer.'}
                        </p>
                      </div>
                    </div>
                    {/* Card Não 3 */}
                    <div className="bg-dark-900/40 backdrop-blur-sm border border-red-500/10 p-6 md:p-8 rounded-3xl space-y-4 shadow-lg group hover:border-red-500/20 transition-all">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">
                          {leadFormType === 'business' ? 'Enviar informações incompletas para a contabilidade' : 'Organização de Números'}
                        </h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed">
                          {leadFormType === 'business'
                            ? 'Dados desorganizados aumentam o risco de erros fiscais, retrabalho, recolhimento incorreto de impostos e possíveis multas.'
                            : 'Toda organização financeira precisa estar conectada aos seus objetivos de vida.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => navigateTo(leadFormType === 'business' ? 'fluxo_empresarial' : 'objetivo_conversa')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {leadFormType === 'business' ? 'Ver Fluxo Financeiro' : 'Objetivo da Conversa'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TELA: FLUXO FINANCEIRO EMPRESARIAL (NOVO SLIDE COMPARATIVO) */}
            {currentSlide === 'fluxo_empresarial' && (
              <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Processo Estruturado</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">O fluxo financeiro das empresas</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto font-light leading-relaxed">
                    A forma como sua empresa organiza os processos financeiros determina sua longevidade.
                  </p>
                </div>

                {/* Seção 1: Modelo Tradicional (Como funciona hoje) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-dark-800 pb-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-red-500/80 font-bold uppercase tracking-widest font-mono">Modelo Tradicional</span>
                      <h2 className="text-lg md:text-xl font-serif font-bold text-white">Como funciona na maioria das empresas hoje</h2>
                    </div>
                    <span className="px-2 py-0.5 rounded border bg-red-500/10 border-red-500/30 text-red-400 text-[8px] font-mono tracking-wider font-bold">
                      CENÁRIO PADRÃO
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                    {/* Card Tradicional 1: Movimentações */}
                    <div className="flex-1 bg-dark-900/35 border border-dark-800/80 p-6 rounded-3xl flex flex-col justify-between min-h-[190px] opacity-70 hover:border-dark-700 transition-all duration-300">
                      <div className="space-y-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-550 border border-dark-800">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider font-mono">Etapa 01</span>
                          <h3 className="text-sm font-bold text-white leading-tight mt-0.5">Movimentações Bancárias</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                          Extrato bruto sem classificação de despesas, custos ou faturamentos reais.
                        </p>
                      </div>
                    </div>

                    {/* Seta 1 */}
                    <div className="flex items-center justify-center shrink-0">
                      <ArrowRight className="hidden lg:block w-5 h-5 text-gray-705" />
                      <ArrowDown className="lg:hidden w-5 h-5 text-gray-750" />
                    </div>

                    {/* Card Tradicional 2: Contabilidade */}
                    <div className="flex-1 bg-dark-900/35 border border-dark-800/80 p-6 rounded-3xl flex flex-col justify-between min-h-[190px] opacity-70 hover:border-dark-700 transition-all duration-300">
                      <div className="space-y-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-550 border border-dark-800">
                          <Building2 className="w-5 h-5 text-gray-450" />
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider font-mono">Etapa 02</span>
                          <h3 className="text-sm font-bold text-white leading-tight mt-0.5">Contabilidade Reativa</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                          Filtra apenas as entradas brutas do mês para apurar impostos, sem conciliação ou análise real de custos e despesas.
                        </p>
                      </div>
                    </div>

                    {/* Seta 2 */}
                    <div className="flex items-center justify-center shrink-0">
                      <ArrowRight className="hidden lg:block w-5 h-5 text-gray-705" />
                      <ArrowDown className="lg:hidden w-5 h-5 text-gray-750" />
                    </div>

                    {/* Card Tradicional 3: Empresário */}
                    <div className="flex-1 bg-dark-900/35 border border-dark-800/80 p-6 rounded-3xl flex flex-col justify-between min-h-[190px] opacity-70 hover:border-dark-700 transition-all duration-300">
                      <div className="space-y-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-550 border border-dark-800">
                          <HelpCircle className="w-5 h-5 text-gray-450" />
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider font-mono">Etapa 03</span>
                          <h3 className="text-sm font-bold text-white leading-tight mt-0.5">O Empresário</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                          Só recebe boletos de impostos sem entender o que paga na maioria das vezes, não tem visão gerencial, não tem previsibilidade e toma decisões baseadas no saldo da conta.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consequências Negativas do Fluxo Tradicional */}
                  <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 shadow-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 text-left">
                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block font-mono">Consequências do Modelo Tradicional</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-gray-450 leading-relaxed font-light mt-1">
                          <div className="flex items-start gap-1.5">
                            <span className="text-red-500/80 font-bold">•</span>
                            <span>Contas pessoais e da empresa misturadas diariamente.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-red-500/80 font-bold">•</span>
                            <span>Ausência de visão de lucro real e margem de contribuição.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-red-500/80 font-bold">•</span>
                            <span>Sensação constante de faturar bem mas não consegue usufruir do dinheiro.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-red-500/80 font-bold">•</span>
                            <span>Na apuração de impostos, geralmente, a empresa paga mais do que deveria. (Risco de problemas fiscais)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão de Revelação do Fluxo Ideal */}
                {!fluxoIdealRevelado ? (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => setFluxoIdealRevelado(true)}
                      className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      Apresentar Solução Ideal Solum
                    </button>
                  </div>
                ) : (
                  /* Seção 2: Fluxo Ideal (Solum) - SEM o container envolvente grande */
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 pt-6 border-t border-dark-800"
                  >
                    <div className="flex items-center justify-between border-b border-dark-800 pb-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-gold-500 font-bold uppercase tracking-widest font-mono">Sequência Recomendada</span>
                        <h2 className="text-lg md:text-xl font-serif font-bold text-white">Como funciona com a Solum Financeiro</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded border bg-gold-500/10 border-gold-500/30 text-gold-500 text-[8px] font-mono tracking-wider font-bold">
                        EFICIENTE & ORGANIZADO
                      </span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                      {/* Card Ideal 1: Movimentações */}
                      <div className="flex-1 bg-dark-900/40 backdrop-blur-sm border border-dark-800 p-6 rounded-3xl space-y-4 hover:border-gold-500/20 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[370px] group">
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 border border-dark-750 group-hover:scale-105 transition-transform duration-300">
                            <CreditCard className="w-6 h-6 text-gray-405" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-550 font-bold uppercase tracking-wider font-mono">Etapa 01</span>
                            <h3 className="text-sm font-bold text-white leading-tight">Movimentações Bancárias</h3>
                          </div>
                          <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                            O ponto de partida de qualquer empresa. Reflete a realidade bruta do caixa.
                          </p>
                          <ul className="space-y-2 pt-2 text-[10px] text-gray-300 font-light border-t border-dark-850">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Extratos das contas correntes</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Entradas brutas e saídas gerais</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Tarifas e despesas bancárias</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Seta 1 */}
                      <div className="flex items-center justify-center shrink-0">
                        <ArrowRight className="hidden lg:block w-5 h-5 text-gold-500/40 animate-pulse" />
                        <ArrowDown className="lg:hidden w-5 h-5 text-gold-500/40 animate-pulse" />
                      </div>

                      {/* Card Ideal 2: Assistência Financeira (Destaque Principal - MAIOR) */}
                      <div className="flex-1 bg-gradient-to-b from-dark-900/85 to-dark-950/98 backdrop-blur-md border-2 border-gold-500 p-7 rounded-3xl space-y-4 hover:border-gold-500 transition-all duration-300 shadow-[0_25px_60px_rgba(212,163,89,0.15)] flex flex-col justify-between min-h-[405px] relative overflow-hidden group ring-1 ring-gold-500/40 lg:scale-[1.04] lg:mx-1 relative z-20">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-gold-600 to-amber-500 text-dark-950 font-black font-mono text-[7px] uppercase tracking-widest rounded-bl-xl shadow-md">
                          FOCO DE ATUAÇÃO
                        </div>
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center text-gold-500 border border-gold-500/30 group-hover:scale-105 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-gold-500" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-gold-500 font-black uppercase tracking-wider font-mono">Etapa 02 • O Coração do Fluxo</span>
                            <h3 className="text-sm font-bold text-white leading-tight">Assistência Financeira</h3>
                          </div>
                          <p className="text-[11px] text-gray-300 font-light leading-relaxed">
                            Organiza o dia a dia da sua empresa para garantir clareza e relatórios confiáveis.
                          </p>
                          <ul className="space-y-2 pt-2 text-[10px] text-white font-medium border-t border-gold-500/20">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500" />
                              <span><strong className="text-gold-400 font-bold">Organiza:</strong> Estrutura o fluxo financeiro</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500" />
                              <span><strong className="text-gold-400 font-bold">Classifica:</strong> Identifica cada movimentação</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500" />
                              <span><strong className="text-gold-400 font-bold">Concilia:</strong> Bate saldos com os bancos</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500" />
                              <span><strong className="text-gold-400 font-bold">Controla:</strong> Acompanha vencimentos</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Seta 2 */}
                      <div className="flex items-center justify-center shrink-0">
                        <ArrowRight className="hidden lg:block w-5 h-5 text-gold-500/40 animate-pulse" />
                        <ArrowDown className="lg:hidden w-5 h-5 text-gold-500/40 animate-pulse" />
                      </div>

                      {/* Card Ideal 3: Contabilidade (Destaque Intermediário) */}
                      <div className="flex-1 bg-dark-900/40 backdrop-blur-sm border border-gold-500/20 p-6 rounded-3xl space-y-4 hover:border-gold-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[370px] group">
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 border border-dark-750 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-5 h-5 text-gold-500/70" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono">Etapa 03</span>
                            <h3 className="text-sm font-bold text-white leading-tight">Contabilidade</h3>
                          </div>
                          <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                            A parte fiscal e estatutária, que necessita de dados estruturados da etapa 2.
                          </p>
                          <ul className="space-y-2 pt-2 text-[10px] text-gray-300 font-light border-t border-dark-850">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Calcula impostos devidos</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Cumpre as obrigações fiscais</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Gera declarações e Balancetes</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Seta 3 */}
                      <div className="flex items-center justify-center shrink-0">
                        <ArrowRight className="hidden lg:block w-5 h-5 text-gold-500/40 animate-pulse" />
                        <ArrowDown className="lg:hidden w-5 h-5 text-gold-500/40 animate-pulse" />
                      </div>

                      {/* Card Ideal 4: Consultoria Estratégica (Destaque Principal - MAIOR) */}
                      <div className="flex-1 bg-gradient-to-b from-dark-900/85 to-dark-950/98 backdrop-blur-md border-2 border-gold-500 p-7 rounded-3xl space-y-4 hover:border-gold-500 transition-all duration-300 shadow-[0_25px_60px_rgba(212,163,89,0.15)] flex flex-col justify-between min-h-[405px] relative overflow-hidden group ring-1 ring-gold-500/40 lg:scale-[1.04] lg:mx-1 relative z-20">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-gold-600 to-amber-500 text-dark-950 font-black font-mono text-[7px] uppercase tracking-widest rounded-bl-xl shadow-md">
                          NOSSO DIFERENCIAL
                        </div>
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center text-gold-500 border border-gold-500/30 group-hover:scale-105 transition-transform duration-300">
                            <TrendingUp className="w-6 h-6 text-gold-500" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-gold-500 font-black uppercase tracking-wider font-mono">Etapa 04</span>
                            <h3 className="text-sm font-bold text-white leading-tight">Consultoria Estratégica</h3>
                          </div>
                          <p className="text-[11px] text-gray-350 font-light leading-relaxed">
                            O ápice da maturidade financeira: tomar decisões inteligentes baseadas em números reais.
                          </p>
                          <ul className="space-y-2 pt-2 text-[10px] text-gray-300 font-light border-t border-dark-850">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Entende a história dos números</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Decide pró-labore e margem</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-gold-500/70" />
                              <span>Planeja investimentos e metas</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bloco de Sistema Próprio / Plataforma Integrada (Minimalista & Solto) */}
                    <div className="mt-14 py-2 text-center space-y-4 relative z-10 max-w-2xl mx-auto">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="absolute w-24 h-24 bg-gold-500/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="w-16 h-16 rounded-full border border-gold-500/60 bg-dark-950 flex items-center justify-center shadow-[0_0_25px_rgba(212,163,89,0.45)] relative z-10 overflow-hidden">
                          <img
                            src="logo.png"
                            alt="Logo Solum Aplicativo"
                            className="w-full h-full object-cover hover:scale-110 transition-all duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.indexOf('/images/') === -1) {
                                target.src = '/images/logo.png';
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 max-w-xl mx-auto">
                        <span className="text-[9px] text-gold-500 font-bold uppercase tracking-widest font-mono block">TECNOLOGIA EXCLUSIVA</span>
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Fazemos o trabalho pesado através da nossa plataforma própria
                        </h4>

                        <div className="flex flex-col items-center gap-2 pt-1 text-[10px] text-gray-400 font-light max-w-xl mx-auto">
                          <div className="flex items-start md:items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0 mt-1.5 md:mt-0"></span>
                            <span>Sua assistência e consultoria são integradas a um <strong className="text-gold-400 font-semibold">sistema próprio de última geração</strong>.</span>
                          </div>
                          <div className="flex items-start md:items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0 mt-1.5 md:mt-0"></span>
                            <span>Cuidamos de toda a complexidade operacional para você focar no <strong className="text-gold-400 font-semibold">crescimento do negócio</strong>.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consequências Boas */}
                    <div className="bg-emerald-550/5 border border-emerald-500/15 rounded-2xl p-5 shadow-md">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block font-mono">Benefícios Reais da Solução Solum</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-gray-300 leading-relaxed font-light mt-1">
                            <div className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>Separação total e saudável das contas PF e PJ.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>Visão clara do lucro real, ponto de equilíbrio e caixa.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>Retiradas e investimentos baseados em dados reais.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>Impostos calculados perfeitamente (sem impostos extras).</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => navigateTo('objetivo_conversa')}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer relative z-10"
                      >
                        Objetivo da Conversa
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TELA 3: OBJETIVO PRINCIPAL DA CONVERSA (NOVO SLIDE) */}
            {currentSlide === 'objetivo_conversa' && (
              <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Direcionamento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">Nosso objetivo de hoje</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                    Primeiro entendemos sua realidade. Depois construímos a solução.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 items-center">

                  {/* Lado Esquerdo - Mensagem Principal */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-4 text-gray-300 font-light text-sm md:text-base leading-relaxed">
                      <h3 className="text-xl md:text-2xl font-serif text-white font-bold">
                        O que acontece nesta reunião?
                      </h3>
                      <p>
                        {leadFormType === 'business'
                          ? 'O objetivo desta conversa é entender onde sua empresa está hoje e para onde deseja ir.'
                          : 'O objetivo desta conversa é entender onde você está hoje e para onde deseja ir.'}
                      </p>
                      <p className="text-gold-400 font-semibold">
                        {leadFormType === 'business'
                          ? 'Com esse diagnóstico, conseguimos construir um direcionamento personalizado para a realidade do seu negócio.'
                          : 'Com esse diagnóstico, conseguimos construir um direcionamento personalizado para sua realidade.'}
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
                        <p className="text-xs text-white font-medium">
                          {leadFormType === 'business' ? 'Mapear a situação atual da empresa' : 'Mapear a sua situação atual'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/20 transition-all shadow-md">
                      <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-bold shrink-0">
                        02
                      </div>
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold">Identificação</h4>
                        <p className="text-xs text-white font-medium">
                          {leadFormType === 'business' ? 'Pontuar problemas que envolvem o caixa' : 'Pontuar problemas que envolvem dinheiro'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/20 transition-all shadow-md">
                      <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-bold shrink-0">
                        03
                      </div>
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold">Planejamento</h4>
                        <p className="text-xs text-white font-medium">
                          {leadFormType === 'business' ? 'Identificar gargalos e metas do negócio' : 'Identificar quais são os desafios e as metas'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-gold-500/20 p-4 rounded-2xl flex items-center gap-4 hover:border-gold-500/30 transition-all shadow-lg">
                      <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center text-gold-500 font-mono text-xs font-black shrink-0">
                        04
                      </div>
                      <div>
                        <h4 className="text-xs text-gold-500 uppercase tracking-widest font-black">Entrega</h4>
                        <p className="text-xs text-white font-black">Direcionamento personalizado</p>
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl lg:text-6xl text-white">Seguiremos 03 pontos importantes</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                    Em poucos passos, vamos entender sua situação e definir os próximos caminhos possíveis.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">1. Coleta de dados</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Confirmar informações e aprofundar os pontos mais importantes da sua situação.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">2. Mostrar o melhor caminho</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Apresentar como a consultoria ajuda a resolver os desafios identificados.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/20 p-6 md:p-8 rounded-3xl space-y-4 transition-all duration-300 shadow-lg group">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20 text-gold-500 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">3. Escolher o próximo passo</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      Definir qual caminho faz mais sentido para você neste momento
                    </p>
                  </div>
                </div>

                <div className="bg-gold-500/5 border-2 border-gold-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between mt-12 shadow-2xl shadow-gold-500/5">
                  <div className="space-y-2 text-center md:text-left flex-grow">
                    <h4 className="text-gold-500 font-serif font-black text-xl uppercase tracking-widest">O Principal:</h4>
                    <p className="text-white text-base md:text-lg font-light leading-relaxed">
                      Que você saia desta conversa sabendo exatamente onde está e quais são suas opções daqui para frente.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('confirmacao_dados')}
                    className="px-8 py-4 bg-dark-800 hover:bg-dark-750 text-gold-500 hover:text-gold-400 border border-dark-700 hover:border-gold-500/20 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shrink-0"
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Validação de diagnóstico inicial</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    {leadFormType === 'business'
                      ? 'Confirmemos as informações coletadas no formulário de perfil da sua empresa para garantir a precisão da assistência.'
                      : 'Confirmemos as informações coletadas no seu formulário de perfil para garantir a precisão da consultoria.'}
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider border-b border-dark-800 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold-500" />
                    {leadFormType === 'business' ? `Ficha da Empresa: ${lead.name}` : `Ficha do Perfil de ${lead.name}`}
                  </h3>

                  {leadFormType === 'business' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Desafio Prioritário da Empresa</p>
                        <p className="text-sm text-white font-medium italic">"{lead.answers.businessDifficulty || 'Não informado'}"</p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Já tentou resolver esse problema?</p>
                        <p className="text-sm text-white font-medium">
                          {lead.answers.businessTriedSolution || 'Não informado'}
                          {lead.answers.businessTriedSolutionDescription && (
                            <span className="block text-xs text-gray-450 mt-1.5 italic font-light leading-relaxed">
                              "{lead.answers.businessTriedSolutionDescription}"
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Perfil da Empresa (Porte, Ramo e Fase)</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Porte: <span className="text-gold-500 font-bold">{lead.answers.businessSize || 'Não informado'}</span>
                          {lead.answers.businessBranch && (
                            <> • Ramo: <span className="text-gold-500 font-bold">{lead.answers.businessBranch}</span></>
                          )}
                          {lead.answers.businessPhase && (
                            <> • Fase: <span className="text-gold-500 font-bold">{lead.answers.businessPhase}</span></>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Faturamento Médio Mensal</p>
                        <p className="text-sm text-white font-mono font-bold">{lead.answers.averageMonthlyRevenue || 'Não informado'}</p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Mistura de Dinheiro (PF/PJ)</p>
                        <p className="text-sm text-white font-medium">{lead.answers.mixesMoney || 'Não informado'}</p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Controle e Rotinas de Caixa</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Fluxo Atualizado: <span className="text-gold-500 font-bold">{lead.answers.cashFlowUpdated || 'Não'}</span>
                          {lead.answers.regularReconciliation && (
                            <> • Conciliação: <span className="text-gold-500 font-bold">{lead.answers.regularReconciliation}</span></>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Lucratividade Mensal</p>
                        <p className="text-sm text-white font-medium">
                          Sabe o lucro? <span className="text-gold-500 font-bold">{lead.answers.knowsMonthlyProfit || 'Não'}</span>
                          {lead.answers.knowsMonthlyProfit === 'Sim' && lead.answers.monthlyProfitValue && (
                            <span className="block text-xs text-gray-450 mt-1 font-mono">
                              Lucro Estimado: {lead.answers.monthlyProfitValue}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Faturamento e Cobranças</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Controle de Contas: <span className="text-gold-500 font-bold">{lead.answers.controlsBills || 'Não'}</span>
                          {lead.answers.hasDeferredSales && (
                            <> • Vendas a prazo: <span className="text-gold-500 font-bold">{lead.answers.hasDeferredSales}</span></>
                          )}
                          {lead.answers.hasDeferredSales === 'Sim' && lead.answers.deferredSalesCollector && (
                            <span className="block text-[10px] text-gray-450 mt-1">
                              Cobrador: {lead.answers.deferredSalesCollector}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Emissão de Notas Fiscais</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Emite Notas: <span className="text-gold-500 font-bold">{lead.answers.emitsInvoices || 'Não'}</span>
                          {lead.answers.emitsInvoices === 'Sim' && (
                            <span className="block text-[10px] text-gray-450 mt-1">
                              {lead.answers.businessBranch === 'Prestação de serviços' && `Emite NFS-e: ${lead.answers.invoiceNFSSe || 'Não'}`}
                              {lead.answers.businessBranch === 'Indústria' && `Emite NF-e: ${lead.answers.invoiceNFSe || 'Não'}`}
                              {lead.answers.businessBranch === 'Comércio de mercadorias' && `Sistema NFC-e: ${lead.answers.invoiceSystemNFCe || 'Não'}`}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Estrutura Operacional e Contábil</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Responsável Financeiro: <span className="text-gold-500 font-bold">{lead.answers.hasFinancialManager || 'Não'}</span>
                          {lead.answers.hasAccounting && (
                            <> • Tem Contador: <span className="text-gold-500 font-bold">{lead.answers.hasAccounting}</span></>
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1 md:col-span-2">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Comprometimento e Decisão</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Comprometimento com a evolução: <span className="text-gold-500 font-bold font-mono">{lead.answers.commitmentScale || '0'}/10</span>
                          {lead.answers.dependsOnOthersBusiness === 'Sim' && (
                            <>
                              <span className="text-red-400 font-bold"> • Depende de outra pessoa para decidir</span>
                              {lead.answers.dependsOnOthersBusinessReason && (
                                <span className="block text-xs mt-1 italic text-gray-400">
                                  {lead.answers.dependsOnOthersBusinessReason === 'Não' ? (
                                    <>Desiste se a pessoa falar não? <span className="text-green-500 font-bold">Não</span></>
                                  ) : lead.answers.dependsOnOthersBusinessReason === 'Sim' ? (
                                    <>Desiste se a pessoa falar não? <span className="text-red-400 font-bold">Sim</span></>
                                  ) : (
                                    `"${lead.answers.dependsOnOthersBusinessReason}"`
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Desafio Prioritário</p>
                        <p className="text-sm text-white font-medium italic">"{lead.answers.mainProblem}"</p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Já tentou resolver esse problema?</p>
                        <p className="text-sm text-white font-medium">
                          {lead.answers.triedSolution || 'Não informado'}
                          {lead.answers.triedSolutionDescription && (
                            <span className="block text-xs text-gray-450 mt-1.5 italic font-light leading-relaxed">
                              "{lead.answers.triedSolutionDescription}"
                            </span>
                          )}
                        </p>
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
                          {lead.answers.profession}
                          {lead.answers.spouse && ` • ${lead.answers.spouse}`}
                          {lead.answers.children && ` • ${lead.answers.children}`}
                          {lead.answers.otherDependents === 'Possuo outros dependentes' && (
                            ` • ${lead.answers.otherDependentsCount || 0} ${lead.answers.otherDependentsCount === 1 ? 'outro dependente' : 'outros dependentes'}`
                          )}
                        </p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Meta / Objetivo Financeiro</p>
                        <p className="text-sm text-white font-medium">{lead.answers.goals}</p>
                      </div>

                      <div className="p-4 bg-dark-950 border border-dark-800/60 rounded-xl space-y-1 md:col-span-2">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Decisão e Comprometimento</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          Comprometimento: <span className="text-gold-500 font-bold font-mono">{lead.answers.commitmentScale || '0'}/10</span>
                          {lead.answers.dependsOnOthers === 'Sim' && (
                            <>
                              <span className="text-red-400 font-bold"> • Depende de outra pessoa para decidir</span>
                              {lead.answers.dependsOnOthersReason && (
                                <span className="block text-xs mt-1 italic text-gray-400">
                                  {lead.answers.dependsOnOthersReason === 'Não' ? (
                                    <>Desiste se a pessoa falar não? <span className="text-green-500 font-bold">Não</span></>
                                  ) : lead.answers.dependsOnOthersReason === 'Sim' ? (
                                    <>Desiste se a pessoa falar não? <span className="text-red-400 font-bold">Sim</span></>
                                  ) : (
                                    `"${lead.answers.dependsOnOthersReason}"`
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => navigateTo('coleta_informacoes')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Aprofundar Diagnóstico
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Coleta de informações</h1>
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
                          {leadFormType === 'business' ? '1. A empresa possui fluxo de caixa organizado e diário?' : '1. Você acredita que gasta mais do que deveria?'}
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
                            placeholder={leadFormType === 'business' ? 'Ex: Custos de fornecedores, marketing ineficiente, impostos altos, despesas administrativas...' : 'Ex: Delivery, saídas aos finais de semana, compras supérfluas, parcelas de cartão...'}
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
                          {leadFormType === 'business' ? '2. Existe mistura de contas da Pessoa Física com a Pessoa Jurídica?' : '2. Você consegue guardar dinheiro atualmente?'}
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
                              {leadFormType === 'business' ? 'Com que frequência ocorre e qual o valor médio misturado?' : 'Você guarda dinheiro mensalmente (todos os meses)?'}
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
                                {leadFormType === 'business' ? 'Sim, misturo com frequência' : 'Sim, mensalmente'}
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
                                {leadFormType === 'business' ? 'Não, misturo raramente' : 'Não, esporadicamente'}
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
                                  {leadFormType === 'business' ? 'Qual valor médio misturado mensalmente (R$)?' : 'Quanto você consegue guardar mensalmente (R$)?'}
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
                                  {leadFormType === 'business' ? 'Qual o valor total que a empresa deve para a pessoa física (ou vice-versa)?' : 'Quanto já conseguiu guardar acumulado até hoje (R$)?'}
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
                                {leadFormType === 'business' ? 'Qual o valor total que a empresa deve para a pessoa física (ou vice-versa)?' : 'Quanto já conseguiu guardar acumulado até hoje (R$)?'}
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
                                    {leadFormType === 'business' ? 'Essa mistura de contas é para suprir a operação da empresa?' : 'Qual finalidade? (que não seja para reserva de emergência)'}
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
                            {leadFormType === 'business' ? 'O que te impede de fazer retiradas de pró-labore fixo?' : 'O que mais te impede de guardar dinheiro atualmente?'}
                          </label>
                          <textarea
                            placeholder={leadFormType === 'business' ? 'Ex: Faturamento instável, falta de controle do caixa, medo de faltar dinheiro para despesas da empresa...' : 'Ex: Custo de vida muito alto, dívidas com juros altos, falta de planejamento, compras por impulso...'}
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
                          {leadFormType === 'business' ? '3. A margem de lucro de cada produto/serviço é conhecida com precisão?' : '3. Quanto você tem de reserva financeira hoje (R$)?'}
                        </label>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                          {leadFormType === 'business' ? 'Considere a margem líquida média estimada do seu produto ou serviço principal após todos os impostos e custos operacionais.' : 'Considere o valor total disponível em poupança, investimentos de liquidez diária ou dinheiro em conta para emergências.'}
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
                          {leadFormType === 'business' ? '4. Existe capital de giro suficiente para manter a operação por 3 meses?' : '4. Além do seu desafio principal, você sente que tem algum outro problema financeiro?'}
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
                            placeholder={leadFormType === 'business' ? 'Ex: Necessito de R$ 50.000 para fluxo de caixa operacional...' : 'Ex: Desentendimento com parceiro(a), dificuldade em faturar mais na empresa, medo constante do futuro...'}
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
                          {leadFormType === 'business' ? '5. A retirada de pró-labore dos sócios é fixa e definida?' : '5. Você possui dívidas atualmente?'}
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
                              {leadFormType === 'business' ? 'Você possui dificuldade para manter essa retirada fixa?' : 'Você possui dificuldade para lidar com essas dívidas?'}
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
                                {leadFormType === 'business' ? 'Quais são as principais dificuldades ou despesas extraordinárias que interferem na retirada?' : 'Quais são as principais dificuldades com as dívidas?'}
                              </label>
                              <textarea
                                placeholder={leadFormType === 'business' ? 'Ex: Sazonalidade de vendas, falta de previsão do caixa, gastos inesperados...' : 'Ex: Juros abusivos, parcelas que consomem toda a renda, ligações de cobrança...'}
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
                          {leadFormType === 'business' ? '6. A empresa possui planejamento tributário e contábil anual?' : '6. Você possui metas claras que deseja alcançar nos próximos meses ou anos?'}
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
                              {leadFormType === 'business' ? 'Quais são as 3 principais metas de crescimento nos próximos 12 meses?' : 'Quais são as suas 3 principais metas?'}
                            </label>
                            <textarea
                              placeholder={leadFormType === 'business' ? 'Ex: 1. Aumentar faturamento em 30%; 2. Reduzir impostos; 3. Contratar novos colaboradores...' : 'Ex: 1. Comprar apartamento; 2. Fazer viagem internacional; 3. Ter R$ 100k investidos...'}
                              rows={3}
                              value={meetingAnswers.quaisTresMetas}
                              onChange={(e) => handleInputChange('quaisTresMetas', e.target.value)}
                              className="w-full bg-dark-950 border border-gold-500/20 hover:border-gold-500/40 focus:border-gold-500 rounded-xl p-4 text-white text-sm outline-none transition-all resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold-500">
                              {leadFormType === 'business' ? 'Por que essas metas de crescimento são cruciais para a empresa?' : 'Por que essas metas são tão importantes para você?'}
                            </label>
                            <textarea
                              placeholder={leadFormType === 'business' ? 'Descreva o impacto de atingir essas metas no caixa e no valor de mercado da empresa...' : 'Descreva a importância e o impacto de realizá-las na sua qualidade de vida familiar...'}
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
                    {coletaStep === 6 ? 'Continuar' : 'Próxima Pergunta'}
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Coleta de informações</h1>
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
                        {leadFormType === 'business' ? 'Você declarou no formulário de perfil que vê o futuro da sua empresa daqui a 6 meses (se nada mudar na gestão atual) como:' : 'Você declarou no formulário de perfil que vê a sua realidade financeira daqui a 6 meses (se nada mudar no seu comportamento atual) como:'}
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
                      {leadFormType === 'business' ? 'Imagina daqui a 1 ano, com a empresa lucrando mais, caixa organizado e processos contábeis perfeitamente alinhados, o quanto isso te deixa animado?' : 'Imagina daqui a 1 ano, você conseguindo resolver os problemas financeiros que tem e alcançando as suas metas, o quanto isso te deixa animado?'}
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
                          Saiba que a consultoria cabe na sua rotina
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Você precisa de apenas 5 a 15 minutos por dia (isso para os dias que, realmente, tiver necessidade). É algo que vai tomar pouco tempo agora para que você tenha mais tempo depois.
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
                          Excelente! Saiba que a consultoria vai acelerar os seus resultados
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Você precisa de apenas 5 a 15 minutos por dia (isso para os dias que, realmente, tiver necessidade). É algo que vai tomar pouco tempo agora para que você tenha mais tempo depois.
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
                    Retornar
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">
                    {leadFormType === 'business' ? 'Para quem a Assistência Financeira & Contábil gera mais resultado?' : 'Para quem a Consultoria gera mais resultado?'}
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    {leadFormType === 'business' ? 'A assistência foi criada para empresários que desejam clareza, crescimento dos lucros e tranquilidade fiscal.' : 'A consultoria foi criada para pessoas que desejam mais clareza, organização e crescimento patrimonial.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">

                  {/* Para quem serve (4 Cards) */}
                  <div className="lg:col-span-7 bg-dark-900 border border-emerald-500/15 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-2xl"></div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 border-b border-dark-800/60 pb-3">
                        <Check className="w-5 h-5 text-emerald-400 animate-pulse" />
                        {leadFormType === 'business' ? 'A Assistência é ideal para:' : 'A Consultoria é ideal para:'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-5 gap-y-6 md:gap-y-8 pt-6">
                        {/* Card 1 */}
                        <div className="bg-dark-950 border border-dark-800/80 p-5 md:p-6 rounded-2xl flex gap-4 hover:border-emerald-500/20 transition-all group min-h-[140px] flex-col md:flex-row items-start md:items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                            <HelpCircle className="w-5 h-5 md:w-6 h-6" />
                          </div>
                          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Quem fatura bem, mas sente que o caixa da empresa poderia render muito mais.' : 'Quem tem uma boa renda, mas sente que poderia administrar melhor os seus recursos.'}
                          </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-dark-950 border border-dark-800/80 p-5 md:p-6 rounded-2xl flex gap-4 hover:border-emerald-500/20 transition-all group min-h-[140px] flex-col md:flex-row items-start md:items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5 md:w-6 h-6" />
                          </div>
                          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Quem tem metas de expansão para a empresa, mas não desenhou a rota financeira e contábil.' : 'Quem tem objetivos importantes, mas ainda não transformou tudo em um plano claro (com prazos e valores).'}
                          </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-dark-950 border border-dark-800/80 p-5 md:p-6 rounded-2xl flex gap-4 hover:border-emerald-500/20 transition-all group min-h-[140px] flex-col md:flex-row items-start md:items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                            <TrendingDown className="w-5 h-5 md:w-6 h-6" />
                          </div>
                          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Quem sofre com a mistura de contas (PF/PJ) e quer separar definitivamente.' : 'Quem sente que algumas decisões financeiras do passado ainda limitam o seu crescimento.'}
                          </p>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-dark-950 border border-dark-800/80 p-5 md:p-6 rounded-2xl flex gap-4 hover:border-emerald-500/20 transition-all group min-h-[140px] flex-col md:flex-row items-start md:items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 md:w-6 h-6" />
                          </div>
                          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Quem quer otimizar a carga tributária de forma legal e segura para reter mais lucros.' : 'Quem quer fazer seu patrimônio crescer com mais segurança e estratégia.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Problemas que resolve (Gargalos) */}
                  <div className="lg:col-span-5 bg-dark-900 border border-gold-500/15 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-gold-400 flex items-center gap-2 border-b border-dark-800/60 pb-3">
                      <AlertCircle className="w-5 h-5 text-gold-500 animate-pulse" />
                      Desafios mais comuns dos meus clientes:
                    </h3>
                    <ul className="space-y-3.5 text-sm text-gray-300 font-light">
                      <li className="flex items-start gap-3 bg-dark-950 p-4 rounded-2xl border border-dark-800/80 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-white text-sm font-semibold">{leadFormType === 'business' ? 'Falta de controle de fluxo de caixa' : 'Falta de clareza financeira'}</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            {leadFormType === 'business' ? 'Não sabe com precisão o lucro líquido do mês e opera no escuro.' : 'Recebe o dinheiro, mas não tem uma visão completa de para onde ele está sendo direcionado.'}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 bg-dark-950 p-4 rounded-2xl border border-dark-800/80 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-white text-sm font-semibold">{leadFormType === 'business' ? 'Insegurança tributária e contábil' : 'Incerteza sobre o futuro'}</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            {leadFormType === 'business' ? 'Medo de pagar impostos a mais ou cair em malhas fiscais por erros de escrituração.' : 'Dificuldade para saber se o patrimônio atual será suficiente para seus planos e imprevistos.'}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 bg-dark-950 p-4 rounded-2xl border border-dark-800/80 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-white text-sm font-semibold">{leadFormType === 'business' ? 'Ausência de capital de giro' : 'Excesso de dúvidas nas decisões'}</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            {leadFormType === 'business' ? 'Qualquer oscilação de mercado ou atraso de cliente ameaça a sobrevivência da operação.' : 'Muitas options, informações e decisões importantes sem saber qual o melhor caminho deveria seguir.'}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 bg-dark-950 p-4 rounded-2xl border border-dark-800/80 hover:border-gold-500/20 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-white text-sm font-semibold">Falta de execução e acompanhamento</strong>
                          <span className="text-gray-400 text-xs font-light block mt-0.5">
                            Saber o que deveria ser feito, mas não conseguir transformar isso em ação.
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
                    Veja alguns resultados
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 8: PROVAS SOCIAIS */}
            {currentSlide === 'provas_sociais' && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Resultados</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Transformações reais de clientes</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Cada cliente possui uma realidade diferente, mas todos tinham algo em comum: precisavam de clareza para tomar melhores decisões.
                  </p>
                </div>

                {leadFormType === 'business' ? (
                  <div className="bg-dark-900 border border-dark-800 rounded-3xl p-12 text-center space-y-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full filter blur-3xl group-hover:bg-gold-500/10 transition-colors duration-500 animate-pulse"></div>
                    <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center text-gold-500 mx-auto animate-bounce">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white">Cases de Sucesso Empresariais</h3>
                      <p className="text-sm text-gold-500 font-semibold font-mono tracking-widest uppercase">Em Construção</p>
                      <p className="text-xs text-gray-400 font-light leading-relaxed max-w-md mx-auto">
                        Estamos expandindo as ramificações de atendimento corporativo neste exato momento. Em respeito aos acordos de confidencialidade (NDA) das empresas atendidas, os cases de sucesso corporativos estão sendo estruturados e serão divulgados em breve.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-dark-800/60 text-xs text-gray-500">
                      Assistência Financeira & Contabilidade • Diego
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] py-4 bg-dark-950/40 rounded-2xl border border-dark-800/40">
                    <div className="animate-infinite-scroll gap-6">
                      {[...TESTIMONIAL_IMAGES, ...TESTIMONIAL_IMAGES].map((imgUrl, idx) => (
                        <div key={idx} className="flex-shrink-0">
                          <img
                            src={imgUrl}
                            className="h-[280px] md:h-[360px] w-auto object-contain rounded-xl shadow-2xl border border-dark-800/80 hover:border-gold-500/30 transition-all duration-300 select-none"
                            alt={`Depoimento ${idx + 1}`}
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid com 3 Cards Premium */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 ${leadFormType === 'business' ? 'hidden' : ''}`}>
                  {/* Felipe Rossi */}
                  {/* Felipe Rossi */}
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src="images/rossipqdt.jpg"
                          className="w-14 h-14 rounded-full border border-gold-500/40 object-cover shrink-0"
                          alt="Felipe Rossi"
                        />
                        <div>
                          <h4 className="text-base font-serif font-bold text-white leading-tight">Felipe Rossi</h4>
                          <p className="text-[10px] text-gray-500 tracking-wider font-semibold mt-0.5">@rossipqd</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Renda acima de 10 mil reais</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest font-sans">Antes da Consultoria</span>
                          <p className="text-xs text-gray-400 font-light leading-relaxed">
                            Sem tranquilidade por conta da desorganização financeira.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-gold-500 font-extrabold uppercase tracking-widest font-sans">Resultado Alcançado</span>
                          <p className="text-xs text-gray-400 font-light leading-relaxed">
                            Sabe exatamente o quanto precisa antes de começar o mês, a renda sobra até o final do mês, sabe usar corretamente o cartão de crédito e reserva dinheiro mensalmente para gastos eventuais e objetivos.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-green-500 font-extrabold uppercase tracking-widest font-sans">Acumulou mais de R$ 3.700,00 em 2 meses</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dark-850/60">
                      <p className="text-xs text-gray-400 leading-relaxed font-light italic">
                        "Organizou a minha vida financeira e parece que fez reproduzir dinheiro na minha conta."
                      </p>
                    </div>
                  </div>

                  {/* Moises Rios */}
                  <div className="bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src="images/moisesrios.jpg"
                          className="w-14 h-14 rounded-full border border-gold-500/40 object-cover shrink-0"
                          alt="Moises Rios"
                        />
                        <div>
                          <h4 className="text-base font-serif font-bold text-white leading-tight">Moises Rios</h4>
                          <p className="text-[10px] text-gray-500 tracking-wider font-semibold mt-0.5">@moisesr.rios</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Renda até 10 mil reais</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest font-sans">Antes da Consultoria</span>
                          <p className="text-xs text-gray-400 font-light leading-relaxed">
                            Não conseguia organizar o financeiro e sempre gastava tudo o que recebia no mês.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-gold-500 font-extrabold uppercase tracking-widest font-sans">Resultado Alcançado</span>
                          <p className="text-xs text-gray-400 font-light leading-relaxed">
                            Estruturou um orçamento que fazia com que o dinheiro sobrasse no fim do mês e, dessa forma, conseguiu separar mensalmente o dinheiro para seus objetivos.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-green-500 font-extrabold uppercase tracking-widest font-sans">Acumulou mais de R$ 3.400,00 em 2 meses</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dark-850/60">
                      <p className="text-xs text-gray-400 leading-relaxed font-light italic">
                        "Agora com as orientações e a técnica, aprendi a separar o dinheiro em metas e ver o resultado crescendo todo dia."
                      </p>
                    </div>
                  </div>

                  {/* O que nossos clientes conquistam (Card 3 Informativo sem Imagem) */}
                  <div className="bg-dark-900/60 border border-dark-800/80 hover:border-gold-500/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-16 -top-16 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-colors duration-500 animate-pulse" />

                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gold-500" />
                        <h4 className="text-base font-serif font-bold text-white leading-tight">O que nossos clientes conquistam</h4>
                      </div>

                      <ul className="space-y-3.5">
                        {[
                          "Mais clareza sobre o dinheiro",
                          "Controle sem abrir mão da qualidade de vida",
                          "Segurança para investir",
                          "Planejamento para objetivos importantes",
                          "Tranquilidade para o futuro",
                          "Acompanhamento nas decisões"
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                            <span className="text-xs text-gray-300 font-light leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dark-850/60 text-center">
                      <p className="text-[10px] text-gold-500/60 font-semibold uppercase tracking-wider">
                        A Consultoria é estruturada para cada pessoa
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Como isso funciona na prática?</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Cada etapa tem um objetivo simples: dar mais clareza, controle e segurança para suas decisões financeiras.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  {/* Tópico 1: O que iremos fazer? */}
                  <div className="bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden text-left flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-gold-400 flex items-center gap-2 border-b border-dark-800/60 pb-3">
                      <Sparkles className="w-5 h-5 text-gold-500" />
                      O que iremos fazer?
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Eye className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{leadFormType === 'business' ? 'Mapear o fluxo de caixa diário' : 'Ver para onde o dinheiro está indo'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Utilizar ferramentas práticas e automatizadas integradas à contabilidade para registrar entradas e saídas.' : 'Utilizar de um app (muito fácil de usar), que não tome muito tempo e que encaixe no seu dia a dia.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Link className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{leadFormType === 'business' ? 'Separar contas PF e PJ' : 'Unificar suas contas'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Criar regras rígidas e processos de tesouraria para eliminar a mistura de despesas pessoais com o caixa corporativo.' : 'Visualizar em uma única tela o que tá entrando, saindo e pra onde. É facilidade para entender o que está acontecendo.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-gold-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Target className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{leadFormType === 'business' ? 'Planejar orçamentos por setor' : 'Criar um orçamento mensal'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Definir limites de gastos, metas de lucratividade por produto/serviço e planos de reinvestimento.' : 'Definir um planejamento financeiro que respeite sua realidade e esteja alinhado aos seus objetivos.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tópico 2: O que isso muda para você? */}
                  <div className="bg-dark-900 border border-dark-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg relative overflow-hidden text-left flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-2xl"></div>
                    <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 border-b border-dark-800/60 pb-3">
                      <Target className="w-5 h-5 text-emerald-400" />
                      O que isso muda para você?
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">{leadFormType === 'business' ? 'Eliminar ansiedade sobre folha e impostos' : 'Eliminar ansiedade e incerteza'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Ter clareza absoluta sobre o capital de giro necessário para cumprir compromissos fiscais e de equipe.' : 'Porque ter clareza sobre o dinheiro reduz a insegurança e permite decisões mais conscientes.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Coins className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">{leadFormType === 'business' ? 'Visualizar lucratividade real' : 'Saber tudo por categoria'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Saber com exatidão qual produto ou serviço gera caixa de verdade e qual está dando prejuízo oculto.' : 'Quando você vê o que sai no horizonte de um mês, entende o quanto está saindo no total por finalidade. (Recebe 5k, saindo 6k, e desses 6k, vai ver que 40% só com alimentação).'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Brain className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">{leadFormType === 'business' ? 'Tomar decisões baseadas em dados' : 'Conseguir trabalhar por tópicos'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Ter relatórios contábeis e de caixa claros em tempo real para embasar planos de expansão ou contenção de custos.' : 'Mantendo sua qualidade de vida, mas fazendo com que você prospere mais e fique menos preocupado com dinheiro.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-dark-950 p-4 rounded-xl border border-dark-800/60 hover:border-emerald-500/20 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Compass className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white font-serif">{leadFormType === 'business' ? 'Blindagem e segurança fiscal' : 'Ver a verdadeira realidade'}</h4>
                          <p className="text-xs text-gray-400 font-light mt-1 leading-relaxed">
                            {leadFormType === 'business' ? 'Reduzir riscos de fiscalização com um processo contábil rigoroso e perfeitamente ajustado.' : 'Dessa forma é possível fazer os ajustes necessários dentro do seu orçamento.'}
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
                    {leadFormType === 'business' ? 'A estrutura que sua empresa precisa para otimizar lucros, organizar o caixa e blindar a contabilidade.' : 'A estrutura que você precisa para organizar sua vida financeira e colocar todos os seus planos em prática.'}
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
                          {leadFormType === 'business' ? 'Reunião estratégica individual para mapear processos contábeis e de caixa, identificar gargalos operacionais e definir ações imediatas.' : 'Encontro individual para entender o detalhe da sua realidade financeira, organizar prioridades e construir um plano de ação personalizado.'}
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
                          {leadFormType === 'business' ? 'Suporte contínuo para sua equipe financeira ou sócios pelo WhatsApp durante 30 dias para apoiar a implementação dos processos.' : 'Suporte pelo WhatsApp durante 30 dias para tirar dúvidas, acompanhar a execução e ajustar o plano sempre que necessário.'}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-3xl flex flex-col justify-between shadow-md group transition-all">
                      <div className="space-y-4">
                        <span className="p-3 bg-dark-950 text-gold-500 rounded-2xl border border-dark-800/80 inline-flex group-hover:scale-110 transition-transform">
                          <Compass className="w-5 h-5" />
                        </span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">Ferramenta de controle financeiro</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            Acesso durante toda a consultoria de um ambiente organizado para registrar e acompanhar a sua vida financeira.
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
                          <h4 className="font-bold text-white text-sm">Análise completa da sua situação financeira</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Revisão das notas fiscais emitidas, enquadramento do Simples Nacional ou Lucro Presumido e análise de pró-labore.' : <>Mapeamento detalhado de dívidas existentes, levantamento do custo de vida e a visualização da relação <strong>"Tempo x Valor"</strong> do seu trabalho.</>}
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
                          <h4 className="font-bold text-white text-sm">{leadFormType === 'business' ? 'Auditoria de Custos & Desperdícios' : 'Revisão dos seus gastos'}</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Varredura detalhada dos custos fixos, tarifas bancárias e despesas com fornecedores para maximizar as margens.' : 'Avaliamos seus gastos para identificar oportunidades de economia e melhor aproveitamento do seu dinheiro.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-dark-900 border border-dark-800 hover:border-gold-500/10 rounded-3xl flex flex-col justify-between shadow-md group transition-all">
                      <div className="space-y-4">
                        <span className="p-3 bg-dark-950 text-gold-500 rounded-2xl border border-dark-800/80 inline-flex group-hover:scale-110 transition-transform">
                          <RefreshCw className="w-5 h-5" />
                        </span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">Sessão de retorno</h4>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            {leadFormType === 'business' ? 'Encontro de fechamento após os 30 dias para avaliar a evolução das margens de lucro e projetar as próximas metas comerciais da empresa.' : 'Encontro de fechamento após os 30 dias para analisar os resultados alcançados e planejar os próximos passos.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destaque de Rodapé */}
                <div className="pt-6 border-t border-dark-800/60 text-center">
                  <p className="text-sm text-gold-450 font-serif italic max-w-2xl mx-auto leading-relaxed">
                    {leadFormType === 'business' ? '"É uma estrutura de entrega corporativa e contábil integrada, planejada sob medida para impulsionar a saúde e o lucro do seu negócio."' : '"É uma estrutura de entrega robusta, que poucas empresas conseguem entregar algo que seja parecido."'}
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">O momento da escolha</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Agora você se depara com duas realidades possíveis para a sua vida financeira daqui para frente.
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
                        No filme Matrix, são <span className="text-white font-bold">duas pílulas, duas direções.</span> Qual caminho você escolherá trilhar a partir de hoje?
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
                        <h3 className="text-xl font-serif font-bold text-blue-400 border-b border-dark-800 pb-2">Continuar como está</h3>
                        <p className="text-sm text-gray-300 font-light leading-relaxed">
                          Finalizamos a conversa, mesmo sabendo que eu consigo te ajudar.
                        </p>
                        <p className="text-xs text-gray-450 font-light leading-relaxed">
                          É você sozinho...
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
                          <h3 className="text-lg font-serif font-bold text-blue-400 border-b border-dark-850 pb-2">Continuar como está</h3>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            Finalizamos a conversa, mesmo sabendo que eu consigo te ajudar.
                          </p>
                          <p className="text-xs text-gray-450 font-light leading-relaxed">
                            É você sozinho...
                          </p>
                        </div>
                      </div>

                      {/* Card Pílula Vermelha (Estático) */}
                      <div className="flex flex-col items-center space-y-6">
                        <img src="/images/pilulavermelha.png" alt="Pílula Vermelha" className="w-36 h-auto object-contain animate-pulse" />
                        <div className="bg-dark-900 border border-gold-500/20 p-6 md:p-8 rounded-3xl text-left space-y-4 shadow-xl w-full min-h-[220px]">
                          <h3 className="text-lg font-serif font-bold text-red-400 border-b border-dark-850 pb-2">Seguir com a Consultoria</h3>
                          <p className="text-xs text-gray-300 font-light leading-relaxed">
                            Eu te ajudo! Começamos da maneira correta, estruturando o seu financeiro para resolver os problemas, tirando dúvidas e com um plano de ação simples para colocar em prática.
                          </p>
                          <p className="text-xs text-gray-300 font-light leading-relaxed">
                            É você com solução e suporte!
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
                    O caminho da pílula vermelha exige comprometimento.
                  </p>
                  <p className="text-gray-400 text-sm md:text-base font-light">
                    <span className="text-gold-500 font-bold">FINGE QUE</span> que essa solução que estou te mostrando <span className="text-gold-500 font-bold">É DE GRAÇA</span>, você apertaria a minha mão agora e nós seguiríamos em frente?
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
                    <span className="text-[10px] text-gray-500 font-light block mt-1">Desejo iniciar um caminho diferente hoje.</span>
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Eu quero que você também tenha resultados!</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
                    Você entendeu o valor, o preço é apenas uma balança para medir o resultado que você procura.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Card Principal: Informações Gerais */}
                  <div className="bg-dark-900/60 backdrop-blur-md border border-dark-800 rounded-3xl p-6 md:p-8 flex gap-5 items-start shadow-xl relative overflow-hidden group hover:border-dark-750 transition-all duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center text-gold-500 shadow-inner">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                        O melhor é que a consultoria irá entrar no seu orçamento de maneira leve, sem comprometer nada do que você tenha.
                      </p>
                    </div>
                  </div>

                  {/* Card Premium Destacado: Frase */}
                  <div className="bg-gradient-to-r from-gold-500/15 via-gold-500/5 to-transparent border border-gold-500/20 rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-xl relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
                    {/* Efeito de brilho de fundo */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-all duration-300"></div>

                    <div className="flex-shrink-0 w-12 h-12 bg-gold-500/20 border border-gold-500/40 rounded-2xl flex items-center justify-center text-gold-400 shadow-lg">
                      <TrendingUp className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gold-500 font-mono uppercase tracking-widest font-black">Princípio de Alinhamento</span>
                      <p className="text-base md:text-lg font-serif italic text-white leading-relaxed font-bold">
                        "Investir em conhecimento rende sempre os melhores juros!"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => navigateTo('justica_valor')}
                    className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Potencial Retorno
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 14: ECONOMIA E VALOR JUSTO (NOVO) */}
            {currentSlide === 'justica_valor' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Alinhamento de Valor</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Impacto real no seu bolso</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light max-w-xl mx-auto">
                    {leadFormType === 'business' ? (
                      <>
                        A média de recuperação de caixa ou aumento de lucros que meus clientes empresariais têm no geral após os ajustes iniciais que faremos juntos é de, no mínimo, <span className="text-gold-500 font-bold">R$ 2.000,00 por mês</span>.
                      </>
                    ) : (
                      <>
                        A média de economia que meus clientes têm no geral após os ajustes iniciais que faremos juntos é de, no mínimo, <span className="text-gold-500 font-bold">R$ 500,00 por mês</span>.
                      </>
                    )}
                  </p>
                </div>

                {/* Exibição Visual da Economia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
                  <div className="p-6 bg-dark-900 border border-dark-800 rounded-3xl text-center space-y-2 shadow-lg">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider font-mono">Economia Mensal</span>
                    <h2 className="text-3xl font-serif font-extrabold text-gold-500">{leadFormType === 'business' ? 'R$ 2.000,00' : 'R$ 500,00'}</h2>
                    <p className="text-[10px] text-gray-400">Recuperados todo mês</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-3xl text-center space-y-2 shadow-lg">
                    <span className="text-[10px] text-gold-500 uppercase font-bold tracking-wider font-mono">Economia no Ano</span>
                    <h2 className="text-3xl font-serif font-extrabold text-white">{leadFormType === 'business' ? 'R$ 24.000,00' : 'R$ 6.000,00'}</h2>
                    <p className="text-[10px] text-gray-400">Total acumulado em 12 meses</p>
                  </div>
                </div>

                {justicaOption === null ? (
                  <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-center max-w-xl mx-auto">
                    <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed italic">
                      {leadFormType === 'business'
                        ? '"Ter a capacidade de recuperar esse valor com o que eu vou te passar nos próximos dias e eu te cobrar R$ 5.000,00 pela assistência e contabilidade integrada você acredita ser um valor justo?"'
                        : '"Ter a capacidade de economizar esse valor com o que eu vou te passar nos próximos dias e eu te cobrar R$ 2.000,00 pela consultoria você acredita ser um valor justo?"'}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                      <button
                        onClick={() => setJusticaOption('sim')}
                        className="px-6 py-3 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/5 hover:shadow-gold-500/20"
                      >
                        Sim, é justo
                      </button>
                      <button
                        onClick={() => setJusticaOption('nao')}
                        className="px-6 py-3 bg-dark-850 hover:bg-dark-800 text-gray-300 hover:text-white border border-dark-800 hover:border-dark-750 font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Não, não acho justo
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl max-w-xl mx-auto"
                  >
                    {justicaOption === 'sim' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gold-500 border-b border-dark-800 pb-3">
                          <CheckCircle2 className="w-5 h-5" />
                          <h4 className="font-bold text-white text-base">Você reconhece o valor.</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-350 font-light leading-relaxed">
                          {leadFormType === 'business' ? (
                            <>
                              Recuperar <span className="text-gold-500 font-bold">R$ 24.000,00 por ano</span> investindo <span className="text-green-500 font-bold">R$ 5.000,00</span> é um excelente negócio — representa um saldo positivo de <span className="text-green-500 font-bold">R$ 19.000,00</span> que hoje, possivelmente, sua empresa não tem ou não consiga economizar.
                            </>
                          ) : (
                            <>
                              Recuperar <span className="text-gold-500 font-bold">R$ 6.000,00 por ano</span> investindo <span className="text-green-500 font-bold">R$ 2.000,00</span> é um excelente negócio — representa um saldo positivo de <span className="text-green-500 font-bold">R$ 4.000,00</span> que hoje, possivelmente, você não tem ou não consiga economizar.
                            </>
                          )}
                        </p>

                        <div className="text-center py-4 px-6 bg-red-950/20 border border-red-900/30 rounded-2xl max-w-lg mx-auto mt-6 animate-pulse">
                          <p className="text-sm md:text-base text-red-500 font-extrabold leading-relaxed uppercase tracking-wide">
                            Contudo, por mais que esse seja o valor considerado justo por nós dois, {leadFormType === 'business' ? 'eu não vou te cobrar R$ 5.000,00 hoje pela minha assistência integrada.' : 'eu não vou te cobrar R$ 2.000,00 hoje pela minha consultoria.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-red-400 border-b border-dark-800 pb-3">
                          <X className="w-5 h-5" />
                          <h4 className="font-bold text-white text-base">Compreendo o seu ponto de vista...</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-350 font-light leading-relaxed">
                          Mas pense comigo: se eu te ajudar a ter <span className="text-green-500 font-bold">R$ 4.000,00 a mais</span> no bolso todos os anos (que hoje você não tem ou não consegue guardar sozinho), isso já seria um negócio extremamente vantajoso para você, concorda?
                        </p>
                        <p className="text-xs md:text-sm text-gray-350 font-light leading-relaxed">
                          O justo aqui seria o compartilhamento de informações que traria não só <span className="text-green-500 font-bold">R$ 500,00 mensais</span> a você, da mesma forma que eu sou recompensado pelo meu tempo e esforço em te guiar. E note que em alguns meses você poderá conseguir muito mais, assim como os alunos que te mostrei que guardaram mais de <span className="text-gold-500 font-bold">R$ 1.500,00 por mês</span> no acompanhamento. Tende a ser um crescimento financeiro constante.
                        </p>

                        <div className="text-center py-4 px-6 bg-red-950/20 border border-red-900/30 rounded-2xl max-w-lg mx-auto mt-6 animate-pulse">
                          <p className="text-sm md:text-base text-red-500 font-extrabold leading-relaxed uppercase tracking-wide">
                            {leadFormType === 'business' ? 'Mesmo assim, eu não vou te cobrar esse valor (R$ 5.000,00) por isso, por mais que eu acredite que seria o justo.' : 'Mesmo assim, eu não vou te cobrar esse valor (R$ 2.000,00) por isso, por mais que eu acredite que seria o justo.'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center pt-4 border-t border-dark-800/60">
                      <button
                        onClick={() => navigateTo('investimento_padrao')}
                        className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl shadow-lg transition-all duration-300 uppercase tracking-widest text-xs flex items-center gap-2"
                      >
                        Conhecer Investimento
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* SLIDE 14: PREÇO PADRÃO */}
            {currentSlide === 'investimento_padrao' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Investimento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Consultoria Financeira</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Escolha a opção de pagamento que melhor se adequa para você, hoje.
                  </p>
                </div>

                <div className="bg-dark-900 border border-gold-500/20 max-w-lg mx-auto rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">
                  {revelarPrecoPadrao && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-red-500 text-dark-950 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {leadFormType === 'business' ? 'Ao invés de R$ 5.000' : 'Ao invés de R$ 2.000'}
                    </div>
                  )}

                  {/* Botão de Copiar Link Unificado (Canto Superior Esquerdo) */}
                  {(!!(consultoriaParceladoOption && consultoriaParceladoOption.checkoutType !== 'maquininha' && consultoriaParceladoOption.link) ||
                    !!(consultoriaVistaOption && consultoriaVistaOption.checkoutType !== 'maquininha' && consultoriaVistaOption.link)) && (
                      <div className="absolute top-4 left-4 z-20">
                        <button
                          type="button"
                          onClick={() => setActiveCopyMenu(activeCopyMenu === 'padrao' ? null : 'padrao')}
                          className={`p-2 rounded-full transition-all cursor-pointer shadow-md ${activeCopyMenu === 'padrao'
                            ? 'bg-gold-500 text-dark-950 border border-gold-500'
                            : 'bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-gold-500/30 text-gray-455 hover:text-gold-400'
                            }`}
                          title="Copiar Links de Pagamento"
                        >
                          <Link className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeCopyMenu === 'padrao' && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveCopyMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-10 left-0 z-20 w-52 bg-dark-950 border border-dark-800 rounded-2xl p-2.5 shadow-2xl space-y-1 text-left"
                              >
                                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest px-2 block mb-1">Qual link copiar?</span>

                                {!!(consultoriaParceladoOption && consultoriaParceladoOption.checkoutType !== 'maquininha' && consultoriaParceladoOption.link) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopyLink(consultoriaParceladoOption.link, 'Parcelado');
                                      setActiveCopyMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-900 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span>Opção Parcelada</span>
                                    {copiedText === 'Parcelado' ? (
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                )}

                                {!!(consultoriaVistaOption && consultoriaVistaOption.checkoutType !== 'maquininha' && consultoriaVistaOption.link) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopyLink(consultoriaVistaOption.link, 'À Vista');
                                      setActiveCopyMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-900 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span>Opção À Vista</span>
                                    {copiedText === 'À Vista' ? (
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                  {/* Botão de Negociação (Formas de Pagamento) */}
                  <button
                    type="button"
                    onClick={() => setPaymentDetailsModal(paymentDetailsModal === 'padrao' ? null : 'padrao')}
                    className="absolute top-4 left-14 p-2 bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-gold-500/30 text-gray-455 hover:text-gold-400 rounded-full transition-all cursor-pointer shadow-md z-10"
                    title="Negociar / Opções de Pagamento"
                  >
                    <Coins className="w-4 h-4" />
                  </button>

                  <div className="space-y-2">
                    <h4 className="text-sm text-gold-500 uppercase tracking-widest font-bold font-mono">Programa Completo</h4>
                    {!revelarPrecoPadrao ? (
                      <div className="py-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setRevelarPrecoPadrao(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                        >
                          <Coins className="w-4 h-4 animate-bounce" />
                          Revelar Investimento
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center gap-1">
                          {renderParceladoPremium(displayParcelado, "text-3xl md:text-4xl")}
                        </div>
                        <div className="text-xs text-gray-455 font-light flex items-center justify-center gap-1.5 mt-1">
                          ou à vista, com um desconto AINDA MELHOR <span className="text-sky-400 font-bold"> por {displayAVista}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="text-xs text-gray-400 space-y-2 py-4 border-t border-b border-dark-800 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Sessão de 1h 30min
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Acompanhamento de 30 dias
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Ferramenta de controle financeiro durante acompanhamento
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Análise completa da sua situação financeira
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Revisão dos seus gastos
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Sessão de retorno <span className="text-gold-400 font-bold"> (APROX. 1H E 30MIN)</span>
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

                    {/* Recusou - Oculto por padrão, visível com hover */}
                    <div className="h-9 flex items-center justify-center">
                      <button
                        onClick={async () => {
                          handleInputChange('investmentChoice', 'Recusou');
                          await saveToSupabase({
                            ...meetingAnswers,
                            investmentChoice: 'Recusou'
                          });
                          navigateTo('argumentacao_especial');
                        }}
                        className="w-full py-2 text-gray-600 hover:text-red-400 uppercase tracking-widest text-[9px] font-black opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      >
                        Não é viável neste valor
                      </button>
                    </div>

                    {/* Encerrar Apresentação - Oculto por padrão, visível com hover */}
                    <div className="h-9 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmarEncerramentoModal(true);
                        }}
                        className="w-full py-2 text-gray-600 hover:text-red-500 uppercase tracking-widest text-[9px] font-black opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      >
                        Encerrar a Apresentação
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE INTERMEDIÁRIO: ARGUMENTAÇÃO DA CONDIÇÃO ESPECIAL */}
            {currentSlide === 'argumentacao_especial' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Comprometimento</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Existem 2 tipos de pessoas que não pagam o valor normal</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Abro uma condição exclusiva na consultoria, apenas, para esses perfis de pessoas.
                  </p>
                </div>

                {/* Os 2 tipos de pessoas colocados em cards premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
                  <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 hover:border-gold-500/20 transition-all shadow-xl">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white">Indicados</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      São parecidos com quem já está tendo resultados. Eu quero trabalhar com pessoas assim, porque também terão sucesso e é mais provável que também vão me indicar para outras pessoas iguais à ela.
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 hover:border-gold-500/20 transition-all shadow-xl">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white">Comprometidos</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      As que passam por uma reunião como essa e percebo que, mesmo tendo DESAFIOS que eu consigo resolver, elas APARENTAM ter o COMPROMETIMENTO para executar o que combinamos.
                    </p>
                  </div>
                </div>

                {/* Frases de Argumentação e Comprometimento */}
                <div className="text-center space-y-6 pt-4 max-w-2xl mx-auto">
                  <div className="p-5 bg-red-950/20 border border-red-500/15 rounded-2xl animate-pulse">
                    <p className="text-red-500 font-bold text-xs md:text-sm leading-relaxed">
                      Quem demora 2, 3, 7 dias para decidir entrar, também são aqueles que demoram para executar, acabam não fazendo e, consequentemente, não tem resultado.
                    </p>
                  </div>

                  <p className="text-sky-400 font-extrabold text-sm md:text-base">
                    Por isso eu beneficio quem age rápido, porque eu sei que estes viram case de sucesso!
                  </p>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => navigateTo('condicao_especial')}
                    className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-dark-950 font-black rounded-xl transition-all uppercase tracking-widest text-[11px] cursor-pointer shadow-lg hover:shadow-gold-500/10 inline-flex items-center gap-2"
                  >
                    <span>Condição Especial para Fechamento em Reunião</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 15: CONDIÇÃO ESPECIAL */}
            {currentSlide === 'condicao_especial' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono">Exclusivo</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Condição Especial</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Existem situações onde abro vagas que viabilizam o orçamento do cliente, especificamente, daqueles que fazem parte dos 2 perfis apresentados.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 max-w-lg mx-auto rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">
                  {revelarPrecoEspecial && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-red-500 text-dark-950 text-[10px] font-black rounded-full uppercase tracking-widest">
                      Ao invés de {displayParcelado} (ou à vista {displayAVista})
                    </div>
                  )}

                  {/* Botão de Copiar Link Unificado (Canto Superior Esquerdo) */}
                  {(!!(especialParceladoOption && especialParceladoOption.checkoutType !== 'maquininha' && especialParceladoOption.link) ||
                    !!(especialVistaOption && especialVistaOption.checkoutType !== 'maquininha' && especialVistaOption.link)) && (
                      <div className="absolute top-4 left-4 z-20">
                        <button
                          type="button"
                          onClick={() => setActiveCopyMenu(activeCopyMenu === 'especial' ? null : 'especial')}
                          className={`p-2 rounded-full transition-all cursor-pointer shadow-md ${activeCopyMenu === 'especial'
                            ? 'bg-gold-500 text-dark-950 border border-gold-500'
                            : 'bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-gold-500/30 text-gray-455 hover:text-gold-400'
                            }`}
                          title="Copiar Links de Pagamento"
                        >
                          <Link className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeCopyMenu === 'especial' && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveCopyMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-10 left-0 z-20 w-52 bg-dark-950 border border-dark-800 rounded-2xl p-2.5 shadow-2xl space-y-1 text-left"
                              >
                                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest px-2 block mb-1">Qual link copiar?</span>

                                {!!(especialParceladoOption && especialParceladoOption.checkoutType !== 'maquininha' && especialParceladoOption.link) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopyLink(especialParceladoOption.link, 'Condição Especial Parcelado');
                                      setActiveCopyMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-900 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span>Opção Parcelada</span>
                                    {copiedText === 'Condição Especial Parcelado' ? (
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                )}

                                {!!(especialVistaOption && especialVistaOption.checkoutType !== 'maquininha' && especialVistaOption.link) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopyLink(especialVistaOption.link, 'Condição Especial À Vista');
                                      setActiveCopyMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-900 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span>Opção À Vista</span>
                                    {copiedText === 'Condição Especial À Vista' ? (
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                  {/* Botão de Negociação (Formas de Pagamento) */}
                  <button
                    type="button"
                    onClick={() => setPaymentDetailsModal(paymentDetailsModal === 'especial' ? null : 'especial')}
                    className="absolute top-4 left-14 p-2 bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-gold-500/30 text-gray-455 hover:text-gold-400 rounded-full transition-all cursor-pointer shadow-md z-10"
                    title="Negociar / Opções de Pagamento"
                  >
                    <Coins className="w-4 h-4" />
                  </button>

                  <div className="pt-4"></div>

                  <div className="space-y-2">
                    <h4 className="text-sm text-gold-500 uppercase tracking-widest font-mono font-bold">Investimento</h4>
                    {!revelarPrecoEspecial ? (
                      <div className="py-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setRevelarPrecoEspecial(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                        >
                          <Coins className="w-4 h-4 animate-bounce" />
                          Revelar Condição Especial
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center gap-1">
                          {renderParceladoPremium(displayEspecial2, "text-3xl md:text-4xl")}
                        </div>
                        <div className="text-xs text-gray-455 font-light flex items-center justify-center gap-1.5 mt-1">
                          ou à vista, com um desconto AINDA MELHOR <span className="text-sky-400 font-bold">por {displayEspecial1}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="text-xs text-gray-400 space-y-2 py-4 border-t border-b border-dark-800 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Sessão de 1h 30min
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Acompanhamento de 30 dias
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Ferramenta de controle financeiro durante acompanhamento
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Análise completa da sua situação financeira
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Revisão dos seus gastos
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Sessão de retorno <span className="text-gold-400 font-bold"> (APROX. 1H E 30MIN)</span>
                    </li>
                  </ul>

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
                      Seguir com Pagamento à Vista
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
                      Seguir com Pagamento Parcelado
                    </button>

                    {/* Ainda Não - Oculto por padrão, visível com hover */}
                    <div className="h-9 flex items-center justify-center">
                      <button
                        onClick={async () => {
                          handleInputChange('negotiationChoice', 'Recusou');
                          await saveToSupabase({
                            ...meetingAnswers,
                            negotiationChoice: 'Recusou'
                          });
                          navigateTo('downsell');
                        }}
                        className="w-full py-2 text-gray-600 hover:text-red-400 uppercase tracking-widest text-[9px] font-black opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      >
                        Ainda não é viável para mim
                      </button>
                    </div>

                    {/* Encerrar Apresentação - Oculto por padrão, visível com hover */}
                    <div className="h-9 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmarEncerramentoModal(true);
                        }}
                        className="w-full py-2 text-gray-600 hover:text-red-500 uppercase tracking-widest text-[9px] font-black opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      >
                        Encerrar a Apresentação
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 16: DOWNSELL */}
            {currentSlide === 'downsell' && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">Última Oportunidade</h3>
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Método Enquadramento Financeiro</h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
                    Se hoje a consultoria ainda não faz sentido para você, existe uma forma de começar sozinho, no seu ritmo, seguindo exatamente o mesmo método, os mesmos materiais e a mesma ferramenta que utilizo com meus clientes.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 max-w-lg mx-auto rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">



                  {/* Botão de Copiar Link Unificado (Canto Superior Esquerdo) */}
                  {(!!(entradaParceladoOption && entradaParceladoOption.checkoutType !== 'maquininha' && entradaParceladoOption.link) ||
                    !!(entradaVistaOption && entradaVistaOption.checkoutType !== 'maquininha' && entradaVistaOption.link)) && (
                      <div className="absolute top-4 left-4 z-20">
                        <button
                          type="button"
                          onClick={() => setActiveCopyMenu(activeCopyMenu === 'downsell' ? null : 'downsell')}
                          className={`p-2 rounded-full transition-all cursor-pointer shadow-md ${activeCopyMenu === 'downsell'
                            ? 'bg-gold-500 text-dark-950 border border-gold-500'
                            : 'bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-gold-500/30 text-gray-455 hover:text-gold-400'
                            }`}
                          title="Copiar Links de Pagamento"
                        >
                          <Link className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeCopyMenu === 'downsell' && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveCopyMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-10 left-0 z-20 w-52 bg-dark-950 border border-dark-800 rounded-2xl p-2.5 shadow-2xl space-y-1 text-left"
                              >
                                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest px-2 block mb-1">Qual link copiar?</span>

                                {!!(entradaParceladoOption && entradaParceladoOption.checkoutType !== 'maquininha' && entradaParceladoOption.link) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopyLink(entradaParceladoOption.link, 'Downsell Parcelado');
                                      setActiveCopyMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-900 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span>Opção Parcelada</span>
                                    {copiedText === 'Downsell Parcelado' ? (
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                )}

                                {!!(entradaVistaOption && entradaVistaOption.checkoutType !== 'maquininha' && entradaVistaOption.link) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopyLink(entradaVistaOption.link, 'Downsell À Vista');
                                      setActiveCopyMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-900 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span>Opção À Vista</span>
                                    {copiedText === 'Downsell À Vista' ? (
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                  {/* Botão de Negociação (Formas de Pagamento) */}
                  <button
                    type="button"
                    onClick={() => setPaymentDetailsModal(paymentDetailsModal === 'downsell' ? null : 'downsell')}
                    className="absolute top-4 left-14 p-2 bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-gold-500/30 text-gray-455 hover:text-gold-400 rounded-full transition-all cursor-pointer shadow-md z-10"
                    title="Negociar / Opções de Pagamento"
                  >
                    <Coins className="w-4 h-4" />
                  </button>

                  <div className="space-y-2">
                    <h4 className="text-sm text-gold-500 uppercase tracking-widest font-bold font-mono">Tudo o que Você Recebe</h4>
                    {!revelarPrecoDownsell ? (
                      <div className="py-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setRevelarPrecoDownsell(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                        >
                          <Coins className="w-4 h-4 animate-bounce" />
                          Revelar Investimento
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center gap-1">
                          {renderParceladoPremium(leadFormType === 'business' ? '12x de R$ 99,70' : (entradaParceladoOption ? formatPaymentOptionValue(entradaParceladoOption, true) : '12x de R$ 15,20'), "text-3xl md:text-4xl")}
                        </div>
                        <div className="text-xs text-gray-455 font-light flex items-center justify-center gap-1.5 mt-1">
                          ou à vista, com um desconto AINDA MELHOR <span className="text-sky-400 font-bold">por {leadFormType === 'business' ? 'R$ 997,00' : (entradaVistaOption ? formatPaymentOptionValue(entradaVistaOption) : 'R$ 147,00')}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="text-xs text-gray-400 space-y-2 py-4 border-t border-b border-dark-800 text-left max-w-xs mx-auto font-light">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Todo o passo a passo para organizar sua vida financeira
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Plataforma exclusiva "Solum Financeiro"
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold-500" />
                      Garantia incondicional de 7 dias
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Materiais práticos para aplicar durante o processo
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Como usar o cartão de crédito de maneira inteligente
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      Calculadora para quitar empréstimos mais rápido
                    </li>
                    <li className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-gold-500" />
                      10 Rotinas para Sempre Ter Dinheiro
                    </li>
                  </ul>

                  {/* Card Premium de Garantia Incondicional */}
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 max-w-xs mx-auto text-left flex gap-3 items-start shadow-md">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">Sem risco para você</span>
                      <h5 className="text-xs font-serif font-bold text-white leading-tight">Garantia Incondicional de 7 dias</h5>
                      <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                        Aprende todo o método e experimenta a ferramenta. Se achar que não é para você, eu te devolvo o valor total investido.
                      </p>
                    </div>
                  </div>

                  {/* Observação em Gold */}
                  <div className="text-[10px] text-gold-500/90 font-medium max-w-xs mx-auto text-center leading-relaxed">
                    💡 Acesso anual à plataforma, atualizações, comunidade e materiais durante a vigência da assinatura.
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
                      Seguir com Pagamento à Vista
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
                      Seguir com Pagamento Parcelado
                    </button>

                    {/* Recusou definitivo - Oculto por padrão, visível com hover */}
                    <div className="h-9 flex items-center justify-center">
                      <button
                        onClick={async () => {
                          handleInputChange('downsellChoice', 'Recusou');
                          await saveToSupabase({
                            ...meetingAnswers,
                            downsellChoice: 'Recusou'
                          });
                          navigateTo('agradecimento_final');
                        }}
                        className="w-full py-2 text-gray-600 hover:text-red-400 uppercase tracking-widest text-[9px] font-black opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      >
                        Prefiro não seguir agora
                      </button>
                    </div>

                    {/* Encerrar Apresentação - Oculto por padrão, visível com hover */}
                    <div className="h-9 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmarEncerramentoModal(true);
                        }}
                        className="w-full py-2 text-gray-600 hover:text-red-500 uppercase tracking-widest text-[9px] font-black opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      >
                        Encerrar a Apresentação
                      </button>
                    </div>
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
                    Parabéns pela decisão de iniciar sua consultoria!
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="grid grid-cols-1 gap-6 text-sm">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        1
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Aprovação do Pagamento</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Acesso ao método de pagamento correspondente à opção escolhida (à vista ou parcelado) para aprovação e transação segura.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        2
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Grupo Fechado, Contrato e Onboarding</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Você receberá o convite para participar do grupo da Consultoria no WhatsApp, onde receberá o contrato de prestação de serviços, para assinatura digital, e o acesso da ferramenta Solum Financeiro, para preencher o Mapeamento de Dívidas, Custo de Vida e Anamnese.
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
                          Após preenchimento do Onboarding, agendaremos o dia e o horário da sua primeira reunião.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        4
                      </span>
                      <div>
                        <h4 className="font-bold text-white">1ª Sessão (Consultoria Financeira)</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Será apresentado o diagnóstico financeiro, o plano de ação e como executar o plano de ação.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        5
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Acompanhamento de 30 dias</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Haverá acompanhamento por 30 dias para tirar dúvidas. Pode acontecer de durar mais dias, pois ele se estenderá até o dia da reunião de retorno.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        6
                      </span>
                      <div>
                        <h4 className="font-bold text-white">2ª Sessão (Pós-Consultoria)</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Haverá uma reunião de retorno para entender como foi a execução do plano de ação, quais foram as dificuldades encontradas, quais foram os resultados alcançados e quais serão os próximos passos.
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
                  <h1 className="font-serif font-bold text-3xl md:text-5xl text-white">Próximos Passos</h1>
                  <p className="text-gray-400 text-sm md:text-base font-light">
                    Parabéns pela decisão de iniciar sua organização financeira! O processo a partir de agora é rápido e simples. Basta seguir os próximos passos para liberar seu acesso.
                  </p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="grid grid-cols-1 gap-6 text-sm">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        1
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Aprovação do Pagamento</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Após a confirmação do pagamento, seu acesso será liberado automaticamente.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        2
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Acesse a Plataforma</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Você receberá um e-mail da Hotmart com o link para criar sua senha e entrar na área de membros.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        3
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Comece pelo 1º Módulo (Boas Vindas)</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Siga a sequência das aulas e utilize os materiais de apoio em cada etapa para aplicar tudo na prática.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        4
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Acesso à Solum Financeiro</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Você receberá um e-mail com login e senha para entrar na ferramenta e começar a utilizar.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 font-black text-xs flex items-center justify-center shrink-0 border border-gold-500/20">
                        5
                      </span>
                      <div>
                        <h4 className="font-bold text-white">Atualizações</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          Dentro da Área de Membros você terá acesso a todas atualizações (inclusive às aulas da ferramenta e do grupo do whatsapp)
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
                    Sair da Reunião
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
          currentSlide !== 'justica_valor' &&
          currentSlide !== 'investimento_padrao' &&
          currentSlide !== 'condicao_especial' &&
          currentSlide !== 'downsell' &&
          currentSlide !== 'proximos_passos' &&
          currentSlide !== 'proximos_passos_downsell' &&
          currentSlide !== 'decisao_matrix' &&
          currentSlide !== 'reforco_valor' &&
          currentSlide !== 'argumentacao_especial' &&
          !(currentSlide === 'fluxo_empresarial' && !fluxoIdealRevelado) ? (
          <button
            onClick={() => {
              if (currentSlide === 'intro') {
                navigateTo('do_que_se_trata');
              } else if (currentSlide === 'do_que_se_trata') {
                if (leadFormType === 'business') {
                  navigateTo('fluxo_empresarial');
                } else {
                  navigateTo('objetivo_conversa');
                }
              } else if (currentSlide === 'fluxo_empresarial') {
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

      {/* Modal de Detalhes de Pagamento / Negociação */}
      <AnimatePresence>
        {paymentDetailsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop com blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaymentDetailsModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>

            {/* Caixa do Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-dark-800 pb-3">
                <div className="flex items-center gap-2 text-gold-500">
                  <Coins className="w-5 h-5" />
                  <h3 className="text-lg font-serif font-bold text-white">Formas de Pagamento</h3>
                </div>
                <button
                  onClick={() => setPaymentDetailsModal(null)}
                  className="p-1.5 hover:bg-dark-800 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {paymentDetailsModal === 'padrao' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-450 font-light leading-relaxed">Opções de parcelamento e à vista para a Consultoria Estruturada:</p>
                    {consultoriaOptions.map((opt) => renderPaymentOption(opt, 'white'))}
                  </div>
                )}

                {paymentDetailsModal === 'especial' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-450 font-light leading-relaxed">Opções de parcelamento para a Condição Especial:</p>
                    {especialOptions.map((opt) => renderPaymentOption(opt, 'gold'))}
                  </div>
                )}

                {paymentDetailsModal === 'downsell' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-450 font-light leading-relaxed">Opções de parcelamento para a Sessão Expresso:</p>
                    {entradaOptions.map((opt) => renderPaymentOption(opt, 'white'))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPaymentDetailsModal(null)}
                className="w-full py-3 bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-dark-700 transition-colors"
              >
                Voltar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação para Encerrar Apresentação e ir para Obrigado */}
      <AnimatePresence>
        {confirmarEncerramentoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop com blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmarEncerramentoModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>

            {/* Caixa do Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-2xl space-y-6 z-10 text-center"
            >
              <div className="w-16 h-16 bg-gold-500/10 text-gold-500 rounded-2xl flex items-center justify-center mx-auto border border-gold-500/20">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-serif">Encerrar a Apresentação?</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Você deseja encerrar a apresentação agora e ir diretamente para a tela de agradecimento final?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfirmarEncerramentoModal(false)}
                  className="py-3 px-6 bg-dark-800 hover:bg-dark-750 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-widest border border-dark-700 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    setConfirmarEncerramentoModal(false);
                    navigateTo('agradecimento_final');
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-gold-500/10 cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
