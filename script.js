const SENHA_ADMIN = '65186518';

// Defina aqui o número de WhatsApp do estabelecimento (com DDD) para receber os pedidos de entrega
const WHATSAPP_ESTABELECIMENTO = '22999392176';

// Tabela de Bairros e Taxas de Entrega
const TABELA_BAIRROS = [
    { nome: 'Centro', taxa: 5.00 },
    { nome: 'Parque Rosário', taxa: 7.00 },
    { nome: 'Caju', taxa: 6.00 },
    { nome: 'Pelinca', taxa: 8.00 },
    { nome: 'Jockey Clube', taxa: 10.00 },
    { nome: 'Goitacazes', taxa: 12.00 }
];

let CARDAPIO = [
    // ESPETINHOS
    { id: 'espeto-carne', nome: 'Carne', preco: 7.00, custo: 3.50, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-frango', nome: 'Frango', preco: 5.00, custo: 2.50, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-salcichao', nome: 'Salcichão', preco: 5.00, custo: 2.20, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-kafta-queijo', nome: 'Kafta c/ queijo', preco: 10.00, custo: 4.80, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-kafta-comum', nome: 'Kafta comum', preco: 6.00, custo: 3.00, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-queijo', nome: 'Queijo', preco: 10.00, custo: 4.50, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-queijo-goiaba', nome: 'Queijo com goiaba', preco: 11.00, custo: 5.00, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-coracao', nome: 'Coração', preco: 7.00, custo: 3.20, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-medalhao-frango', nome: 'Medalhão de frango', preco: 10.00, custo: 4.50, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-misto', nome: 'Misto', preco: 6.00, custo: 3.00, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-calabresa', nome: 'Calabresa', preco: 5.00, custo: 2.30, categoria: 'Espetinhos', icone: 'flame' },
    { id: 'espeto-cofriu', nome: 'Cofriu', preco: 7.00, custo: 3.50, categoria: 'Espetinhos', icone: 'flame' },

    // ADICIONAIS
    { id: 'adc-molho-farofa', nome: 'Molho e farofa', preco: 3.00, custo: 1.00, categoria: 'Adicionais', icone: 'plus-circle' },
    { id: 'adc-molho-farofa-arroz', nome: 'Molho, farofa e arroz', preco: 6.00, custo: 2.20, categoria: 'Adicionais', icone: 'plus-circle' },

    // BEBIDAS
    { id: 'beb-cerveja-lata', nome: 'Cerveja Lata', preco: 6.00, custo: 3.60, categoria: 'Bebidas', icone: 'beer' },
    { id: 'beb-cerveja-600', nome: 'Cerveja 600ml', preco: 12.00, custo: 7.50, categoria: 'Bebidas', icone: 'beer' },
    { id: 'beb-refri-lata', nome: 'Refrigerante Lata', preco: 6.00, custo: 3.20, categoria: 'Bebidas', icone: 'cup-soda' },
    { id: 'beb-refri-2l', nome: 'Refrigerante 2L', preco: 12.00, custo: 7.00, categoria: 'Bebidas', icone: 'cup-soda' },
    { id: 'beb-agua-sem-gas', nome: 'Água s/ Gás', preco: 3.00, custo: 1.20, categoria: 'Bebidas', icone: 'droplet' },
    { id: 'beb-agua-com-gas', nome: 'Água c/ Gás', preco: 4.00, custo: 1.60, categoria: 'Bebidas', icone: 'droplet' }
];

let comandas = [];
let comandaAtivaId = null;
let filtroAtual = 'todas';
let categoriasAbertas = { 'Espetinhos': true, 'Adicionais': true, 'Bebidas': true };

window.onload = function() {
    carregarComandasStorage();
    renderizarCardapio();
    renderizarComandaAtual();
    renderizarComandasSalvas();
    carregarOpcoesBairros();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};

function carregarOpcoesBairros() {
    const select = document.getElementById('selectBairro');
    if (!select) return;
    
    let html = '<option value="">Selecione o bairro...</option>';
    TABELA_BAIRROS.forEach(b => {
        html += `<option value="${b.nome}" data-taxa="${b.taxa}">${b.nome} - R$ ${b.taxa.toFixed(2).replace('.', ',')}</option>`;
    });
    select.innerHTML = html;
}

function atualizarTaxaPorBairro() {
    const select = document.getElementById('selectBairro');
    const inputTaxa = document.getElementById('inputTaxaEntrega');
    if (!select || !inputTaxa) return;

    const selectedOption = select.options[select.selectedIndex];
    const taxa = selectedOption.getAttribute('data-taxa');

    if (taxa) {
        inputTaxa.value = parseFloat(taxa).toFixed(2);
    } else {
        inputTaxa.value = '0.00';
    }
}

function salvarComandasStorage() {
    localStorage.setItem('amado_espeto_comandas', JSON.stringify(comandas));
}

function carregarComandasStorage() {
    const dados = localStorage.getItem('amado_espeto_comandas');
    if (dados) {
        try { comandas = JSON.parse(dados); } catch(e) { comandas = []; }
    }
}

function toggleCategoria(catNome) {
    categoriasAbertas[catNome] = !categoriasAbertas[catNome];
    renderizarCardapio();
}

function renderizarCardapio(itensFiltrados = CARDAPIO) {
    const container = document.getElementById('containerCardapio');
    if (!container) return;

    const buscaAtiva = document.getElementById('inputBuscaCardapio')?.value.trim() !== '';

    if (itensFiltrados.length === 0) {
        container.innerHTML = `<div class="py-8 text-center text-zinc-500"><p class="text-xs">Nenhum item encontrado.</p></div>`;
        return;
    }

    const categorias = {};
    itensFiltrados.forEach(prod => {
        if (!categorias[prod.categoria]) categorias[prod.categoria] = [];
        categorias[prod.categoria].push(prod);
    });

    container.innerHTML = Object.keys(categorias).map(catNome => {
        const produtosDaCat = categorias[catNome];
        const estaAberta = buscaAtiva || !!categoriasAbertas[catNome];

        return `
            <div class="border border-zinc-700/85 rounded-xl overflow-hidden bg-zinc-900/60">
                <button 
                    type="button"
                    onclick="toggleCategoria('${catNome}')"
                    class="w-full bg-zinc-800 hover:bg-zinc-700 p-3.5 text-left font-extrabold text-zinc-100 flex items-center justify-between transition-colors border-b border-zinc-700/50"
                >
                    <div class="flex items-center gap-2">
                        <span class="text-base sm:text-lg font-black text-amber-400">${catNome}</span>
                        <span class="text-xs font-bold bg-red-900/60 text-red-300 border border-red-700/50 px-2.5 py-0.5 rounded-full">${produtosDaCat.length}</span>
                    </div>
                    <i data-lucide="${estaAberta ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-zinc-400"></i>
                </button>

                ${estaAberta ? `
                    <div class="p-2.5 space-y-2.5 bg-zinc-900/40">
                        ${produtosDaCat.map(prod => `
                            <button 
                                type="button"
                                onclick="adicionarProdutoComanda('${prod.id}')"
                                class="group w-full bg-zinc-800 hover:bg-red-950/40 border border-zinc-700 hover:border-amber-500/50 rounded-xl p-3 text-left transition-all active:scale-[0.98] flex items-center justify-between shadow-xs"
                            >
                                <div class="flex items-center gap-3 min-w-0 pr-2">
                                    <div class="bg-zinc-900 p-2.5 rounded-xl border border-zinc-700 text-red-500 group-hover:text-amber-400 flex-shrink-0">
                                        <i data-lucide="${prod.icone || 'flame'}" class="w-6 h-6"></i>
                                    </div>
                                    <div class="min-w-0">
                                        <h3 class="font-black text-zinc-100 text-base sm:text-lg group-hover:text-amber-400 transition-colors truncate">${prod.nome}</h3>
                                        <p class="text-sm text-amber-400 font-extrabold mt-0.5">${formatarMoeda(prod.preco)}</p>
                                    </div>
                                </div>
                                <div class="bg-zinc-700 group-hover:bg-red-600 text-zinc-200 group-hover:text-white p-2.5 rounded-xl transition-colors flex-shrink-0">
                                    <i data-lucide="plus" class="w-5 h-5"></i>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function filtrarCardapio() {
    const inputBusca = document.getElementById('inputBuscaCardapio');
    if (!inputBusca) return;
    const termo = inputBusca.value.toLowerCase().trim();
    if (!termo) { renderizarCardapio(CARDAPIO); return; }
    const filtrados = CARDAPIO.filter(item => item.nome.toLowerCase().includes(termo) || item.categoria.toLowerCase().includes(termo));
    renderizarCardapio(filtrados);
}

function alternarTipoPedidoForm(tipo) {
    const boxEntrega = document.getElementById('boxCamposEntrega');
    const boxTelefone = document.getElementById('boxCampoTelefone');
    const inputTel = document.getElementById('inputTelefone');

    if (tipo === 'Entrega / WhatsApp') {
        if (boxEntrega) boxEntrega.classList.remove('hidden');
        if (boxTelefone) boxTelefone.classList.remove('hidden');
        if (inputTel) inputTel.required = true;
    } else {
        if (boxEntrega) boxEntrega.classList.add('hidden');
        if (boxTelefone) boxTelefone.classList.add('hidden');
        if (inputTel) {
            inputTel.required = false;
            inputTel.value = '';
        }
    }
}

function handleAbrirComanda(e) {
    if (e) e.preventDefault();
    const inputNome = document.getElementById('inputNome');
    const inputTelefone = document.getElementById('inputTelefone');
    const tipoPedidoEl = document.querySelector('input[name="tipoPedido"]:checked');
    const tipoPedido = tipoPedidoEl ? tipoPedidoEl.value : 'Consumo no Local';
    
    const inputEndereco = document.getElementById('inputEndereco');
    const selectBairro = document.getElementById('selectBairro');
    const inputTaxaEntrega = document.getElementById('inputTaxaEntrega');

    if (!inputNome) return;
    const nomeStr = inputNome.value.trim();
    const telStr = inputTelefone ? inputTelefone.value.trim() : '';

    if (!nomeStr) {
        alert('⚠️ Por favor, digite o Nome do Cliente ou Mesa!');
        inputNome.focus();
        return;
    }

    if (tipoPedido === 'Entrega / WhatsApp') {
        if (!telStr) {
            alert('⚠️ O número de WhatsApp é obrigatório para pedidos de entrega!');
            if (inputTelefone) inputTelefone.focus();
            return;
        }
        if (selectBairro && !selectBairro.value) {
            alert('⚠️ Por favor, selecione o bairro para calcular a taxa de entrega!');
            selectBairro.focus();
            return;
        }
    }

    let comandaExistente = comandas.find(c => c.nome.toLowerCase() === nomeStr.toLowerCase() && c.status === 'aberta');

    if (comandaExistente) {
        comandaAtivaId = comandaExistente.id;
    } else {
        const proximoNumero = comandas.length + 101;
        const novaComanda = {
            id: 'cmd-' + Date.now(),
            ficha: proximoNumero,
            nome: nomeStr,
            telefone: telStr,
            tipoPedido: tipoPedido,
            endereco: tipoPedido === 'Entrega / WhatsApp' ? (inputEndereco?.value || '') : '',
            bairro: tipoPedido === 'Entrega / WhatsApp' ? (selectBairro?.value || '') : '',
            taxaEntrega: tipoPedido === 'Entrega / WhatsApp' ? (parseFloat(inputTaxaEntrega?.value) || 0) : 0,
            itens: [],
            status: 'aberta',
            pagamento: 'Pendente',
            dataCriacao: new Date().toISOString()
        };
        comandas.unshift(novaComanda);
        comandaAtivaId = novaComanda.id;
    }

    salvarComandasStorage();
    renderizarComandaAtual();
    renderizarComandasSalvas();

    inputNome.value = '';
    if (inputTelefone) inputTelefone.value = '';
    if (inputEndereco) inputEndereco.value = '';
    if (selectBairro) selectBairro.value = '';
    if (inputTaxaEntrega) inputTaxaEntrega.value = '0.00';
}

function adicionarProdutoComanda(idProduto) {
    if (!comandaAtivaId) {
        alert('⚠️ ATENÇÃO: Por favor, digite o "Nome do Cliente / Mesa" acima e clique em "Abrir Comanda" antes de escolher os itens!');
        
        const inputNome = document.getElementById('inputNome');
        if (inputNome) {
            inputNome.focus();
            inputNome.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    const comanda = comandas.find(c => c.id === comandaAtivaId);
    if (!comanda || comanda.status === 'finalizada') {
        alert('Esta comanda já foi finalizada. Abra uma nova comanda para continuar.');
        return;
    }

    const itemExistente = comanda.itens.find(i => i.idProduto === idProduto);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        comanda.itens.push({ idProduto: idProduto, quantidade: 1 });
    }

    salvarComandasStorage();
    renderizarComandaAtual();
    renderizarComandasSalvas();
}

function alterarQuantidadeItem(idProduto, delta) {
    if (!comandaAtivaId) return;
    const comanda = comandas.find(c => c.id === comandaAtivaId);
    if (!comanda || comanda.status === 'finalizada') return;

    const idx = comanda.itens.findIndex(i => i.idProduto === idProduto);
    if (idx !== -1) {
        comanda.itens[idx].quantidade += delta;
        if (comanda.itens[idx].quantidade <= 0) comanda.itens.splice(idx, 1);
    }

    salvarComandasStorage();
    renderizarComandaAtual();
    renderizarComandasSalvas();
}

function atualizarPagamentoComanda(valor) {
    if (!comandaAtivaId) return;
    const comanda = comandas.find(c => c.id === comandaAtivaId);
    if (comanda) {
        comanda.pagamento = valor;
        salvarComandasStorage();
        renderizarComandasSalvas();
    }
}

function renderizarComandaAtual() {
    const header = document.getElementById('headerComandaAtual');
    const containerItens = document.getElementById('containerItensComanda');
    const txtTotal = document.getElementById('txtTotalComanda');
    const acoes = document.getElementById('acoesComandaAtual');
    const badgeStatus = document.getElementById('badgeStatusAtual');
    const boxPagamento = document.getElementById('boxFormaPagamento');
    const selectPagamento = document.getElementById('selectFormaPagamento');
    const txtBtnWhatsApp = document.getElementById('txtBtnWhatsApp');

    if (!header || !containerItens || !txtTotal) return;

    const comanda = comandas.find(c => c.id === comandaAtivaId);

    if (!comanda) {
        header.innerHTML = `<p class="text-zinc-500 text-sm italic">Nenhuma comanda aberta no momento.</p>`;
        containerItens.innerHTML = `<div class="h-40 flex flex-col items-center justify-center text-zinc-500 gap-2"><i data-lucide="shopping-bag" class="w-8 h-8 opacity-40"></i><p class="text-xs text-center">Informe o nome e abra uma comanda.</p></div>`;
        txtTotal.innerText = 'R$ 0,00';
        if (acoes) acoes.classList.add('hidden');
        if (boxPagamento) boxPagamento.classList.add('hidden');
        if (badgeStatus) badgeStatus.classList.add('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    const isEntrega = comanda.tipoPedido === 'Entrega / WhatsApp';
    const bairroNome = comanda.bairro || 'Bairro';

    if (txtBtnWhatsApp) {
        txtBtnWhatsApp.innerText = isEntrega ? 'Enviar Pedido via WhatsApp' : 'Notificar Cliente via WhatsApp';
    }

    header.innerHTML = `
        <div>
            <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md uppercase">Ficha #${comanda.ficha || '101'}</span>
                <span class="text-xs font-bold ${isEntrega ? 'bg-red-950 text-red-300 border border-red-700/50' : 'bg-zinc-700 text-zinc-200'} px-2 py-0.5 rounded-md">${comanda.tipoPedido || 'Consumo no Local'}</span>
            </div>
            <h3 class="text-2xl font-black text-amber-400 mt-1">${escapeHtml(comanda.nome)}</h3>
            ${comanda.telefone ? `<p class="text-xs font-bold text-zinc-400 mt-0.5">📱 Whats: ${escapeHtml(comanda.telefone)}</p>` : ''}
            ${isEntrega && comanda.endereco ? `<p class="text-xs font-semibold text-red-300 mt-1">🏠 ${escapeHtml(comanda.endereco)} -${escapeHtml(bairroNome)}</p>` : ''}
            ${isEntrega && comanda.taxaEntrega > 0 ? `<p class="text-xs font-bold text-amber-400 mt-0.5">🛵 Taxa Motoboy (${escapeHtml(bairroNome)}):${formatarMoeda(comanda.taxaEntrega)}</p>` : ''}
        </div>
    `;

    if (badgeStatus) {
        badgeStatus.classList.remove('hidden');
        if (comanda.status === 'aberta') {
            badgeStatus.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/50';
            badgeStatus.innerText = 'Aberta';
        } else {
            badgeStatus.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50';
            badgeStatus.innerText = 'Finalizada';
        }
    }

    if (selectPagamento) selectPagamento.value = comanda.pagamento || 'Pendente';

    if (comanda.itens.length === 0) {
        containerItens.innerHTML = `<div class="h-36 flex flex-col items-center justify-center text-zinc-500 gap-2"><p class="text-xs text-center">Comanda vazia. Clique nos itens do cardápio.</p></div>`;
    } else {
        containerItens.innerHTML = comanda.itens.map(item => {
            const prod = CARDAPIO.find(p => p.id === item.idProduto) || { nome: 'Item Desconhecido', preco: 0 };
            const totalItem = prod.preco * item.quantidade;

            return `
                <div class="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700/60 rounded-xl gap-2">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-black text-zinc-100 truncate">${prod.nome}</p>
                        <p class="text-xs text-zinc-400">${item.quantidade}x ${formatarMoeda(prod.preco)} = <strong class="text-amber-400">${formatarMoeda(totalItem)}</strong></p>
                    </div>
                    
                    ${comanda.status === 'aberta' ? `
                        <div class="flex items-center gap-1.5">
                            <button type="button" onclick="alterarQuantidadeItem('${item.idProduto}', -1)" class="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 active:scale-95 text-zinc-100 font-black flex items-center justify-center text-base">-</button>
                            <span class="w-6 text-center text-sm font-black text-amber-400">${item.quantidade}</span>
                            <button type="button" onclick="alterarQuantidadeItem('${item.idProduto}', 1)" class="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 active:scale-95 text-zinc-100 font-black flex items-center justify-center text-base">+</button>
                        </div>
                    ` : `<span class="text-xs font-bold bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">${item.quantidade}x</span>`}
                </div>
            `;
        }).join('');
    }

    txtTotal.innerText = formatarMoeda(calcularTotalComanda(comanda));
    if (acoes) acoes.classList.remove('hidden');
    if (boxPagamento) boxPagamento.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function salvarComandaAtual() {
    if (!comandaAtivaId) return;
    const comanda = comandas.find(c => c.id === comandaAtivaId);
    if (!comanda) return;

    const selectPag = document.getElementById('selectFormaPagamento');
    if (!comanda.pagamento || comanda.pagamento === 'Pendente') {
        if (selectPag) {
            selectPag.focus();
            selectPag.scrollIntoView({ behavior: 'smooth', block: 'center' });
            selectPag.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => selectPag.classList.remove('ring-2', 'ring-red-500'), 2000);
        }
        mostrarNotificacao('⚠️ Preencha esse campo (Forma de Pagamento)!');
        return;
    }

    salvarComandasStorage();
    renderizarComandasSalvas();
    mostrarNotificacao('Comanda salva com sucesso!');

    // Se for Entrega, envia automaticamente o pedido para o WhatsApp do Espeto ao salvar
    const isEntrega = comanda.tipoPedido === 'Entrega / WhatsApp';
    if (isEntrega) {
        if (comanda.itens.length === 0) {
            mostrarNotificacao('Adicione produtos na comanda primeiro.');
            return;
        }

        let msg = `🔥 *AMADO ESPETO*\n`;
        msg += `📍 *Pedido #${comanda.ficha || '101'} - ${comanda.nome}*\n`;
        msg += `📌 *Tipo:* ${comanda.tipoPedido}\n`;
        msg += `📱 *WhatsApp do Cliente:* ${comanda.telefone || 'Não informado'}\n`;
        msg += `🏠 *Endereço:* ${comanda.endereco || 'Não informado'} - Bairro: ${comanda.bairro || 'Não informado'}\n`;
        
        msg += `\n*Resumo do Pedido:*\n`;

        comanda.itens.forEach(i => {
            const prod = CARDAPIO.find(p => p.id === i.idProduto);
            if (prod) msg += `• ${i.quantidade}x ${prod.nome} (${formatarMoeda(prod.preco * i.quantidade)})\n`;
        });

        if (comanda.taxaEntrega > 0) {
            msg += `🛵 *Taxa de Entrega (${comanda.bairro || ''}):* ${formatarMoeda(comanda.taxaEntrega)}\n`;
        }

        msg += `\n💰 *Total Geral:* ${formatarMoeda(calcularTotalComanda(comanda))}\n`;
        msg += `💳 *Pagamento:* ${comanda.pagamento}\n`;
        msg += `\n_Pedido realizado pelo site._`;

        let numTel = WHATSAPP_ESTABELECIMENTO.replace(/\D/g, '');
        if (numTel && !numTel.startsWith('55')) numTel = '55' + numTel;

        const url = `https://api.whatsapp.com/send?phone=${numTel}&text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }
}

function finalizarComandaAtual() {
    if (!comandaAtivaId) return;
    const comanda = comandas.find(c => c.id === comandaAtivaId);
    if (!comanda) return;

    const selectPag = document.getElementById('selectFormaPagamento');
    if (!comanda.pagamento || comanda.pagamento === 'Pendente') {
        if (selectPag) {
            selectPag.focus();
            selectPag.scrollIntoView({ behavior: 'smooth', block: 'center' });
            selectPag.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => selectPag.classList.remove('ring-2', 'ring-red-500'), 2000);
        }
        mostrarNotificacao('⚠️ Preencha esse campo (Forma de Pagamento)!');
        return;
    }

    comanda.status = 'finalizada';
    salvarComandasStorage();
    renderizarComandaAtual();
    renderizarComandasSalvas();
    mostrarNotificacao(`Comanda de ${comanda.nome} finalizada com sucesso!`);
}

function enviarWhatsAppComanda() {
    if (!comandaAtivaId) return;
    const comanda = comandas.find(c => c.id === comandaAtivaId);
    if (!comanda || comanda.itens.length === 0) {
        mostrarNotificacao('Adicione produtos na comanda primeiro.');
        return;
    }

    const isEntrega = comanda.tipoPedido === 'Entrega / WhatsApp';

    let msg = `🔥 *AMADO ESPETO*\n`;
    msg += `📍 *Pedido #${comanda.ficha || '101'} - ${comanda.nome}*\n`;
    msg += `📌 *Tipo:* ${comanda.tipoPedido}\n`;
    
    if (isEntrega) {
        msg += `📱 *WhatsApp do Cliente:* ${comanda.telefone || 'Não informado'}\n`;
        msg += `🏠 *Endereço:* ${comanda.endereco || 'Não informado'} - Bairro: ${comanda.bairro || 'Não informado'}\n`;
    }
    
    msg += `\n*Resumo do Pedido:*\n`;

    comanda.itens.forEach(i => {
        const prod = CARDAPIO.find(p => p.id === i.idProduto);
        if (prod) msg += `• ${i.quantidade}x ${prod.nome} (${formatarMoeda(prod.preco * i.quantidade)})\n`;
    });

    if (isEntrega && comanda.taxaEntrega > 0) {
        msg += `🛵 *Taxa de Entrega (${comanda.bairro || ''}):* ${formatarMoeda(comanda.taxaEntrega)}\n`;
    }

    msg += `\n💰 *Total Geral:* ${formatarMoeda(calcularTotalComanda(comanda))}\n`;
    msg += `💳 *Pagamento:* ${comanda.pagamento || 'Pendente'}\n`;

    let numDestino = '';

    if (isEntrega) {
        // Envia direto para o WhatsApp do estabelecimento (Amado Espeto)
        numDestino = WHATSAPP_ESTABELECIMENTO;
        msg += `\n_Pedido realizado pelo site._`;
    } else {
        // Envia para o cliente (caso tenha cadastrado)
        if (!comanda.telefone) {
            alert('⚠️ Esta comanda presencial não possui número de WhatsApp do cliente.');
            return;
        }
        numDestino = comanda.telefone;
        msg += `\nObrigado pela preferência! Volte sempre! ❤️`;
    }

    let numTel = numDestino.replace(/\D/g, '');
    if (numTel && !numTel.startsWith('55')) numTel = '55' + numTel;

    const url = `https://api.whatsapp.com/send?phone=${numTel}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

function reabrirComanda(id) {
    comandaAtivaId = id;
    renderizarComandaAtual();
    const headerEl = document.getElementById('headerComandaAtual');
    if (headerEl) headerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function excluirComanda(id, e) {
    if (e) e.stopPropagation();
    comandas = comandas.filter(c => c.id !== id);
    if (comandaAtivaId === id) comandaAtivaId = null;
    salvarComandasStorage();
    renderizarComandaAtual();
    renderizarComandasSalvas();
    mostrarNotificacao('Comanda excluída.');
}

function filtrarComandas(filtro) {
    filtroAtual = filtro;
    ['Todas', 'Abertas', 'Finalizadas'].forEach(f => {
        const btn = document.getElementById(`btnFiltro${f}`);
        if (!btn) return;
        if (f.toLowerCase().startsWith(filtro.substring(0, 4))) {
            btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 transition-all';
        } else {
            btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-all';
        }
    });
    renderizarComandasSalvas();
}

function renderizarComandasSalvas() {
    const container = document.getElementById('gridComandasSalvas');
    if (!container) return;

    let comandasExibidas = comandas;
    if (filtroAtual === 'aberta') comandasExibidas = comandas.filter(c => c.status === 'aberta');
    else if (filtroAtual === 'finalizada') comandasExibidas = comandas.filter(c => c.status === 'finalizada');

    if (comandasExibidas.length === 0) {
        container.innerHTML = `<div class="col-span-full py-8 text-center text-zinc-500"><p class="text-xs">Nenhuma comanda registrada.</p></div>`;
        return;
    }

    container.innerHTML = comandasExibidas.map(c => {
        const total = calcularTotalComanda(c);
        const isSelecionada = c.id === comandaAtivaId;
        const isAberta = c.status === 'aberta';
        const isEntrega = c.tipoPedido === 'Entrega / WhatsApp';

        return `
            <div 
                onclick="reabrirComanda('${c.id}')"
                class="cursor-pointer border ${isSelecionada ? 'border-amber-500 ring-2 ring-amber-500/20 bg-zinc-900/90' : 'border-zinc-700/80 bg-zinc-900/50 hover:border-zinc-600'} rounded-xl p-3.5 transition-all relative group"
            >
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="text-[10px] font-bold text-amber-400 uppercase">Ficha #${c.ficha || '101'}</span>
                            <span class="text-[9px] font-bold ${isEntrega ? 'bg-red-950 text-red-300 border border-red-800/50' : 'bg-zinc-800 text-zinc-300'} px-1.5 py-0.5 rounded">${c.tipoPedido || 'Local'}</span>
                        </div>
                        <h4 class="font-black text-zinc-100 text-base">${escapeHtml(c.nome)}</h4>
                    </div>
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${isAberta ? 'bg-amber-950 text-amber-300 border border-amber-600/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'}">
                        ${isAberta ? 'aberta' : 'finalizada'}
                    </span>
                </div>

                <p class="text-[11px] text-zinc-400">Pagamento: <strong class="text-zinc-200">${c.pagamento || 'Pendente'}</strong></p>

                <div class="flex justify-between items-end mt-3 pt-2 border-t border-zinc-800">
                    <div>
                        <span class="text-[10px] text-zinc-400 uppercase font-semibold block">Total</span>
                        <span class="text-base font-extrabold text-amber-400">${formatarMoeda(total)}</span>
                    </div>
                    
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="excluirComanda('${c.id}', event)" title="Excluir" class="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                        <span class="text-xs font-bold text-amber-400 flex items-center">Abrir <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function abrirModalAdmin() {
    const modal = document.getElementById('modalAdmin');
    if (modal) modal.classList.remove('hidden');
}

function fecharModalAdmin() {
    const modal = document.getElementById('modalAdmin');
    if (modal) modal.classList.add('hidden');
}

function validarSenhaAdmin() {
    const inputSenha = document.getElementById('inputSenhaAdmin');
    if (!inputSenha) return;
    const pwd = inputSenha.value;
    if (pwd === SENHA_ADMIN) {
        document.getElementById('secLoginAdmin')?.classList.add('hidden');
        document.getElementById('secConteudoAdmin')?.classList.remove('hidden');
        carregarMetricasFinanceiras();
        renderizarListaCustosAdmin();
    } else {
        alert('Senha incorreta!');
    }
}

function carregarMetricasFinanceiras() {
    let totalHoje = 0;
    let totalMes = 0;
    let lucroEstimado = 0;

    const hojeStr = new Date().toLocaleDateString('pt-BR');

    comandas.forEach(c => {
        if (c.status === 'finalizada') {
            const totalComanda = calcularTotalComanda(c);
            totalMes += totalComanda;

            const dataComanda = new Date(c.dataCriacao || Date.now()).toLocaleDateString('pt-BR');
            if (dataComanda === hojeStr) {
                totalHoje += totalComanda;
            }

            c.itens.forEach(i => {
                const prod = CARDAPIO.find(p => p.id === i.idProduto);
                if (prod) {
                    const custoTotalItem = (prod.custo || (prod.preco * 0.5)) * i.quantidade;
                    const vendaTotalItem = prod.preco * i.quantidade;
                    lucroEstimado += (vendaTotalItem - custoTotalItem);
                }
            });
        }
    });

    const lblHoje = document.getElementById('lblVendasHoje');
    const lblMes = document.getElementById('lblVendasMes');
    const lblLucro = document.getElementById('lblLucroEstimado');

    if (lblHoje) lblHoje.innerText = formatarMoeda(totalHoje);
    if (lblMes) lblMes.innerText = formatarMoeda(totalMes);
    if (lblLucro) lblLucro.innerText = formatarMoeda(lucroEstimado);
}

function renderizarListaCustosAdmin() {
    const container = document.getElementById('listaCustosAdmin');
    if (!container) return;

    container.innerHTML = CARDAPIO.map(p => `
        <div class="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs gap-2">
            <span class="font-bold text-zinc-200 w-1/3 truncate">${p.nome}</span>
            <div class="flex items-center gap-2">
                <div>
                    <span class="text-[9px] text-zinc-400 block">Preço (R$)</span>
                    <input type="number" step="0.50" value="${p.preco}" id="preco_${p.id}" class="w-16 bg-zinc-800 border border-zinc-700 text-amber-400 font-bold px-1.5 py-1 rounded text-center">
                </div>
                <div>
                    <span class="text-[9px] text-zinc-400 block">Custo (R$)</span>
                    <input type="number" step="0.50" value="${p.custo || (p.preco * 0.5)}" id="custo_${p.id}" class="w-16 bg-zinc-800 border border-zinc-700 text-emerald-400 font-bold px-1.5 py-1 rounded text-center">
                </div>
            </div>
        </div>
    `).join('');
}

function salvarAlteracoesCustos() {
    CARDAPIO.forEach(p => {
        const elPreco = document.getElementById(`preco_${p.id}`);
        const elCusto = document.getElementById(`custo_${p.id}`);
        if (elPreco) p.preco = parseFloat(elPreco.value) || p.preco;
        if (elCusto) p.custo = parseFloat(elCusto.value) || elCusto;
    });

    renderizarCardapio();
    carregarMetricasFinanceiras();
    mostrarNotificacao('Custos e Preços atualizados com sucesso!');
}

function exportarCSV() {
    if (comandas.length === 0) {
        mostrarNotificacao('Não há comandas para exportar.');
        return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'Ficha;Cliente;Telefone;Tipo;Endereço;Bairro;Taxa Entrega;Produtos;Quantidades;Total;Pagamento;Status;Data\n';

    comandas.forEach(c => {
        const fichaStr = c.ficha || '101';
        const nomeStr = `"${c.nome.replace(/"/g, '""')}"`;
        const telStr = `"${(c.telefone || '').replace(/"/g, '""')}"`;
        const tipoStr = `"${c.tipoPedido || 'Consumo no Local'}"`;
        const endStr = `"${(c.endereco || '').replace(/"/g, '""')}"`;
        const bairroStr = `"${(c.bairro || '').replace(/"/g, '""')}"`;
        const taxaStr = `"${(c.taxaEntrega || 0).toFixed(2).replace('.', ',')}"`;

        const nomesProdutos = [];
        const qtdsProdutos = [];

        c.itens.forEach(i => {
            const prod = CARDAPIO.find(p => p.id === i.idProduto);
            if (prod) {
                nomesProdutos.push(prod.nome);
                qtdsProdutos.push(i.quantidade);
            }
        });

        const produtosStr = `"${nomesProdutos.join(' | ')}"`;
        const quantidadesStr = `"${qtdsProdutos.join(' | ')}"`;
        const totalStr = `"${calcularTotalComanda(c).toFixed(2).replace('.', ',')}"`;
        const pagamentoStr = c.pagamento || 'Pendente';
        const statusStr = c.status;
        const dataStr = new Date(c.dataCriacao || Date.now()).toLocaleDateString('pt-BR');

        csvContent += `${fichaStr};${nomeStr};${telStr};${tipoStr};${endStr};${bairroStr};${taxaStr};${produtosStr};${quantidadesStr};${totalStr};${pagamentoStr};${statusStr};${dataStr}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'amado-espeto-relatorio-vendas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarNotificacao('Planilha em CSV baixada com sucesso!');
}

function calcularTotalComanda(comanda) {
    if (!comanda || !comanda.itens) return 0;
    const totalProdutos = comanda.itens.reduce((acc, item) => {
        const prod = CARDAPIO.find(p => p.id === item.idProduto);
        return acc + (prod ? prod.preco * item.quantidade : 0);
    }, 0);

    const taxa = (comanda.tipoPedido === 'Entrega / WhatsApp') ? (comanda.taxaEntrega || 0) : 0;
    return totalProdutos + taxa;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(string) {
    if (!string) return '';
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

function mostrarNotificacao(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-zinc-800 text-zinc-100 border border-amber-500/40 px-4 py-3 rounded-xl shadow-2xl z-50 text-xs font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-10 opacity-0';
    toast.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-amber-400"></i> <span>${mensagem}</span>`;
    document.body.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}