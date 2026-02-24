import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserAnswers, ProfileType } from '../types';
import { calculateProfile, generateReportText } from '../utils/logic';
import { Calendar, MessageCircle, Lock, TrendingUp, Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
    answers: UserAnswers;
}

export const Result: React.FC<Props> = ({ answers }) => {
    const profile: ProfileType = calculateProfile(answers);
    const reportHtml = generateReportText(answers, profile);
    const [showWhatsappInput, setShowWhatsappInput] = useState(false);
    const [whatsappName, setWhatsappName] = useState('');
    const [whatsappEmail, setWhatsappEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [sentWhatsapp, setSentWhatsapp] = useState(false);

    // New state for strategy session form
    const [showStrategyForm, setShowStrategyForm] = useState(false);
    const [strategyName, setStrategyName] = useState('');
    const [strategyEmail, setStrategyEmail] = useState('');
    const [strategyPhone, setStrategyPhone] = useState('');

    // New state for direct WhatsApp option
    const [showDirectWhatsappInput, setShowDirectWhatsappInput] = useState(false);
    const [directWhatsappName, setDirectWhatsappName] = useState('');
    const [directWhatsappEmail, setDirectWhatsappEmail] = useState('');
    const [directWhatsappNumber, setDirectWhatsappNumber] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [redirectionUrl, setRedirectionUrl] = useState<string | null>(null);
    const [redirectionLabel, setRedirectionLabel] = useState('');

    // Auto-redirection effect
    React.useEffect(() => {
        if (redirectionUrl) {
            const timer = setTimeout(() => {
                window.open(redirectionUrl, "_blank");
            }, 3000); // 3 seconds delay
            return () => clearTimeout(timer);
        }
    }, [redirectionUrl]);

    const saveLead = async (name: string, email: string, phone: string, actionType: string) => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('leads').insert({
                name,
                email,
                phone,
                profile,
                answers,
                action_type: actionType
            });
            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error saving lead:', err);
            // We still want the user to proceed even if saving fails
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStrategySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (strategyName && strategyEmail && strategyPhone) {
            const success = await saveLead(strategyName, strategyEmail, strategyPhone, 'Strategy Session');
            if (success) {
                setRedirectionLabel('Abrindo sua Agenda...');
                setRedirectionUrl("https://calendar.app.google/Fh6dNbVXyvQEc9Pw5");
            }
        }
    };

    const handleWhatsappSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (whatsappName && whatsappEmail && whatsappNumber) {
            const success = await saveLead(whatsappName, whatsappEmail, whatsappNumber, 'WhatsApp Contact');
            if (success) setSentWhatsapp(true);
        }
    };

    const handleDirectWhatsappSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (directWhatsappName && directWhatsappEmail && directWhatsappNumber) {
            const success = await saveLead(directWhatsappName, directWhatsappEmail, directWhatsappNumber, 'WhatsApp Direct');
            if (success) {
                setRedirectionLabel('Iniciando conversa no WhatsApp...');
                setRedirectionUrl("https://wa.me/message/VFMAYP65ATMVL1");
            }
        }
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

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-12 text-center"
                >
                    <h3 className="text-2xl font-serif text-white mb-6">Próximo passo recomendado</h3>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Nessa conversa estratégica gratuita, vou validar esse diagnóstico, mostrar onde ajustar primeiro e explicar como minha consultoria pode acelerar sua liberdade financeira.
                    </p>

                    {redirectionUrl ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto bg-dark-800 p-8 rounded-xl border border-gold-500/30 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-gold-500" />
                            </div>
                            <h4 className="text-2xl font-serif text-white mb-2">Quase lá!</h4>
                            <p className="text-gray-400 mb-8">
                                Seus dados foram salvos. Você será redirecionado para: <br />
                                <strong className="text-gold-400">{redirectionLabel}</strong>
                            </p>
                            <button
                                onClick={() => window.open(redirectionUrl, "_blank")}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg transition-all"
                            >
                                Clique aqui caso não seja redirecionado
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {!showStrategyForm ? (
                                <button
                                    onClick={() => setShowStrategyForm(true)}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold text-lg rounded-lg shadow-lg hover:shadow-gold-500/20 transition-all transform hover:-translate-y-1"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Quero minha conversa estratégica
                                </button>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onSubmit={handleStrategySubmit}
                                    className="max-w-md mx-auto bg-dark-800 p-6 rounded-xl border border-gold-500/30 shadow-2xl"
                                >
                                    <h4 className="text-xl font-serif text-white mb-4">Agendar Conversa</h4>
                                    <div className="space-y-4 text-left">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Seu Nome</label>
                                            <input
                                                type="text"
                                                required
                                                value={strategyName}
                                                onChange={(e) => setStrategyName(e.target.value)}
                                                className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-gold-500 outline-none"
                                                placeholder="Nome completo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Seu Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={strategyEmail}
                                                onChange={(e) => setStrategyEmail(e.target.value)}
                                                className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-gold-500 outline-none"
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Seu WhatsApp</label>
                                            <input
                                                type="tel"
                                                required
                                                value={strategyPhone}
                                                onChange={(e) => setStrategyPhone(e.target.value)}
                                                className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-gold-500 outline-none"
                                                placeholder="(XX) 99999-9999"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg transition-colors mt-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : null}
                                            {isSubmitting ? 'Enviando...' : 'Ir para Agenda'}
                                            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {/* Direct WhatsApp Option (Yellow) - Below Strategy Button */}
                            <div className="mt-6 mb-8">
                                {!showDirectWhatsappInput ? (
                                    <button
                                        onClick={() => setShowDirectWhatsappInput(true)}
                                        className="text-yellow-500 hover:text-yellow-400 text-sm font-medium underline underline-offset-4 transition-colors"
                                    >
                                        Não consegui encontrar o melhor horário na agenda. Prefiro falar direto pelo WhatsApp.
                                    </button>
                                ) : (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        onSubmit={handleDirectWhatsappSubmit}
                                        className="max-w-md mx-auto mt-4 bg-dark-800 p-6 rounded-xl border border-yellow-500/30 shadow-xl"
                                    >
                                        <h4 className="text-lg font-serif text-white mb-4">Falar pelo WhatsApp</h4>
                                        <div className="space-y-4 text-left">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Seu Nome</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={directWhatsappName}
                                                    onChange={(e) => setDirectWhatsappName(e.target.value)}
                                                    className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-yellow-500 outline-none"
                                                    placeholder="Nome completo"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Seu Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={directWhatsappEmail}
                                                    onChange={(e) => setDirectWhatsappEmail(e.target.value)}
                                                    className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-yellow-500 outline-none"
                                                    placeholder="seu@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Seu WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={directWhatsappNumber}
                                                    onChange={(e) => setDirectWhatsappNumber(e.target.value)}
                                                    className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-yellow-500 outline-none"
                                                    placeholder="(XX) 99999-9999"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors mt-2 disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <MessageCircle className="w-5 h-5" />
                                                )}
                                                {isSubmitting ? 'Enviando...' : 'Iniciar Conversa'}
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </div>
                        </>
                    )}

                    {/* Fallback */}
                    <div className="mt-8 border-t border-dark-800 pt-8">
                        {!showWhatsappInput && !sentWhatsapp ? (
                            <button
                                onClick={() => setShowWhatsappInput(true)}
                                className="text-red-400 hover:text-red-300 text-sm underline underline-offset-4 transition-colors"
                            >
                                Prefiro que você entre em contato pelo WhatsApp
                            </button>
                        ) : sentWhatsapp ? (
                            <div className="flex flex-col items-center gap-2 text-green-400">
                                <div className="w-10 h-10 bg-green-900/20 rounded-full flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <p>Recebido. Entrarei em contato em breve.</p>
                            </div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                onSubmit={handleWhatsappSubmit}
                                className="max-w-md mx-auto bg-dark-800 p-6 rounded-xl border border-red-500/30 shadow-xl"
                            >
                                <h4 className="text-lg font-serif text-white mb-4">Solicitar Contato</h4>
                                <div className="space-y-4 text-left">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Seu Nome</label>
                                        <input
                                            type="text"
                                            required
                                            value={whatsappName}
                                            onChange={(e) => setWhatsappName(e.target.value)}
                                            className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-red-500 outline-none"
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Seu Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={whatsappEmail}
                                            onChange={(e) => setWhatsappEmail(e.target.value)}
                                            className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-red-500 outline-none"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Seu WhatsApp</label>
                                        <input
                                            type="tel"
                                            required
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="w-full bg-dark-900 border border-dark-600 rounded p-3 text-white focus:border-red-500 outline-none"
                                            placeholder="(XX) 99999-9999"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-dark-700 hover:bg-dark-600 text-white p-3 rounded border border-dark-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Solicitação
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-2 text-dark-700 text-xs">
                        <Lock className="w-3 h-3" />
                        <span>Seus dados estão seguros e não serão compartilhados.</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};