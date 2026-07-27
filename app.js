// Configuração do Estado inicial e localStorage
const STORAGE_KEYS = {
    CONTACTS: 'transparencia_bauru_contacts',
    MESSAGE: 'transparencia_bauru_message'
};

let state = {
    contacts: [],
    messageTemplate: ''
};

// Seletores DOM
const messageTemplateInput = document.getElementById('messageTemplate');
const charCountSpan = document.getElementById('charCount');
const contactForm = document.getElementById('contactForm');
const contactPhoneInput = document.getElementById('contactPhone');
const contactNameInput = document.getElementById('contactName');
const contactListUl = document.getElementById('contactList');
const emptyStateDiv = document.getElementById('emptyState');
const btnClearList = document.getElementById('btnClearList');

const contactInstagramInput = document.getElementById('contactInstagram');

// Carrega o estado inicial do LocalStorage
function loadState() {
    try {
        const savedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        const savedMessage = localStorage.getItem(STORAGE_KEYS.MESSAGE);

        state.contacts = savedContacts ? JSON.parse(savedContacts) : [];
        state.messageTemplate = savedMessage || '';

        // Preenche campos se existirem dados
        messageTemplateInput.value = state.messageTemplate;
        updateCharCount();
        renderContacts();
    } catch (e) {
        console.error('Erro ao ler dados do localStorage:', e);
    }
}

// Salva o estado atual no LocalStorage
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(state.contacts));
        localStorage.setItem(STORAGE_KEYS.MESSAGE, state.messageTemplate);
    } catch (e) {
        console.error('Erro ao salvar dados no localStorage:', e);
    }
}

// Atualiza o contador de caracteres
function updateCharCount() {
    const count = messageTemplateInput.value.length;
    charCountSpan.textContent = `${count} caracteres`;
    state.messageTemplate = messageTemplateInput.value;
    saveState();
}

// Limpa formatação não numérica do celular (exceto + se houver, mas idealmente mantendo apenas números)
function cleanPhoneNumber(phone) {
    // Remove tudo exceto dígitos numéricos
    return phone.replace(/\D/g, '');
}

// Renderiza a lista de contatos na tela
function renderContacts() {
    contactListUl.innerHTML = '';

    if (state.contacts.length === 0) {
        emptyStateDiv.style.display = 'block';
        contactListUl.style.display = 'none';
        return;
    }

    emptyStateDiv.style.display = 'none';
    contactListUl.style.display = 'flex';

    state.contacts.forEach((contact, index) => {
        const li = document.createElement('li');
        li.className = 'contact-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'contact-info';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'contact-name';
        nameSpan.textContent = contact.name || 'Sem nome';

        const phoneSpan = document.createElement('span');
        phoneSpan.className = 'contact-phone';
        phoneSpan.textContent = `+${contact.phone}`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(phoneSpan);

        if (contact.instagram) {
            const instagramDiv = document.createElement('a');
            instagramDiv.className = 'contact-instagram-link';
            instagramDiv.href = `https://instagram.com/${contact.instagram}`;
            instagramDiv.target = '_blank';
            instagramDiv.innerHTML = `📸 @${contact.instagram}`;
            infoDiv.appendChild(instagramDiv);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'contact-actions';

        // Renderiza o botão de acordo com o status
        if (contact.status === 'sent') {
            const btnChecked = document.createElement('button');
            btnChecked.className = 'btn-checked';
            btnChecked.innerHTML = '<span>✓ Enviado</span>';
            btnChecked.title = 'Clique para marcar como pendente novamente';
            btnChecked.addEventListener('click', () => {
                toggleContactStatus(index, 'pending');
            });
            actionsDiv.appendChild(btnChecked);
        } else {
            const btnSend = document.createElement('button');
            btnSend.className = 'btn-send';
            btnSend.innerHTML = '<span>Enviar</span> 🚀';
            btnSend.addEventListener('click', () => {
                sendWhatsAppMessage(contact, index);
            });
            actionsDiv.appendChild(btnSend);
        }

        // Botão para deletar contato
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete';
        btnDelete.innerHTML = '🗑️';
        btnDelete.title = 'Remover contato';
        btnDelete.addEventListener('click', () => {
            deleteContact(index);
        });

        actionsDiv.appendChild(btnDelete);
        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        contactListUl.appendChild(li);
    });
}

// Altera o status do contato
function toggleContactStatus(index, newStatus) {
    state.contacts[index].status = newStatus;
    saveState();
    renderContacts();
}

// Remove um contato da lista
function deleteContact(index) {
    state.contacts.splice(index, 1);
    saveState();
    renderContacts();
}

// Processa a sintaxe Spintax (ex: [Olá|Oi|Bom dia] -> escolhe um aleatoriamente)
function parseSpintax(text) {
    // Expressão regular para encontrar blocos contendo colchetes e opções separadas por barra vertical
    const spintaxRegex = /\[([^\]]+)\]/g;
    
    return text.replace(spintaxRegex, (match, optionsText) => {
        const choices = optionsText.split('|');
        if (choices.length > 0) {
            const randomIndex = Math.floor(Math.random() * choices.length);
            return choices[randomIndex].trim();
        }
        return match;
    });
}

// Processa a string de texto substituindo a flag %nome e interpretando Spintax
function buildMessage(template, name) {
    let text = template;
    const resolvedName = name ? name.trim() : '';
    // Substitui %nome de forma global case-insensitive
    text = text.replace(/%nome/gi, resolvedName);
    
    // Processa variações dinâmicas de spintax
    text = parseSpintax(text);
    return text;
}

// Executa a abertura do WhatsApp e marca como enviado
function sendWhatsAppMessage(contact, index) {
    const rawMessage = state.messageTemplate;
    const finalMessage = buildMessage(rawMessage, contact.name);
    
    // Encoda a mensagem para formato URI
    const encodedText = encodeURIComponent(finalMessage);
    
    // API padrão do wa.me que redireciona corretamente no Mobile (App) e Desktop (Web/App)
    const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodedText}`;
    
    // Abre a aba
    window.open(whatsappUrl, '_blank');
    
    // Atualiza o status do contato para "sent" (Enviado)
    toggleContactStatus(index, 'sent');
}

// Alterna entre abas (Individual vs Massa)
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tabId === 'tab-individual') {
        document.getElementById('btnTabIndividual').classList.add('active');
    } else if (tabId === 'tab-bulk') {
        document.getElementById('btnTabBulk').classList.add('active');
    }
    
    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add('active');
}

// Event Listeners das Abas
document.getElementById('btnTabIndividual').addEventListener('click', () => switchTab('tab-individual'));
document.getElementById('btnTabBulk').addEventListener('click', () => switchTab('tab-bulk'));

// Intercepta e processa importação em massa
const bulkForm = document.getElementById('bulkForm');
const bulkInput = document.getElementById('bulkInput');

bulkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = bulkInput.value.trim();
    if (!text) {
        alert('Por favor, cole alguma linha para importar.');
        return;
    }

    const lines = text.split(/\r?\n/);
    let addedCount = 0;
    let duplicateCount = 0;

    // Mapeamento local dos Instagrams conhecidos dos vereadores de Bauru
    const instagramMap = {
        'andré maldonado': 'andremaldonadobauru',
        'arnaldo ribeiro': 'arnaldoribeirobauru',
        'beto móveis': 'betomoveisoficial',
        'cabo helinho': 'cabo_helinho',
        'dario luis': 'darioluisbauru',
        'eduardo borgo': 'eduardoborgo',
        'emerson construtor': 'emersonconstrutorbauru',
        'emerson pereira': 'emersonpereira.oficial',
        'estela almagro': 'estelaalmagro',
        'julio cesar / segalla': 'vereadorsegalla',
        'junior lokadora': 'juniorlokadora',
        'junior rodrigues': 'juniorrodriguesbauru',
        'mané losila': 'manelosila',
        'marcelo afonso': 'marceloafonsobauru',
        'marcio teixeira': 'marcioteixeirabauru',
        'markinho souza': 'markinhosouzaoficial',
        'miltinho sardin': 'miltinho_sardin',
        'pastor bira': 'pastorbira.bauru',
        'pastor edson miguel': 'pastoredsonmiguel',
        'sandro bussola': 'sandrobussola'
    };

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Expressão regular para tentar capturar nomes e números de formatos como:
        // "André Maldonado PP (14) 99632-0111" ou "André Maldonado (14) 99632-0111"
        // Captura o telefone no final contendo parênteses, hífen e espaços
        const phoneRegex = /(?:\+?\d{1,3}\s*)?\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}$/;
        const match = trimmed.match(phoneRegex);

        let phone = '';
        let name = '';

        if (match) {
            phone = cleanPhoneNumber(match[0]);
            // O nome é tudo o que vem antes do número de telefone encontrado
            name = trimmed.substring(0, match.index).trim();
            // Limpa sufixos comuns do nome como siglas de partidos ("PP", "MDB", "PL", etc. se soltos no final do nome)
            name = name.replace(/\s+(?:PP|PL|MDB|PSD|PT|NOVO|AVANTE|PODEMOS|REPUBLICANOS|PSDB|UNIÃO|PDT|PSB|PSOL)\b/gi, '').trim();
        } else {
            // Se não bater com o formato padrão com DDD entre parênteses, limpa tudo o que for dígito da linha e vê se sobra algo
            const digits = cleanPhoneNumber(trimmed);
            if (digits.length >= 8) {
                phone = digits;
                // Tenta extrair qualquer texto restante como nome
                name = trimmed.replace(/[\d\s()+-]/g, '').trim();
            }
        }

        // Se o número de telefone limpo não tiver código de país (geralmente começa com DDD 11 a 99), coloca 55 (Brasil)
        if (phone.length >= 10 && phone.length <= 11 && !phone.startsWith('55')) {
            phone = '55' + phone;
        }

        if (phone.length >= 8) {
            // Evita duplicados
            const isDuplicate = state.contacts.some(c => c.phone === phone);
            if (isDuplicate) {
                duplicateCount++;
            } else {
                // Tenta mapear o Instagram automaticamente com base no nome limpo (normalizado)
                const normalName = (name || '').toLowerCase().trim();
                const matchedInstagram = instagramMap[normalName] || '';

                state.contacts.push({
                    phone: phone,
                    name: name || 'Sem nome',
                    instagram: matchedInstagram,
                    status: 'pending'
                });
                addedCount++;
            }
        }
    });

    saveState();
    renderContacts();

    alert(`Importação concluída!\nContatos adicionados: ${addedCount}\nDuplicados ignorados: ${duplicateCount}`);
    
    // Limpa a caixa de texto e volta para a lista
    bulkInput.value = '';
    switchTab('tab-individual');
});

// Evento para adicionar novo contato
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const rawPhone = contactPhoneInput.value.trim();
    const name = contactNameInput.value.trim();
    const instagram = contactInstagramInput.value.trim();
    let cleanedPhone = cleanPhoneNumber(rawPhone);

    if (cleanedPhone.length < 8) {
        alert('Por favor, insira um número de telefone válido com DDD e DDI (Ex: 5511999999999).');
        return;
    }

    // Auto-preenche com 55 se o usuário digitar apenas o DDD + Celular (10 ou 11 caracteres)
    if (cleanedPhone.length >= 10 && cleanedPhone.length <= 11 && !cleanedPhone.startsWith('55')) {
        cleanedPhone = '55' + cleanedPhone;
    }

    // Verifica duplicados
    const isDuplicate = state.contacts.some(c => c.phone === cleanedPhone);
    if (isDuplicate) {
        alert('Este número já está na lista de contatos.');
        return;
    }

    // Limpa o caractere @ se o usuário digitar
    const cleanInstagram = instagram.startsWith('@') ? instagram.substring(1) : instagram;

    state.contacts.push({
        phone: cleanedPhone,
        name: name,
        instagram: cleanInstagram,
        status: 'pending' // pending ou sent
    });

    saveState();
    renderContacts();

    // Limpa apenas o formulário de contatos (mantém o foco no input principal)
    contactPhoneInput.value = '';
    contactNameInput.value = '';
    contactInstagramInput.value = '';
    contactPhoneInput.focus();
});

// Limpa toda a lista de contatos
btnClearList.addEventListener('click', () => {
    if (state.contacts.length === 0) return;
    
    if (confirm('Tem certeza que deseja apagar TODOS os contatos da lista?')) {
        state.contacts = [];
        saveState();
        renderContacts();
    }
});

// Atualiza o template da mensagem conforme o usuario digita
messageTemplateInput.addEventListener('input', updateCharCount);

// Inicializa a aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', loadState);
