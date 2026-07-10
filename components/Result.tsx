import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAnswers, ProfileType } from '../types';
import { calculateProfile, generateReportText } from '../utils/logic';
import { Calendar, MessageCircle, Lock, TrendingUp, Check, ArrowRight, Loader2, PhoneCall, Phone, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength <= 2) {
        return phoneNumberLength > 0 ? `(${phoneNumber}` : '';
    }
    if (phoneNumberLength <= 6) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    if (phoneNumberLength <= 10) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

interface Props {
    answers: UserAnswers;
}

export const Result: React.FC<Props> = ({ answers }) => {
    const profile: ProfileType = calculateProfile(answers);
    const reportHtml = generateReportText(answers, profile);
    const [sentWhatsapp, setSentWhatsapp] = useState(false);

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

    const [isSubmittingStrategy, setIsSubmittingStrategy] = useState(false);
    const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
    const [isSubmittingWhatsapp, setIsSubmittingWhatsapp] = useState(false);
    const [strategyRedirectionUrl, setStrategyRedirectionUrl] = useState<string | null>(null);
    const [directRedirectionUrl, setDirectRedirectionUrl] = useState<string | null>(null);

    // Auto-redirection effect for Strategy Session
    React.useEffect(() => {
        if (strategyRedirectionUrl) {
            const timer = setTimeout(() => {
                window.open(strategyRedirectionUrl, "_blank");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [strategyRedirectionUrl]);

    // Auto-redirection effect for Direct WhatsApp
    React.useEffect(() => {
        if (directRedirectionUrl) {
            const timer = setTimeout(() => {
                window.open(directRedirectionUrl, "_blank");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [directRedirectionUrl]);

    const saveLeadAction = async (actionType: string) => {
        try {
            const { error } = await supabase.from('leads').insert({
                name: answers.leadName || 'Sem nome',
                email: answers.leadEmail || 'Sem email',
                phone: answers.leadPhone || 'Sem telefone',
                profile,
                answers: {
                    ...answers,
                    formType: 'personal'
                },
                action_type: actionType
            });
            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error saving lead action:', err);
            return false;
        }
    };

    const handleStrategyClick = async () => {
        if (isSubmittingStrategy || strategyRedirectionUrl) return;
        setIsSubmittingStrategy(true);
        const success = await saveLeadAction('Strategy Session');
        if (success) {
            setStrategyRedirectionUrl("https://calendar.app.google/Fh6dNbVXyvQEc9Pw5");
        }
        setIsSubmittingStrategy(false);
    };

    const handleDirectWhatsappClick = async () => {
        if (isSubmittingDirect || directRedirectionUrl) return;
        setIsSubmittingDirect(true);
        const success = await saveLeadAction('WhatsApp Direct');
        if (success) {
            setDirectRedirectionUrl("https://wa.me/message/VFMAYP65ATMVL1");
        }
        setIsSubmittingDirect(false);
    };

    const handleWhatsappContactClick = async () => {
        if (isSubmittingWhatsapp || sentWhatsapp) return;
        setIsSubmittingWhatsapp(true);
        const success = await saveLeadAction('WhatsApp Contact');
        if (success) {
            setSentWhatsapp(true);
        }
        setIsSubmittingWhatsapp(false);
    };

    return (
        <div className="min-h-screen bg-dark-950 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-dark-800 to-dark-900 p-8 md:p-12 text-center border-b border-gold-900/30">
                        <p className="text-gold-500 font-medium tracking-widest uppercase text-sm mb-4">Seu Perfil Financeiro</p>
                        <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-6">{profile}</h2>
                        <div className="flex justify-center gap-4">
                            <span className="bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">Confidencial</span>
                            <span className="bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">Personalizado</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <div
                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: reportHtml }}
                        />

                        <div className="mt-12 p-6 bg-dark-800/50 rounded-xl border border-dark-700">
                            <h3 className="text-xl text-white font-serif mb-2 flex items-center gap-2">
                                <TrendingUp className="text-gold-500 w-5 h-5" />
                                O Caminho para a Solução
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Identificamos padrões no seu relato que indicam oportunidades imediatas de ajuste. Não se trata de cortar o cafézinho, mas de reestruturação inteligente do fluxo de capital.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section - Ultra Premium */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-12 text-center"
                >
                    <div ref={ctaRef} className="border border-gold-500/20 bg-gradient-to-b from-dark-900 to-dark-950 p-8 rounded-3xl space-y-8 shadow-[0_0_50px_rgba(245,158,11,0.05)] text-center relative overflow-hidden">
                        {/* Detalhe estético dourado */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                        <div className="text-center space-y-3 max-w-xl mx-auto">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-gold-400 bg-gold-400/10 uppercase border border-gold-400/20">
                                Próximo Passo Recomendado
                            </span>
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight font-serif">Como destravar sua vida financeira?</h3>
                            <p className="text-sm text-gray-400 font-light leading-relaxed">
                                Nessa conversa estratégica gratuita de 30 minutos, vou validar esse diagnóstico pessoalmente com você, mostrar onde ajustar primeiro e explicar como minha consultoria premium vai acelerar sua liberdade financeira. Escolha o canal de sua preferência:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            {/* Opção 1: Agendar na agenda (Destaque Principal) */}
                            <div className="relative flex">
                                {strategyRedirectionUrl ? (
                                    <motion.div
                                        key="strategy-success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full flex flex-col items-center justify-center p-6 bg-dark-950/65 border border-gold-500 rounded-2xl text-center shadow-lg shadow-gold-500/10"
                                    >
                                        <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Check className="w-5 h-5 text-gold-500" />
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light">
                                            Redirecionando para a agenda... <br />
                                            <span className="text-[10px] text-gold-400 font-bold">Por favor, aguarde.</span>
                                        </p>
                                    </motion.div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleStrategyClick}
                                        disabled={isSubmittingStrategy || isSubmittingDirect || isSubmittingWhatsapp}
                                        className="flex flex-col items-center justify-between p-6 bg-dark-950/60 hover:bg-dark-900 border-2 border-gold-500/30 hover:border-gold-500 rounded-2xl text-center group transition-all shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] relative w-full cursor-pointer disabled:opacity-50"
                                    >
                                        <div className="absolute -top-3 right-4 px-2 py-0.5 rounded bg-gold-500 text-dark-950 text-[9px] font-bold uppercase tracking-wider">
                                            Caminho Direto
                                        </div>
                                        <Calendar className="w-9 h-9 text-gold-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <div className="space-y-1.5 mb-4">
                                            <h4 className="text-base font-bold text-white">Agendar na Agenda</h4>
                                            <p className="text-xs text-gray-400 font-light leading-relaxed">Escolha o melhor dia e horário na minha agenda do Google.</p>
                                        </div>
                                        <span className="text-xs font-bold text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            {isSubmittingStrategy ? 'Processando...' : 'Escolher Horário'} <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Opção 2: Chamar no WhatsApp */}
                            <div className="relative flex">
                                {directRedirectionUrl ? (
                                    <motion.div
                                        key="direct-success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full flex flex-col items-center justify-center p-6 bg-dark-950/65 border border-emerald-500 rounded-2xl text-center shadow-lg shadow-emerald-500/10"
                                    >
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Check className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light">
                                            Redirecionando para o WhatsApp... <br />
                                            <span className="text-[10px] text-emerald-400 font-bold">Por favor, aguarde.</span>
                                        </p>
                                    </motion.div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleDirectWhatsappClick}
                                        disabled={isSubmittingStrategy || isSubmittingDirect || isSubmittingWhatsapp}
                                        className="flex flex-col items-center justify-between p-6 bg-dark-950/60 hover:bg-dark-900 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-2xl text-center group transition-all shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative w-full cursor-pointer disabled:opacity-50"
                                    >
                                        <div className="absolute -top-3 right-4 px-2 py-0.5 rounded bg-emerald-500 text-dark-950 text-[9px] font-bold uppercase tracking-wider">
                                            Mais Rápido
                                        </div>
                                        <MessageCircle className="w-9 h-9 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <div className="space-y-1.5 mb-4">
                                            <h4 className="text-base font-bold text-white">Falar no WhatsApp</h4>
                                            <p className="text-xs text-gray-400 font-light leading-relaxed">Envie seu diagnóstico diretamente para iniciarmos a conversa.</p>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            {isSubmittingDirect ? 'Processando...' : 'Iniciar Conversa'} <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Opção 3: Nós entramos em contato */}
                            <button
                                type="button"
                                onClick={handleWhatsappContactClick}
                                disabled={sentWhatsapp || isSubmittingStrategy || isSubmittingDirect || isSubmittingWhatsapp}
                                className="flex flex-col items-center justify-between p-6 bg-dark-950/60 hover:bg-dark-900 border border-dark-800 hover:border-blue-500 rounded-2xl text-center group transition-all w-full shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] cursor-pointer disabled:opacity-50"
                            >
                                <PhoneCall className="w-9 h-9 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="space-y-1.5 mb-4">
                                    <h4 className="text-base font-bold text-white">Nós te ligamos</h4>
                                    <p className="text-xs text-gray-400 font-light leading-relaxed">Prefere um retorno? Nossa equipe entrará em contato com você.</p>
                                </div>
                                {sentWhatsapp ? (
                                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Solicitação Enviada!
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        {isSubmittingWhatsapp ? 'Processando...' : 'Solicitar Retorno'} <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-dark-700 text-xs border-t border-dark-800/50 pt-4">
                            <Lock className="w-3 h-3" />
                            <span>Seus dados estão protegidos e sob total confidencialidade.</span>
                        </div>
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