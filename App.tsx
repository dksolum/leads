import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { UserAnswers } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';

function App() {
  const [view, setView] = useState<'landing' | 'quiz' | 'loading' | 'result' | 'adminLogin' | 'adminDashboard'>('landing');
  const [answers, setAnswers] = useState<UserAnswers | null>(null);

  // Check initial session
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If we have a hash #admin, go to dashboard
        if (window.location.hash === '#admin') {
          setView('adminDashboard');
        }
      }
    });
  }, []);

  const startQuiz = () => {
    setView('quiz');
  };

  const handleQuizComplete = (data: UserAnswers) => {
    setAnswers(data);
    setView('loading');

    // Simulate processing time for "Analysis" effect
    setTimeout(() => {
      setView('result');
    }, 2500);
  };

  return (
    <div className="min-h-screen font-sans bg-dark-950 text-slate-200 selection:bg-gold-500/30 selection:text-gold-200">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage
              onStart={startQuiz}
              onAdminClick={() => setView('adminLogin')}
            />
          </motion.div>
        )}

        {view === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Quiz onComplete={handleQuizComplete} />
          </motion.div>
        )}

        {view === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-16 h-16 border-4 border-dark-800 border-t-gold-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-serif text-white mb-2">Analisando seu perfil...</h2>
            <p className="text-gray-500">Cruzando dados de renda, objetivos e desafios.</p>
          </motion.div>
        )}

        {view === 'result' && answers && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Result answers={answers} />
          </motion.div>
        )}

        {view === 'adminLogin' && (
          <motion.div
            key="adminLogin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminLogin
              onLoginSuccess={() => setView('adminDashboard')}
              onBack={() => setView('landing')}
            />
          </motion.div>
        )}

        {view === 'adminDashboard' && (
          <motion.div
            key="adminDashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminDashboard
              onLogout={async () => {
                await supabase.auth.signOut();
                setView('landing');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;