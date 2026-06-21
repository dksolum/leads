import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Lead, AdminUser, PricingPackage, PaymentOption } from '../types';
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
    Sparkles,
    X,
    AlertCircle,
    Calendar,
    Target,
    Shield,
    DollarSign,
    UserPlus,
    Coins,
    Lock,
    ShieldAlert,
    HelpCircle,
    Edit,
    Eye
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

const STATIC_PAYMENT_OPTIONS: PaymentOption[] = [
    { label: '1', description: 'Até 12x de R$ 61,74 no Cartão de Crédito', link: 'https://hotm.io/solum-consultoria' },
    { label: '2', description: 'À vista por R$ 597', link: 'https://hotm.io/solum-consultoria' },
    { label: '3', description: 'Até 2x de R$ 314,22 no Boleto Parcelado', link: 'https://hotm.io/solum-consultoria-parcelado' },
    { label: '4', description: 'Entrada de R$ 147 + 1x de R$ 450', link: 'https://mpago.li/2PY7vuj' },
    { label: '5', description: 'Boleto Parcelado (PARCELEX) - Última tentativa', link: 'https://hotm.io/solum-consultoria-parcelex' },
    { label: '6', description: 'R$ 47 (GARANTIR A VAGA) + 1x de R$ 550 (NO DIA DO FECHAMENTO)', link: 'https://mpago.li/2gVs1Rb' },
];

const OBJECTIONS_LIST = Object.keys(OBJECTIONS_MAPPING);

interface ModalConfig {
    type: 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

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

    // Modal Premium
    const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

    const showModal = (type: 'error' | 'success' | 'confirm', title: string, message: string, onConfirm?: () => void) => {
        setModalConfig({
            type,
            title,
            message,
            onConfirm: onConfirm ? () => {
                onConfirm();
                setModalConfig(null);
            } : undefined,
            onCancel: () => setModalConfig(null)
        });
    };

    // Estados dos filtros
    const [filterCreditCard, setFilterCreditCard] = useState<'all' | 'yes' | 'problem' | 'no'>('all');
    const [filterDepends, setFilterDepends] = useState<'all' | 'yes' | 'no'>('all');
    const [filterCommitment, setFilterCommitment] = useState<'all' | '8' | '5'>('all');

    // Estados adicionados para Fluxos Premium (Senhas, Usuários e Precificações)
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [changePasswordValue, setChangePasswordValue] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const [pricingModalOpen, setPricingModalOpen] = useState(false);
    const [editingPricing, setEditingPricing] = useState<PricingPackage | null>(null);
    const [viewingPricing, setViewingPricing] = useState<PricingPackage | null>(null);

    // Estado para controlar a exibição dos detalhes técnicos do Lead
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
    const [activePresentationLead, setActivePresentationLead] = useState<Lead | null>(null);
    const [selectedFormType, setSelectedFormType] = useState<'all' | 'personal' | 'business' | 'complete'>('all');
    const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | Lead['status']>('all');
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    const [showPresentationAnswersModal, setShowPresentationAnswersModal] = useState(false);
    const [activeAnswersTab, setActiveAnswersTab] = useState<'diagnostico' | 'metas' | 'emocional' | 'fechamento'>('diagnostico');
    const [confirmClear, setConfirmClear] = useState(false);
    const [clearingPresentation, setClearingPresentation] = useState(false);

    // Controle de papéis de usuários (RBAC) e abas
    const [userRole, setUserRole] = useState<'administrador' | 'vendedor' | 'secretario' | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const [authLoading, setAuthLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [activeTab, setActiveTab] = useState<'leads' | 'users' | 'pricing'>('leads');

    // Usuários e Precificação
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingPricing, setLoadingPricing] = useState(false);

    // Form Novo Usuário
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<'administrador' | 'vendedor' | 'secretario'>('vendedor');
    const [submittingUser, setSubmittingUser] = useState(false);

    // Form Nova Precificação
    const [newPricingName, setNewPricingName] = useState('');
    const [newPricingValue, setNewPricingValue] = useState('');
    const [newPricingOptions, setNewPricingOptions] = useState<PaymentOption[]>([
        { label: '1', description: '', link: '' },
        { label: '2', description: '', link: '' },
        { label: '3', description: '', link: '' },
        { label: '4', description: '', link: '' },
        { label: '5', description: '', link: '' },
        { label: '6', description: '', link: '' }
    ]);
    const [submittingPricing, setSubmittingPricing] = useState(false);

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

    const checkUserRole = async () => {
        setAuthLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.user) {
                setAccessDenied(true);
                setAuthLoading(false);
                return;
            }

            const email = session.user.email || '';
            setCurrentUserEmail(email);

            if (email.toLowerCase() === 'diegokloppel21@gmail.com') {
                setUserRole('administrador');
                setAccessDenied(false);
            } else {
                const { data, error } = await supabase
                    .from('admin_users')
                    .select('role')
                    .eq('email', email.toLowerCase())
                    .maybeSingle();

                if (data && data.role) {
                    setUserRole(data.role as any);
                    setAccessDenied(false);
                } else {
                    setUserRole(null);
                    setAccessDenied(true);
                }
            }
        } catch (e) {
            console.error('Erro ao verificar permissões:', e);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email?.toLowerCase() === 'diegokloppel21@gmail.com') {
                setUserRole('administrador');
                setAccessDenied(false);
            } else {
                setAccessDenied(true);
            }
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchAdminUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setAdminUsers(data);
            }
        } catch (e) {
            console.error('Erro ao buscar usuários administrativos:', e);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchPricingPackages = async () => {
        setLoadingPricing(true);
        try {
            const { data, error } = await supabase
                .from('pricing_packages')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                if (data.length === 0) {
                    const { data: insertedData, error: insertError } = await supabase
                        .from('pricing_packages')
                        .insert({
                            name: 'Consultoria Padrão',
                            value: 'R$ 597,00',
                            payment_options: STATIC_PAYMENT_OPTIONS
                        })
                        .select();
                    if (!insertError && insertedData) {
                        setPricingPackages(insertedData);
                    }
                } else {
                    setPricingPackages(data);
                }
            }
        } catch (e) {
            console.error('Erro ao buscar precificações:', e);
        } finally {
            setLoadingPricing(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        setSubmittingUser(true);
        try {
            // Tentar criar o usuário na aba Authentication do Supabase
            // Geramos uma senha aleatória forte de 20 caracteres
            const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + '!@#A1';
            
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: newEmail.trim().toLowerCase(),
                password: tempPassword
            });

            // Se for erro de usuário já cadastrado, permitimos vincular o perfil
            const isAlreadyRegistered = signUpError && signUpError.message?.toLowerCase().includes('already registered');
            
            if (signUpError && !isAlreadyRegistered) {
                showModal('error', 'Erro ao Cadastrar Login', `Não foi possível registrar o login do usuário no Supabase Auth: ${signUpError.message}`);
                setSubmittingUser(false);
                return;
            }

            // Inserir perfil na tabela pública admin_users
            const { data, error } = await supabase
                .from('admin_users')
                .insert({
                    email: newEmail.trim().toLowerCase(),
                    role: newRole
                })
                .select();

            if (error) {
                if (error.code === '42P01') {
                    showModal('error', 'Tabela Não Encontrada', 'Erro: A tabela admin_users não existe no Supabase. Por favor, execute o script SQL de inicialização no painel do seu Supabase.');
                } else {
                    showModal('error', 'Erro ao Adicionar', `Erro ao adicionar usuário: ${error.message}`);
                }
            } else if (data && data.length > 0) {
                setAdminUsers(prev => [data[0] as AdminUser, ...prev]);
                setNewEmail('');
                setNewRole('vendedor');
                
                if (isAlreadyRegistered) {
                    showModal('success', 'Usuário Vinculado', 'O usuário já possuía uma conta no Supabase Auth e o perfil correspondente foi vinculado com sucesso!');
                } else {
                    showModal('success', 'Usuário Adicionado', 'O perfil foi criado e o e-mail de convite de confirmação foi enviado! O usuário deve clicar no link recebido no e-mail para confirmar a conta e depois criar sua própria senha.');
                }
            }
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Falha de Conexão', 'Falha ao se conectar com o servidor.');
        } finally {
            setSubmittingUser(false);
        }
    };

    const handleDeleteUser = (id: string, email: string) => {
        if (userRole !== 'administrador') {
            showModal('error', 'Ação Não Permitida', 'Apenas administradores podem excluir usuários.');
            return;
        }
        if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
            showModal('error', 'Ação Inválida', 'Você não pode excluir seu próprio usuário administrativo.');
            return;
        }
        showModal('confirm', 'Confirmar Exclusão', `Tem certeza que deseja excluir o acesso administrativo do e-mail ${email}?`, () => {
            executeDeleteUser(id);
        });
    };

    const executeDeleteUser = async (id: string) => {
        try {
            const { error } = await supabase
                .from('admin_users')
                .delete()
                .eq('id', id);

            if (error) {
                showModal('error', 'Erro ao Excluir', `Erro ao excluir: ${error.message}`);
            } else {
                setAdminUsers(prev => prev.filter(u => u.id !== id));
                showModal('success', 'Sucesso', 'Acesso administrativo excluído com sucesso.');
            }
        } catch (e) {
            console.error(e);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!changePasswordValue || changePasswordValue.length < 6) {
            showModal('error', 'Senha Fraca', 'A senha precisa ter pelo menos 6 caracteres.');
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: changePasswordValue
            });

            if (error) {
                showModal('error', 'Erro ao Alterar Senha', `Não foi possível atualizar sua senha: ${error.message}`);
            } else {
                setIsChangePasswordModalOpen(false);
                setChangePasswordValue('');
                showModal('success', 'Sucesso', 'Sua senha foi alterada com sucesso!');
            }
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setSubmittingUser(true);
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .update({ role: editingUser.role })
                .eq('id', editingUser.id)
                .select();

            if (error) {
                showModal('error', 'Erro ao Editar', `Não foi possível atualizar o perfil: ${error.message}`);
            } else if (data && data.length > 0) {
                setAdminUsers(prev => prev.map(u => u.id === editingUser.id ? (data[0] as AdminUser) : u));
                setIsUserModalOpen(false);
                setEditingUser(null);
                showModal('success', 'Sucesso', 'Perfil do usuário atualizado com sucesso.');
            }
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        } finally {
            setSubmittingUser(false);
        }
    };

    const handleSendResetEmail = async (email: string) => {
        try {
            // Tentamos cadastrar no Auth primeiro caso ele tenha sido criado sem registro no Auth (fluxos legados ou inconsistências)
            const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + '!@#A1';
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password: tempPassword
            });

            const isAlreadyRegistered = signUpError && signUpError.message?.toLowerCase().includes('already registered');

            if (signUpError && !isAlreadyRegistered) {
                showModal('error', 'Erro ao Enviar Link', `Não foi possível prosseguir: ${signUpError.message}`);
                return;
            }

            if (!signUpError) {
                // Usuário não existia no Auth e foi criado com sucesso (enviando e-mail de confirmação)
                showModal('success', 'E-mail de Convite Enviado', `Como o usuário não possuía cadastro ativo no sistema de autenticação, criamos o seu acesso e enviamos um e-mail de convite para ${email}. Ele deve confirmar o e-mail para definir sua senha.`);
                return;
            }

            // Se já estava cadastrado no Auth, enviamos o reset de senha normal
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/administrativo'
            });

            if (resetError) {
                showModal('error', 'Erro ao Enviar Link', `Não foi possível enviar o link de redefinição de senha: ${resetError.message}`);
            } else {
                showModal('success', 'E-mail Enviado', `O link de redefinição de senha foi enviado com sucesso para ${email}! O usuário poderá cadastrar sua senha definitiva através do link recebido.`);
            }
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        }
    };

    const handlePricingValueChange = (rawValue: string) => {
        const digits = rawValue.replace(/\D/g, '');
        if (!digits) {
            setNewPricingValue('');
            return;
        }
        const cents = parseInt(digits, 10);
        const formatted = (cents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        setNewPricingValue(formatted);
    };

    const handleSavePricing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPricingName || !newPricingValue) {
            showModal('error', 'Campos Incompletos', 'Por favor, informe o nome e o valor da precificação.');
            return;
        }
        const filledOptions = newPricingOptions.filter(o => o.description.trim() !== '');
        if (filledOptions.length === 0) {
            showModal('error', 'Campos Incompletos', 'Por favor, informe pelo menos uma forma de pagamento.');
            return;
        }

        setSubmittingPricing(true);
        try {
            if (editingPricing) {
                // Atualizar pacote existente
                const { data, error } = await supabase
                    .from('pricing_packages')
                    .update({
                        name: newPricingName.trim(),
                        value: newPricingValue.trim(),
                        payment_options: newPricingOptions
                    })
                    .eq('id', editingPricing.id)
                    .select();

                if (error) {
                    showModal('error', 'Erro ao Atualizar', `Não foi possível atualizar a precificação: ${error.message}`);
                } else if (data && data.length > 0) {
                    setPricingPackages(prev => prev.map(p => p.id === editingPricing.id ? (data[0] as PricingPackage) : p));
                    setPricingModalOpen(false);
                    setEditingPricing(null);
                    showModal('success', 'Precificação Atualizada', 'O pacote de precificação foi atualizado com sucesso!');
                }
            } else {
                // Criar novo pacote
                const { data, error } = await supabase
                    .from('pricing_packages')
                    .insert({
                        name: newPricingName.trim(),
                        value: newPricingValue.trim(),
                        payment_options: newPricingOptions
                    })
                    .select();

                if (error) {
                    if (error.code === '42P01') {
                        showModal('error', 'Tabela Não Encontrada', 'Erro: A tabela pricing_packages não existe no Supabase. Por favor, execute o script SQL de inicialização no painel do seu Supabase.');
                    } else {
                        showModal('error', 'Erro ao Criar', `Erro ao criar precificação: ${error.message}`);
                    }
                } else if (data && data.length > 0) {
                    setPricingPackages(prev => [data[0] as PricingPackage, ...prev]);
                    setPricingModalOpen(false);
                    showModal('success', 'Precificação Criada', 'O pacote de precificação foi criado com sucesso!');
                }
            }
        } catch (err) {
            console.error(err);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        } finally {
            setSubmittingPricing(false);
        }
    };

    const handleDeletePricing = (id: string, name: string) => {
        if (userRole !== 'administrador') {
            showModal('error', 'Ação Não Permitida', 'Apenas administradores podem gerenciar a precificação.');
            return;
        }
        showModal('confirm', 'Confirmar Exclusão', `Tem certeza que deseja excluir o pacote de precificação "${name}"?`, () => {
            executeDeletePricing(id);
        });
    };

    const executeDeletePricing = async (id: string) => {
        try {
            const { error } = await supabase
                .from('pricing_packages')
                .delete()
                .eq('id', id);

            if (error) {
                showModal('error', 'Erro ao Excluir', `Erro ao excluir: ${error.message}`);
            } else {
                setPricingPackages(prev => prev.filter(p => p.id !== id));
                showModal('success', 'Sucesso', 'Pacote de precificação excluído com sucesso.');
            }
        } catch (e) {
            console.error(e);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        }
    };

    const handleUpdateLeadPricing = async (leadId: string, pricingId: string) => {
        if (userRole !== 'administrador') return;
        const updatedAnswers = {
            ...selectedLead!.answers,
            selectedPricingId: pricingId === 'default' ? undefined : pricingId
        };

        const { data, error } = await supabase
            .from('leads')
            .update({ answers: updatedAnswers })
            .eq('id', leadId)
            .select();

        if (error) {
            console.error('Erro ao atualizar precificação do lead:', error);
            showModal('error', 'Erro ao Salvar', `Erro ao salvar precificação: ${error.message}`);
        } else if (data && data.length > 0) {
            const updatedLead = data[0] as Lead;
            setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
            setSelectedLead(updatedLead);
        }
    };

    useEffect(() => {
        checkUserRole();
        fetchLeads();

        // Verificar se viemos de um link de recuperação/ativação de senha do e-mail
        if (window.location.hash && (window.location.hash.includes('type=recovery') || window.location.hash.includes('type=signup') || window.location.hash.includes('access_token='))) {
            const isRecovery = window.location.hash.includes('type=recovery');
            setIsChangePasswordModalOpen(true);
            showModal('success', 'Defina sua Senha', isRecovery 
                ? 'Sua conta foi verificada! Defina a sua senha definitiva abaixo para acessar o painel.'
                : 'Seu acesso foi verificado com sucesso! Crie a sua senha pessoal abaixo para começar.'
            );
            // Limpar o hash para evitar processamento repetido pelo StrictMode ou recargas
            setTimeout(() => {
                window.location.hash = '';
            }, 200);
        }
    }, []);

    useEffect(() => {
        if (userRole === 'administrador' || userRole === 'secretario') {
            fetchAdminUsers();
        }
        if (userRole === 'administrador') {
            fetchPricingPackages();
        }
    }, [userRole]);

    useEffect(() => {
        setSelectedObjection(null);
    }, [selectedLead?.id]);

    const handleDelete = (lead: Lead) => {
        setLeadToDelete(lead);
    };

    const confirmDelete = async () => {
        if (!leadToDelete) return;
        const { error } = await supabase.from('leads').delete().eq('id', leadToDelete.id);
        if (!error) {
            setLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
            if (selectedLead?.id === leadToDelete.id) {
                setSelectedLead(null);
                setShowTechnicalDetails(false);
            }
        }
        setLeadToDelete(null);
    };

    const handleClearPresentation = () => {
        if (!selectedLead) return;
        showModal('confirm', 'Limpar Apresentação', 'Tem certeza que deseja limpar as respostas da apresentação para este lead? Esta ação não pode ser desfeita.', () => {
            executeClearPresentation();
        });
    };

    const executeClearPresentation = async () => {
        if (!selectedLead) return;
        setClearingPresentation(true);
        try {
            const updatedAnswers = { ...selectedLead.answers };
            delete updatedAnswers.meeting;

            const { data, error } = await supabase
                .from('leads')
                .update({ answers: updatedAnswers })
                .eq('id', selectedLead.id)
                .select();

            if (error) {
                console.error('Erro ao limpar apresentação:', error);
                showModal('error', 'Erro ao Limpar', `Erro ao limpar: ${error.message}`);
            } else if (data && data.length > 0) {
                const updatedLead = data[0] as Lead;
                setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
                setSelectedLead(updatedLead);
                showModal('success', 'Sucesso', 'Apresentação limpa com sucesso.');
            }
        } catch (e) {
            console.error('Erro ao limpar dados da apresentação:', e);
            showModal('error', 'Erro de Conexão', 'Falha ao se conectar com o servidor.');
        } finally {
            setClearingPresentation(false);
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
            showModal('error', 'Erro ao Atualizar', `Erro ao atualizar: ${error.message}`);
        } else if (!data || data.length === 0) {
            console.warn('Status não atualizado no Supabase. Possível problema de permissão (RLS).');
            showModal('error', 'Acesso Negado', 'Não foi possível atualizar o status no servidor. Verifique suas permissões.');
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
                            onClick={() => {
                                setChangePasswordValue('');
                                setIsChangePasswordModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-gold-500/15 hover:text-gold-400 text-gray-400 rounded-lg transition-all text-sm font-medium border border-dark-700 cursor-pointer"
                        >
                            <Lock className="w-4 h-4" />
                            Alterar Senha
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-all text-sm font-medium border border-dark-700 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* Abas de Navegação Administrativa */}
            {!authLoading && !accessDenied && (
                <div className="max-w-7xl mx-auto px-6 mt-6 shrink-0">
                    <div className="flex border-b border-dark-800 gap-4">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('leads'); setSelectedLead(null); }}
                            className={`px-5 py-3 border-b-2 text-sm font-bold transition-all flex items-center gap-2 ${
                                activeTab === 'leads'
                                    ? 'border-gold-500 text-gold-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-400'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Leads
                        </button>
                        {(userRole === 'administrador' || userRole === 'secretario') && (
                            <button
                                type="button"
                                onClick={() => { setActiveTab('users'); setSelectedLead(null); }}
                                className={`px-5 py-3 border-b-2 text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === 'users'
                                        ? 'border-gold-500 text-gold-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-400'
                                }`}
                            >
                                <Shield className="w-4 h-4" />
                                Usuários
                            </button>
                        )}
                        {userRole === 'administrador' && (
                            <button
                                type="button"
                                onClick={() => { setActiveTab('pricing'); setSelectedLead(null); }}
                                className={`px-5 py-3 border-b-2 text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === 'pricing'
                                        ? 'border-gold-500 text-gold-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-400'
                                }`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Precificação
                            </button>
                        )}
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto p-6">
                {authLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <RefreshCw className="w-10 h-10 text-gold-500 animate-spin mb-4" />
                        <p className="text-gray-500 text-sm">Carregando permissões...</p>
                    </div>
                ) : accessDenied ? (
                    <div className="max-w-md mx-auto py-16 text-center space-y-6 bg-dark-900 border border-dark-800 p-8 rounded-2xl shadow-2xl mt-12">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                O e-mail <strong className="text-slate-350">{currentUserEmail}</strong> não tem permissão para acessar o sistema administrativo.
                            </p>
                            <p className="text-xs text-gray-500 font-light">
                                Entre em contato com o administrador para solicitar permissão.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="w-full py-3 bg-red-650 hover:bg-red-550 text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider cursor-pointer"
                        >
                            Sair da Conta
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'leads' && (
                            <div className="space-y-6">
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
                                                        {userRole === 'administrador' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(lead); }}
                                                                className="p-2 text-gray-655 hover:text-red-400 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
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

                                    <div className="flex flex-col sm:flex-row sm:flex-wrap lg:justify-end gap-x-6 gap-y-3 text-sm font-medium border-t lg:border-t-0 border-dark-800/60 pt-4 lg:pt-0 max-w-full">
                                        <div className="flex items-center gap-2 text-gray-300 min-w-0">
                                            <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                                            <span className="truncate max-w-[220px] sm:max-w-xs md:max-w-sm" title={selectedLead.email}>
                                                {selectedLead.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300 shrink-0">
                                            <Phone className="w-4 h-4 text-gold-500" />
                                            <span>{selectedLead.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300 shrink-0">
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

                                {/* Botões de Ação: Detalhes Técnicos e Respostas da Apresentação */}
                                <div className="pt-8 border-t border-dark-800 flex flex-wrap justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border border-gold-500/20 hover:border-gold-500/40 bg-gold-500/5 hover:bg-gold-500/10 text-gold-400 hover:text-gold-300 transition-all font-bold text-xs md:text-sm tracking-widest uppercase shadow-lg shadow-black/20"
                                    >
                                        {showTechnicalDetails ? 'Ocultar Detalhes Técnicos' : 'Mostrar Detalhes Técnicos'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPresentationAnswersModal(true)}
                                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 hover:from-gold-500 hover:to-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs md:text-sm tracking-widest uppercase shadow-lg shadow-gold-500/20 border border-gold-400/20"
                                    >
                                        <Target className="w-4 h-4 text-dark-950" />
                                        Ver Respostas da Apresentação
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
                                                            disabled={updatingStatus === selectedLead.id || userRole === 'secretario'}
                                                            className={`px-4 py-3 rounded-lg text-xs md:text-sm font-semibold border transition-all ${selectedLead.status === s
                                                                ? statusColors[s] + ' shadow-md'
                                                                : 'bg-dark-900 border-dark-800 text-gray-500 hover:border-dark-700 hover:text-gray-400'
                                                            } ${userRole === 'secretario' ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}`}
                                                            title={userRole === 'secretario' ? 'Secretários não podem alterar o status' : ''}
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
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-gold-500" />
                                                        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 font-sans">Opções de Pagamento</h4>
                                                    </div>
                                                    
                                                    {/* Dropdown de Precificação */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-450 uppercase font-bold tracking-wider shrink-0 font-sans">Precificação:</span>
                                                        <select
                                                            value={selectedLead.answers.selectedPricingId || 'default'}
                                                            onChange={(e) => handleUpdateLeadPricing(selectedLead.id, e.target.value)}
                                                            disabled={userRole !== 'administrador'}
                                                            className="bg-dark-900 border border-dark-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gold-500 transition-all cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="default">Renda de até 10 mil reais (R$ 597) - Padrão</option>
                                                            {pricingPackages.map(pkg => (
                                                                <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.value})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(() => {
                                                        const currentPricingId = selectedLead.answers.selectedPricingId;
                                                        const currentPkg = currentPricingId && pricingPackages.find(p => p.id === currentPricingId);
                                                        const options = currentPkg ? currentPkg.payment_options : STATIC_PAYMENT_OPTIONS;
                                                        const activeOptions = options.filter(o => o && o.description && o.description.trim() !== '');

                                                        return activeOptions.map((option, idx) => (
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
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <motion.div
                    key="users-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                >
                    <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-2xl font-sans">
                        <h3 className="text-lg font-serif text-white font-bold mb-4">Adicionar Novo Usuário Administrativo</h3>
                        
                        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail do Usuário</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@dominio.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Papel / Acesso</label>
                                <select
                                    value={newRole}
                                    onChange={(e: any) => setNewRole(e.target.value)}
                                    className="w-full bg-dark-950 border border-dark-800 text-white rounded-lg p-3 text-sm outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
                                >
                                    <option value="vendedor">Vendedor</option>
                                    <option value="secretario">Secretário</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingUser || !newEmail}
                                className="py-3 px-6 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4 text-black" />
                                {submittingUser ? 'Adicionando...' : 'Adicionar Usuário'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-2xl font-sans">
                        <div className="p-4 bg-dark-850 border-b border-dark-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Usuários Cadastrados</h3>
                            <span className="text-xs text-gray-500 font-mono">{adminUsers.length + 1} usuários</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-800/50 text-xs uppercase tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">E-mail</th>
                                        <th className="px-6 py-4 font-semibold">Papel</th>
                                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {/* Super Admin fixo no topo */}
                                    <tr className="bg-gold-500/5 border-l-2 border-gold-500">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            diegokloppel21@gmail.com
                                            <span className="text-[9px] px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded border border-gold-500/20 font-bold uppercase">Criador</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold uppercase tracking-wider">
                                                Administrador
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-gray-500 italic font-mono">
                                            Acesso Mestre
                                        </td>
                                    </tr>

                                    {adminUsers.filter(u => u.email.toLowerCase() !== 'diegokloppel21@gmail.com').map(user => (
                                        <tr key={user.id} className="hover:bg-dark-800/40 transition-colors">
                                            <td className="px-6 py-4 text-gray-300 font-medium">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${
                                                    user.role === 'administrador'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : user.role === 'secretario'
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser({ ...user });
                                                        setIsUserModalOpen(true);
                                                    }}
                                                    disabled={userRole !== 'administrador'}
                                                    className="p-2 text-gray-600 hover:text-gold-400 transition-colors disabled:opacity-30 disabled:hover:text-gray-600 cursor-pointer"
                                                    title="Editar perfil e redefinir senha"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    disabled={userRole !== 'administrador'}
                                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:text-gray-600 cursor-pointer"
                                                    title={userRole === 'administrador' ? "Remover acesso" : "Apenas administradores podem excluir"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'pricing' && (
                <motion.div
                    key="pricing-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                >
                    {/* Barra Superior com botão Novo Pacote */}
                    <div className="flex justify-between items-center bg-dark-900 border border-dark-800 rounded-xl p-4 shadow-lg font-sans">
                        <div>
                            <h3 className="text-lg font-serif text-white font-bold">Gerenciador de Precificações</h3>
                            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Controle de pacotes e checkouts do sistema</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingPricing(null);
                                setNewPricingName('');
                                setNewPricingValue('');
                                setNewPricingOptions([
                                    { label: '1', description: '', link: '' },
                                    { label: '2', description: '', link: '' },
                                    { label: '3', description: '', link: '' },
                                    { label: '4', description: '', link: '' },
                                    { label: '5', description: '', link: '' },
                                    { label: '6', description: '', link: '' }
                                ]);
                                setPricingModalOpen(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                        >
                            <Coins className="w-4 h-4 text-dark-950" />
                            + Novo Pacote
                        </button>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-2xl font-sans">
                        <div className="p-4 bg-dark-850 border-b border-dark-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Pacotes Cadastrados</h3>
                            <span className="text-xs text-gray-500 font-mono">{pricingPackages.length} pacotes</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-800/50 text-xs uppercase tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold font-sans">Nome</th>
                                        <th className="px-6 py-4 font-semibold font-sans">Valor Total</th>
                                        <th className="px-6 py-4 font-semibold font-sans">Formas Cadastradas</th>
                                        <th className="px-6 py-4 font-semibold text-right font-sans">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {pricingPackages.map(pkg => (
                                        <tr key={pkg.id} className="hover:bg-dark-800/40 transition-colors">
                                            <td className="px-6 py-4 text-gray-300 font-medium flex items-center gap-2">
                                                {pkg.name}
                                                {pkg.name === 'Consultoria Padrão' && (
                                                    <span className="text-[9px] px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded border border-gold-500/20 font-bold uppercase">Padrão</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gold-500">{pkg.value}</td>
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                {pkg.payment_options.filter(o => o.description && o.description.trim() !== '').length} formas ativas
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setViewingPricing(pkg);
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-gold-400 transition-colors cursor-pointer"
                                                    title="Visualizar detalhes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingPricing(pkg);
                                                        setNewPricingName(pkg.name);
                                                        setNewPricingValue(pkg.value);
                                                        const opts = Array.from({ length: 6 }, (_, idx) => {
                                                            const existing = pkg.payment_options.find(o => o.label === String(idx + 1));
                                                            return existing ? { ...existing } : { label: String(idx + 1), description: '', link: '' };
                                                        });
                                                        setNewPricingOptions(opts);
                                                        setPricingModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-gold-400 transition-colors cursor-pointer"
                                                    title="Editar precificação"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePricing(pkg.id, pkg.name)}
                                                    disabled={pkg.name === 'Consultoria Padrão'}
                                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:text-gray-600"
                                                    title={pkg.name === 'Consultoria Padrão' ? "O pacote padrão não deve ser excluído" : "Excluir precificação"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )}
</main>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {leadToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLeadToDelete(null)}
                            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        />
                        
                        {/* Card do Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 p-6 space-y-6"
                        >
                            <div className="flex items-center gap-4 text-red-500">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif text-white font-bold">Excluir Lead</h3>
                                    <p className="text-xs text-red-400 font-semibold tracking-wider uppercase">Confirmação de Ação Permanente</p>
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-300 leading-relaxed font-light">
                                Tem certeza de que deseja excluir o lead <strong className="text-white font-semibold">{leadToDelete.name}</strong>? 
                                Esta ação irá apagar todos os registros do lead, incluindo respostas de formulários e da apresentação.
                                <span className="block mt-2 font-medium text-red-400/90">Esta alteração é irreversível.</span>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setLeadToDelete(null)}
                                    className="px-5 py-2.5 bg-dark-800 hover:bg-dark-750 text-gray-400 hover:text-white rounded-xl transition-all border border-dark-700 text-sm font-bold uppercase tracking-wider"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] text-sm font-bold uppercase tracking-wider"
                                >
                                    Excluir Permanente
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Respostas da Apresentação */}
            <AnimatePresence>
                {showPresentationAnswersModal && selectedLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowPresentationAnswersModal(false);
                                setConfirmClear(false);
                            }}
                            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        />
                        
                        {/* Card do Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-dark-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif text-white font-bold">Respostas da Apresentação</h3>
                                        <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Lead: {selectedLead.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPresentationAnswersModal(false);
                                        setConfirmClear(false);
                                    }}
                                    className="p-2 hover:bg-dark-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto flex-grow space-y-6">
                                {!selectedLead.answers?.meeting || 
                                 !Object.keys(selectedLead.answers.meeting).some(
                                     key => selectedLead.answers.meeting![key as keyof typeof selectedLead.answers.meeting] !== undefined && 
                                            selectedLead.answers.meeting![key as keyof typeof selectedLead.answers.meeting] !== ''
                                 ) ? (
                                    /* Caso Não Tenha Respostas */
                                    <div className="text-center py-16 px-4">
                                        <AlertCircle className="w-16 h-16 text-gold-500/70 mx-auto mb-4 animate-pulse" />
                                        <h3 className="text-lg font-serif text-white font-bold mb-2">Apresentação Não Realizada</h3>
                                        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                                            Ainda não existem informações desta parte porque não foi feita a apresentação que tem no sistema para o lead <strong className="text-slate-300 font-semibold">{selectedLead.name}</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    /* Caso Tenha Respostas (Abas Internas) */
                                    <div className="space-y-6">
                                        {/* Abas */}
                                        <div className="flex border-b border-dark-800 scrollbar-none overflow-x-auto gap-2">
                                            {[
                                                { id: 'diagnostico', label: 'Diagnóstico & Dívidas' },
                                                { id: 'metas', label: 'Metas & Hábitos' },
                                                { id: 'emocional', label: 'Emocional & Tempo' },
                                                { id: 'fechamento', label: 'Fechamento & Notas' }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveAnswersTab(tab.id as any)}
                                                    className={`px-4 py-3 border-b-2 text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                                                        activeAnswersTab === tab.id
                                                            ? 'border-gold-500 text-gold-400'
                                                            : 'border-transparent text-gray-500 hover:text-gray-400'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {/* Conteúdo da Aba Diagnóstico */}
                                        {activeAnswersTab === 'diagnostico' && selectedLead.answers.meeting && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Gasta mais do que deveria?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.gastaMaisDoQueDeveria || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Com o que gasta mais?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.comOQueGastaMais || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Consegue guardar dinheiro?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.consegueGuardarDinheiro || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Guarda mensalmente?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.guardaMensalmente || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quanto guarda mensalmente?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.quantoGuardaMensalmente || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quanto conseguiu guardar?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.quantoConseguiuGuardar || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">O que impede de guardar?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.oQueImpedeDeGuardar || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quanto tem de reserva de emergência?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.quantoTemDeReserva || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Possui dívidas?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.possuiDividas || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Dificuldade para lidar com as dívidas?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.dificuldadeLidarDividas || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1 md:col-span-2">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quais são as dificuldades com dívidas?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.quaisDificuldadesDividas || 'Nenhuma informada ou sem dívidas'}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Conteúdo da Aba Metas */}
                                        {activeAnswersTab === 'metas' && selectedLead.answers.meeting && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Economia Mensal Média</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.monthlySavings || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Prioridade Financeira Atual</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.financialPriority || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Maior Desperdício / Ralo</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.biggestWaste || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tem reserva?</p>
                                                    <p className="text-sm text-white font-medium">
                                                        {selectedLead.answers.meeting.hasReserve || 'Não respondido'}
                                                        {selectedLead.answers.meeting.reserveMonths && ` (${selectedLead.answers.meeting.reserveMonths} meses)`}
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Possui Metas definidas?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.possuiMetas || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tem outro problema além do principal?</p>
                                                    <p className="text-sm text-white font-medium">
                                                        {selectedLead.answers.meeting.problemaAlemDoPrincipal || 'Não respondido'}
                                                        {selectedLead.answers.meeting.quaisOutrosProblemas && ` - ${selectedLead.answers.meeting.quaisOutrosProblemas}`}
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1 md:col-span-2">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quais são as três metas principais?</p>
                                                    <p className="text-sm text-white font-medium leading-relaxed">{selectedLead.answers.meeting.quaisTresMetas || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1 md:col-span-2">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider font-bold">Por que essas metas são importantes?</p>
                                                    <p className="text-sm text-white font-medium leading-relaxed">{selectedLead.answers.meeting.porqueMetasImportantes || 'Não respondido'}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Conteúdo da Aba Emocional */}
                                        {activeAnswersTab === 'emocional' && selectedLead.answers.meeting && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Nota de Animação para resolver metas</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.animacaoResolverMetas || 'Não respondido'} / 10</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">O que falta para nota 10?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.oQueFaltaParaDez || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Como estará a vida financeira daqui a 6 meses?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.vidaDaquiSeisMeses || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">A perspectiva de 6 meses assusta ou conforta?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.seisMesesAssustaOuConforta || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tempo de dedicação semanal (horas)</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.timeCommitment || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Se a rotina tem pouco tempo, aceita 10-15m/dia?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.rotinaPoucoTempo || 'Não respondido'}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Conteúdo da Aba Fechamento */}
                                        {activeAnswersTab === 'fechamento' && selectedLead.answers.meeting && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Decisão da Matriz (Cor)</p>
                                                    <p className="text-sm text-white font-medium">
                                                        {selectedLead.answers.meeting.matrixDecision === 'blue' && 'Azul (Razão/Segurança)'}
                                                        {selectedLead.answers.meeting.matrixDecision === 'red' && 'Vermelho (Ação/Ganho)'}
                                                        {!selectedLead.answers.meeting.matrixDecision && 'Não respondido'}
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">A solução inicial fez sentido?</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.initialSolutionSense || 'Não respondido'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Finalidade do dinheiro guardado</p>
                                                    <p className="text-sm text-white font-medium">
                                                        {selectedLead.answers.meeting.guardadoTemFinalidade || 'Não respondido'}
                                                        {selectedLead.answers.meeting.guardadoQualFinalidade && ` - ${selectedLead.answers.meeting.guardadoQualFinalidade}`}
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Data da Reunião / Registro</p>
                                                    <p className="text-sm text-white font-medium">
                                                        {selectedLead.answers.meeting.meetingDate ? new Date(selectedLead.answers.meeting.meetingDate).toLocaleString('pt-BR') : 'Não registrada'}
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Escolha de Investimento (Oferta Principal)</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.investmentChoice || 'Nenhuma selecionada'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider font-bold">Escolha na Negociação</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.negotiationChoice || 'Nenhuma selecionada'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1 md:col-span-2">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider font-bold">Escolha no Downsell</p>
                                                    <p className="text-sm text-white font-medium">{selectedLead.answers.meeting.downsellChoice || 'Nenhuma selecionada'}</p>
                                                </div>
                                                
                                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 space-y-1 md:col-span-2">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider font-bold">Observações Adicionais do Consultor</p>
                                                    <p className="text-sm text-white font-light whitespace-pre-wrap leading-relaxed">{selectedLead.answers.meeting.notes || 'Sem observações adicionais.'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer */}
                            <div className="p-6 border-t border-dark-800 flex justify-between items-center shrink-0">
                                <div>
                                    {selectedLead.answers?.meeting && (
                                        <button
                                            type="button"
                                            onClick={handleClearPresentation}
                                            disabled={clearingPresentation}
                                            className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-xl transition-all border border-red-500/25 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {clearingPresentation ? 'Limpando...' : 'Apagar Apresentação'}
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPresentationAnswersModal(false);
                                    }}
                                    className="px-6 py-2.5 bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white rounded-xl transition-all border border-dark-700 text-xs font-bold uppercase tracking-widest"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {activePresentationLead && (
                <PresentationFlow
                    lead={activePresentationLead}
                    pricingPackages={pricingPackages}
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

            {/* Modal Premium de Alertas/Confirmações */}
            <AnimatePresence>
                {modalConfig && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-2xl space-y-6"
                        >
                            {/* Cabeçalho com ícone */}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                                    modalConfig.type === 'error'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                        : modalConfig.type === 'success'
                                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                        : 'bg-gold-500/10 border-gold-500/20 text-gold-400'
                                }`}>
                                    {modalConfig.type === 'error' && <AlertCircle className="w-6 h-6" />}
                                    {modalConfig.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                                    {modalConfig.type === 'confirm' && <HelpCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white font-serif">{modalConfig.title}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                                        {modalConfig.type === 'error' ? 'Erro' : modalConfig.type === 'success' ? 'Sucesso' : 'Confirmação'}
                                    </p>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <p className="text-gray-300 text-sm leading-relaxed font-light font-sans">
                                {modalConfig.message}
                            </p>

                            {/* Botões */}
                            <div className="flex justify-end gap-3 pt-2">
                                {modalConfig.type === 'confirm' ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={modalConfig.onCancel}
                                            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 border border-dark-700 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={modalConfig.onConfirm}
                                            className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-450 text-dark-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer"
                                        >
                                            Confirmar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={modalConfig.onCancel}
                                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-xl border cursor-pointer ${
                                            modalConfig.type === 'error'
                                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                                : 'bg-gold-500/10 hover:bg-gold-500/20 text-gold-450 border border-gold-500/20'
                                        }`}
                                    >
                                        Fechar
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Premium de Alteração de Senha */}
            <AnimatePresence>
                {isChangePasswordModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-2xl space-y-6 font-sans"
                        >
                            <div className="flex items-center gap-4 border-b border-dark-800 pb-4">
                                <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white font-serif">Alterar Minha Senha</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Segurança da Conta</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Nova Senha</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="Mínimo de 6 caracteres"
                                        value={changePasswordValue}
                                        onChange={(e) => setChangePasswordValue(e.target.value)}
                                        className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsChangePasswordModalOpen(false)}
                                        className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 border border-dark-700 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword || !changePasswordValue}
                                        className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-450 text-dark-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer disabled:opacity-50"
                                    >
                                        {isUpdatingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Premium de Edição de Usuário (Vendedor) */}
            <AnimatePresence>
                {isUserModalOpen && editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-2xl space-y-6 font-sans"
                        >
                            <div className="flex items-center gap-4 border-b border-dark-800 pb-4">
                                <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white font-serif">Editar Usuário</h3>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{editingUser.email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleEditUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Papel / Acesso</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e: any) => setEditingUser(prev => prev ? { ...prev, role: e.target.value } : null)}
                                        className="w-full bg-dark-950 border border-dark-800 text-white rounded-lg p-3 text-sm outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
                                    >
                                        <option value="vendedor">Vendedor</option>
                                        <option value="secretario">Secretário</option>
                                        <option value="administrador">Administrador</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-dark-950 rounded-xl border border-dark-800/60 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 font-sans">Recuperação de Acesso</h4>
                                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                                        Se este vendedor esqueceu a senha ou precisa defini-la pela primeira vez, você pode disparar um link de redefinição de senha para o e-mail dele.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleSendResetEmail(editingUser.email)}
                                        className="w-full py-2.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Enviar E-mail de Nova Senha
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsUserModalOpen(false);
                                            setEditingUser(null);
                                        }}
                                        className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 border border-dark-700 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingUser}
                                        className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-450 text-dark-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer disabled:opacity-50"
                                    >
                                        {submittingUser ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Premium de Visualização de Precificação */}
            <AnimatePresence>
                {viewingPricing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingPricing(null)}
                            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col font-sans"
                        >
                            <div className="p-6 border-b border-dark-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif text-white font-bold">{viewingPricing.name}</h3>
                                        <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Visualizar Detalhes do Pacote</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingPricing(null)}
                                    className="p-2 hover:bg-dark-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div className="p-4 bg-dark-850 rounded-xl border border-dark-800 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor Total Configurado</span>
                                    <span className="text-xl font-bold text-gold-500 font-serif">{viewingPricing.value}</span>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-dark-800 pb-2">Formas de Pagamento Ativas</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {viewingPricing.payment_options.filter(o => o.description && o.description.trim() !== '').map((option, idx) => (
                                            <div key={idx} className="bg-dark-950 rounded-xl border border-dark-800 p-4 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold-500/10 text-gold-500 font-bold text-[10px] border border-gold-500/20">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Opção {option.label}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Descrição</p>
                                                    <p className="text-sm text-white font-medium">{option.description}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Checkout Link</p>
                                                    <p className="text-xs text-gold-500/80 truncate font-mono">{option.link}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-dark-800 flex justify-end shrink-0">
                                <button
                                    onClick={() => setViewingPricing(null)}
                                    className="px-6 py-2.5 bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white rounded-xl transition-all border border-dark-700 text-xs font-bold uppercase tracking-widest"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Premium de Criação/Edição de Precificação */}
            <AnimatePresence>
                {pricingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setPricingModalOpen(false);
                                setEditingPricing(null);
                            }}
                            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col font-sans"
                        >
                            <div className="p-6 border-b border-dark-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif text-white font-bold">
                                            {editingPricing ? 'Editar Pacote de Precificação' : 'Criar Novo Pacote de Precificação'}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
                                            {editingPricing ? 'Atualizar valores e checkouts' : 'Configurar novo pacote e checkouts'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setPricingModalOpen(false);
                                        setEditingPricing(null);
                                    }}
                                    className="p-2 hover:bg-dark-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSavePricing} className="flex flex-col flex-grow overflow-hidden">
                                <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome da Precificação</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ex: Renda acima de 15 mil reais"
                                                value={newPricingName}
                                                onChange={(e) => setNewPricingName(e.target.value)}
                                                className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-all text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor do Pacote (2 casas decimais)</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ex: R$ 597,00"
                                                value={newPricingValue}
                                                onChange={(e) => handlePricingValueChange(e.target.value)}
                                                className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-dark-800 pb-2">Opções de Pagamento (Até 6 Formas)</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {newPricingOptions.map((opt, idx) => (
                                                <div key={idx} className="p-4 bg-dark-950 rounded-xl border border-dark-850 space-y-3 relative">
                                                    <span className="absolute top-2 right-3 text-[10px] font-bold text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                                                        Forma {opt.label}
                                                    </span>
                                                    <div className="space-y-1">
                                                        <label className="block text-[9px] font-semibold text-gray-450 uppercase tracking-widest">Descrição da Opção</label>
                                                        <input
                                                            type="text"
                                                            placeholder={idx === 0 ? "Até 12x de R$ 99 no Cartão" : idx === 1 ? "À vista por R$ 997" : "Ex: Boleto parcelado..."}
                                                            value={opt.description}
                                                            onChange={(e) => {
                                                                const updated = [...newPricingOptions];
                                                                updated[idx].description = e.target.value;
                                                                setNewPricingOptions(updated);
                                                            }}
                                                            className="w-full bg-dark-900 border border-dark-800 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold-500 transition-all font-medium"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="block text-[9px] font-semibold text-gray-450 uppercase tracking-widest">Link do Checkout</label>
                                                        <input
                                                            type="url"
                                                            placeholder="https://..."
                                                            value={opt.link}
                                                            onChange={(e) => {
                                                                const updated = [...newPricingOptions];
                                                                updated[idx].link = e.target.value;
                                                                setNewPricingOptions(updated);
                                                            }}
                                                            className="w-full bg-dark-900 border border-dark-800 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold-500 transition-all font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-dark-800 flex justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPricingModalOpen(false);
                                            setEditingPricing(null);
                                        }}
                                        className="px-6 py-2.5 bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white rounded-xl transition-all border border-dark-700 text-xs font-bold uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingPricing || !newPricingName || !newPricingValue}
                                        className="px-6 py-2.5 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 text-dark-950 hover:scale-[1.02] active:scale-[0.98] font-black rounded-xl shadow-lg shadow-gold-500/25 transition-all text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50"
                                    >
                                        {submittingPricing ? 'Salvando...' : editingPricing ? 'Salvar Alterações' : 'Criar Precificação'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
