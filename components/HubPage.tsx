import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HubPageProps {
  navigate: (path: string) => void;
}

export const HubPage: React.FC<HubPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 selection:bg-gold-500/30 selection:text-gold-200 flex flex-col justify-between overflow-x-hidden relative">

      {/* Decorações de Fundo (Glows Premium) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-25 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-gold-600 rounded-full blur-[160px] opacity-30"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-red-900 rounded-full blur-[140px] opacity-10"></div>
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-dark-800 rounded-full blur-[180px] border border-gold-900/10 opacity-40"></div>
      </div>

      {/* Conteúdo Principal */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col justify-center gap-16 md:gap-20 w-full">

        {/* Seção Hero: Apresentação & Foto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Coluna de Informações */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 md:space-y-8 order-2 lg:order-1 flex flex-col items-center lg:items-start">

            <div className="space-y-2 w-full flex flex-col items-center lg:items-start">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight text-center lg:text-left"
              >
                Diego Kloppel
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[11px] md:text-xs font-sans font-semibold text-gold-500 tracking-[0.25em] uppercase text-center lg:text-left block mt-1"
              >
                Educador Financeiro e Contador
              </motion.p>
            </div>

            {/* Linha lateral esquerda laranjada de volta em todas as resoluções e alinhamento à esquerda fixado */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base md:text-lg text-gray-400 font-light leading-relaxed max-w-xl italic font-serif border-l-2 border-gold-500/30 pl-4 text-left w-full"
            >
              "Ajudo você a se organizar financeiramente em 30 dias, para que transforme a sua renda em patrimônio e viva com tranquilidade."
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm md:text-base text-gray-500 leading-relaxed max-w-xl text-left"
            >
              Soluções para você:
            </motion.p>
          </div>

          {/* Coluna da Foto (Sem Moldura / Dissolve-se no Fundo nas 4 direções com Máscara Radial) */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] flex items-center justify-center"
            >
              {/* Sombreamento escuro profundo e difuso em todas as direções */}
              <div className="absolute w-[85%] h-[85%] bg-black rounded-full blur-[45px] opacity-95 z-0"></div>

              {/* Imagem do Perfil com Máscara Radial para dissolver no topo, base e laterais */}
              <img
                src="/images/profile.png"
                alt="Diego Kloppel - Educador Financeiro"
                className="w-full h-full object-contain object-top relative z-10 select-none pointer-events-none"
                style={{
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 70%)',
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 70%)'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
                }}
              />
            </motion.div>
          </div>

        </div>

        {/* Seção dos Cards Premium (Lista Vertical com Imagens de Fundo) */}
        <div className="flex flex-col gap-6 md:gap-8 w-full relative">

          {/* Card 1: Finanças Pessoais */}
          <motion.div
            whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => navigate('/financas-pessoais')}
            className="cursor-pointer group flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-dark-900/30 hover:bg-dark-900/60 border border-dark-800 rounded-2xl transition-all duration-300 relative overflow-hidden min-h-[200px] md:min-h-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Imagem de Fundo (Plano de Fundo do Card) */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <img
                src="/images/card_personal.png"
                alt="Background Finanças Pessoais"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-20 group-hover:opacity-30"
              />
              {/* Overlay de Gradiente Escuro para legibilidade perfeita do texto */}
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-dark-950/20 hidden md:block"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/90 to-dark-950/60 md:hidden"></div>
            </div>

            {/* Conteúdo sobreposto (Texto) */}
            <div className="flex-1 space-y-4 text-center md:text-left relative z-10 w-full flex flex-col items-center md:items-start">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white group-hover:text-gold-400 transition-colors">
                Ganha bem e não consegue construir patrimônio?
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light max-w-xl">
                O dinheiro entra na conta mas você não sabe para onde está indo. Entenda como ter sobrando no início e no final do mês para realizar os seus objetivos.
              </p>
              {/* Botão com Fundo Destacado Premium */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 group-hover:text-gold-300 border border-gold-500/20 group-hover:border-gold-500/40 transition-all shadow-lg shadow-black/30 backdrop-blur-sm mt-2 w-fit">
                <span>Fazer Diagnóstico Gratuito</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Finanças Empresariais */}
          <motion.div
            whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.3)' }}
            onClick={() => navigate('/financas-empresariais')}
            className="cursor-pointer group flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-dark-900/30 hover:bg-dark-900/60 border border-dark-800 rounded-2xl transition-all duration-300 relative overflow-hidden min-h-[200px] md:min-h-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Imagem de Fundo (Plano de Fundo do Card) */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <img
                src="/images/card_business.png"
                alt="Background Finanças Empresariais"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-20 group-hover:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-dark-950/20 hidden md:block"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/90 to-dark-950/60 md:hidden"></div>
            </div>

            {/* Conteúdo sobreposto (Texto) */}
            <div className="flex-1 space-y-4 text-center md:text-left relative z-10 w-full flex flex-col items-center md:items-start">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white group-hover:text-gold-400 transition-colors">
                Mais controle e mais lucro para sua empresa
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light max-w-xl">
                Em breve...
              </p>
              {/* Botão com Fundo Destacado Premium */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 group-hover:text-gold-300 border border-gold-500/20 group-hover:border-gold-500/40 transition-all shadow-lg shadow-black/30 backdrop-blur-sm mt-2 w-fit">
                <span>Em breve!</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Finanças Pessoais + Empresariais (Completas) */}
          <motion.div
            whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => navigate('/financas-completas')}
            className="cursor-pointer group flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-dark-900/30 hover:bg-dark-900/60 border border-dark-800 rounded-2xl transition-all duration-300 relative overflow-hidden min-h-[200px] md:min-h-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Imagem de Fundo (Plano de Fundo do Card) */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <img
                src="/images/card_complete.png"
                alt="Background Finanças Completas"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-20 group-hover:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-dark-950/20 hidden md:block"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/90 to-dark-950/60 md:hidden"></div>
            </div>

            {/* Conteúdo sobreposto (Texto) */}
            <div className="flex-1 space-y-4 text-center md:text-left relative z-10 w-full flex flex-col items-center md:items-start">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white group-hover:text-gold-400 transition-colors">
                Separe sua empresa da sua vida pessoal
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light max-w-xl">
                Em breve...
              </p>
              {/* Botão com Fundo Destacado Premium */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 group-hover:text-gold-300 border border-gold-500/20 group-hover:border-gold-500/40 transition-all shadow-lg shadow-black/30 backdrop-blur-sm mt-2 w-fit">
                <span>Em breve!</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Conheça a Solum Financeiro */}
          <motion.div
            whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.3)' }}
            onClick={() => navigate('/solum-financeiro')}
            className="cursor-pointer group flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-dark-900/30 hover:bg-dark-900/60 border border-dark-800 rounded-2xl transition-all duration-300 relative overflow-hidden min-h-[200px] md:min-h-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Imagem de Fundo (Plano de Fundo do Card) */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <img
                src="/images/card_solum.png"
                alt="Background Solum Financeiro"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-20 group-hover:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-dark-950/20 hidden md:block"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/90 to-dark-950/60 md:hidden"></div>
            </div>

            {/* Conteúdo sobreposto (Texto) */}
            <div className="flex-1 space-y-4 text-center md:text-left relative z-10 w-full flex flex-col items-center md:items-start">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white group-hover:text-gold-400 transition-colors">
                Conheça a Solum Financeiro
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light max-w-xl">
                A ferramenta exclusiva para organizar as finanças da sua empresa e da sua vida pessoal.
              </p>
              {/* Botão com Fundo Destacado Premium */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 group-hover:text-gold-300 border border-gold-500/20 group-hover:border-gold-500/40 transition-all shadow-lg shadow-black/30 backdrop-blur-sm mt-2 w-fit">
                <span>Conhecer Plataforma</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Seção Redes Sociais */}
        <div className="flex flex-col items-center gap-6 pt-6 border-t border-dark-900">
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase font-sans">Me Acompanhe nas Redes</span>

          <div className="flex flex-wrap items-center justify-center gap-4">

            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-dark-900 border border-dark-800 text-gray-300 hover:text-white hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all text-sm font-semibold shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.978 14.12 1.05 11.5 1.05c-5.45 0-9.886 4.372-9.89 9.802-.001 1.77.476 3.497 1.385 5.04L1.995 20.2l4.652-1.046zM17.305 14.4c-.287-.143-1.7-.838-1.963-.933-.262-.096-.454-.143-.645.143-.19.287-.738.933-.905 1.123-.167.19-.333.214-.62.071-2.92-1.454-4.802-4.103-5.467-5.247-.167-.287-.018-.442.125-.583.128-.127.287-.333.43-.5.143-.167.19-.287.287-.477.095-.19.048-.358-.024-.5-.071-.143-.645-1.551-.883-2.124-.233-.558-.47-.482-.645-.491-.166-.008-.358-.01-.55-.01s-.5.071-.763.358c-.262.287-1.002.978-1.002 2.387 0 1.41 1.026 2.769 1.17 2.96.143.19 2.017 3.08 4.886 4.32 1.954.845 2.714.887 3.684.743.606-.09 1.7-.692 1.939-1.36.238-.668.238-1.241.167-1.36-.072-.119-.262-.214-.549-.357z" />
              </svg>
              <span>WhatsApp</span>
            </motion.a>

            {/* YouTube */}
            <motion.a
              href="https://youtube.com/@seu_canal"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-dark-900 border border-dark-800 text-gray-300 hover:text-white hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5 transition-all text-sm font-semibold shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>YouTube</span>
            </motion.a>

            {/* Instagram */}
            <motion.a
              href="https://instagram.com/seu_perfil"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-dark-900 border border-dark-800 text-gray-300 hover:text-white hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5 transition-all text-sm font-semibold shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              <span>Instagram</span>
            </motion.a>

            {/* TikTok */}
            <motion.a
              href="https://tiktok.com/@seu_tiktok"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-dark-900 border border-dark-800 text-gray-300 hover:text-white hover:border-[#00f2fe]/40 hover:bg-[#00f2fe]/5 transition-all text-sm font-semibold shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.72-.49-.44-.9-1-1.24-1.55v6.52c-.04 2.32-.86 4.67-2.6 6.19-1.92 1.73-4.75 2.22-7.1 1.54-2.35-.67-4.36-2.58-4.99-4.96-.8-3.05.67-6.62 3.65-7.79 1.08-.43 2.26-.54 3.4-.42v4.09c-.88-.28-1.88-.13-2.61.43-.91.7-1.23 1.93-.93 3.04.3 1.11 1.39 1.94 2.54 1.9 1.43-.05 2.52-1.35 2.47-2.79.02-3.41.01-6.83.01-10.24h4.09V.02z" />
              </svg>
              <span>TikTok</span>
            </motion.a>

          </div>
        </div>

      </main>

      {/* Footer / Direitos Reservados */}
      <footer className="relative z-10 w-full py-6 text-center text-xs md:text-sm text-gray-600 border-t border-dark-900/60 bg-dark-950/80 backdrop-blur-md">
        <p>© {new Date().getFullYear()} Diego Kloppel - Consultoria Financeira Premium. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
};
