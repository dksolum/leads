import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

interface Props {
    onLoginSuccess: () => void;
    onBack: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('diegokloppel21@gmail.com');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-dark-900 border border-dark-800 p-8 rounded-2xl shadow-2xl"
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Home
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                        <Lock className="w-8 h-8 text-gold-500" />
                    </div>
                    <h2 className="text-2xl font-serif text-white font-bold">Acesso Administrativo</h2>
                    <p className="text-gray-500 mt-2">Gerencie seus leads e dados</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dark-950 border border-dark-800 rounded-lg py-3 pl-11 pr-4 text-white focus:border-gold-500 outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-950 border border-dark-800 rounded-lg py-3 pl-11 pr-4 text-white focus:border-gold-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Painel'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};
