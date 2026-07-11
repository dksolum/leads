import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAnswers } from '../types';
import { Calendar, MessageSquare, PhoneCall, Check, ArrowRight, TrendingUp, AlertTriangle, Coins, Target, Compass, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  answers: UserAnswers;
  onBackToHome?: () => void;
}

export const ResultBusiness: React.FC<Props> = ({ answers, onBackToHome }) => {
  const [sentContactRequest, setSentContactRequest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showScrollButton, setShowScrollButton] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ctaRef.current) return;
      const ctaRect = ctaRef.current.getBoundingClientRect();
      if (ctaRect.top < window.innerHeight - 50) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calcula o perfil corporativo
  const getBusinessProfile = (): { title: string; color: string; bg: string; border: string; desc: string } => {
    if (answers.mixesMoney === 'Sim' || answers.cashFlowUpdated === 'Não') {
      return {
        title: 'Desorganização Estrutural',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        desc: 'Sua empresa enfrenta vazamentos financeiros invisíveis devido à mistura de contas pessoais com corporativas ou falta de registro diário. O caixa funciona no modo passivo, impedindo qualquer planejamento de lucro.',
      };
    }
    if (answers.knowsMonthlyProfit === 'Não' || answers.regularReconciliation === 'Não') {
      return {
        title: 'Potencial Travado',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        desc: 'A empresa gera receitas e opera diariamente, mas você não sabe quanto sobra de verdade ao final do mês. Sem conciliação bancária regular, as decisões são tomadas com base no saldo do banco e não na lucratividade real.',
      };
    }
    if (answers.feelsSafeDecision === 'Não' || answers.feelsSafeDecision === 'Às vezes' || answers.analyzesResults === 'Não') {
      return {
        title: 'Executor Sem Direção',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        desc: 'Você domina a entrega do serviço ou a venda do produto e trabalha arduamente no operacional. No entanto, a falta de análise periódica dos resultados faz com que a tomada de decisões seja insegura, gerando ansiedade sobre o futuro.',
      };
    }
    return {
      title: 'Estruturado em Evolução',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      desc: 'Os controles essenciais existem, mas agora o desafio é a escalabilidade, otimização de margens de lucro, planejamento tributário avançado e a delegação de tarefas para que você possa focar estrategicamente no crescimento do negócio.',
    };
  };

  const profile = getBusinessProfile();

  // Gera o relatório estratégico de recomendações
  const generateReportPoints = () => {
    const points = [];

    // Recomendação sobre Mistura de Contas
    if (answers.mixesMoney === 'Sim' || answers.mixesMoney === 'Às vezes') {
      points.push({
        title: 'Divisão Rígida PF e PJ',
        text: 'É urgente abrir contas correntes distintas e definir um pró-labore fixo para o sócio. A mistura de contas distorce o lucro real da empresa e cria riscos tributários severos.',
        type: 'danger'
      });
    } else {
      points.push({
        title: 'Independência Financeira PJ Mantida',
        text: 'Excelente! A separação de despesas pessoais e empresariais está correta, garantindo a integridade dos dados e segurança contábil.',
        type: 'success'
      });
    }

    // Recomendação sobre Fluxo de Caixa e Conciliação
    if (answers.cashFlowUpdated === 'Não' || answers.regularReconciliation === 'Não') {
      points.push({
        title: 'Conciliação e Fluxo Diário',
        text: 'A conciliação bancária deve ser diária. Cada centavo que entra ou sai do banco precisa estar categorizado no fluxo de caixa para evitar perdas e prever o saldo dos próximos meses.',
        type: 'warning'
      });
    }

    // Recomendação sobre Lucro e Análise
    if (answers.knowsMonthlyProfit === 'Não' || answers.analyzesResults === 'Não') {
      points.push({
        title: 'Apuração e Análise de DRE',
        text: 'Você precisa de uma estrutura de Demonstrativo de Resultados (DRE) mensal. Faturamento não é lucro. Sem analisar a margem de cada produto/serviço, a empresa pode estar pagando para trabalhar.',
        type: 'danger'
      });
    }

    // Recomendação sobre Contas a Pagar/Receber e Cobranças
    if (answers.hasDeferredSales === 'Sim' || answers.hasDeferredSales === 'Às vezes') {
      if (answers.deferredSalesCollector === 'Eu mesmo faço') {
        points.push({
          title: 'Estruturação de Processo de Cobrança',
          text: 'Focar operacionalmente nas cobranças consome tempo valioso do empresário. Recomenda-se estruturar um processo automatizado de régua de cobranças ou delegar essa função para evitar desgaste comercial.',
          type: 'warning'
        });
      }
    }

    // Recomendação sobre Emissão de Notas
    if (answers.emitsInvoices === 'Não' || answers.emitsInvoices === 'Às vezes') {
      points.push({
        title: 'Riscos de Sonegação e Penalidades',
        text: 'A falta de emissão sistemática de notas fiscais gera riscos severos de multas e fiscalizações da Receita Federal. O enquadramento de MEI e ME exige conformidade legal completa na emissão.',
        type: 'danger'
      });
    }

    // Recomendação sobre Cartão de Crédito
    if (answers.hasBusinessCard === 'Sim' && answers.businessCardIsProblem === 'Sim') {
      points.push({
        title: 'Blindagem do Cartão Corporativo',
        text: 'O cartão de crédito está sendo usado como extensão do capital de giro, o que é um perigo devido aos juros altos. Defina limites estritos e registre cada compra no fluxo de caixa no momento do gasto.',
        type: 'danger'
      });
    } else if (answers.hasBusinessCard === 'Não' && answers.usePersonalCardForBusiness && answers.usePersonalCardForBusiness.includes('Sim')) {
      points.push({
        title: 'Uso Inadequado do Cartão Pessoal',
        text: 'Utilizar o cartão pessoal para compras da empresa dificulta a contabilidade e infringe as regras fiscais do Simples Nacional. Providencie um cartão de crédito em nome da PJ imediatamente.',
        type: 'warning'
      });
    }

    // Recomendação sobre Contabilidade
    if (answers.hasAccounting === 'Não') {
      points.push({
        title: 'Parceria Contábil Homologada',
        text: 'Toda empresa do porte ME precisa legalmente de um contador responsável para assinar balancetes e apurar impostos mensais. Regularize sua situação para evitar o bloqueio do CNPJ.',
        type: 'warning'
      });
    }

    // Se a lista estiver vazia por ser uma empresa perfeita
    if (points.length === 0) {
      points.push({
        title: 'Otimização Contínua',
        text: 'Seus processos básicos estão excelentes! O foco agora deve ser o aumento da eficiência fiscal, automações de conciliação bancária e projeção de investimentos a longo prazo.',
        type: 'success'
      });
    }

    return points;
  };

  const reportPoints = generateReportPoints();

  // Enviar solicitação de contato
  const handleContactRequest = async () => {
    setIsSubmitting(true);
    try {
      // Buscar o lead mais recente do usuário para atualizar seu action_type
      // O lead é identificado pelo e-mail salvo na resposta da empresa (que agora fica em answers.email se buscado, ou pelo WhatsApp)
      // Como o ID não é facilmente rastreável de imediato no client sem passar por props, podemos pesquisar no Supabase pelo telefone/email do lead corporativo criado nesta sessão
      const { data: leads, error: fetchError } = await supabase
        .from('leads')
        .select('id, name, phone')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!fetchError && leads && leads.length > 0) {
        await supabase
          .from('leads')
          .update({ action_type: 'WhatsApp Contact' })
          .eq('id', leads[0].id);
      }
      setSentContactRequest(true);
    } catch (err) {
      console.error('Erro ao salvar solicitação de contato:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mensagem customizada do WhatsApp
  const getWhatsappLink = () => {
    const phone = '5565984633457';
    const text = encodeURIComponent(
      `Olá Diego! Acabei de gerar o diagnóstico de Finanças Empresariais. Minha empresa foi classificada como *${profile.title}* (${answers.businessSize}).\n\n` +
      `*Dificuldade principal:* ${answers.businessDifficulty}\n` +
      `*Ramo:* ${answers.businessBranch}\n` +
      `*Mistura contas:* ${answers.mixesMoney}\n\n` +
      `Gostaria de agendar a reunião estratégica de apresentação de soluções.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-dark-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 p-8 md:p-12 text-center border-b border-dark-800 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
            <p className="text-gold-500 font-semibold tracking-widest uppercase text-xs mb-3 font-mono">Diagnóstico de Gestão Financeira PJ</p>
            <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-4">Empresa: {profile.title}</h2>
            <div className="flex justify-center gap-3">
              <span className="bg-dark-950 border border-dark-800 text-gray-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                Porte: {answers.businessSize}
              </span>
              <span className="bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                Ramo: {answers.businessBranch}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Bloco de Visão Geral */}
            <div className={`p-6 rounded-2xl border ${profile.border} ${profile.bg} space-y-3`}>
              <div className="flex items-center gap-3">
                <Compass className={`w-6 h-6 ${profile.color}`} />
                <h3 className="font-serif font-bold text-lg text-white">Análise de Cenário</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
                {profile.desc}
              </p>
            </div>

            {/* Recomendações Estruturadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2 border-b border-dark-800 pb-3">
                <Target className="w-5 h-5 text-gold-500" />
                Pontos de Atenção Estratégicos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportPoints.map((pt, idx) => (
                  <div key={idx} className="p-5 bg-dark-950 border border-dark-850 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {pt.type === 'danger' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                        ) : pt.type === 'warning' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        )}
                        <h4 className="text-sm font-bold text-white font-serif">{pt.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-light pt-1">
                        {pt.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chamada para Ação (Conversão com 3 opções) - Ultra Premium */}
            <div ref={ctaRef} className="border border-gold-500/20 bg-gradient-to-b from-dark-900 to-dark-950 p-8 rounded-3xl space-y-8 shadow-[0_0_50px_rgba(245,158,11,0.05)] mt-12 relative overflow-hidden">
              {/* Detalhe estético dourado */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

              <div className="text-center space-y-3 max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-gold-400 bg-gold-400/10 uppercase border border-gold-400/20">
                  Ação Recomendada
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">Como destravar esses gargalos e alavancar o seu lucro?</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  Para estruturar seus processos financeiros, obter controle absoluto do fluxo de caixa e blindar seu negócio contra risks fiscais, selecione um dos canais premium abaixo e agende uma **sessão estratégica de diagnóstico gratuita (30 min)** com Diego Kloppel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Opção 1: Agendar na agenda (Destaque Principal) */}
                <a
                  href="https://calendar.app.google/Fh6dNbVXyvQEc9Pw5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-between p-6 bg-dark-950/60 hover:bg-dark-900 border-2 border-gold-500/30 hover:border-gold-500 rounded-2xl text-center group transition-all shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] relative"
                >
                  <div className="absolute -top-3 right-4 px-2 py-0.5 rounded bg-gold-500 text-dark-950 text-[9px] font-bold uppercase tracking-wider">
                    Caminho Direto
                  </div>
                  <Calendar className="w-9 h-9 text-gold-500 mb-4 group-hover:scale-110 transition-transform" />
                  <div className="space-y-1.5 mb-4">
                    <h4 className="text-base font-bold text-white">Agendar na Agenda</h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">Garanta seu horário direto no Google Calendar e receba o convite por e-mail.</p>
                  </div>
                  <span className="text-xs font-bold text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Escolher Horário <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>

                {/* Opção 2: Chamar no WhatsApp */}
                <a
                  href={getWhatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-between p-6 bg-dark-950/60 hover:bg-dark-900 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-2xl text-center group transition-all shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative"
                >
                  <div className="absolute -top-3 right-4 px-2 py-0.5 rounded bg-emerald-500 text-dark-950 text-[9px] font-bold uppercase tracking-wider">
                    Mais Rápido
                  </div>
                  <MessageSquare className="w-9 h-9 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                  <div className="space-y-1.5 mb-4">
                    <h4 className="text-base font-bold text-white">Falar no WhatsApp</h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">Inicie uma conversa direta enviando o resumo do diagnóstico da sua empresa.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Iniciar Conversa <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>

                {/* Opção 3: Nós entramos em contato */}
                <button
                  type="button"
                  onClick={handleContactRequest}
                  disabled={sentContactRequest || isSubmitting}
                  className="flex flex-col items-center justify-between p-6 bg-dark-950/60 hover:bg-dark-900 border border-dark-800 hover:border-blue-500 rounded-2xl text-center group transition-all w-full shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] cursor-pointer"
                >
                  <PhoneCall className="w-9 h-9 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <div className="space-y-1.5 mb-4">
                    <h4 className="text-base font-bold text-white">Nós te chamamos</h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">Solicite que nossa assessoria entre em contato com você por telefone.</p>
                  </div>
                  {sentContactRequest ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Solicitação Enviada!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {isSubmitting ? 'Processando...' : 'Solicitar Retorno'} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Voltar para a Home */}
            {onBackToHome && (
              <div className="text-center pt-6 border-t border-dark-800/50">
                <button
                  onClick={onBackToHome}
                  className="text-gray-500 hover:text-white transition-colors text-sm underline underline-offset-4 cursor-pointer"
                >
                  Voltar ao Início
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Botão flutuante premium para guiar até o CTA */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            onClick={scrollToCTA}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-transform border border-gold-400/35 cursor-pointer group"
          >
            <span>Desbloquear Agendamento</span>
            <ArrowDown className="w-4 h-4 animate-bounce group-hover:translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
