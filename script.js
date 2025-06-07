// Array para armazenar as necessidades cadastradas
let necessidades = [];

// DOMContentLoaded para garantir que o DOM está carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica em qual página estamos
    const path = window.location.pathname;
    
    if (path.includes('cadastro.html')) {
        initCadastroPage();
    } else if (path.includes('necessidade')) {
        initNecessidadesPage();
    }
});

// Funções para a página de cadastro
function initCadastroPage() {
    const form = document.getElementById('necessidadeForm');
    const cepInput = document.getElementById('cep');
    
    // Evento para preencher endereço via CEP
    cepInput.addEventListener('blur', preencherEndereco);
    
    // Evento de submit do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            cadastrarNecessidade();
            form.reset();
            alert('Necessidade cadastrada com sucesso!');
        }
    });
}

function preencherEndereco() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('rua').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('estado').value = data.uf || '';
            } else {
                alert('CEP não encontrado');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP. Tente novamente.');
        });
}

function validarFormulario() {
    const camposObrigatorios = [
        'nomeInstituicao', 'tipoAjuda', 'tituloNecessidade', 
        'descricao', 'cep', 'rua', 'bairro', 
        'cidade', 'estado', 'contato'
    ];
    
    let valido = true;
    
    camposObrigatorios.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (!elemento.value.trim()) {
            elemento.style.border = '1px solid red';
            valido = false;
        } else {
            elemento.style.border = '';
        }
    });
    
    // Validação básica de e-mail/telefone
    const contato = document.getElementById('contato').value;
    if (!contato.includes('@') && !/\d{10,}/.test(contato)) {
        alert('Por favor, insira um e-mail ou telefone válido');
        document.getElementById('contato').style.border = '1px solid red';
        valido = false;
    }
    
    return valido;
}

function cadastrarNecessidade() {
    const novaNecessidade = {
        id: Date.now(), // Usa timestamp como ID único
        instituicao: document.getElementById('nomeInstituicao').value,
        tipo: document.getElementById('tipoAjuda').value,
        titulo: document.getElementById('tituloNecessidade').value,
        descricao: document.getElementById('descricao').value,
        endereco: {
            cep: document.getElementById('cep').value,
            rua: document.getElementById('rua').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value
        },
        contato: document.getElementById('contato').value,
        dataCadastro: new Date().toLocaleDateString()
    };
    
    // Adiciona ao array de necessidades
    necessidades.push(novaNecessidade);
    
    // Salva no localStorage
    localStorage.setItem('necessidades', JSON.stringify(necessidades));
}

// Funções para a página de necessidades
function initNecessidadesPage() {
    // Carrega as necessidades do localStorage
    const salvas = localStorage.getItem('necessidades');
    if (salvas) {
        necessidades = JSON.parse(salvas);
    }
    
    // Exibe as necessidades
    exibirNecessidades(necessidades);
    
    // Configura os eventos de filtro/pesquisa
    document.getElementById('searchInput').addEventListener('input', filtrarNecessidades);
    document.getElementById('filterType').addEventListener('change', filtrarNecessidades);
}

function exibirNecessidades(needs) {
    const container = document.getElementById('needsContainer');
    
    if (!needs || needs.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhuma necessidade cadastrada ainda.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    needs.forEach(need => {
        const card = document.createElement('div');
        card.className = 'need-card';
        card.innerHTML = `
            <h3>${need.titulo}</h3>
            <p class="institution">${need.instituicao}</p>
            <span class="tag ${need.tipo.toLowerCase().replace(/\s/g, '-')}">${need.tipo}</span>
            <p class="description">${need.descricao}</p>
            <div class="need-footer">
                <p class="location">${need.endereco.cidade} - ${need.endereco.estado}</p>
                <p class="contact">Contato: ${need.contato}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function filtrarNecessidades() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const tipo = document.getElementById('filterType').value;
    
    let filtradas = necessidades;
    
    // Filtra por tipo
    if (tipo) {
        filtradas = filtradas.filter(need => need.tipo === tipo);
    }
    
    // Filtra por termo de pesquisa
    if (termo) {
        filtradas = filtradas.filter(need => 
            need.titulo.toLowerCase().includes(termo) || 
            need.descricao.toLowerCase().includes(termo) ||
            need.instituicao.toLowerCase().includes(termo)
        );
    }
    
    exibirNecessidades(filtradas);
}