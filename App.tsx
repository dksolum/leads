import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { UserAnswers } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';
import { HubPage } from './components/HubPage';
import { ComingSoonPage } from './components/ComingSoonPage';
import { PortfolioPage } from './components/PortfolioPage';

// Componente que encapsula toda a lógica e fluxo originais de Finanças Pessoais
const PersonalFinanceFlow: React.FC<{ onBack: () => void; onAdminClick: () => void }> = ({ onBack, onAdminClick }) => {
  const [view, setView] = useState<'landing' | 'quiz' | 'loading' | 'result'>('landing');
  const [answers, setAnswers] = useState<UserAnswers | null>(null);

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
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <motion.div
          key="landing"
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage
            onStart={startQuiz}
            onAdminClick={onAdminClick}
            onBack={onBack}
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
    </AnimatePresence>
  );
};

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Mapear autenticação Supabase centralizada
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Monitorar popstate do SPA
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  return (
    <div className="min-h-screen font-sans bg-dark-950 text-slate-200 selection:bg-gold-500/30 selection:text-gold-200">
      {currentPath === '/financas-pessoais' && (
        <PersonalFinanceFlow 
          onBack={() => navigate('/')} 
          onAdminClick={() => navigate('/administrativo')} 
        />
      )}
      
      {currentPath === '/financas-empresariais' && (
        <ComingSoonPage 
          title="Finanças Empresariais" 
          onBack={() => navigate('/')} 
          onAdminClick={() => navigate('/administrativo')}
        />
      )}
      
      {currentPath === '/financas-completas' && (
        <ComingSoonPage 
          title="Gestão Completa (Física + Jurídica)" 
          onBack={() => navigate('/')} 
          onAdminClick={() => navigate('/administrativo')}
        />
      )}
      
      {currentPath === '/solum-financeiro' && (
        <ComingSoonPage 
          title="Solum Financeiro" 
          onBack={() => navigate('/')} 
          onAdminClick={() => navigate('/administrativo')}
        />
      )}

      {currentPath === '/administrativo' && (
        sessionLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-dark-950 text-gold-500">
            <div className="w-12 h-12 border-4 border-dark-800 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        ) : session ? (
          <AdminDashboard
            onLogout={async () => {
              await supabase.auth.signOut();
              setSession(null);
              navigate('/');
            }}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={() => {
              // Buscar sessão após sucesso
              supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
              });
            }}
            onBack={() => navigate('/')}
          />
        )
      )}

      {(currentPath === '/portfolio' || currentPath === '/portifolio') && (
        <PortfolioPage navigate={navigate} />
      )}
      
      {currentPath !== '/financas-pessoais' && 
       currentPath !== '/financas-empresariais' && 
       currentPath !== '/financas-completas' && 
       currentPath !== '/solum-financeiro' && 
       currentPath !== '/administrativo' && 
       currentPath !== '/portfolio' && 
       currentPath !== '/portifolio' && (
        <HubPage navigate={navigate} />
      )}
    </div>
  );
}

export default App;