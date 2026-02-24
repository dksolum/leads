import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign, Lock } from 'lucide-react';

interface Props {
  onStart: () => void;
  onAdminClick: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStart, onAdminClick }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-600 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dark-800 rounded-full blur-[128px] border border-gold-900/20"></div>
      </div>

      <div className="relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-4"
        >
          <img
            src="/images/logo.png"
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
          <DollarSign className="w-4 h-4" />
          Diagnóstico Financeiro Exclusivo
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight"
        >
          Descubra em 3 minutos se você está <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">perdendo dinheiro</span> sem perceber — mesmo ganhando bem.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Responda a perguntas estratégicas, receba um pré-diagnóstico personalizado da sua saúde financeira e desbloqueie uma sessão de orientação gratuita.
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
          Quero meu diagnóstico financeiro
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex items-center justify-center gap-6 pt-8 text-gray-600 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <span>Análise Gratuita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <span>Confidencialidade Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <span>Foco em Resultado</span>
          </div>
        </motion.div>
      </div>

      {/* Admin Link at the bottom */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={onAdminClick}
          className="p-3 bg-dark-900 border border-dark-800 rounded-full text-gray-700 hover:text-gold-500 hover:border-gold-900/30 transition-all group lg:opacity-30 lg:hover:opacity-100"
          title="Área Administrativa"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};