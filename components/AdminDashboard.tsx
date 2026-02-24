import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Lead } from '../types';
import {
    Users,
    Search,
    Trash2,
    RefreshCw,
    LogOut,
    User,
    Mail,
    Phone,
    Layers
} from 'lucide-react';

interface Props {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const statusColors: Record<Lead['status'], string> = {
        'Verificar': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Agendado': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'Consultoria': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Perdido': 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setLeads(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lead?')) {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (!error) {
                setLeads(prev => prev.filter(l => l.id !== id));
                if (selectedLead?.id === id) setSelectedLead(null);
            }
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: Lead['status']) => {
        setUpdatingStatus(id);
        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            if (selectedLead?.id === id) {
                setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
            }
        }
        setUpdatingStatus(null);
    };

    const filteredLeads = leads.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-dark-950 text-slate-200">
            <header className="bg-dark-900 border-b border-dark-800 p-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gold-500 rounded flex items-center justify-center">
                            <Users className="text-black w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-serif text-white font-bold">Painel de Leads</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Consultoria Premium</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchLeads}
                            className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Atualizar"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-all text-sm font-medium border border-dark-700"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            className="w-full bg-dark-900 border border-dark-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold-500 transition-all text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-800/50 text-xs uppercase tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Lead</th>
                                        <th className="px-6 py-4 font-semibold">Perfil</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {filteredLeads.map(lead => (
                                        <tr
                                            key={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            className={`hover:bg-dark-800/50 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-gold-500/5' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{lead.name}</span>
                                                    <span className="text-xs text-gray-500">{lead.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gold-500">
                                                {lead.profile}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusColors[lead.status || 'Verificar']}`}>
                                                    {lead.status || 'Verificar'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLeads.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                Nenhum lead encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedLead ? (
                            <motion.div
                                key={selectedLead.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-dark-900 border border-dark-800 rounded-xl p-6 sticky top-6"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-lg font-serif text-white font-bold">Detalhes do Lead</h3>
                                    <span className="text-xs text-gray-500">{new Date(selectedLead.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center text-gold-500">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{selectedLead.name}</p>
                                            <p className="text-sm text-gray-500">{selectedLead.profile}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-dark-800">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="w-4 h-4 text-gold-500" />
                                            <span className="text-gray-300">{selectedLead.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-gold-500" />
                                            <span className="text-gray-300">{selectedLead.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Layers className="w-4 h-4 text-gold-500" />
                                            <span className="text-gray-300">Ação: {selectedLead.action_type}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-dark-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Status do Lead</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['Verificar', 'Agendado', 'Consultoria', 'Perdido'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleStatusUpdate(selectedLead.id, s)}
                                                    disabled={updatingStatus === selectedLead.id}
                                                    className={`px-3 py-2 rounded text-xs font-medium border transition-all ${selectedLead.status === s
                                                            ? statusColors[s]
                                                            : 'bg-dark-800 border-dark-700 text-gray-500 hover:border-dark-600'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-dark-800">
                                        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Respostas Completas</h4>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">1. Principal Problema</p>
                                                <p className="text-sm text-white leading-relaxed">{selectedLead.answers.mainProblem}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">2. Já tentou resolver?</p>
                                                <p className="text-sm text-white">{selectedLead.answers.triedSolution}</p>
                                                {selectedLead.answers.triedSolutionDescription && (
                                                    <p className="text-sm text-gray-400 mt-2 p-2 bg-dark-900 rounded border border-dark-800 italic">
                                                        "{selectedLead.answers.triedSolutionDescription}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">3. Renda Mensal</p>
                                                <p className="text-sm text-white">{selectedLead.answers.incomeRange}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">4. Profissão</p>
                                                <p className="text-sm text-white">{selectedLead.answers.profession}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">5. Estado Civil</p>
                                                <p className="text-sm text-white">{selectedLead.answers.spouse}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">6. Filhos</p>
                                                <p className="text-sm text-white">{selectedLead.answers.children}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">7. Dependentes</p>
                                                <p className="text-sm text-white">{selectedLead.answers.otherDependents}</p>
                                                {selectedLead.answers.otherDependentsCount !== undefined && (
                                                    <p className="text-sm text-gray-400 mt-1">Quantidade: {selectedLead.answers.otherDependentsCount}</p>
                                                )}
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">8. Vida Financeira Atual</p>
                                                <p className="text-sm text-white">{selectedLead.answers.financialState}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">9. Metas Claras</p>
                                                <p className="text-sm text-white">{selectedLead.answers.goals}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">10. Perspectiva (6 meses)</p>
                                                <p className="text-sm text-white">{selectedLead.answers.futureOutlook}</p>
                                            </div>

                                            <div className="p-3 bg-dark-800/50 rounded border border-dark-700/50">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ponto de Contato</p>
                                                <p className="text-sm text-gold-500 font-bold">{selectedLead.action_type}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-dark-900/50 border border-dark-800 border-dashed rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                                <Search className="w-12 h-12 text-dark-800 mb-4" />
                                <p className="text-gray-600">Selecione um lead para ver os detalhes completos das respostas do quiz.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
