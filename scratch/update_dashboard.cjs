const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inserir a função renderLeadProductPaymentSection
const targetFunctionAnchor = `    const sortedLeads = [...filteredLeads].sort((a, b) => {
        const priorityA = statusPriority[a.status || 'Verificar'] || 2;
        const priorityB = statusPriority[b.status || 'Verificar'] || 2;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });`;

const functionInsertion = `

    const renderLeadProductPaymentSection = (
        title: string,
        packageId: string | undefined,
        vistaLabel: string | undefined,
        parceladoLabel: string | undefined,
        momentKey: 'consultoria' | 'especial' | 'entrada'
    ) => {
        const leadFormType = selectedLead!.answers?.formType || 'personal';
        const finalPackageId = packageId || 
            (pricingPackages.find(p => p.presentation_type === leadFormType && p.product_moment === momentKey)?.id || '');
        
        const currentPkg = pricingPackages.find(p => p.id === finalPackageId);
        
        let options = currentPkg ? currentPkg.payment_options : [];
        if (momentKey === 'consultoria' && options.length === 0 && !packageId) {
            options = STATIC_PAYMENT_OPTIONS;
        }

        const activeOptions = options.filter(o => o && o.description && o.description.trim() !== '');

        return (
            <div className="bg-dark-900/40 p-4 rounded-xl border border-dark-800 space-y-3 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-800/60 pb-2">
                    <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h5>
                        <p className="text-[10px] text-gray-500 font-semibold">
                            Pacote: <span className="text-gold-500 font-bold">{currentPkg ? \`\${currentPkg.name} (\${currentPkg.value})\` : 'Padrão (R$ 597)'}</span>
                        </p>
                    </div>
                </div>

                {activeOptions.length === 0 ? (
                    <p className="text-xs text-gray-500 font-medium">Nenhuma forma de pagamento cadastrada para este pacote.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeOptions.map((option, idx) => {
                            const isVistaSelected = vistaLabel && option.label === vistaLabel;
                            const isParceladoSelected = parceladoLabel && option.label === parceladoLabel;
                            const uniqueIdx = \`\${momentKey}_\${option.label}_\${idx}\`;

                            const isStructured = !!(option.value || (option.installments && option.installmentValue));
                            
                            let displayValue = "";
                            if (option.installments && option.installmentValue) {
                                displayValue = \`\${option.installments}x de \${option.installmentValue}\`;
                            } else if (option.value) {
                                displayValue = option.value;
                            } else {
                                displayValue = option.description;
                            }

                            const displayDescription = isStructured ? option.description : "Opção de Pagamento";

                            return (
                                <div key={uniqueIdx} className={\`bg-dark-950/50 rounded-lg border transition-all overflow-hidden flex flex-col justify-between \${
                                    isVistaSelected || isParceladoSelected 
                                        ? 'border-gold-500/30 shadow-md shadow-gold-500/5' 
                                        : 'border-dark-800 hover:border-gold-500/10'
                                }\`}>
                                    <div className="p-3 flex items-start gap-2.5">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold-500/10 text-gold-500 font-bold text-[10px] shrink-0 border border-gold-500/20 font-mono">
                                            {option.label}
                                        </span>
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <span className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase block truncate" title={displayDescription}>
                                                {displayDescription}
                                            </span>
                                            
                                            {/* Valor Estruturado Cadastrado em Destaque */}
                                            <div className="text-sm font-extrabold text-gold-400 font-sans">
                                                {displayValue}
                                            </div>

                                            <div className="flex gap-1 flex-wrap pt-0.5">
                                                {isVistaSelected && (
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-black uppercase tracking-wider">
                                                        À Vista Selecionado
                                                    </span>
                                                )}
                                                {isParceladoSelected && (
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-black uppercase tracking-wider">
                                                        Parcelado Selecionado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-dark-950/80 border-t border-dark-800/40">
                                        <span className="text-[9px] text-gray-500 truncate max-w-[120px] md:max-w-xs">{option.link || 'Sem link (Maquininha)'}</span>
                                        {option.link && (
                                            <button
                                                onClick={() => {
                                                    const copyIdxOffset = momentKey === 'especial' ? 10 : momentKey === 'entrada' ? 20 : 0;
                                                    handleCopyLink(option.link, idx + copyIdxOffset);
                                                }}
                                                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-dark-800 hover:bg-dark-750 text-gold-500 hover:text-gold-400 rounded transition-colors border border-dark-700 cursor-pointer"
                                                title="Copiar link"
                                            >
                                                {copiedIndex === idx + (momentKey === 'especial' ? 10 : momentKey === 'entrada' ? 20 : 0) ? (
                                                    <>
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                                                        <span className="text-green-500 text-[8px]">Copiado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-2.5 h-2.5" />
                                                        <span className="text-[8px]">Copiar</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }; Regular expression representation of the anchor.`;

// Para simplificar e evitar problemas de CRLF vs LF ao ler o arquivo original,
// normalizamos tudo para LF antes de fazer o replace
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedAnchor = targetFunctionAnchor.replace(/\r\n/g, '\n');

if (!normalizedContent.includes(normalizedAnchor)) {
    console.error('Erro: Âncora da função de ordenação não encontrada!');
    process.exit(1);
}

// Fazer o replace usando as strings de quebras normalizadas
let updatedContent = normalizedContent.replace(normalizedAnchor, normalizedAnchor + functionInsertion.replace(/ Regular expression representation of the anchor\.$/, ''));

// 2. Substituir o bloco de Opções de Pagamento antigo pelo novo
const targetPricingBlock = `                                                        {/* Bloco de Opções de Pagamento */}
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
                                                        </div>`;

const newPricingBlock = `                                                        {/* Bloco de Opções de Pagamento */}
                                                        <div className="bg-dark-850 p-6 rounded-xl border border-dark-800 space-y-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <CreditCard className="w-4 h-4 text-gold-500" />
                                                                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 font-sans">Opções de Pagamento</h4>
                                                                </div>

                                                                {/* Botão Ajustar Produtos sem o dropdown */}
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => setSelectedPricingLead(selectedLead)}
                                                                        className="px-4 py-2 bg-gradient-to-r from-gold-600 via-amber-500 to-gold-500 hover:from-gold-500 hover:via-amber-400 hover:to-gold-400 text-black text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 border-none font-sans"
                                                                        title="Editar detalhadamente cada produto de preços da apresentação"
                                                                    >
                                                                        <Edit className="w-3.5 h-3.5 text-black font-bold" />
                                                                        Ajustar Produtos
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {(() => {
                                                                const hasPricingConfigured = !!selectedLead.answers?.pricingSelections && (
                                                                    !!selectedLead.answers.pricingSelections.consultoriaPackageId ||
                                                                    !!selectedLead.answers.pricingSelections.especialPackageId ||
                                                                    !!selectedLead.answers.pricingSelections.entradaPackageId
                                                                );

                                                                if (!hasPricingConfigured) {
                                                                    return (
                                                                        <div className="bg-dark-900/40 rounded-xl border border-dashed border-gold-500/20 p-8 text-center flex flex-col items-center justify-center space-y-3">
                                                                            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/25">
                                                                                <AlertCircle className="w-6 h-6 text-gold-400" />
                                                                            </div>
                                                                            <div className="max-w-md">
                                                                                <h5 className="text-sm font-bold text-white mb-1">Precificação não configurada</h5>
                                                                                <p className="text-xs text-gray-400 leading-relaxed font-light">
                                                                                    Nenhuma precificação foi configurada para a apresentação deste lead ainda. Clique no botão <strong className="text-gold-400 font-semibold">Ajustar Produtos</strong> acima para configurar os pacotes de preços e as formas de pagamento.
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className="space-y-4">
                                                                        {renderLeadProductPaymentSection(
                                                                            "1. Consultoria Estruturada",
                                                                            selectedLead.answers.pricingSelections?.consultoriaPackageId,
                                                                            selectedLead.answers.pricingSelections?.consultoriaVista,
                                                                            selectedLead.answers.pricingSelections?.consultoriaParcelado,
                                                                            'consultoria'
                                                                        )}

                                                                        {renderLeadProductPaymentSection(
                                                                            "2. Condição Especial (Produto Alternativo)",
                                                                            selectedLead.answers.pricingSelections?.especialPackageId,
                                                                            selectedLead.answers.pricingSelections?.especialVista,
                                                                            selectedLead.answers.pricingSelections?.especialParcelado,
                                                                            'especial'
                                                                        )}

                                                                        {renderLeadProductPaymentSection(
                                                                            "3. Produto de Entrada (Downsell)",
                                                                            selectedLead.answers.pricingSelections?.entradaPackageId,
                                                                            selectedLead.answers.pricingSelections?.entradaVista,
                                                                            selectedLead.answers.pricingSelections?.entradaParcelado,
                                                                            'entrada'
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>`;

const normalizedTargetBlock = targetPricingBlock.replace(/\r\n/g, '\n');
const normalizedNewBlock = newPricingBlock.replace(/\r\n/g, '\n');

if (!updatedContent.includes(normalizedTargetBlock)) {
    console.error('Erro: Bloco de precificação original não encontrado!');
    process.exit(1);
}

updatedContent = updatedContent.replace(normalizedTargetBlock, normalizedNewBlock);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('AdminDashboard.tsx atualizado com sucesso via script CommonJS!');
