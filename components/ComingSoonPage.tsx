import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Hourglass, Settings, Sparkles, Lock } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  onBack: () => void;
  onAdminClick?: () => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, onBack, onAdminClick }) => {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 selection:bg-gold-500/30 selection:text-gold-200 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Admin Link - cadeado oculto */}
      {onAdminClick && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={onAdminClick}
            className="p-2 md:p-3 bg-dark-900/50 hover:bg-dark-900 border border-dark-800 rounded-full text-gray-750 hover:text-gold-500 hover:border-gold-900/30 transition-all group opacity-20 hover:opacity-100"
            title="Área Administrativa"
          >
            <Lock className="w-3 h-3 md:w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Background Decor (Blur Glows) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-gold-600 rounded-full blur-[160px] opacity-25"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-dark-800 rounded-full blur-[120px] border border-gold-900/10"></div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto space-y-8 px-4">
        
        {/* Ícone Animado Premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex justify-center"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <Hourglass className="w-10 h-10 md:w-12 md:h-12 animate-[spin_8s_linear_infinite]" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute -top-1 -right-1 text-gold-500"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </div>
        </motion.div>

        {/* Textos de Identificação */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/5 border border-gold-500/15 text-gold-400/80 text-xs md:text-sm font-medium uppercase tracking-wider"
          >
            <Settings className="w-3.5 h-3.5 animate-spin" />
            Desenvolvimento Exclusivo
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-wide leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-xl text-gray-400 font-light leading-relaxed max-w-md mx-auto"
          >
            Estamos finalizando esta solução. Em breve disponível.
          </motion.p>
        </div>

        {/* Efeito de barra de progresso premium decorativa */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent max-w-xs mx-auto"
        />

        {/* Botão de Retorno */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-dark-900 border border-dark-800 text-gray-300 hover:text-white hover:border-gold-500/30 hover:bg-dark-800/80 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para a Página Inicial
          </button>
        </motion.div>

      </div>
    </div>
  );
};
