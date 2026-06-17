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
    CheckCircle2,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { PresentationFlow } from './PresentationFlow';

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
        reenquadrar: 'O que nós precisamos são de 10 a 15 minutos por dia ou uma hora por semana. Você é capaz de priorizar esse tempo para investir in você e mudar teu jogo?',
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
        solucionar1: 'SE TIVER COMPARATIVO: Mostrar o prejuízo que ele tem por não fazer a consultoria e o lucro que vai ter fazendo a consultoria. / Em frente com a consultoria? / SE SIM: Você prefere parcelado ou à vista?',
        solucionar2: 'SE NÃO TIVER COMPARATIVO: Então, será que o caro mesmo não é continuar no mesmo ponto, enfrentando os mesmos problemas sem resolver nada? / Em frente com a consultoria? / SE SIM: Você prefere parcelado ou à vista?'
    },
    'Tenho medo/receio': {
        acolher: 'Obrigado por compartilhar, NOME. Me diz então: o que te faz ficar inseguro?',
        reenquadrar: 'Entendo perfeitamente o medo que você está sentindo, afinal é uma sensação natural quando nos deparamos com uma decisão que pode mudar a nossas vidas.',
        solucionar1: 'Se você pensar em qualquer decisão que realmente mudou a sua vida, todas elas foram acompanhadas de algum nível de medo, não é mesmo? Eu quero que você se sinta seguro ao se juntar a nós, por isso ofereço uma garantia: se por algum motivo você não alcançar algum retorno do seu investimento, eu vou trabalhar de graça até você ver o mínimo de retorno sobre o seu investimento. Fica bom para você assim? / SE SIM: Você prefere parcelado ou à vista?',
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
        reenquadrar: 'Quando percebemos que existe algo significativo para discutir e resolver, não esperamos que seja tarde demais. Da mesma forma que, procrastinar decisões importantes em 3 ou 30 dias acaba sendo a escolha menos inteligente sempre.',
        solucionar1: 'E te digo o seguinte, a maioria dos clientes colhem resultados nas primeiras semanas, logo eu te pergunto: "você realmente quer deixar essa decisão em vez de começar a colher resultados a partir de hoje?"',
        solucionar2: 'SE NÃO: você prefere parcelado ou à vista? / SE SIM: Então é só uma questão de tempo, em exatamente [TEMPO DO CLIENTE], você tem certeza que teria tempo e dinheiro para investir? SE SIM: Então temos uma solução: Daqui a 1 mês eu não consigo manter a oferta que te fiz, por respeito aos que fecharam dentro do prazo combinado, mas se você fizer uma entrada simbólica de R$ 47,00, que não vai mudar a minha vida e nem a sua, nós formalizamos o contrato e dentro de 1 mês você finaliza o pagamento e iniciamos a mentoria. Fechado? / SE SIM: Então seja bem-vindo. / SE NÃO: Entendo perfeitamente, então daqui a [TEMPO DO CLIENTE] eu te ligo para fecharmos no valor normal. Combinado?'
    },
    'Não tomo decisão na hora': {
        acolher: 'NOME, obrigado por compartilhar. Quando eu passo esse tempo com você, parte do motivo por abrir uma condição diferenciada é porque eu entendi que você é uma pessoa decidida. Então me diz com sinceridade: o que falta para ficar seguro com essa decisão? Qual a sua insegurança?',
        reenquadrar: 'Certo, perfeito. Antes de combinarmos um prazo, tem alguma outra informação que seja importante para você tomar essa decisão?',
        solucionar1: 'SE NÃO: Combinado, então quanto tempo precisa para tomar essa decisão? [PUXAR PARA MENOS E NÃO DEIXAR DORMIR] / SE PARA +24h: NOME, infelizmente não consigo abrir até [DATA DO CLIENTE], porque seria injusto com quem apresentei uma oferta diferenciada e a pessoa tomou a decisão antes. Conseguimos combinar até hoje às [HORÁRIO GANCHO]?',
        solucionar2: 'SE NÃO: E até hoje [HORÁRIO LIMITE NO DIA]? / SE NÃO: Então, amanhã as 12:00, pode ser? / SE SIM: Combinado, então entrarei em contato amanhã às 12:00 para a sua confirmação. Pode ser?'
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
        solucionar1: 'SE SIM SOBRE INVESTIR EM VOCÊ: Perfeito. Para confirmar: se não dependesse da sua esposa, mas apenas de você, você fecharia agora, correto? / SE SIM SOBRE DECIDIR SOZINHO: Certo. Mas a sua esposa/sócio é do tipo de pessoa que não apoiaria uma decisão para cuidar da sua saúde e qualidade de vida? / SE NÃO SOBRE DECIDIR SOZINHO: Consequentemente, talvez você não acredita na minha solução, porque ficou com alguma dúvida ou insegurança e se encerrarmos a reunião agora, você ainda vai ficar com essas perguntas na cabeça. Sou a melhor fonte de informação no momento, então, quais são suas dúvidas ou inseguranças?',
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

    // Estados dos filtros
    const [filterCreditCard, setFilterCreditCard] = useState<'all' | 'yes' | 'problem' | 'no'>('all');
    const [filterDepends, setFilterDepends] = useState<'all' | 'yes' | 'no'>('all');
    const [filterCommitment, setFilterCommitment] = useState<'all' | '8' | '5'>('all');

    // Estado para controlar a exibição dos detalhes técnicos do Lead
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
    const [activePresentationLead, setActivePresentationLead] = useState<Lead | null>(null);
    const [selectedFormType, setSelectedFormType] = useState<'all' | 'personal' | 'business' | 'complete'>('all');
    const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | Lead['status']>('all');

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
        'Downsell': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
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
        const { data, error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erro ao atualizar status no Supabase:', error);
            alert(`Erro ao atualizar: ${error.message}`);
        } else if (!data || data.length === 0) {
            console.warn('Status não atualizado no Supabase. Possível problema de permissão (RLS).');
            alert('Não foi possível atualizar o status no servidor. Verifique suas permissões.');
        } else {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            if (selectedLead?.id === id) {
                setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
            }
        }
        setUpdatingStatus(null);
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        // Filtro por tipo de formulário (lead)
        if (selectedFormType !== 'all') {
            const formType = lead.answers?.formType || 'personal';
            if (formType !== selectedFormType) return false;
        }

        // Filtro por status do lead
        if (selectedStatusTab !== 'all') {
            if ((lead.status || 'Verificar') !== selectedStatusTab) return false;
        }

        // Filtro de cartão de crédito
        if (filterCreditCard === 'yes' && lead.answers?.hasCreditCard !== 'Sim') return false;
        if (filterCreditCard === 'no' && lead.answers?.hasCreditCard !== 'Não') return false;
        if (filterCreditCard === 'problem' && lead.answers?.creditCardIsProblem !== 'Sim') return false;

        // Filtro de dependência
        if (filterDepends === 'yes' && lead.answers?.dependsOnOthers !== 'Sim') return false;
        if (filterDepends === 'no' && lead.answers?.dependsOnOthers !== 'Não') return false;

        // Filtro de comprometimento
        if (filterCommitment !== 'all') {
            const val = parseInt(lead.answers?.commitmentScale || '0', 10);
            const minVal = parseInt(filterCommitment, 10);
            if (val < minVal) return false;
        }

        return true;
    });

    const statusPriority: Record<Lead['status'], number> = {
        'Agendado': 1,
        'Verificar': 2,
        'Consultoria': 3,
        'Downsell': 4,
        'Perdido': 5
    };

    const sortedLeads = [...filteredLeads].sort((a, b) => {
        const priorityA = statusPriority[a.status || 'Verificar'] || 2;
        const priorityB = statusPriority[b.status || 'Verificar'] || 2;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });

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

            <main className="max-w-7xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    {/* Se não houver lead selecionado, exibe a tabela de leads em largura total */}
                    {!selectedLead ? (
                        <motion.div
                            key="list-view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Seleção do Tipo de Lead (Formulário) */}
                            <div className="flex flex-wrap gap-2 border-b border-dark-800 pb-4">
                                {(['all', 'personal', 'business', 'complete'] as const).map((type) => {
                                    const labels = {
                                        all: 'Todos os Formulários',
                                        personal: 'Finanças Pessoais',
                                        business: 'Finanças Empresariais',
                                        complete: 'Gestão Completa'
                                    };
                                    const active = selectedFormType === type;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedFormType(type)}
                                            className={`relative px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 border ${
                                                active 
                                                    ? 'bg-gold-500 text-black border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                                                    : 'bg-dark-900 border-dark-800 text-gray-400 hover:text-white hover:border-dark-700'
                                            }`}
                                        >
                                            {labels[type]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Filtro Rápido por Status */}
                            <div className="flex flex-wrap gap-2 items-center bg-dark-900/50 p-4 border border-dark-800 rounded-xl">
                                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mr-2 font-sans">Status:</span>
                                {(['all', 'Agendado', 'Verificar', 'Consultoria', 'Downsell', 'Perdido'] as const).map((status) => {
                                    const active = selectedStatusTab === status;
                                    
                                    const colors: Record<typeof status, string> = {
                                        all: active 
                                            ? 'bg-slate-700 text-white border-slate-600 shadow-sm' 
                                            : 'bg-dark-800 border-dark-700 text-gray-400 hover:text-white hover:border-dark-600',
                                        Agendado: active 
                                            ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                            : 'bg-dark-800 border-dark-750 text-yellow-500/80 hover:text-yellow-500 hover:border-yellow-500/30',
                                        Verificar: active 
                                            ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                                            : 'bg-dark-800 border-dark-750 text-blue-400/80 hover:text-blue-400 hover:border-blue-500/30',
                                        Consultoria: active 
                                            ? 'bg-green-500 text-white border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                            : 'bg-dark-800 border-dark-750 text-green-400/80 hover:text-green-400 hover:border-green-500/30',
                                        Downsell: active 
                                            ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                            : 'bg-dark-800 border-dark-750 text-purple-400/80 hover:text-purple-400 hover:border-purple-500/30',
                                        Perdido: active 
                                            ? 'bg-red-500 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                            : 'bg-dark-800 border-dark-750 text-red-400/80 hover:text-red-400 hover:border-red-500/30'
                                    };

                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatusTab(status)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${colors[status]}`}
                                        >
                                            {status === 'all' ? 'Ver Todos' : status}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-4">
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
                                
                                {/* Filtros de respostas do quiz */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dark-900 border border-dark-800 rounded-xl">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">Cartão de Crédito</label>
                                        <select
                                            value={filterCreditCard}
                                            onChange={(e: any) => setFilterCreditCard(e.target.value)}
                                            className="w-full bg-dark-800 border border-dark-700 text-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="yes">Possui Cartão</option>
                                            <option value="problem">Cartão é um Problema</option>
                                            <option value="no">Não Possui Cartão</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">Dependência de Decisão</label>
                                        <select
                                            value={filterDepends}
                                            onChange={(e: any) => setFilterDepends(e.target.value)}
                                            className="w-full bg-dark-800 border border-dark-700 text-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="yes">Depende de outra pessoa</option>
                                            <option value="no">Decide sozinho</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">Comprometimento</label>
                                        <select
                                            value={filterCommitment}
                                            onChange={(e: any) => setFilterCommitment(e.target.value)}
                                            className="w-full bg-dark-800 border border-dark-700 text-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="8">Comprometimento (8 a 10)</option>
                                            <option value="5">Comprometimento (5 a 10)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-2xl">
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
                                            {sortedLeads.map(lead => (
                                                <tr
                                                    key={lead.id}
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="hover:bg-dark-800/50 cursor-pointer transition-all duration-200"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-medium text-base">{lead.name}</span>
                                                            <span className="text-xs text-gray-500 mt-0.5">{lead.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gold-500">
                                                        {lead.profile}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold tracking-wider uppercase ${statusColors[lead.status || 'Verificar']}`}>
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
                                            {sortedLeads.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium text-sm">
                                                        Nenhum lead encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Se houver lead selecionado, exibe os detalhes em largura total e oculta a lista */
                        <motion.div
                            key="details-view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Barra Superior de Navegação dos Detalhes */}
                            <div className="flex justify-between items-center bg-dark-900 border border-dark-800 rounded-xl p-4 shadow-lg">
                                <button
                                    onClick={() => {
                                        setSelectedLead(null);
                                        setShowTechnicalDetails(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700/80 border border-dark-700 text-gray-300 hover:text-white rounded-lg transition-all text-xs md:text-sm font-semibold shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar para a Lista de Leads
                                </button>
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold hidden sm:inline">
                                    Lead selecionado
                                </span>
                            </div>

                            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 md:p-8 space-y-8 shadow-2xl">
                                
                                {/* Linha 1: Dados Principais do Lead */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-dark-850 p-6 rounded-xl border border-dark-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20 shrink-0 shadow-inner">
                                            <User className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-1">
                                            {/* Nome e Botão de Apresentação em Destaque */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-white font-serif font-bold text-xl md:text-2xl tracking-wide">{selectedLead.name}</p>
                                                
                                                <button
                                                    onClick={() => setActivePresentationLead(selectedLead)}
                                                    className="px-4 py-1.5 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 text-[10px] font-black rounded-lg shadow-xl shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-widest border border-gold-400/20"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 text-dark-950 fill-current animate-pulse" />
                                                    Apresentação
                                                </button>
                                            </div>
                                            <p className="text-sm text-gold-500 font-semibold tracking-wide">{selectedLead.profile}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium border-t lg:border-t-0 border-dark-800/60 pt-4 lg:pt-0">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail className="w-4 h-4 text-gold-500" />
                                            <span>{selectedLead.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Phone className="w-4 h-4 text-gold-500" />
                                            <span>{selectedLead.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Layers className="w-4 h-4 text-gold-500" />
                                            <span>Origem: {selectedLead.action_type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Linha 2: Respostas do Quiz (Sempre Visíveis) */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 border-b border-dark-800 pb-2">
                                        Respostas Completas do Quiz
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">1. Principal Problema</p>
                                            <p className="text-sm text-white leading-relaxed font-light">{selectedLead.answers.mainProblem}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">2. Já tentou resolver?</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.triedSolution}</p>
                                            {selectedLead.answers.triedSolutionDescription && (
                                                <p className="text-xs text-gray-400 mt-2.5 p-2.5 bg-dark-950 rounded border border-dark-850 italic font-light leading-relaxed">
                                                    "{selectedLead.answers.triedSolutionDescription}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">3. Renda Mensal</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.incomeRange}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">4. Profissão</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.profession}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">5. Estado Civil</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.spouse}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">6. Filhos</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.children}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">7. Dependentes</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.otherDependents}</p>
                                            {selectedLead.answers.otherDependentsCount !== undefined && (
                                                <p className="text-xs text-gray-400 mt-1.5 font-medium">Quantidade informada: {selectedLead.answers.otherDependentsCount}</p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">8. Vida Financeira Atual</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.financialState}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">9. Metas Claras</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.goals}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">10. Possui Cartão de Crédito?</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.hasCreditCard || 'Não respondido'}</p>
                                            {selectedLead.answers.hasCreditCard === 'Sim' && (
                                                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                                    Hoje é um problema financeiro? <span className="text-white font-bold">{selectedLead.answers.creditCardIsProblem || 'Não informado'}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">11. Perspectiva (6 meses)</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.futureOutlook}</p>
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">12. Depende de outra pessoa para tomar decisão?</p>
                                            <p className="text-sm text-white font-medium">{selectedLead.answers.dependsOnOthers || 'Não respondido'}</p>
                                            {selectedLead.answers.dependsOnOthers === 'Sim' && (
                                                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                                    Investe mesmo se falar não? <span className="text-white font-bold">{selectedLead.answers.dependsOnOthersReason || 'Não informado'}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-800/80 hover:border-dark-700 transition-colors md:col-span-2">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">13. Nível de Comprometimento (0 a 10)</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex-grow bg-dark-950 rounded-full h-3 overflow-hidden border border-dark-850">
                                                    <div 
                                                        className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full transition-all duration-700" 
                                                        style={{ width: `${(parseInt(selectedLead.answers.commitmentScale || '0', 10) / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gold-500 shrink-0 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
                                                    {selectedLead.answers.commitmentScale || '0'} / 10
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão de Toggle para Exibir/Ocultar os Detalhes Técnicos */}
                                <div className="pt-8 border-t border-dark-800 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border border-gold-500/20 hover:border-gold-500/40 bg-gold-500/5 hover:bg-gold-500/10 text-gold-400 hover:text-gold-300 transition-all font-bold text-xs md:text-sm tracking-widest uppercase shadow-lg shadow-black/20"
                                    >
                                        {showTechnicalDetails ? 'Ocultar Detalhes Técnicos' : 'Mostrar Detalhes Técnicos'}
                                    </button>
                                </div>

                                {/* Seção de Detalhes Técnicos (Ocultada/Liberada pelo botão acima) */}
                                <AnimatePresence>
                                    {showTechnicalDetails && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-8 pt-8 border-t border-dark-800 overflow-hidden"
                                        >
                                            
                                            {/* Bloco de Status do Lead */}
                                            <div className="bg-dark-850 p-6 rounded-xl border border-dark-800 space-y-4">
                                                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                    Status do Lead
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    {(['Agendado', 'Verificar', 'Consultoria', 'Downsell', 'Perdido'] as const).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleStatusUpdate(selectedLead.id, s)}
                                                            disabled={updatingStatus === selectedLead.id}
                                                            className={`px-4 py-3 rounded-lg text-xs md:text-sm font-semibold border transition-all ${selectedLead.status === s
                                                                ? statusColors[s] + ' shadow-md'
                                                                : 'bg-dark-900 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Bloco de Objeções (Scripts de Venda) */}
                                            <div className="bg-dark-850 p-6 rounded-xl border border-dark-800 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-gold-500" />
                                                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Script de Objeções</h4>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {OBJECTIONS_LIST.map((objection) => (
                                                        <button
                                                            key={objection}
                                                            onClick={() => setSelectedObjection(selectedObjection === objection ? null : objection)}
                                                            className={`text-[11px] px-3.5 py-2 rounded-full border transition-all ${selectedObjection === objection
                                                                ? 'bg-gold-500 text-black border-gold-500 font-extrabold shadow-md'
                                                                : 'bg-dark-900 border-dark-800 text-gray-400 hover:border-gold-500/30 hover:text-gray-300'
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
                                                            className="overflow-hidden mt-4"
                                                        >
                                                            <div className="p-4 bg-dark-900 rounded-lg border border-gold-500/10 space-y-4 shadow-inner">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                        <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">1. Acolher</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 pl-3.5 leading-relaxed font-light">{OBJECTIONS_MAPPING[selectedObjection].acolher.replace('NOME', selectedLead.name)}</p>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                                        <p className="text-[10px] text-yellow-400 uppercase font-bold tracking-widest">2. Reenquadrar</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 pl-3.5 leading-relaxed font-light">{OBJECTIONS_MAPPING[selectedObjection].reenquadrar.replace('NOME', selectedLead.name)}</p>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                        <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest">3. Solucionar 1</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 pl-3.5 leading-relaxed font-light">{OBJECTIONS_MAPPING[selectedObjection].solucionar1.replace('NOME', selectedLead.name)}</p>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                        <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">4. Solucionar 2</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 pl-3.5 leading-relaxed font-light">{OBJECTIONS_MAPPING[selectedObjection].solucionar2.replace('NOME', selectedLead.name)}</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Bloco de Opções de Pagamento */}
                                            <div className="bg-dark-850 p-6 rounded-xl border border-dark-800 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-gold-500" />
                                                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Opções de Pagamento</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {PAYMENT_OPTIONS.map((option, idx) => (
                                                        <div key={idx} className="bg-dark-900 rounded-lg border border-dark-800 hover:border-gold-500/20 transition-all overflow-hidden flex flex-col justify-between">
                                                            <div className="p-4 flex items-start gap-3">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500/10 text-gold-500 font-bold text-[11px] shrink-0 border border-gold-500/20">
                                                                    {option.label}
                                                                </span>
                                                                <span className="text-sm text-gray-300 font-medium leading-snug">{option.description}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between px-4 py-2 bg-dark-950/40 border-t border-dark-800/40">
                                                                <span className="text-[10px] text-gray-500 truncate max-w-[150px] md:max-w-xs">{option.link}</span>
                                                                <button
                                                                    onClick={() => handleCopyLink(option.link, idx)}
                                                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-dark-800 hover:bg-dark-750 text-gold-500 hover:text-gold-400 rounded-md transition-colors border border-dark-700"
                                                                    title="Copiar link"
                                                                >
                                                                    {copiedIndex === idx ? (
                                                                        <>
                                                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                                            <span className="text-green-500 text-[9px]">Copiado</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Copy className="w-3 h-3" />
                                                                            <span className="text-[9px]">Copiar Link</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {activePresentationLead && (
                <PresentationFlow
                    lead={activePresentationLead}
                    onClose={() => {
                        setActivePresentationLead(null);
                        fetchLeads();
                    }}
                    onUpdateLead={(updatedLead) => {
                        setSelectedLead(updatedLead);
                        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
                    }}
                />
            )}
        </div>
    );
};
