// 1. BANCO DE DADOS E CONFIGURAÇÕES
const ITENS_CONTRATO = [
    { id: 1, name: "Cama Elástica Menor (mín. 3m)", price: 79.00 },
    { id: 2, name: "Cama Elástica Grande (mín. 4m)", price: 99.00 },
    { id: 3, name: "Tobogã Inflável Médio", price: 125.00 },
    { id: 4, name: "Tobogã Inflável Grande", price: 120.00 },
    { id: 5, name: "Touro Mecânico (220v)", price: 125.00 },
    { id: 6, name: "Kid Play Médio (Multi-atividades)", price: 125.00 },
    { id: 7, name: "Kid Play Grande (Multi-atividades)", price: 140.00 },
    { id: 8, name: "Futebol de Sabão Médio", price: 120.00 },
    { id: 9, name: "Futebol de Sabão Grande", price: 120.00 },
    { id: 10, name: "Bate e Cai Humano (Giro Loco)", price: 125.00 },
    { id: 11, name: "Pula-Pula Inflável Standard", price: 110.00 },
    { id: 12, name: "Barraquinha de Pipoca (3 monitores + insumos)", price: 176.37 }
];

const VEREADORES_DATA = [
    { name: "André Maldonado", party: "PP", phone: "5514996320111", instagram: "andremaldonadobauru" },
    { name: "Arnaldo Ribeiro", party: "Avante", phone: "5514997850265", instagram: "arnaldoribeirobauru" },
    { name: "Beto Móveis", party: "Republicanos", phone: "5514988025423", instagram: "betomoveisoficial" },
    { name: "Cabo Helinho", party: "PL", phone: "5514997060774", instagram: "cabo_helinho" },
    { name: "Dario Luis", party: "PSD", phone: "5514981144700", instagram: "darioluisbauru" },
    { name: "Eduardo Borgo", party: "Novo", phone: "5514982063014", instagram: "eduardoborgo" },
    { name: "Emerson Construtor", party: "Podemos", phone: "5514997526406", instagram: "emersonconstrutorbauru" },
    { name: "Emerson Pereira", party: "MDB", phone: "5514997710576", instagram: "emersonpereira.oficial" },
    { name: "Estela Almagro", party: "PT", phone: "5514998339009", instagram: "estelaalmagro" },
    { name: "Julio Cesar / Segalla", party: "PP / União", phone: "5514991130777", instagram: "vereadorsegalla" },
    { name: "Junior Lokadora", party: "Podemos", phone: "5514991146351", instagram: "juniorlokadora" },
    { name: "Junior Rodrigues", party: "PSD", phone: "5514991113232", instagram: "juniorrodriguesbauru" },
    { name: "Mané Losila", party: "MDB", phone: "5514996020238", instagram: "manelosila" },
    { name: "Marcelo Afonso", party: "PSD", phone: "5514996655678", instagram: "marceloafonsobauru" },
    { name: "Marcio Teixeira", party: "PL", phone: "5514991761926", instagram: "marcioteixeirabauru" },
    { name: "Markinho Souza", party: "MDB", phone: "5514991352083", instagram: "markinhosouzaoficial" },
    { name: "Miltinho Sardin", party: "PSD", phone: "5514998811611", instagram: "miltinho_sardin" },
    { name: "Pastor Bira", party: "Podemos", phone: "5514996987553", instagram: "pastorbira.bauru" },
    { name: "Pastor Edson Miguel", party: "Republicanos", phone: "5514991361443", instagram: "pastoredsonmiguel" },
    { name: "Sandro Bussola", party: "MDB", phone: "5514996550575", instagram: "sandrobussola" }
];

const STORAGE_KEYS = {
    VEREADORES_STATUS: 'transparencia_bauru_status',
    ACTION_TEMPLATE: 'transparencia_bauru_template'
};

// 2. ESTADO DA APLICACAO
let state = {
    quantities: {}, // Quantidade selecionada no simulador por ID
    hours: 6,       // Horas do evento simulado
    vereadoresStatus: {}, // Status de envio (pending/sent) por telefone do vereador
    template: ""
};

// 3. SELETORES DOM
const navDashboardBtn = document.getElementById('nav-dashboard');
const navEmpenhosBtn = document.getElementById('nav-empenhos');
const navCalcBtn = document.getElementById('nav-calc');
const navVereadoresBtn = document.getElementById('nav-vereadores');

const tabDashboard = document.getElementById('tab-dashboard');
const tabEmpenhos = document.getElementById('tab-empenhos');
const tabCalc = document.getElementById('tab-calc');
const tabVereadores = document.getElementById('tab-vereadores');

const searchItemsInput = document.getElementById('searchItems');
const itemsTableBody = document.getElementById('itemsTableBody');

const calcItemsList = document.getElementById('calcItemsList');
const calcTotalDisplay = document.getElementById('calcTotalDisplay');
const calcHoursInput = document.getElementById('calcHours');
const calcSummaryText = document.getElementById('calcSummaryText');

const vereadoresListUl = document.getElementById('vereadoresList');

// 4. SISTEMA DE ABAS (NAVEGAÇÃO)
function switchTab(activeTab) {
    // Esconde todas
    tabDashboard.classList.remove('active');
    tabEmpenhos.classList.remove('active');
    tabCalc.classList.remove('active');
    tabVereadores.classList.remove('active');
    
    navDashboardBtn.classList.remove('active');
    navEmpenhosBtn.classList.remove('active');
    navCalcBtn.classList.remove('active');
    navVereadoresBtn.classList.remove('active');

    // Mostra ativa
    if (activeTab === 'dashboard') {
        tabDashboard.classList.add('active');
        navDashboardBtn.classList.add('active');
    } else if (activeTab === 'empenhos') {
        tabEmpenhos.classList.add('active');
        navEmpenhosBtn.classList.add('active');
    } else if (activeTab === 'calc') {
        tabCalc.classList.add('active');
        navCalcBtn.classList.add('active');
    } else if (activeTab === 'vereadores') {
        tabVereadores.classList.add('active');
        navVereadoresBtn.classList.add('active');
    }
}

navDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
navEmpenhosBtn.addEventListener('click', () => switchTab('empenhos'));
navCalcBtn.addEventListener('click', () => switchTab('calc'));
navVereadoresBtn.addEventListener('click', () => switchTab('vereadores'));

// 5. RENDERIZACAO DA TABELA DE PREÇOS
function renderItemsTable(filterText = '') {
    itemsTableBody.innerHTML = '';
    const filtered = ITENS_CONTRATO.filter(item => 
        item.name.toLowerCase().includes(filterText.toLowerCase())
    );

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        
        const tdName = document.createElement('td');
        tdName.textContent = item.name;
        
        const tdPrice = document.createElement('td');
        const spanPrice = document.createElement('span');
        spanPrice.className = 'text-price-badge';
        spanPrice.textContent = `R$ ${item.price.toFixed(2).replace('.', ',')}`;
        
        tdPrice.appendChild(spanPrice);
        tr.appendChild(tdName);
        tr.appendChild(tdPrice);
        itemsTableBody.appendChild(tr);
    });
}

searchItemsInput.addEventListener('input', (e) => {
    renderItemsTable(e.target.value);
});

// 6. RENDERIZACAO E LOGICA DO SIMULADOR (CALCULADORA)
function initCalculator() {
    calcItemsList.innerHTML = '';
    
    ITENS_CONTRATO.forEach(item => {
        // Inicializa o estado de quantidades se não existir
        if (state.quantities[item.id] === undefined) {
            state.quantities[item.id] = 0;
        }

        const controlDiv = document.createElement('div');
        controlDiv.className = 'calc-item-control';

        const infoDiv = document.createElement('div');
        const nameSpan = document.createElement('div');
        nameSpan.className = 'calc-item-name';
        nameSpan.textContent = item.name;
        
        const priceSpan = document.createElement('div');
        priceSpan.className = 'calc-item-price';
        priceSpan.textContent = `R$ ${item.price.toFixed(2).replace('.', ',')} / hora`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(priceSpan);

        const qtyControl = document.createElement('div');
        qtyControl.className = 'quantity-control';

        const btnMinus = document.createElement('button');
        btnMinus.type = 'button';
        btnMinus.className = 'btn-qty';
        btnMinus.textContent = '-';
        btnMinus.addEventListener('click', () => adjustQuantity(item.id, -1));

        const qtyVal = document.createElement('span');
        qtyVal.className = 'qty-val';
        qtyVal.id = `qty-val-${item.id}`;
        qtyVal.textContent = state.quantities[item.id];

        const btnPlus = document.createElement('button');
        btnPlus.type = 'button';
        btnPlus.className = 'btn-qty';
        btnPlus.textContent = '+';
        btnPlus.addEventListener('click', () => adjustQuantity(item.id, 1));

        qtyControl.appendChild(btnMinus);
        qtyControl.appendChild(qtyVal);
        qtyControl.appendChild(btnPlus);

        controlDiv.appendChild(infoDiv);
        controlDiv.appendChild(qtyControl);
        
        calcItemsList.appendChild(controlDiv);
    });

    updateCalculatorTotal();
}

function adjustQuantity(id, change) {
    const newVal = Math.max(0, state.quantities[id] + change);
    state.quantities[id] = newVal;
    
    const display = document.getElementById(`qty-val-${id}`);
    if (display) display.textContent = newVal;
    
    updateCalculatorTotal();
}

function adjustHours(change) {
    const newVal = Math.max(1, parseInt(calcHoursInput.value || 6) + change);
    calcHoursInput.value = newVal;
    state.hours = newVal;
    updateCalculatorTotal();
}

calcHoursInput.addEventListener('input', (e) => {
    state.hours = Math.max(1, parseInt(e.target.value) || 1);
    updateCalculatorTotal();
});

function updateCalculatorTotal() {
    let hourlyTotal = 0;
    let selectedSummary = [];

    ITENS_CONTRATO.forEach(item => {
        const qty = state.quantities[item.id] || 0;
        if (qty > 0) {
            hourlyTotal += item.price * qty;
            selectedSummary.push(`${qty}x ${item.name.split(' (')[0]}`);
        }
    });

    const finalTotal = hourlyTotal * state.hours;
    calcTotalDisplay.textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;

    if (selectedSummary.length === 0) {
        calcSummaryText.textContent = "Nenhum item selecionado na lista ao lado.";
    } else {
        calcSummaryText.innerHTML = `<strong>Itens:</strong> ${selectedSummary.join(', ')} <br><strong>Custo por hora:</strong> R$ ${hourlyTotal.toFixed(2).replace('.', ',')}/h <br><strong>Duração:</strong> ${state.hours} horas.`;
    }
}

// Global para chamar via HTML nos botões de controle de horas
window.adjustHours = adjustHours;

// 7. RENDERIZACAO E ENVIO DOS VEREADORES
function renderVereadores() {
    vereadoresListUl.innerHTML = '';

    VEREADORES_DATA.forEach(ver => {
        const status = state.vereadoresStatus[ver.phone] || 'pending';

        const li = document.createElement('li');
        li.className = 'contact-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'contact-info';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'contact-name';
        nameSpan.textContent = ver.name;

        const partySpan = document.createElement('span');
        partySpan.className = 'contact-party';
        partySpan.textContent = ver.party;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(partySpan);

        if (ver.instagram) {
            const instaLink = document.createElement('a');
            instaLink.className = 'contact-instagram-link';
            instaLink.href = `https://instagram.com/${ver.instagram}`;
            instaLink.target = '_blank';
            instaLink.innerHTML = `📸 @${ver.instagram}`;
            infoDiv.appendChild(instaLink);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'contact-actions';

        if (status === 'sent') {
            const btnChecked = document.createElement('button');
            btnChecked.className = 'btn-checked';
            btnChecked.innerHTML = '<span>✓ Notificado</span>';
            btnChecked.title = 'Clique para marcar como pendente novamente';
            btnChecked.addEventListener('click', () => {
                toggleVereadorStatus(ver.phone, 'pending');
            });
            actionsDiv.appendChild(btnChecked);
        } else {
            const btnSend = document.createElement('button');
            btnSend.className = 'btn-send';
            btnSend.innerHTML = '<span>Enviar WhatsApp</span> 🚀';
            btnSend.addEventListener('click', () => {
                sendWhatsAppToVereador(ver);
            });
            actionsDiv.appendChild(btnSend);
        }

        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        vereadoresListUl.appendChild(li);
    });
}

function toggleVereadorStatus(phone, newStatus) {
    state.vereadoresStatus[phone] = newStatus;
    saveState();
    renderVereadores();
}

function sendWhatsAppToVereador(ver) {
    const waUrl = `https://wa.me/${ver.phone}`;
    window.open(waUrl, '_blank');
    toggleVereadorStatus(ver.phone, 'sent');
}

// 8. PERSISTENCIA DE DADOS LOCALSTORAGE
function loadState() {
    try {
        const savedStatus = localStorage.getItem(STORAGE_KEYS.VEREADORES_STATUS);
        state.vereadoresStatus = savedStatus ? JSON.parse(savedStatus) : {};
        
        renderItemsTable();
        initCalculator();
        renderVereadores();
    } catch (e) {
        console.error("Erro ao carregar do localStorage", e);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEYS.VEREADORES_STATUS, JSON.stringify(state.vereadoresStatus));
    } catch (e) {
        console.error("Erro ao salvar no localStorage", e);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', loadState);
