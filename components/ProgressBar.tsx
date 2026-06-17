import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<Props> = ({ current, total }) => {
  // Começa em 60% e progride até 100% nas últimas perguntas para dar sensação de proximidade do fim
  const startProgress = 60;
  const progress = total > 1 
    ? Math.min(startProgress + (current / (total - 1)) * (100 - startProgress), 100) 
    : 100;

  return (
    <div className="w-full h-1 bg-dark-800 rounded-full mb-8 overflow-hidden">
      <motion.div 
        className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};