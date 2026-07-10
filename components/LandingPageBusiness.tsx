import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign, Lock, ArrowLeft, Building2 } from 'lucide-react';

interface Props {
  onStart: () => void;
  onAdminClick: () => void;
  onBack: () => void;
}

export const LandingPageBusiness: React.FC<Props> = ({ onStart, onAdminClick, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto relative overflow-hidden">
      {/* Botão de Voltar para o Portal */}
      <div className="absolute top-6 left-6 z-20 max-md:relative max-md:top-0 max-md:left-0 max-md:w-full max-md:flex max-md:justify-start max-md:mb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900/50 hover:bg-dark-900 border border-dark-800 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all shadow-md backdrop-blur-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Portal
        </button>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-600 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dark-800 rounded-full blur-[128px] border border-gold-900/20"></div>
      </div>

      <div className="relative z-10 space-y-6 md:space-y-8 w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-4"
        >
          <img
            src="/images/logo.webp"
            alt="Consultoria Financeira Premium Logo"
            className="h-20 md:h-28 object-contain filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium tracking-wide uppercase"
        >
          <Building2 className="w-4 h-4 text-gold-400" />
          Diagnóstico Financeiro Corporativo
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight"
        >
          Descubra em 3 minutos se a sua empresa está <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">perdendo lucro</span> por falta de controles.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Responda poucas perguntas rápidas, identifique os maiores gargalos de caixa da sua empresa e receba um diagnóstico exclusivo com orientações de Diego Kloppel.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 rounded-lg text-dark-950 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all"
        >
          Analisar Minha Empresa
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-3 md:pt-8 text-gray-600 text-sm px-4"
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <span>Análise Empresarial Gratuita</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <span>Confidencialidade LGPD</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <span>Foco em Margem e Caixa</span>
          </div>
        </motion.div>
      </div>

      {/* Admin Link */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onAdminClick}
          className="p-2 md:p-3 bg-dark-900/50 hover:bg-dark-900 border border-dark-850 rounded-full text-gray-700 hover:text-gold-500 hover:border-gold-900/30 transition-all group opacity-20 hover:opacity-100"
          title="Área Administrativa"
        >
          <Lock className="w-3 h-3 md:w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
