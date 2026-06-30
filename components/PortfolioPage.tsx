import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, MessageSquare, ShieldCheck, TrendingUp, Compass, Calendar, Wallet } from 'lucide-react';

interface PortfolioPageProps {
  navigate: (path: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ navigate }) => {
  const handleWhatsappClick = () => {
    window.open('https://wa.me/5565984633457?text=Ol%C3%A1%20Diego%2C%20gostaria%20de%20agendar%20um%20diagn%C3%B3stico%20financeiro%20personalizado.', '_blank');
  };

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
        <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] bg-gold-900 rounded-full blur-[200px] opacity-10" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-red-900 rounded-full blur-[180px] opacity-5" />
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10">
        
        {/* SEÇÃO 1: CAPA */}
        <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-3xl"
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-gold-500 bg-gold-500/10 px-3 py-1.5 rounded-full border border-gold-500/20 shadow-inner">
              Apresentação Exclusiva
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Consultoria Financeira
            </h1>
            <p className="text-lg md:text-2xl text-gray-450 font-light leading-relaxed max-w-2xl mx-auto">
              Transforme a sua renda em patrimônio sólido e viva com a tranquilidade que você merece.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleWhatsappClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-dark-950" />
                Agendar Diagnóstico Gratuito
              </button>
              <a
                href="#sobre"
                className="w-full sm:w-auto px-8 py-4 bg-dark-900 hover:bg-dark-850 border border-dark-800 hover:border-gold-500/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center"
              >
                Saiba Mais
              </a>
            </div>
          </motion.div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Role para explorar</span>
            <div className="w-1.5 h-6 bg-gray-650 mx-auto rounded-full mt-2" />
          </div>
        </section>

        {/* SEÇÃO 2: QUEM É DIEGO */}
        <section id="sobre" className="py-20 md:py-32 px-6 border-t border-dark-900/60 bg-dark-900/20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-2xl overflow-hidden border border-dark-800 bg-dark-900/40 p-2 shadow-2xl"
              >
                <img
                  src="/images/profile.webp"
                  alt="Diego Kloppel"
                  className="w-full h-full object-contain object-top rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              </motion.div>
            </div>

            {/* Texto */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">O Consultor</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Diego Kloppel</h2>
              <p className="text-xs font-semibold text-gold-500/80 uppercase tracking-widest">Educador Financeiro e Contador</p>
              
              <div className="space-y-4 text-gray-400 font-light leading-relaxed text-sm md:text-base">
                <p>
                  Minha missão é guiar você no processo de reestruturação financeira para que consiga se organizar em até 30 dias, criando as bases para transformar a sua renda mensal em patrimônio real.
                </p>
                <p>
                  Com sólida formação contábil e anos de experiência em planejamento financeiro estratégico, desenvolvi um método dinâmico, focado na prática diária, sem planilhas complexas ou restrições extremas que travam sua rotina.
                </p>
              </div>

              <div className="pt-4 border-t border-dark-850 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  Método Validado
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold-500" />
                  Foco em Patrimônio
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SEÇÃO 3: O PROBLEMA */}
        <section className="py-20 md:py-32 px-6 border-t border-dark-900/60 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">A Realidade</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white max-w-2xl mx-auto leading-tight">
              Você ganha bem, mas seu dinheiro simplesmente "desaparece"?
            </h2>
            
            <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed max-w-xl mx-auto">
              É muito comum vermos profissionais de alta renda que recebem excelentes salários, mas que vivem em uma roda-gigante financeira constante, sem conseguir construir patrimônio ou investir com segurança.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
              <div className="p-6 bg-dark-900/30 border border-dark-850 rounded-2xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">1</div>
                <h4 className="font-bold text-white text-sm">Gargalo Oculto</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  Você não sabe exatamente onde seu dinheiro está indo até o fim do mês chegar.
                </p>
              </div>
              <div className="p-6 bg-dark-900/30 border border-dark-850 rounded-2xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">2</div>
                <h4 className="font-bold text-white text-sm">Falta de Planejamento</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  Ausência de metas de curto e longo prazo estruturadas para crescimento real.
                </p>
              </div>
              <div className="p-6 bg-dark-900/30 border border-dark-850 rounded-2xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">3</div>
                <h4 className="font-bold text-white text-sm">Armadilha do Crédito</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  O limite do cartão de crédito é usado incorretamente, impedindo investimentos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: O MÉTODO */}
        <section className="py-20 md:py-32 px-6 border-t border-dark-900/60 bg-dark-900/10 relative">
          <div className="max-w-5xl mx-auto space-y-16">
            
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">A Solução</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">Como Funciona a Consultoria</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto font-light">
                Um método estruturado em três pilares fundamentais para blindar a sua vida financeira.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Pilar 1 */}
              <div className="bg-dark-900/50 border border-dark-850 p-8 rounded-3xl space-y-4 text-center hover:border-gold-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto text-gold-500">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">1. Organização Financeira</h3>
                <p className="text-xs text-gray-550 leading-relaxed font-light">
                  Mapeamos com precisão sua realidade. Eliminamos vazamentos e criamos uma visualização simples das suas despesas e receitas sem travar sua rotina.
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="bg-dark-900/50 border border-dark-850 p-8 rounded-3xl space-y-4 text-center hover:border-gold-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto text-gold-500">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">2. Planejamento Sólido</h3>
                <p className="text-xs text-gray-550 leading-relaxed font-light">
                  Projetamos suas finanças para os próximos meses de forma previsível, construindo um orçamento equilibrado focado nas suas metas e prioridades de vida.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="bg-dark-900/50 border border-dark-850 p-8 rounded-3xl space-y-4 text-center hover:border-gold-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto text-gold-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">3. Crescimento Patrimonial</h3>
                <p className="text-xs text-gray-550 leading-relaxed font-light">
                  Aprenda a amortizar dívidas rapidamente, construir sua reserva financeira estratégica e dar os primeiros passos seguros no universo de investimentos.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SEÇÃO 5: FERRAMENTAS E INCLUSOS */}
        <section className="py-20 md:py-32 px-6 border-t border-dark-900/60">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Diferenciais</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">O que Você Recebe na Consultoria</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto font-light">
                Todo o suporte e ferramentas que você precisa para assumir o controle definitivo do seu dinheiro.
              </p>
            </div>

            <div className="bg-dark-900/30 border border-dark-850 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-left">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Sessões Individuais de Direcionamento</h4>
                    <p className="text-xs text-gray-550 font-light mt-0.5">Encontros focados em mapear gargalos e construir o plano estratégico de ação personalizado.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Acompanhamento e Suporte Diário</h4>
                    <p className="text-xs text-gray-550 font-light mt-0.5">Acesso direto ao consultor para tirar dúvidas e realizar ajustes de rota ao longo do processo.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Ferramenta Solum Financeiro</h4>
                    <p className="text-xs text-gray-550 font-light mt-0.5">Plataforma exclusiva de controle de receitas, despesas, caixa e metas de investimentos por 12 meses.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Guia Cartão de Crédito sem Armadilhas</h4>
                    <p className="text-xs text-gray-550 font-light mt-0.5">Aprenda a acumular pontos, milhas e obter benefícios, anulando o risco de endividamento.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Manual de Amortização Inteligente</h4>
                    <p className="text-xs text-gray-550 font-light mt-0.5">Como negociar taxas e antecipar parcelas de financiamentos ou dívidas reduzindo juros em até 3x.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Grupo de Apoio & Networking</h4>
                    <p className="text-xs text-gray-550 font-light mt-0.5">Espaço reservado para trocar experiências e esclarecer dúvidas comuns entre mentorados.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SEÇÃO 6: CTA E CONVITE */}
        <section className="py-20 md:py-32 px-6 border-t border-dark-900/60 bg-dark-900/40 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Seu Próximo Passo</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              Pronto para colocar as suas finanças no rumo certo?
            </h2>
            
            <p className="text-base md:text-lg text-gray-450 font-light leading-relaxed max-w-xl mx-auto">
              Como cada pessoa tem uma renda, um custo de vida e objetivos totalmente únicos, a consultoria é desenhada de forma 100% individualizada e exclusiva.
            </p>

            <div className="p-6 bg-dark-900/80 border border-dark-800 rounded-3xl max-w-md mx-auto space-y-4">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto text-gold-500">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Diagnóstico Financeiro Gratuito</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Faremos uma chamada rápida no WhatsApp para analisar o seu perfil e identificar o plano de ação imediato para a sua realidade.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={handleWhatsappClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 hover:from-gold-500 hover:to-amber-400 text-dark-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <MessageSquare className="w-4 h-4 text-dark-950" />
                Agendar no WhatsApp
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full py-8 text-center text-xs text-gray-650 border-t border-dark-900/80 bg-dark-950">
        <p>© {new Date().getFullYear()} Diego Kloppel. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
};

export default PortfolioPage;
