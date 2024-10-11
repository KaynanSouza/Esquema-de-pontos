// Atualiza a data e hora atual na página principal
function atualizarDataHora() {
    const datetimeElement = document.getElementById('datetime');
    const agora = new Date();
    const options = { dateStyle: 'full', timeStyle: 'medium' };
    datetimeElement.textContent = agora.toLocaleString('pt-BR', options);
}
setInterval(atualizarDataHora, 1000);
atualizarDataHora();

// Função para registrar ponto atual
function registrarPonto(tipo) {
    const agora = new Date();
    const registro = {
        data: agora.toISOString().split('T')[0],
        hora: agora.toTimeString().split(' ')[0],
        tipo: tipo,
        observacao: '',
        editado: false,
        passado: false
    };
    salvarRegistro(registro);
    alert('Ponto registrado com sucesso!');
}

// Função para registrar ponto no passado
function registrarPontoPassado(event) {
    event.preventDefault();
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const tipo = document.getElementById('tipo').value;

    const dataSelecionada = new Date(`${data}T${hora}`);
    const agora = new Date();

    if (dataSelecionada > agora) {
        alert('Não é permitido registrar ponto em data futura.');
        return;
    }

    const registro = {
        data: data,
        hora: hora,
        tipo: tipo,
        observacao: '',
        editado: false,
        passado: true
    };
    salvarRegistro(registro);
    alert('Ponto no passado registrado com sucesso!');
    document.getElementById('formRegistroPassado').reset();
}

// Função para salvar registro no localStorage
function salvarRegistro(registro) {
    let registros = JSON.parse(localStorage.getItem('registros')) || [];
    registros.push(registro);
    localStorage.setItem('registros', JSON.stringify(registros));
}

// Função para registrar justificativa
function registrarJustificativa(event) {
    event.preventDefault();
    const data = document.getElementById('dataJustificativa').value;
    const motivo = document.getElementById('motivo').value;
    const arquivoInput = document.getElementById('arquivo');
    let arquivoNome = '';

    if (arquivoInput.files.length > 0) {
        arquivoNome = arquivoInput.files[0].name;
    }

    const justificativa = {
        data: data,
        motivo: motivo,
        arquivo: arquivoNome
    };

    let justificativas = JSON.parse(localStorage.getItem('justificativas')) || [];
    justificativas.push(justificativa);
    localStorage.setItem('justificativas', JSON.stringify(justificativas));

    alert('Justificativa registrada com sucesso!');
    document.getElementById('formJustificativa').reset();
}

// Função para adicionar observação a um registro
function adicionarObservacao(event) {
    event.preventDefault();
    const data = document.getElementById('dataObservacao').value;
    const observacaoTexto = document.getElementById('observacao').value;

    let registros = JSON.parse(localStorage.getItem('registros')) || [];

    const registroEncontrado = registros.find(registro => registro.data === data);

    if (registroEncontrado) {
        registroEncontrado.observacao = observacaoTexto;
        registroEncontrado.editado = true;
        localStorage.setItem('registros', JSON.stringify(registros));
        alert('Observação adicionada com sucesso!');
    } else {
        alert('Nenhum registro encontrado para esta data.');
    }

    document.getElementById('formObservacao').reset();
}

// Função para carregar registros no relatório
function carregarRegistros(filtro = null) {
    const registrosElement = document.getElementById('registros');
    registrosElement.innerHTML = '';
    let registros = JSON.parse(localStorage.getItem('registros')) || [];

    if (filtro === 'semana') {
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
        registros = registros.filter(registro => new Date(registro.data) >= seteDiasAtras);
    } else if (filtro === 'mes') {
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        registros = registros.filter(registro => new Date(registro.data) >= umMesAtras);
    }

    registros.sort((a, b) => new Date(b.data) - new Date(a.data));

    registros.forEach((registro, index) => {
        const registroDiv = document.createElement('div');
        registroDiv.classList.add('registro-item');

        if (registro.editado) {
            registroDiv.classList.add('editado');
        }
        if (registro.observacao) {
            registroDiv.classList.add('observacao');
        }
        if (registro.passado) {
            registroDiv.classList.add('passado');
        }

        registroDiv.innerHTML = `
            <strong>Data:</strong> ${registro.data} <br>
            <strong>Hora:</strong> ${registro.hora} <br>
            <strong>Tipo:</strong> ${registro.tipo} <br>
            ${registro.observacao ? `<strong>Observação:</strong> ${registro.observacao} <br>` : ''}
            <button class="editar" onclick="editarRegistro(${index})">Editar</button>
            <button class="excluir" onclick="excluirRegistro()">Excluir</button>
        `;

        registrosElement.appendChild(registroDiv);
    });
}

// Função para filtrar registros
function filtrarRegistros(periodo) {
    carregarRegistros(periodo);
}

// Função para mostrar todos os registros
function mostrarTodosRegistros() {
    carregarRegistros();
}

// Função de edição de registro
function editarRegistro(index) {
    let registros = JSON.parse(localStorage.getItem('registros')) || [];
    const registro = registros[index];

    const novaData = prompt('Nova data (AAAA-MM-DD):', registro.data);
    const novaHora = prompt('Nova hora (HH:MM:SS):', registro.hora);

    if (novaData && novaHora) {
        registro.data = novaData;
        registro.hora = novaHora;
        registro.editado = true;
        localStorage.setItem('registros', JSON.stringify(registros));
        alert('Registro editado com sucesso!');
        carregarRegistros();
    }
}

// Função para exclusão (apenas alerta)
function excluirRegistro() {
    alert('O ponto não pode ser excluído.');
}

// Carrega os registros ao abrir o relatório
if (window.location.pathname.includes('relatorio.html')) {
    carregarRegistros();
}
