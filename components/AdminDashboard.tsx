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
    Layers,
    MessageSquare,
    CreditCard,
    Copy,
    CheckCircle2
} from 'lucide-react';

const OBJECTIONS_MAPPING: Record<string, { acolher: string, reenquadrar: string, solucionar1: string, solucionar2: string }> = {
    'Preciso pensar': {
        acolher: 'NOME, obrigado por compartilhar. Sabe, quando alguém me diz que precisa pensar, geralmente é porque ficou alguma dúvida ou insegurança. Isso é normal e tá tudo bem.',
        reenquadrar: 'A questão é que se encerrarmos a reunião agora, você vai continuar com dúvidas e não vai conseguir responder sozinho.',
        solucionar1: 'Sou sua melhor fonte de informações, então me diz: quais são suas dúvidas, preocupações ou inseguranças?',
        solucionar2: '...'
    },
    'Não tenho R$/Condições': {
        acolher: 'NOME, obrigado por compartilhar. Antes de avançar, vou te fazer uma pergunta de forma honesta e sincera, você topa me responder de forma honesta e sincera também?',
        reenquadrar: 'De 0 a 10, quanto você está decidido, independente do dinheiro, a conseguir resolver [PROBLEMA] e alcançar [METAS]?',
        solucionar1: 'SE MENOR QUE 10: Obrigado pela sinceridade, NOME. O que falta para o 10?',
        solucionar2: 'SE MAIOR QUE 10: Então é uma questão de encontrarmos uma forma de você conseguir recursos para dar esse passo, correto? / Perfeito, então vamos encontrar uma solução juntos. / O valor da parcela ou o valor total que está pesando para você?'
    },
    'Sem tempo': {
        acolher: 'NOME, posso te fazer uma pergunta sincera?',
        reenquadrar: 'O que nós precisamos são de 10 a 15 minutos por dia ou uma hora por semana. Você é capaz de priorizar esse tempo para investir em você e mudar teu jogo?',
        solucionar1: 'Perfeito. Problema resolvido, porque é esse tempo que você vai precisar dedicar. Vamos em frente? / SE SIM: Você prefere parcelado ou à vista?',
        solucionar2: 'SE NÃO: Entendo, mas até quando você vai terceirizar a responsabilidade de mudar a tua vida? / A consultoria não é para tirar tempo, na verdade, ela vai te dar tempo. É justamente por isso que você precisa dessa solução. Tem uma frase que diz o seguinte (CALONI): "O dinheiro que você não ganha, está no conhecimento que você não tem". / Então, você não terá mais tempo e nem dinheiro sem adicionar novos conhecimentos. Esperar ter mais tempo para começar, não vai ajudar você a ter mais tempo. O que você acha de começarmos agora? / SE SIM: Você prefere parcelado ou à vista?'
    },
    'Preciso ver minhas contas antes': {
        acolher: 'Obrigado por compartilhar. Sabe, NOME, quando alguém me diz que precisa ver as contas antes, geralmente é porque ficou alguma dúvida ou insegurança. Isso é normal e tá tudo bem.',
        reenquadrar: 'A questão é que se encerrarmos a reunião agora, você vai continuar com dúvidas e não vai conseguir responder sozinho.',
        solucionar1: 'Sou sua melhor fonte de informações, então me diz: quais são suas dúvidas, preocupações ou inseguranças?',
        solucionar2: 'SE INSISTIR NAS CONTAS: Entendo perfeitamente, mas me responde uma pergunta com sinceridade: Você achou o preço alto ou o valor da parcela que não encaixou no seu orçamento? / Então eu vou abrir uma condição para facilitar a sua entrada, pode ser? / VER QUAL OPÇÃO SE ENCAIXA MELHOR'
    },
    'Está caro': {
        acolher: 'NOME, obrigado por compartilhar. Quando diz que está caro, deve usar algo como comparação, com certeza. Mas muitas vezes o que você acha caro agora, te faz economizar muito lá na frente.',
        reenquadrar: 'Eu te mostrei que a média de quem faz a consultoria, economiza em torno de R$ 500,00 reais por mês e teve pessoas que economizaram R$ 3.700,00 em dois meses. Então, quando diz que está caro, o que tem em mente como uma solução parecida com essa?',
        solucionar1: 'SE TIVER COMPARATIVO: Mostrar o prejuízo que ele tem por não fazer a consultoria e o lucro que vai ter fazendo a consultoria. / Então vamos continuar com a consultoria? / SE SIM: Você prefere parcelado ou à vista?',
        solucionar2: 'SE NÃO TIVER COMPARATIVO: Então, será que o caro mesmo não é continuar no mesmo ponto, enfrentando os mesmos problemas sem resolver nada? / Então vamos continuar com a consultoria? / SE SIM: Você prefere parcelado ou à vista?'
    },
    'Tenho medo/receio': {
        acolher: 'Obrigado por compartilhar, NOME. Me diz então: o que te faz ficar inseguro?',
        reenquadrar: 'Entendo perfeitamente o medo que você está sentindo, afinal é uma sensação natural quando nos deparamos com uma decisão que pode mudar a nossas vidas.',
        solucionar1: 'Se você pensar em qualquer decisão que realmente mudou a sua vida, todas elas foram acompanhadas de algum nível de medo, não é mesmo? Eu quero que você se sinta seguro ao se juntar à nós, por isso ofereço uma garantia: se por algum motivo você não alcançar algum retorno do seu investimento, eu vou trabalhar de graça até você ver o mínimo de retorno sobre o seu investimento. Fica bom para você assim? / SE SIM: Você prefere parcelado ou à vista?',
        solucionar2: '...'
    },
    'Não é prioridade agora': {
        acolher: 'Obrigado por compartilhar, NOME. A minha função aqui não é te vender se não for o seu momento, então, posso te fazer um pergunta honesta e sincera e você também me responde de forma honesta e sincera?',
        reenquadrar: 'Se não é uma prioridade agora, por que a gente está aqui conversando? Você tirou um tempo da sua agenda para estar aqui conversando comigo, então, por que não é uma prioridade para você?',
        solucionar1: 'SE ENTENDER QUE É PRIORIDADE: Então, já está resolvido. Você quer mudanças e a gente vai poder começar agora. Então, me diz: você prefere o pagamento parcelado ou à vista?',
        solucionar2: 'SE NÃO ENTENDER QUE É PRIORIDADE: Você consegue enxergar que existem consequências de não resolver essa situação agora? / Você tem metas que quer alcançar, problemas que não consegue resolver e eu tenho as ferramentas necessárias para que você consiga alcançar seus objetivos. O que ainda te impede de começar agora? / SE NADA: Você prefere parcelado ou à vista?'
    },
    'Quero, mas vou deixar para depois': {
        acolher: 'Entendo sua preocupação em adiar para daqui um tempo. Mas pense nisso como adiar uma cirurgia preventiva, ou seja, pode acontecer nada ou pode acontecer algo bem grave, entende?',
        reenquadrar: 'Quando percebemos que existe algo significativo para discutir e resolver, não esperamos que seja tarde de mais. Da mesma forma que, procrastinar decisões importantes em 3 ou 30 dias acaba sendo a escolha menos inteligente sempre.',
        solucionar1: 'E te digo o seguinte, a maioria dos clientes colhem resultados nas primeiras semanas, logo eu te pergunto: "você realmente quer deixar essa decisão em vez de começar a colher resultados a partir de hoje?"',
        solucionar2: 'SE NÃO: você prefere parcelado ou à vista? / SE SIM: Então é só uma questão de tempo, em exatamente [TEMPO DO CLIENTE], você tem certeza que teria tempo e dinheiro para investir? SE SIM: Então temos uma solução: Daqui a 1 mês eu não consigo manter a oferta que te fiz, por respeito aos que fecharam dentro do prazo combinado, mas se você fizer uma entrada simbólica de R$ 47,00, que não vai mudar a minha vida e nem a sua, nós formalizamos o contrato e dentro de 1 mês você finaliza o pagamento e iniciamos a mentoria. Fechado? / SE SIM: Então seja bem vindo. / SE NÃO: Entendo perfeitamente, então daqui a [TEMPO DO CLIENTE] eu te ligo para fecharmos no valor normal. Combinado?'
    },
    'Não tomo decisão na hora': {
        acolher: 'NOME, obrigado por compartilhar. Quando eu passo esse tempo com você, parte do motivo por abrir uma condição diferenciada é porque eu entendi que você é uma pessoa decidida. Então me diz com sinceridade: o que falta para ficar seguro com essa decisão? Qual a sua insegurança?',
        reenquadrar: 'Certo, perfeito. Antes de combinarmos um prazo, tem alguma outra informação que seja importante para você tomar essa decisão?',
        solucionar1: 'SE NÃO: Combinado, então quanto tempo precisa para tomar essa decisão? [PUXAR PARA MENOS E NÃO DEIXAR DORMIR] / SE PARA +24h: NOME, infelizmente não consigo abir até [DATA DO CLIENTE], porque seria injusto com quem apresentei uma oferta diferenciada e a pessoa tomou a decisão antes. Conseguimos combinar até hoje às [HORÁRIO GANCHO]? / SE NÃO: E até hoje [HORÁRIO LIMITE NO DIA]? / SE NÃO: Então, amanhã as 12:00, pode ser?',
        solucionar2: 'SE SIM: Combinado, então entrarei em contato amanhã às 12:00 para sua confirmação. Pode ser?'
    },
    'Mas você consegue fazer um preço melhor?': {
        acolher: 'NOME, eu entendo que todos queremos fazer sempre um bom negócio.',
        reenquadrar: 'Porém, eu não consigo negociar o valor mas, consigo negociar as condições de pagamento.',
        solucionar1: 'Você prefere parcelado ou à vista? Esse valor cabe no seu orçamento?',
        solucionar2: 'SE SIM: Então está resolvido. / SE NÃO: Podemos fazer uma entrada, iniciamos a consultoria e definimos junto o pagamento do restante até o seu retorno, fechado?'
    },
    'Preciso falar com minha esposa/sócio': {
        acolher: 'NOME, para validar se eu compreendi corretamente: sua esposa/sócio é uma pessoa importante para as decisões de mudança na sua vida. Certo? / Se ela falar "NÃO", você desiste de investir em você?',
        reenquadrar: 'SE NÃO SOBRE INVESTIR EM VOCÊ: Bom, então você tem tudo o que precisa: que é a sua decisão de melhorar de vida e entregar o melhor de você para ela. Dessa forma, a gente pode avançar. Então me diz: Você prefere marcar a reunião para um horário da manhã ou da tarde?',
        solucionar1: 'SE SIM SOBRE INVESTIR EM VOCÊ: Perfeito. Para confirmar: se não dependesse da sua esposa, mas apenas de você, você fecharia agora, correto? / SE SIM SOBRE DECIDIR SOZINHO: Certo. Mas a sua esposa/sócio é do tipo de pessoa que não apoiaria uma decisão para cuidar da sua saúde e qualidade de vida? / SE NÃO SOBRE DECIDIR SOZINHO: Então, talvez você não acredita na minha solução, porque ficou com alguma dúvida ou insegurança e se encerrarmos a reunião agora, você ainda vai ficar com essas perguntas na cabeça. Sou a melhor fonte de informação no momento, então, quais são suas dúvidas ou inseguranças?',
        solucionar2: 'SE SIM SOBRE CUIDAR DA SAÚDE: Bom, então você tem tudo o que precisa: que é a sua decisão de melhorar de vida e entregar o melhor de você para ela. Dessa forma, a gente pode avançar. Então me diz: Você prefere marcar a reunião para um horário da manhã ou da tarde? / SE NÃO SOBRE A SAÚDE: Então, talvez seja melhor nós 3 conversarmos, pode ser? / SE SIM PARA CONVERSA A 3: Eu posso te enviar um áudio, explicando tudo o que conversamos aqui para facilitar, para você não ter que ficar lembrando de cada detalhe que conversamos aqui. Aí você e ela/ele escutam juntos e podem tomar a decisão. Pode ser? / SE SIM PARA ENVIAR ÁUDIO: Conseguimos combinar de você me retornar até hoje às [HORÁRIO GANCHO]? / SE NÃO: E até hoje [HORÁRIO LIMITE NO DIA]? / SE NÃO: Então, amanhã as 12:00, pode ser? / SE SIM: Combinado, então entrarei em contato amanhã às 12:00 para a confirmação de vocês. Pode ser? '
    }
};

const PAYMENT_OPTIONS = [
    { label: '1', description: 'Até 12x de R$ 61,74 no Cartão de Crédito', link: 'https://hotm.io/solum-consultoria' },
    { label: '2', description: 'À vista por R$ 597', link: 'https://hotm.io/solum-consultoria' },
    { label: '3', description: 'Até 2x de R$ 314,22 no Boleto Parcelado', link: 'https://hotm.io/solum-consultoria-parcelado' },
    { label: '4', description: 'Entrada de R$ 147 + 1x de R$ 450', link: 'https://mpago.li/2PY7vuj' },
    { label: '5', description: 'Boleto Parcelado (PARCELEX) - Última tentativa', link: 'https://hotm.io/solum-consultoria-parcelex' },
    { label: '6', description: 'R$ 47 (GARANTIR A VAGA) + 1x de R$ 550 (NO DIA DO FECHAMENTO)', link: 'https://mpago.li/2gVs1Rb' },
];

const OBJECTIONS_LIST = Object.keys(OBJECTIONS_MAPPING);

interface Props {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [selectedObjection, setSelectedObjection] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopyLink = async (link: string, idx: number) => {
        try {
            await navigator.clipboard.writeText(link);
            setCopiedIndex(idx);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

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

    useEffect(() => {
        setSelectedObjection(null);
    }, [selectedLead?.id]);

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

                                    {/* Objections Script Section */}
                                    <div className="pt-4 border-t border-dark-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MessageSquare className="w-4 h-4 text-gold-500" />
                                            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Script de Objeções</h4>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {OBJECTIONS_LIST.map((objection) => (
                                                <button
                                                    key={objection}
                                                    onClick={() => setSelectedObjection(selectedObjection === objection ? null : objection)}
                                                    className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${selectedObjection === objection
                                                        ? 'bg-gold-500 text-black border-gold-500 font-bold'
                                                        : 'bg-dark-800/80 border-dark-700 text-gray-400 hover:border-gold-500/30 hover:text-gray-300'
                                                        }`}
                                                >
                                                    {objection}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {selectedObjection && OBJECTIONS_MAPPING[selectedObjection] && (
                                                <motion.div
                                                    key={selectedObjection}
                                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 bg-dark-800/50 rounded-lg border border-gold-500/20 space-y-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">1. Acolher</p>
                                                            </div>
                                                            <p className="text-sm text-gray-300 pl-3.5 leading-relaxed">{OBJECTIONS_MAPPING[selectedObjection].acolher}</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                                <p className="text-[10px] text-yellow-400 uppercase font-bold tracking-widest">2. Reenquadrar</p>
                                                            </div>
                                                            <p className="text-sm text-gray-300 pl-3.5 leading-relaxed">{OBJECTIONS_MAPPING[selectedObjection].reenquadrar}</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest">3. Solucionar 1</p>
                                                            </div>
                                                            <p className="text-sm text-gray-300 pl-3.5 leading-relaxed">{OBJECTIONS_MAPPING[selectedObjection].solucionar1}</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">4. Solucionar 2</p>
                                                            </div>
                                                            <p className="text-sm text-gray-300 pl-3.5 leading-relaxed">{OBJECTIONS_MAPPING[selectedObjection].solucionar2}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Payment Options Section */}
                                    <div className="pt-4 border-t border-dark-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CreditCard className="w-4 h-4 text-gold-500" />
                                            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Opções de Pagamento</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {PAYMENT_OPTIONS.map((option, idx) => (
                                                <div key={idx} className="bg-dark-800/50 rounded-lg border border-dark-700/50 hover:border-gold-500/30 transition-colors overflow-hidden">
                                                    <div className="flex flex-col md:flex-row md:items-center py-2 md:py-3 px-4 justify-between gap-2 border-b border-dark-700/30">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500/10 text-gold-500 font-bold text-[11px] shrink-0">
                                                                {option.label}
                                                            </span>
                                                            <span className="text-sm text-gray-300 font-medium">{option.description}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between px-4 py-2 bg-dark-900/50">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[200px] md:max-w-xs">{option.link}</span>
                                                        <button
                                                            onClick={() => handleCopyLink(option.link, idx)}
                                                            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md hover:bg-dark-700 transition-colors"
                                                            title="Copiar link"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                    <span className="text-green-500">Copiado</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5 text-gold-500" />
                                                                    <span className="text-gold-500">Copiar Link</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
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
