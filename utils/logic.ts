import { UserAnswers, ProfileType } from '../types';

export const calculateProfile = (answers: UserAnswers): ProfileType => {
  const { financialState, goals } = answers;

  // Logic Matrix
  if (financialState === 'Desorganizada e preocupante' || financialState === 'Sobrevivendo mês a mês') {
    return 'Desorganização Estrutural';
  }

  if (financialState === 'Estável mas sem crescimento') {
    if (goals === 'Não tenho metas definidas' || goals === 'Tenho metas mas não sei como alcançar') {
      return 'Potencial Travado';
    }
    return 'Executor Sem Direção';
  }

  if (financialState === 'Organizada mas quero evoluir') {
    if (goals === 'Tenho metas e estratégia definida') {
      return 'Estruturado em Evolução';
    }
    return 'Executor Sem Direção';
  }

  if (financialState === 'Muito bem estruturada') {
    return 'Estruturado em Evolução';
  }

  // Fallback
  return 'Potencial Travado';
};

export const generateReportText = (answers: UserAnswers, profile: ProfileType): string => {
  const { profession, mainProblem, spouse, children, otherDependents, otherDependentsCount } = answers;
  
  const hasSpouse = spouse === 'Cônjuge';
  const hasChildren = children !== 'Não possuo filhos' && children !== '';
  const hasOther = otherDependents === 'Possuo outros dependentes';

  const hasDependents = hasSpouse || hasChildren || hasOther;
  let dependentText = "Mesmo que você sinta que suas finanças são apenas suas,";
  
  if (hasDependents) {
    const parts = [];
    if (hasSpouse) parts.push('Cônjuge');
    if (hasChildren) parts.push(children);
    
    const depList = parts.join(', ');
    const count = otherDependentsCount || 0;
    const others = hasOther ? ` e mais ${count} ${count === 1 ? 'dependente' : 'dependentes'}` : '';
    
    let combined = depList;
    if (depList && others) {
        combined = `${depList}${others}`;
    } else if (others) {
        // If only others, remove " e mais " prefix if it feels weird, or keep it?
        // "Considerando sua responsabilidade familiar ( e mais 2 dependentes)..." -> weird.
        // "Considerando sua responsabilidade familiar (2 dependentes)..." -> better.
        combined = `${count} ${count === 1 ? 'dependente' : 'dependentes'}`;
    }

    dependentText = `Considerando sua responsabilidade familiar (${combined}), a necessidade de segurança é multiplicada.`;
  }

  let intro = `Na sua realidade como <span class="text-gold-400 font-semibold">${profession}</span>, é comum que a rotina absorva o tempo de gestão estratégica.`;
  
  // Specific tweaks based on profession keywords (simple heuristic)
  const profLower = profession.toLowerCase();
  if (profLower.includes('médic') || profLower.includes('advogad') || profLower.includes('engenheir') || profLower.includes('ti') || profLower.includes('dev')) {
    intro = `Na sua realidade como <span class="text-gold-400 font-semibold">${profession}</span>, você provavelmente tem uma alta capacidade de geração de receita, mas a complexidade do dia a dia pode estar drenando sua eficiência financeira.`;
  } else if (profLower.includes('servidor') || profLower.includes('públic')) {
    intro = `Na sua realidade como <span class="text-gold-400 font-semibold">${profession}</span>, a estabilidade da sua renda é sua maior vantagem estratégica, mas sem um plano ativo, ela pode se tornar uma armadilha de estagnação.`;
  }

  let problemAddress = `Você mencionou que <span class="italic text-white">"${mainProblem}"</span> é seu maior desafio hoje.`;
  
  let profileExplanation = "";

  switch (profile) {
    case 'Desorganização Estrutural':
      profileExplanation = "Isso indica que, apesar de gerar renda, o dinheiro está escapando por falhas no sistema básico de controle. O fluxo de caixa está invertido ou neutro, impedindo a construção de patrimônio real.";
      break;
    case 'Potencial Travado':
      profileExplanation = "Você tem a base: ganha o suficiente para estar melhor. O problema não é a falta de dinheiro, mas a falta de um 'motor' de multiplicação. Seu dinheiro está estacionado ou rendendo menos do que a inflação real do seu estilo de vida.";
      break;
    case 'Executor Sem Direção':
      profileExplanation = "Você é proativo e tenta resolver, mas a energia está dispersa. Fazer muito sem uma direção clara gera cansaço financeiro e resultados medíocres a longo prazo. Falta alinhamento estratégico.";
      break;
    case 'Estruturado em Evolução':
      profileExplanation = "Você já superou a fase de sobrevivência. Agora, o jogo é sobre otimização fiscal, blindagem patrimonial e investimentos de alta performance. O erro aqui custa mais caro.";
      break;
  }

  return `
    <p class="mb-4">${intro}</p>
    <p class="mb-4">${problemAddress} ${profileExplanation}</p>
    <p class="mb-4">${dependentText}</p>
    <p class="mb-4">A boa notícia é: com as ferramentas certas e um plano estruturado, é totalmente possível resolver esse desafio e evoluir com segurança. Seu cenário tem solução clara, desde que deixemos de tratar o sintoma e foquemos na causa raiz.</p>
  `;
};