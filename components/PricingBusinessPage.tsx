import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, MessageSquare, Building2, FileText, Landmark, RefreshCw, Sparkles, Percent, ShieldCheck, HelpCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PricingBusinessPageProps {
  navigate: (path: string) => void;
}

export const PricingBusinessPage: React.FC<PricingBusinessPageProps> = ({ navigate }) => {
  const [erroModalMsg, setErroModalMsg] = useState<string | null>(null);
  const [contabilidadeAnual, setContabilidadeAnual] = useState(true);
  const [contabilidadeMensal, setContabilidadeMensal] = useState(false);
  const [financeiro, setFinanceiro] = useState(true);
  const [atendimento, setAtendimento] = useState(true);
  const [cobranca, setCobranca] = useState(false);
  const [inscricaoEstadual, setInscricaoEstadual] = useState(false);
  const [migracaoMei, setMigracaoMei] = useState(false);
  const [certificadoDigital, setCertificadoDigital] = useState(false);

  const [emissaoFaixa, setEmissaoFaixa] = useState<'ate5' | 'ate10' | 'ate20' | 'ate30' | 'none'>('none');
  const [pagamentoCartao, setPagamentoCartao] = useState(true); // Começa ativo pois contabilidadeAnual começa true
  const [orcamentoFinalizado, setOrcamentoFinalizado] = useState(false);

  // ==========================================
  // TABELA DE VALORES DE PROPOSTA CORPORATIVA
  // ==========================================
  // Modifique os valores abaixo conforme sua política comercial.
  // ------------------------------------------

  // 1. Valores Normais / Avulsos (Sem parceria)
  const valNormalFinanceiro = 400;
  const valNormalAtendimento = 200;
  const valNormalContabilidade = 298.80; // Valor da Contabilidade Mensal Avulsa / Referência Normal
  const valNormalCobranca = 150;

  // 2. Valores Promocionais (Plano com Parceria / Com desconto)
  const valDescontoFinanceiro = 250;
  const valDescontoAtendimento = 150;
  const valDescontoContabilidade = 249.00; // Valor da Contabilidade Anual no Cartão (12x R$ 249,00)
  const valDescontoCobranca = 100;

  // 3. Valor da Contabilidade Anual Sem Cartão (Boleto/Pix)
  const valAnualSemCartaoContabilidade = 298.80; // Editável aqui para Contabilidade Anual Sem Cartão

  const getValorNota = (faixa: typeof emissaoFaixa) => {
    switch (faixa) {
      case 'ate5': return 47;
      case 'ate10': return 87;
      case 'ate20': return 127;
      case 'ate30': return 147;
      default: return 0;
    }
  };

  // Valores de Combo (Assistência Financeira + Atendimento Personalizado)
  const valComboFinanceiro = 350;
  const valComboAtendimento = 150;
  const valComboCobranca = 100;

  // =========================================================================
  // LÓGICA DE CONDICIONAIS COMERCIAIS & ESTRUTURAÇÃO DE CÁLCULO
  // =========================================================================

  // A. Verificação de Condições
  const isCombo = financeiro && atendimento; // Combo: Assistência Financeira + Atendimento Personalizado
  const temContabilidade = contabilidadeAnual || contabilidadeMensal;

  // B. Preço Contabilidade
  let precoContabilidade = 0;
  if (contabilidadeAnual) {
    precoContabilidade = pagamentoCartao ? valDescontoContabilidade : valAnualSemCartaoContabilidade;
  } else if (contabilidadeMensal) {
    precoContabilidade = valNormalContabilidade;
  }

  // C. Preço Assistência Financeira
  let precoFinanceiro = 0;
  if (financeiro) {
    if (temContabilidade) {
      precoFinanceiro = atendimento ? valDescontoFinanceiro : 350; // R$ 250 se combo com atendimento, R$ 350 se individual com contabilidade
    } else if (isCombo) {
      precoFinanceiro = valComboFinanceiro; // R$ 350 se combo ativo no modo avulso
    } else {
      precoFinanceiro = valNormalFinanceiro; // R$ 400 cheio avulso
    }
  }

  // D. Preço Atendimento Personalizado
  let precoAtendimento = 0;
  if (atendimento) {
    if (financeiro) {
      precoAtendimento = valDescontoAtendimento; // R$ 150 se contratado junto com Assistência Financeira (combo)
    } else {
      precoAtendimento = valNormalAtendimento; // R$ 200 se contratado sozinho (sem Assistência Financeira)
    }
  }

  // E. Preço Cobrança de Credores
  let precoCobranca = 0;
  if (cobranca) {
    if (temContabilidade) {
      precoCobranca = valDescontoCobranca; // R$ 100 se contabilidade (anual ou mensal) selecionada
    } else if (isCombo) {
      precoCobranca = valComboCobranca; // R$ 100 se combo ativo no modo avulso
    } else {
      precoCobranca = valNormalCobranca; // R$ 150 cheio avulso
    }
  }

  // F. Soma dos valores finais
  const precoFechamento = precoContabilidade + precoFinanceiro + precoAtendimento + precoCobranca + getValorNota(emissaoFaixa);

  // G. Para referência de comparação (Valor de mercado riscado)
  const totalReferenciaAvulso =
    (financeiro ? valNormalFinanceiro : 0) +
    (atendimento ? valNormalAtendimento : 0) +
    ((contabilidadeAnual || contabilidadeMensal) ? 450 : 0) +
    (cobranca ? valNormalCobranca : 0) +
    getValorNota(emissaoFaixa);

  const economia = (contabilidadeAnual && pagamentoCartao) ? Math.max(0, totalReferenciaAvulso - precoFechamento) : 0;
  const valorCartao = Math.min(precoFechamento, 249);
  const valorRestante = Math.max(0, precoFechamento - valorCartao);

  const contabilidadeSemBonus = (contabilidadeAnual && !pagamentoCartao) || contabilidadeMensal;
  const transicaoIncompleta = contabilidadeSemBonus && (!certificadoDigital || !inscricaoEstadual || !migracaoMei);

  // Taxa de transição única (MEI para ME) + Certificado Digital
  let custoTransicaoUnico = 0;
  if (contabilidadeSemBonus) {
    custoTransicaoUnico = 987;
  } else if (!contabilidadeAnual && !contabilidadeMensal) {
    custoTransicaoUnico = (certificadoDigital ? 287 : 0) + (inscricaoEstadual ? 350 : 0) + (migracaoMei ? 350 : 0);
  }

  const handleWhatsappClick = () => {
    window.open('https://wa.me/5565984633457?text=Ol%C3%A1%20Diego%2C%20gostaria%20de%20conversar%20sobre%20a%20precifica%C3%A7%C3%A3o%20de%20servi%C3%A7os%20financeiros%20e%20contabilidade%20para%20minha%20empresa.', '_blank');
  };

  const handleWhatsappPlanoCompletoClick = () => {
    const list = [];
    if (financeiro) list.push('Assistência Financeira');
    if (atendimento) list.push('Atendimento Personalizado');
    if (contabilidadeAnual) list.push('Contabilidade Anual Premium');
    if (contabilidadeMensal) list.push('Contabilidade Mensal');
    if (cobranca) list.push('Cobrança de Credores');
    if (contabilidadeSemBonus && certificadoDigital) list.push('Certificado Digital (R$ 287)');
    if (contabilidadeSemBonus && inscricaoEstadual) list.push('Inscrição Estadual (R$ 350)');
    if (contabilidadeSemBonus && migracaoMei) list.push('Migração MEI p/ ME & Contrato (R$ 350)');
    if (emissaoFaixa !== 'none') {
      const rotulo = emissaoFaixa === 'ate5' ? 'Até 5 Notas (R$ 47)' : emissaoFaixa === 'ate10' ? 'Até 10 Notas (R$ 87)' : emissaoFaixa === 'ate20' ? 'Até 20 Notas (R$ 127)' : 'Até 30 Notas (R$ 147)';
      list.push(rotulo);
    }
    const servicosTexto = list.length > 0 ? list.join(', ') : 'Nenhum serviço selecionado';

    // Taxas extras/únicas de transição se contabilidade sem bônus ativa
    const transicaoTexto = (contabilidadeSemBonus && custoTransicaoUnico > 0)
      ? ` + R$ ${custoTransicaoUnico.toFixed(2)} Taxa Única de Transição`
      : '';

    const pagamentoTexto = (contabilidadeAnual && pagamentoCartao)
      ? `no Cartão de Crédito do Parceiro com Super Bônus inclusos (12x R$ ${valorCartao.toFixed(2)}/mês + R$ ${valorRestante.toFixed(2)}/mês restante)`
      : `sem cartão de crédito (Bônus não inclusos, taxas de transição/anual avulsas, valor unificado integral de R$ ${precoFechamento.toFixed(2)}/mês${transicaoTexto})`;

    const texto = `Olá Diego, montei a proposta de Plano Completo interativo no site:\n\nServiços Escolhidos: ${servicosTexto}\nValor do Plano: R$ ${precoFechamento.toFixed(2)}/mês${transicaoTexto} (Valor de mercado seria R$ ${totalReferenciaAvulso.toFixed(2)}/mês)\nForma de pagamento: ${pagamentoTexto}`;

    window.open(`https://wa.me/5565984633457?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const services = [
    {
      title: 'Assistência Financeira',
      description: 'Gestão básica de fluxo de caixa para correta organização, tomada de decisões e escrituração contábil.',
      additional: 'Taxa adicional por conta bancária extra incluída na operação.',
      referenceValue: 'R$ 400',
      period: 'mês',
      isMonthly: true,
      icon: <Landmark className="w-6 h-6 text-gold-500" />,
      tag: { text: 'OBRIGATÓRIO', type: 'required' },
      inclusos: [
        'Controle financeiro (até 1 conta bancária)',
        'Categorização organizada de despesas e receitas',
        'Controle de contas a pagar e a receber básico',
        'Conciliação bancária de lançamentos',
        'Organização de documentos',
        '[SE MEI] Relatório Mensal de Faturamento e Declaração Anual (DASN-SIMEI)'
      ]
    },
    {
      title: 'Atendimento Personalizado',
      description: 'Suporte contínuo via WhatsApp para tomadas de decisão rápidas e alinhamentos.',
      additional: 'Reunião estratégica extra pode ser solicitada como aditivo contratual.',
      referenceValue: 'R$ 200',
      period: 'mês',
      isMonthly: true,
      icon: <MessageSquare className="w-6 h-6 text-gold-500" />,
      tag: { text: 'IMPORTANTE', type: 'important' },
      inclusos: [
        'Suporte direto no WhatsApp',
        'Até 01 Reunião Estratégica Mensal de alinhamento',
        'Análise interpretada de indicadores e gargalos',
        'Apoio rápido em decisões de caixa no dia a dia',
        'Explicações contábeis e financeiras de maneira simples'
      ]
    },
    {
      title: 'Emissão de NF-e e NFS-e',
      description: 'Faturamento de vendas que não foram emitidas pelo cliente no momento da venda (emissão de notas fiscais de serviços/produtos).',
      additional: 'Adicional cobrado caso ultrapasse a quantidade de tipos cadastrados.',
      referenceValue: 'R$ 47*',
      period: 'mês',
      isMonthly: true,
      icon: <FileText className="w-6 h-6 text-gold-500" />,
      tag: { text: 'OBRIGATÓRIA', type: 'required' },
      inclusos: [
        '*Emissão de até 05 Notas Fiscais de Serviços (NFS-e)/Produtos (NF-e)',
        '*Envio mensal das NFes (via e-mail/WhatsApp) para o cliente (caso não tenha contabilidade incluída)',
        '*Envio mensal automático para a contabilidade (caso tenha contabilidade incluída)'
      ]
    },
    {
      title: 'Contabilidade',
      description: 'Gestão fiscal para o cumprimento das obrigações mensais e anuais de empresas com faturamento de até R$ 60.000,00.',
      additional: 'Aberturas, alterações, inscrições, consultorias complexas, pró-labore, folha de pagamento* e outros serviços são cobrados à parte. - (Não estão inclusos taxas e impostos)',
      referenceValue: 'R$ 450',
      period: 'mês',
      isMonthly: true,
      icon: <Building2 className="w-6 h-6 text-gold-500" />,
      tag: { text: 'OBRIGATÓRIO', type: 'required' },
      inclusos: [
        'Apuração de guias de impostos',
        'Folha de pagamento de até 02 funcionários',
        'Envio das declarações'
      ]
    },
    {
      title: 'Cobrança de Credores',
      description: 'Controle ativo de recebíveis vencidos e ações amigáveis para redução de inadimplência.',
      additional: 'Cobranças adicionais via assessoria jurídica não inclusas.',
      referenceValue: 'R$ 150',
      period: 'mês',
      isMonthly: true,
      icon: <RefreshCw className="w-6 h-6 text-gold-500" />,
      tag: { text: 'OPCIONAL', type: 'optional' },
      inclusos: [
        'Monitoramento contínuo de contas em atraso',
        'Cobrança semanal via e-mail e WhatsApp',
        'Negociação amigável de parcelamentos de dívidas (se aceito as condições pela empresa)',
        'Relatório mensal de perdas e inadimplência'
      ]
    },
    {
      title: 'Certificação Digital',
      description: 'Emissão ou renovação anual de certificado e-CNPJ A1 para assinatura eletrônica de documentos, acesso aos sistemas da RFB e emissão de notas.',
      additional: 'Cobrança exclusivamente anual. Não contabiliza no custo mensal dos serviços avulsos.',
      referenceValue: 'R$ 287',
      period: 'ano',
      isMonthly: false,
      icon: <ShieldCheck className="w-6 h-6 text-gold-500" />,
      tag: { text: 'OBRIGATÓRIO', type: 'required' },
      inclusos: [
        'Certificado e-CNPJ A1 válido por 12 meses',
        'Renovação descomplicada todos os anos'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 selection:bg-gold-500/30 selection:text-gold-200 font-sans relative overflow-x-hidden">

      {/* Botão de Voltar SPA */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-dark-900/80 hover:bg-dark-800 border border-dark-800 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </button>
      </div>

      {/* Glows Decorativos de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20 z-0">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-gold-600 rounded-full blur-[180px] opacity-10" />
        <div className="absolute top-[35%] -right-40 w-[600px] h-[600px] bg-gold-900 rounded-full blur-[200px] opacity-10" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-amber-900 rounded-full blur-[180px] opacity-5" />
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10">

        {/* SEÇÃO 1: CAPA */}
        <section className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-4xl"
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-gold-500 bg-gold-500/10 px-3 py-1.5 rounded-full border border-gold-500/20 shadow-inner inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              Tabela de Serviços Corporativos
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight">
              Precificação & Serviços
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
              Contratação sob demanda, modular e flexível. Monte a estrutura de assistência financeira e contábil perfeita para a sua empresa.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <a
                href="#plano-completo"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-dark-950 animate-pulse" />
                Ver Plano Completo (Recomendado)
              </a>
              <a
                href="#servicos"
                className="w-full sm:w-auto px-8 py-4 bg-dark-900 hover:bg-dark-850 border border-dark-800 hover:border-gold-500/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center"
              >
                Módulos Avulsos
              </a>
            </div>
          </motion.div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Role para baixo</span>
            <div className="w-1.5 h-6 bg-gray-650 mx-auto rounded-full mt-2" />
          </div>
        </section>

        {/* SEÇÃO 2: A FILOSOFIA DE CONTRATAÇÃO */}
        <section className="py-16 px-6 border-t border-dark-900/60 bg-dark-900/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Modelo Flexível</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Contratos que acompanham o seu ritmo</h2>
            <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
              Acreditamos que uma empresa de sucesso não deve ser engessada por mensalidades contábeis fixas que não refletem sua operação real. Cada um de nossos serviços possui um valor específico e pode ser ativado ou desativado mediante <strong>termos aditivos simples</strong>, adaptando-se às necessidades do seu negócio.
            </p>
          </div>
        </section>

        {/* SEÇÃO 3: CARDS DE SERVIÇOS */}
        <section id="servicos" className="py-20 md:py-24 px-6 border-t border-dark-900/60 relative">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Serviços Disponíveis</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Estrutura de Soluções</h2>
              <p className="text-xs md:text-sm text-gray-500 max-w-xl mx-auto font-light">
                Escolha os módulos de serviços que deseja e pague apenas pelo que utilizar na sua operação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-4">
              {services.map((svc, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-dark-900/60 backdrop-blur-md border border-dark-800/80 hover:border-gold-500/20 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group relative overflow-hidden"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 group-hover:scale-110 transition-transform">
                        {svc.icon}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-550 font-light block">Referência</span>
                        <span className="text-2xl font-serif font-bold text-gold-450">{svc.referenceValue}</span>
                        <span className="text-[10px] text-gray-550 block">/{svc.period}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white leading-tight font-serif">{svc.title}</h3>
                        {svc.tag && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${svc.tag.type === 'required' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            svc.tag.type === 'important' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                              'bg-slate-500/10 border-slate-500/30 text-slate-400'
                            }`}>
                            {svc.tag.text}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-450 font-light leading-relaxed">
                        {svc.description}
                      </p>
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block">O que está incluso:</span>
                        <ul className="space-y-1.5 text-xs text-gray-400">
                          {svc.inclusos.map((item, itemIdx) => {
                            const isAsterisk = item.startsWith('*');
                            const textToRender = isAsterisk ? item.slice(1) : item;

                            let textContent: React.ReactNode = textToRender;
                            if (textToRender.includes('[SE MEI]')) {
                              const parts = textToRender.split('[SE MEI]');
                              textContent = (
                                <>
                                  {parts[0]}
                                  <span className="text-gold-500 font-bold">[SE MEI]</span>
                                  {parts[1]}
                                </>
                              );
                            }

                            return (
                              <li key={itemIdx} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                                <span className={isAsterisk ? 'text-gold-450/90 font-medium' : ''}>
                                  {isAsterisk && <span className="text-gold-500 font-bold mr-0.5">*</span>}
                                  {textContent}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dark-850/60">
                    <p className="text-[10px] text-gold-500/75 font-medium leading-relaxed italic">
                      💡 {svc.additional}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bloco Premium de Transição MEI para ME */}
            <div className="mt-14 max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col items-center justify-center text-center gap-2 pb-3 border-b border-dark-800/60">
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  <Sparkles className="w-5 h-5 text-gold-500 animate-pulse shrink-0" />
                  <h3 className="text-base md:text-lg font-serif font-extrabold uppercase tracking-widest text-gold-500">
                    Processo de Transição
                  </h3>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400 uppercase tracking-widest font-sans">
                    OBRIGATÓRIO
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider font-mono">
                  Serviços Únicos de Transição (MEI para ME)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item 1 */}
                <div className="bg-dark-900/30 border border-dark-800/80 hover:border-gold-500/20 p-5 rounded-2xl flex justify-between items-center transition-all shadow-md group">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Inscrição Estadual</h4>
                    <p className="text-[11px] text-gray-400 font-light leading-relaxed max-w-[220px]">
                      Regularização fiscal estadual para emissão de Notas Fiscais de Venda (caso a empresa ainda não possua).
                    </p>
                  </div>
                  <div className="text-right shrink-0 px-4 py-2 bg-dark-950/80 rounded-xl border border-dark-800">
                    <span className="text-lg font-serif font-bold text-white">R$ 350,00</span>
                    <span className="text-[9px] text-gold-500/80 block uppercase font-bold tracking-wider mt-0.5">Taxa Única</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="bg-dark-900/30 border border-dark-800/80 hover:border-gold-500/20 p-5 rounded-2xl flex justify-between items-center transition-all shadow-md group">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Migração MEI para ME e Contrato Social</h4>
                    <p className="text-[11px] text-gray-400 font-light leading-relaxed max-w-[220px]">
                      Desenquadramento de MEI para ME, elaboração do contrato social e registro completo na Junta Comercial.
                    </p>
                  </div>
                  <div className="text-right shrink-0 px-4 py-2 bg-dark-950/80 rounded-xl border border-dark-800">
                    <span className="text-lg font-serif font-bold text-white">R$ 350,00</span>
                    <span className="text-[9px] text-gold-500/80 block uppercase font-bold tracking-wider mt-0.5">Taxa Única</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: CARD PREMIUM DO PLANO COMPLETO */}
        <section id="plano-completo" className="py-24 px-6 border-t border-dark-900/60 bg-gradient-to-b from-dark-900/40 via-dark-900/80 to-dark-950 relative">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Oferta Premium Única</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">Plano Completo de Gestão</h2>
              <p className="text-xs md:text-sm text-gray-400 max-w-xl mx-auto font-light leading-relaxed">
                Toda a gestão financeira e escrituração contábil integradas, focadas em economia operacional, tranquilidade contábil e bônus estratégico.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gold-500/15 via-dark-900 to-dark-950 border-2 border-gold-500/40 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-visible group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full filter blur-3xl group-hover:bg-gold-500/10 transition-colors duration-700 animate-pulse pointer-events-none"></div>

              {/* Badge de Recomendado reposicionado de forma que nao sobrepoe nada */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-600 to-amber-500 text-dark-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-xl flex items-center gap-1 border border-gold-450 z-20">
                <Sparkles className="w-3 h-3 text-dark-950 animate-pulse" />
                Melhor Custo-Benefício
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Gestão Customizada</h3>
                    <p className="text-xs md:text-sm text-gray-350 font-light leading-relaxed">
                      Selecione abaixo os serviços que deseja incluir no seu contrato mensal unificado.
                    </p>
                  </div>

                  {/* Wrapper Premium para separar os blocos */}
                  <div className="bg-dark-950/40 border border-dark-850/80 p-5 rounded-2xl space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs text-gold-500 font-bold uppercase tracking-wider">Serviços Disponíveis (Selecione)</h4>

                      {/* Função auxiliar para renderizar switch toggle */}
                      {(() => {
                        const renderSwitch = (active: boolean, onToggle: () => void) => (
                          <button
                            type="button"
                            onClick={onToggle}
                            className={`w-10 h-6 rounded-full p-0.5 transition-all duration-300 relative shrink-0 ${active ? 'bg-gold-500 shadow-lg shadow-gold-500/20' : 'bg-dark-800 border border-dark-750'}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        );

                        return (
                          <div className="flex flex-col gap-3">

                            {/* 1. Contabilidade Anual Premium */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all relative overflow-hidden ${contabilidadeAnual ? 'bg-gradient-to-r from-gold-500/15 via-gold-500/5 to-transparent border-gold-500/50 shadow-md' : 'bg-dark-900/60 border-dark-800'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                              <div className="absolute top-0 right-0 bg-gold-600 text-dark-950 text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl">
                                Melhor Condição
                              </div>
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">Contabilidade Anual Premium</span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400">
                                    OBRIGATÓRIO
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-450 font-light mt-0.5">Condição diferenciada por meio de parceria</span>
                              </div>
                              {!orcamentoFinalizado && renderSwitch(contabilidadeAnual, () => {
                                const newVal = !contabilidadeAnual;
                                setContabilidadeAnual(newVal);
                                if (newVal) {
                                  setContabilidadeMensal(false);
                                  setInscricaoEstadual(false);
                                  setMigracaoMei(false);
                                  setCertificadoDigital(false);
                                  setPagamentoCartao(true);
                                } else {
                                  setContabilidadeMensal(true);
                                  setInscricaoEstadual(true);
                                  setMigracaoMei(true);
                                  setCertificadoDigital(true);
                                  setPagamentoCartao(false);
                                }
                              })}
                              {orcamentoFinalizado && renderSwitch(contabilidadeAnual, () => { })}
                            </div>

                            {/* Grupo de Serviços Avulsos/Transição (Visível apenas se Contabilidade Anual NÃO estiver selecionada) */}
                            {!contabilidadeAnual && (
                              <div className="p-4 rounded-2xl border border-dashed border-amber-500/35 bg-amber-500/5 space-y-3.5 relative">
                                <div className="flex items-center justify-between border-b border-amber-500/15 pb-2 mb-1.5">
                                  <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest font-mono">
                                    Serviços de Transição / Mensais / Avulsos
                                  </span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-400 uppercase tracking-widest">
                                    REQUERIDO
                                  </span>
                                </div>

                                {/* 2. Contabilidade Mensal */}
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${contabilidadeMensal ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                                  <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-white">Contabilidade Mensal</span>
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400">
                                        OBRIGATÓRIO
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-450 font-light mt-0.5">Mensalidade recorrente sem bônus adicionais</span>
                                  </div>
                                  {!orcamentoFinalizado && renderSwitch(contabilidadeMensal, () => setContabilidadeMensal(!contabilidadeMensal))}
                                  {orcamentoFinalizado && renderSwitch(contabilidadeMensal, () => { })}
                                </div>

                                {/* Certificado Digital */}
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${certificadoDigital ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                                  <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-white">Certificado Digital e-CNPJ A1</span>
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400">
                                        OBRIGATÓRIO
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-450 font-light mt-0.5">Emissão de Notas Fiscais</span>
                                  </div>
                                  {!orcamentoFinalizado && renderSwitch(certificadoDigital, () => setCertificadoDigital(!certificadoDigital))}
                                  {orcamentoFinalizado && renderSwitch(certificadoDigital, () => { })}
                                </div>

                                {/* 3. Inscrição Estadual */}
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${inscricaoEstadual ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                                  <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-white">Inscrição Estadual</span>
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400">
                                        OBRIGATÓRIO
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-450 font-light mt-0.5">Comércio e indústria</span>
                                  </div>
                                  {!orcamentoFinalizado && renderSwitch(inscricaoEstadual, () => setInscricaoEstadual(!inscricaoEstadual))}
                                  {orcamentoFinalizado && renderSwitch(inscricaoEstadual, () => { })}
                                </div>

                                {/* 4. Migração de MEI para ME */}
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${migracaoMei ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                                  <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-white">Migração MEI p/ ME e Contrato Social</span>
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400">
                                        OBRIGATÓRIO
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-450 font-light mt-0.5">Para empresas que ultrapassam o limite de faturamento do MEI</span>
                                  </div>
                                  {!orcamentoFinalizado && renderSwitch(migracaoMei, () => setMigracaoMei(!migracaoMei))}
                                  {orcamentoFinalizado && renderSwitch(migracaoMei, () => { })}
                                </div>
                              </div>
                            )}

                            {/* 5. Assistência Financeira */}
                            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${financeiro ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-white">Assistência Financeira</span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400">
                                    OBRIGATÓRIO
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-450 font-light mt-0.5">Gestão básica e controle do fluxo de caixa</span>
                              </div>
                              {!orcamentoFinalizado && renderSwitch(financeiro, () => setFinanceiro(!financeiro))}
                              {orcamentoFinalizado && renderSwitch(financeiro, () => { })}
                            </div>

                            {/* 6. Atendimento Personalizado */}
                            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${atendimento ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-white">Atendimento Personalizado</span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-400">
                                    IMPORTANTE
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-450 font-light mt-0.5">Suporte direto WhatsApp e reunião mensal</span>
                              </div>
                              {!orcamentoFinalizado && renderSwitch(atendimento, () => setAtendimento(!atendimento))}
                              {orcamentoFinalizado && renderSwitch(atendimento, () => { })}
                            </div>

                            {/* 7. Cobrança de Credores */}
                            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${cobranca ? 'bg-gold-500/10 border-gold-500/30 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-500'} ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''}`}>
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-white">Cobrança de Credores</span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border bg-slate-500/10 border-slate-500/30 text-slate-400">
                                    OPCIONAL
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-450 font-light mt-0.5">Ações amigáveis para inadimplência</span>
                              </div>
                              {!orcamentoFinalizado && renderSwitch(cobranca, () => setCobranca(!cobranca))}
                              {orcamentoFinalizado && renderSwitch(cobranca, () => { })}
                            </div>

                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-3 border-t border-dark-850/60 pt-5">
                      <h4 className="text-xs text-gold-500 font-bold uppercase tracking-wider text-left">Franquia de Notas Fiscais</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <button
                          onClick={() => !orcamentoFinalizado && setEmissaoFaixa('none')}
                          className={`p-2 py-2.5 rounded-xl border text-center font-medium transition-all ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''} ${emissaoFaixa === 'none' ? 'bg-gold-500/15 border-gold-500 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-400 hover:border-dark-700'}`}
                        >
                          Sem Emissão
                        </button>
                        <button
                          onClick={() => !orcamentoFinalizado && setEmissaoFaixa('ate5')}
                          className={`p-2 py-2.5 rounded-xl border text-center font-medium transition-all ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''} ${emissaoFaixa === 'ate5' ? 'bg-gold-500/15 border-gold-500 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-400 hover:border-dark-700'}`}
                        >
                          Até 5
                        </button>
                        <button
                          onClick={() => !orcamentoFinalizado && setEmissaoFaixa('ate10')}
                          className={`p-2 py-2.5 rounded-xl border text-center font-medium transition-all ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''} ${emissaoFaixa === 'ate10' ? 'bg-gold-500/15 border-gold-500 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-400 hover:border-dark-700'}`}
                        >
                          Até 10
                        </button>
                        <button
                          onClick={() => !orcamentoFinalizado && setEmissaoFaixa('ate20')}
                          className={`p-2 py-2.5 rounded-xl border text-center font-medium transition-all ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''} ${emissaoFaixa === 'ate20' ? 'bg-gold-500/15 border-gold-500 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-400 hover:border-dark-700'}`}
                        >
                          Até 20
                        </button>
                        <button
                          onClick={() => !orcamentoFinalizado && setEmissaoFaixa('ate30')}
                          className={`p-2 py-2.5 rounded-xl border text-center font-medium transition-all col-span-2 sm:col-span-1 ${orcamentoFinalizado ? 'pointer-events-none opacity-80' : ''} ${emissaoFaixa === 'ate30' ? 'bg-gold-500/15 border-gold-500 text-white' : 'bg-dark-900/40 border-dark-800 text-gray-400 hover:border-dark-700'}`}
                        >
                          Até 30
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-light mt-2 leading-relaxed text-left">
                        * A emissão de Notas Fiscais é obrigatória e deve ser realizada pelo estabelecimento no ato da venda. Nossas franquias destinam-se ao fechamento e escrituração contábil semanal/mensal. Caso necessite de um serviço de emissão diária integral, solicite um orçamento em separado.
                      </p>
                    </div>
                  </div>

                  {/* Forma de Pagamento e Condição de Cartão */}
                  <div className="p-4 bg-dark-900/50 border border-dark-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] text-gold-500 font-bold uppercase tracking-wider block font-mono">Bônus & Condição Comercial</span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pagamento em Cartão de Crédito</h4>
                      </div>
                      <button
                        onClick={() => {
                          if (!contabilidadeAnual) return;
                          setPagamentoCartao(!pagamentoCartao);
                        }}
                        className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shrink-0 ${!contabilidadeAnual ? 'opacity-40 pointer-events-none bg-dark-950 border border-dark-800 text-gray-650' : pagamentoCartao ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 cursor-pointer' : 'bg-dark-950 border border-dark-800 text-gray-500 hover:text-white cursor-pointer'}`}
                      >
                        {!contabilidadeAnual ? '❌ Requer Contabilidade Anual' : pagamentoCartao ? '💳 Cartão Ativo' : '❌ Sem Cartão'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 font-light leading-relaxed text-left">
                      {pagamentoCartao
                        ? 'Realizando o pagamento de 12x R$ 249,00 no cartão para o parceiro, você ganha a Inscrição Estadual, a Migração MEI p/ ME, o Contrato Social e o Certificado Digital como super bônus gratuitos!'
                        : 'Sem cartão, nenhum bônus será concedido. Os custos com Certificado Digital (R$ 287), Inscrição Estadual (R$ 350) e Migração (R$ 350) serão cobrados de forma avulsa.'
                      }
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 w-full">
                  {!orcamentoFinalizado ? (
                    /* Estado Neutro (Antes de finalizar) */
                    <div className="text-center py-10 px-6 bg-dark-900/40 rounded-3xl border border-dark-800/80 shadow-2xl flex flex-col justify-center items-center space-y-6 min-h-[380px] backdrop-blur-md">
                      {transicaoIncompleta ? (
                        <>
                          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-bounce">
                            <AlertTriangle className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-base font-bold text-red-400 font-serif">Processo de Transição</h4>
                            <p className="text-xs text-gray-300 font-light leading-relaxed max-w-[285px] mx-auto">
                              Para realizar a transição de MEI para ME, a seleção de <strong>Certificado Digital</strong>, <strong>Inscrição Estadual</strong> e <strong>Migração MEI</strong> é necessária.
                            </p>
                          </div>
                          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl w-full space-y-2 text-left">
                            <div className="flex items-center justify-between border-b border-red-500/20 pb-1">
                              <span className="text-[9px] text-red-400 font-black uppercase tracking-widest block font-mono">Serviços Requeridos</span>
                              <span className="text-[9px] text-red-450 font-bold">A SELECIONAR</span>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-gray-400 font-light">
                              {!certificadoDigital && (
                                <li className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-450 shrink-0"></span>
                                  <span>Certificado Digital e-CNPJ A1</span>
                                </li>
                              )}
                              {!inscricaoEstadual && (
                                <li className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-450 shrink-0"></span>
                                  <span>Inscrição Estadual</span>
                                </li>
                              )}
                              {!migracaoMei && (
                                <li className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-450 shrink-0"></span>
                                  <span>Migração MEI p/ ME & Contrato Social</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 animate-pulse">
                            <Building2 className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-base font-bold text-white font-serif">Gerar Proposta</h4>
                            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-[285px] mx-auto">
                              Selecione os serviços corporativos e a franquia de notas fiscais ao lado para calcular o orçamento ideal para a sua empresa.
                            </p>
                          </div>
                        </>
                      )}

                      <button
                        onClick={() => {
                          const temServico = contabilidadeAnual || contabilidadeMensal || financeiro || atendimento || cobranca || certificadoDigital || inscricaoEstadual || migracaoMei || emissaoFaixa !== 'none';
                          if (!temServico) {
                            setErroModalMsg('Por favor, selecione pelo menos um serviço ou a franquia de notas fiscais antes de finalizar.');
                            return;
                          }

                          setOrcamentoFinalizado(true);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-gold-500/10 cursor-pointer"
                      >
                        Finalizar Orçamento
                      </button>
                    </div>
                  ) : (
                    /* Estado Finalizado (Resultado) */
                    <div className="space-y-6">
                      {/* Status dos Bônus e Taxas de Transição */}
                      <div className="space-y-3">
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider text-left">Benefícios & Adicionais</h4>

                        {/* Se contabilidade anual estiver selecionada */}
                        {contabilidadeAnual && pagamentoCartao ? (
                          <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-2xl space-y-2 text-left">
                            <div className="flex items-center justify-between border-b border-green-500/20 pb-1.5">
                              <span className="text-[9px] text-green-400 font-black uppercase tracking-widest block font-mono">Super Bônus Inclusos</span>
                              <span className="text-[9px] text-green-400/80 font-bold">GRÁTIS</span>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-gray-300">
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                <span>Certificado Digital e-CNPJ A1 (Todo Ano)</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                <span>Inscrição Estadual (Isenção da taxa)</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                <span>Migração MEI p/ ME & Contrato Social</span>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          contabilidadeSemBonus ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl space-y-2 text-left">
                              <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
                                <span className="text-[9px] text-red-400 font-black uppercase tracking-widest block font-mono">Taxas Únicas de Transição</span>
                                <span className="text-[9px] text-red-400/80 font-bold">A PAGAR</span>
                              </div>
                              <ul className="space-y-1.5 text-[11px] text-gray-300">
                                <li className="flex items-center justify-between">
                                  <span>Certificado Digital e-CNPJ A1</span>
                                  <span className="font-mono text-red-400 font-bold">R$ 287,00</span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span>Inscrição Estadual</span>
                                  <span className="font-mono text-red-400 font-bold">R$ 350,00</span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span>Migração MEI p/ ME & Contrato Social</span>
                                  <span className="font-mono text-red-400 font-bold">R$ 350,00</span>
                                </li>
                                <li className="flex items-center justify-between border-t border-red-500/20 pt-2 mt-1.5 font-bold text-white">
                                  <span>Total Taxas Únicas</span>
                                  <span className="font-mono text-red-400">R$ {custoTransicaoUnico.toFixed(2)}</span>
                                </li>
                              </ul>
                            </div>
                          ) : (
                            (!temContabilidade && custoTransicaoUnico > 0) && (
                              <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl space-y-2 text-left">
                                <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
                                  <span className="text-[9px] text-red-400 font-black uppercase tracking-widest block font-mono">Taxas Únicas de Transição</span>
                                  <span className="text-[9px] text-red-400/80 font-bold">A PAGAR</span>
                                </div>
                                <ul className="space-y-1.5 text-[11px] text-gray-300">
                                  {certificadoDigital && (
                                    <li className="flex items-center justify-between">
                                      <span>Certificado Digital e-CNPJ A1</span>
                                      <span className="font-mono text-red-400 font-bold">R$ 287,00</span>
                                    </li>
                                  )}
                                  {inscricaoEstadual && (
                                    <li className="flex items-center justify-between">
                                      <span>Inscrição Estadual</span>
                                      <span className="font-mono text-red-400 font-bold">R$ 350,00</span>
                                    </li>
                                  )}
                                  {migracaoMei && (
                                    <li className="flex items-center justify-between">
                                      <span>Migração MEI p/ ME & Contrato Social</span>
                                      <span className="font-mono text-red-400 font-bold">R$ 350,00</span>
                                    </li>
                                  )}
                                  <li className="flex items-center justify-between border-t border-red-500/20 pt-2 mt-1.5 font-bold text-white">
                                    <span>Total Taxas Únicas</span>
                                    <span className="font-mono text-red-400">R$ {custoTransicaoUnico.toFixed(2)}</span>
                                  </li>
                                </ul>
                              </div>
                            )
                          )
                        )}
                      </div>

                      {/* Resultados da Proposta */}
                      <div className="text-center py-6 px-6 bg-dark-950/90 rounded-3xl border border-dark-800 shadow-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-550 uppercase tracking-widest font-black font-mono">Mensalidade do Plano Customizado</span>
                          {contabilidadeAnual && pagamentoCartao && (
                            <div className="text-gray-500 text-xs line-through decoration-red-500/70 font-light">R$ {totalReferenciaAvulso.toFixed(2)}</div>
                          )}
                          <div className="text-3xl md:text-4xl font-serif font-black text-gold-500 my-1">
                            R$ {precoFechamento.toFixed(2)}
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium block">/mês no contrato unificado</span>
                          {!contabilidadeAnual && custoTransicaoUnico > 0 && (
                            <span className="text-[9px] text-amber-500/80 font-medium block mt-1 leading-normal italic">
                              * Taxas de transição de R$ {custoTransicaoUnico.toFixed(2)} cobradas separadamente.
                            </span>
                          )}
                        </div>

                        {contabilidadeAnual && pagamentoCartao ? (
                          <div className="p-3 bg-gold-500/5 border border-gold-500/20 rounded-2xl space-y-1 text-left">
                            <span className="text-[8px] text-gold-500 font-bold uppercase tracking-widest block font-mono">Divisão de Pagamento no Cartão</span>
                            <div className="text-xs text-white font-semibold">
                              💳 12x de <span className="text-gold-500 font-mono font-bold">R$ {valorCartao.toFixed(2)}</span> no Cartão do Parceiro
                            </div>
                            {valorRestante > 0 && (
                              <div className="text-[10px] text-gray-400 font-light">
                                + Restante mensal de: <span className="font-bold text-white font-mono">R$ {valorRestante.toFixed(2)}/mês</span> (Boleto/Pix)
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(contabilidadeAnual || contabilidadeMensal) ? (
                              <div className="p-3 bg-dark-900 border border-dark-800 rounded-2xl space-y-1.5 text-left">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block font-mono">Divisão de Pagamento Sem Cartão</span>
                                <div className="text-xs text-white font-medium">
                                  📄 Pago ao Parceiro de Contabilidade: <span className="text-gold-450 font-mono font-bold">R$ 298,80/mês</span>
                                </div>
                                {precoFechamento > 298.80 && (
                                  <div className="text-[10px] text-gray-400 font-light">
                                    + Restante mensal de: <span className="font-bold text-white font-mono">R$ {(precoFechamento - 298.80).toFixed(2)}/mês</span> (Boleto/Pix)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-1 text-left">
                                <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest block font-mono">Contratação Individual/Avulsa</span>
                                <div className="text-[11px] text-gray-300 font-light">
                                  Sem o parcelamento recorrente em cartão do parceiro, a contratação mensal dos serviços unificados segue o valor de mercado (integral).
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-3 border-t border-dark-850">
                          {contabilidadeAnual && pagamentoCartao && (
                            <p className="text-[10px] text-green-400/90 font-medium leading-relaxed uppercase tracking-wider mb-3">
                              Economia mensal de R$ {economia.toFixed(2)}
                            </p>
                          )}
                          <div className="space-y-2">
                            <button
                              onClick={handleWhatsappPlanoCompletoClick}
                              className="w-full py-3 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-gold-500/10 cursor-pointer"
                            >
                              Contratar Plano Customizado
                            </button>
                            <button
                              onClick={() => {
                                setOrcamentoFinalizado(false);
                              }}
                              className="w-full py-2 bg-dark-900 hover:bg-dark-850 border border-dark-800 text-gray-450 hover:text-white rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer"
                            >
                              Refazer Orçamento
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 5: DESCONTO PARA INDICAÇÕES */}
        <section className="py-20 md:py-24 px-6 border-t border-dark-900/60 bg-dark-900/10 relative">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Parceria de Sucesso</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Desconto por Indicações</h2>
              <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto font-light">
                Indicar novos parceiros comerciais é vantajoso para o seu negócio e reduz seus custos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full filter blur-3xl group-hover:bg-gold-500/10 transition-colors duration-500 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

                <div className="md:col-span-8 space-y-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                    <Percent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white">Como funciona o desconto?</h3>
                  <p className="text-xs md:text-sm text-gray-400 font-light leading-relaxed">
                    Sempre que você indicar Diego Kloppel para outras empresas e o contrato for assinado pelo indicado, sua empresa ganha um <strong>abatimento direto na mensalidade</strong>.
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 font-light leading-relaxed">
                    O desconto é concedido de forma recorrente por contrato assinado. Indique novos parceiros corporativos e zere a sua mensalidade de serviços financeiros e contábeis!
                  </p>
                </div>

                <div className="md:col-span-4 text-center py-6 px-4 bg-dark-950/80 rounded-2xl border border-dark-800 shadow-inner">
                  <span className="text-[10px] text-gray-550 uppercase tracking-widest font-bold font-mono">Redução de Custos</span>
                  <div className="text-3xl font-serif font-black text-gold-500 my-2">Desconto Fixo</div>
                  <p className="text-[11px] text-gray-400 font-light">Concedido mensalmente por indicação ativa fechada</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 6: CTA E CONVITE */}
        <section className="py-20 md:py-28 px-6 border-t border-dark-900/60 bg-dark-950 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Contato Direto</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              Vamos organizar as finanças da sua empresa?
            </h2>

            <p className="text-base md:text-lg text-gray-450 font-light leading-relaxed max-w-xl mx-auto">
              Fale diretamente com o Diego Kloppel para alinhar as necessidades contábeis e financeiras da sua empresa e receber uma proposta comercial ideal.
            </p>

            <div className="pt-6">
              <button
                onClick={handleWhatsappClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <MessageSquare className="w-4 h-4 text-dark-950" />
                Falar com Diego no WhatsApp
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full py-8 text-center text-xs text-gray-650 border-t border-dark-900/80 bg-dark-950">
        <p>© {new Date().getFullYear()} Diego Kloppel. Todos os direitos reservados.</p>
      </footer>

      {erroModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-dark-900 border-2 border-gold-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3 border-b border-dark-800 pb-3">
              <AlertTriangle className="w-6 h-6 text-gold-500 shrink-0 animate-bounce" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-serif">Aviso Importante</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light text-left">
              {erroModalMsg}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setErroModalMsg(null)}
                className="w-full py-2.5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PricingBusinessPage;
