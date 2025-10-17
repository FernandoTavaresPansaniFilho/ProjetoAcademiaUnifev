  /* === SISTEMA DE GERENCIAMENTO DA ACADEMIA UNIFEV === */
  
  // Accessibility helper
  const srOnlyStyle = document.createElement('style');
  srOnlyStyle.textContent = `.sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;}`;
  document.head.appendChild(srOnlyStyle);

  const STORAGE_KEY = 'academia-unifev-db-v4'; 

  const GRUPOS_MUSCULARES = {
    pernas: "Pernas",
    gluteos: "Glúteos",
    peitoral: "Peitoral",
    bicepsAntebraco: "Bíceps/Antebraço",
    dorsais: "Dorsais (Costas)",
    deltoides: "Deltóides (Ombros)",
    triceps: "Tríceps",
    abdominais: "Abdominais"
  };

  const EXERCICIOS_LISTA = {
    pernas: [
      "AGACHAMENTO", "AFUNDO A FRENTE", "AGACHAMENTO SUMO", "STIFF", "AGACHAMENTO NA PAREDE", "LEG PRESS 90°", "MÁQUINA HACK", "LEG PRESS HORIZONTAL", "LEG PRESS 45", "EXTENSÃO UNILAT, SIMULT", "ADUÇÃO MÁQUINA", "ADUÇÃO CANELEIRA", "FLEXÃO QUADRIL COM CANELEIRA", "PANTURRILHA SENTADX", "PANTURRILHA LEG. HORIZONTAL", "PANTURRILHA LEG. 45"
    ],
    gluteos: [
      "AFUNDO A FRENTE", "FLEXÃO (DEITADX/SENTADX) GLUTEOS", "MAQUINA ABDUÇÃO", "ABDUÇÃO CANELEIRA", "EXTENSÃO QUADRIL (CROSS-OVER)", "GLUTEO 4 APOIOS PERNAS (FLEX/EXT)", "ELEVAÇÃO PELVICA"
    ],
    peitoral: [
      "FLEXÃO DE SOLO", "SUPINO HORIZONTAL CONVERGENTE", "SUPINO INCLINADO", "MÁQUINA PEITORAL", "VOADOR", "CROSS-OVER", "CRUCIFIXO", "CRUCIFIXO INCLINADO", "SUP HORIZ C/HALTER (C/ROTIS/ROT.)", "SUP. INCLIN. CHALTER (C/ROTIS/ROTJ", "PULL OVER"
    ],
    bicepsAntebraco: [
      "ROSCA DIRETA", "ROSCA DIRETA (W)", "ROSCA DIRETA (H)", "ROSCA SCOTT", "ROSCA ALTERNADA (SUPNEUT. ROT)", "ROSCA SIMULTANEA (SUPNEUT. ROT)", "ROSCA CONCENTRADA (SUPNEUTROT)", "FLEX. BRAÇO ELEV. COT (SUPINEUT. ROT)", "POLIA ALTA CRUZ (SIMLT. ALTERN)", "ROSCA INVERSA (W)", "FLEXÃO PUNHO (BARRA HALTER EMPE)", "CARRETEL"
    ],
    dorsais: [
      "TRAÇÃO BARRA FIXA (PIS)", "PUXADA COSTAS CONVERGENTE", "PUXADA COSTAS", "PUXADA FRENTE PINIT", "PUXADA BARRAT (PINIT", "REMADA BAIXA (PINIT)", "VOADOR", "PUXADA HORIZONTAL BARRA", "REMADA UNILATERAL", "EXTENSÃO TRONCO"
    ],
    deltoides: [
      "DESENVOLVimento BARRA FRENTE", "DESENVOLVIMENTO BARRA ATRÁS", "DESENV SENT, HALTER (C/ROT.IS/ROT)", "ARNOLD PRESS", "ELEVAÇÃO LATERAL BRAÇOS", "ELEV. FRONT. BRAÇOS (SIMULT. ALTERN.)", "ELEV. FRONT. BRAÇOS (X W[H)", "CROSS OVER (ELEV. LAT. FRONT.)", "MÁQUINA PARA OMBROS", "ABDUÇÃO BRAÇO X", "CRUCIFIXO INVERSO", "REMADA ALTA (FECHADA ABERTA)", "REMADA ALTA COM EXTENSÃO", "ELEV OMBRO HALTER (FRENTE ATRÁS"
    ],
    triceps: [
      "PUXADOR (-1)", "INVERSO", "CORDA", "EXTENSORA ALTA (PISIN)", "EXTENSORA BAIXA (PSN)", "TESTA BARRA (-)", "TESTA BARRA (W)", "TESTA BARRA (H)", "TESTA COM HALTER", "FRANCES (UNILAT, SIMULT.)", "KICK BACK (UNILAT. SIMULT.)", "NO BANCO", "MÁQUINA", "PARALELA"
    ],
    abdominais: [
      "RODA ABDOMINAL", "ARCO (RETO)", "ARCO (OBLIQUO)", "PARALELA ABDOMINAL", "ABDOMINAL INCLINADO", "ELEV. PER PR. INCL", "ELEVAÇÃO JOELHOS BARRA FIXA", "FLEXÃO LATERAL", "FLEXÃO LATERAL BANCO", "ABDOMINAL REMADOR", "PRANCHA LATERAL", "PRANCHA"
    ]
  };

  // Validação e formatação de telefone
  function formatarTelefone(telefone) {
    // Remove tudo que não é dígito
    const digits = telefone.replace(/\D/g, '');
    
    // Se tem 11 dígitos, formata como (XX) XXXXX-XXXX
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    
    return telefone; // Retorna original se não tem 11 dígitos
  }

  function validarTelefone(telefone) {
    const digits = telefone.replace(/\D/g, '');
    return digits.length === 11;
  }

  function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length <= 11) {
        if (value.length >= 2) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length >= 10) {
          value = value.replace(/(\(\d{2}\) \d{5})(\d)/, '$1-$2');
        }
      }
      
      e.target.value = value;
      
      // Validação visual
      if (value.replace(/\D/g, '').length === 11 || value === '') {
        e.target.classList.remove('error');
      } else {
        e.target.classList.add('error');
      }
    });
  }

  function getDefaultPlanStructure() {
    return {
      descricaoGeral: "Plano de treino. Adapte conforme necessário.",
      grupos: { 
        pernas: [], gluteos: [], peitoral: [], bicepsAntebraco: [], dorsais: [], deltoides: [], triceps: [], abdominais: []
      }
    };
  }

  function loadDatabase() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let db;
    if (rawData) {
      try {
        db = JSON.parse(rawData);
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage. Restaurando para o padrão.", e);
      }
    }

    const defaults = {
      alunos: [
        {
          id: 1001,
          nome: "Aluno01",
          senha: "aluno123",
          telefone: "(17) 99704-1783",
          email: "fernandotavarespf@gmail.com",
          anamneseFeita: true,
          dataHoraAnamnese: "01/01/2024 10:00",
          observacoesAnamnese: "Aluna em boa forma física",
          solicitacaoAnamnesePendente: false,
          dataCadastro: "2024-01-01",
          ativo: true
        },
        {
          id: 1002,
          nome: "Aluno02",
          senha: "aluno123",
          telefone: "(17) 99704-1783",
          email: "fernandotavarespf@gmail.com",
          anamneseFeita: false,
          dataHoraAnamnese: null,
          observacoesAnamnese: "",
          solicitacaoAnamnesePendente: true,
          dataCadastro: "2024-01-15",
          ativo: true
        }
      ],
      instrutores: [
        {
          id: 1,
          nome: "Instrutor01",
          senha: "instrutor123",
          telefone: "(17) 99704-1783",
          email: "fernandotavarespf@gmail.com",
          especialidade: "Musculação e Condicionamento",
          dataCadastro: "2024-01-01",
          ativo: true
        },
        {
          id: 2,
          nome: "Instrutor02",
          senha: "instrutor123",
          telefone: "(17) 99704-1783",
          email: "fernandotavarespf@gmail.com",
          especialidade: "Pilates e Funcional",
          dataCadastro: "2024-01-01",
          ativo: true
        }
      ],
      administradores: [
        {
          id: 1,
          usuario: "admin",
          senha: "admin123",
          nome: "Administrador Sistema",
          email: "fernandotavarespf@gmail.com"
        }
      ],
      planos: {
        1001: {
          descricaoGeral: "Plano de treino para condicionamento geral e fortalecimento muscular",
          grupos: {
            pernas: [
              { exercicio: "AGACHAMENTO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "AFUNDO A FRENTE", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "AGACHAMENTO SUMO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "STIFF", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "AGACHAMENTO NA PAREDE", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "LEG PRESS 90°", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "MÁQUINA HACK", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "LEG PRESS HORIZONTAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "LEG PRESS 45", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "EXTENSÃO UNILAT, SIMULT", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ADUÇÃO MÁQUINA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ADUÇÃO CANELEIRA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FLEXÃO QUADRIL COM CANELEIRA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PANTURRILHA SENTADX", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PANTURRILHA LEG. HORIZONTAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PANTURRILHA LEG. 45", series: "3", repeticoes: "10", carga: "" }
            ],
            gluteos: [
              { exercicio: "AFUNDO A FRENTE", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FLEXÃO (DEITADX/SENTADX) GLUTEOS", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "MAQUINA ABDUÇÃO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ABDUÇÃO CANELEIRA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "EXTENSÃO QUADRIL (CROSS-OVER)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "GLUTEO 4 APOIOS PERNAS (FLEX/EXT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEVAÇÃO PELVICA", series: "3", repeticoes: "10", carga: "" }
            ],
            peitoral: [
              { exercicio: "FLEXÃO DE SOLO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "SUPINO HORIZONTAL CONVERGENTE", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "SUPINO INCLINADO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "MÁQUINA PEITORAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "VOADOR", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CROSS-OVER", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CRUCIFIXO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CRUCIFIXO INCLINADO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "SUPINO HORIZONTAL COM HALTER", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "SUPINO INCLINADO COM HALTER", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PULL OVER", series: "3", repeticoes: "10", carga: "" }
            ],
            bicepsAntebraco: [
              { exercicio: "ROSCA DIRETA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA DIRETA (W)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA DIRETA (H)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA SCOTT", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA ALTERNADA (SUPNEUT. ROT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA SIMULTANEA (SUPNEUT. ROT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA CONCENTRADA (SUPNEUTROT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FLEX. BRAÇO ELEV. COT (SUPINEUT. ROT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "POLIA ALTA CRUZ (SIMLT. ALTERN)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ROSCA INVERSA (W)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FLEXÃO PUNHO (BARRA HALTER EMPE)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CARRETEL", series: "3", repeticoes: "10", carga: "" }
            ],
            dorsais: [
              { exercicio: "TRAÇÃO BARRA FIXA (PIS)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PUXADA COSTAS CONVERGENTE", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PUXADA COSTAS", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PUXADA FRENTE PINIT", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PUXADA BARRAT (PINIT", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "REMADA BAIXA (PINIT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "VOADOR", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PUXADA HORIZONTAL BARRA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "REMADA UNILATERAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "EXTENSÃO TRONCO", series: "3", repeticoes: "10", carga: "" }
            ],
            deltoides: [
              { exercicio: "DESENVOLVIMENTO BARRA FRENTE", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "DESENVOLVIMENTO BARRA ATRÁS", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "DESENV SENT, HALTER (C/ROT.IS/ROT)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ARNOLD PRESS", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEVAÇÃO LATERAL BRAÇOS", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEV. FRONT. BRAÇOS (SIMULT. ALTERN.)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEV. FRONT. BRAÇOS (X W[H)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CROSS OVER (ELEV. LAT. FRONT.)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "MÁQUINA PARA OMBROS", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ABDUÇÃO BRAÇO X", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CRUCIFIXO INVERSO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "REMADA ALTA (FECHADA ABERTA)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "REMADA ALTA COM EXTENSÃO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEV OMBRO HALTER (FRENTE ATRÁS", series: "3", repeticoes: "10", carga: "" }
            ],
            triceps: [
              { exercicio: "PUXADOR (-1)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "INVERSO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "CORDA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "EXTENSORA ALTA (PISIN)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "EXTENSORA BAIXA (PSN)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "TESTA BARRA (-)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "TESTA BARRA (W)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "TESTA BARRA (H)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "TESTA COM HALTER", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FRANCES (UNILAT, SIMULT.)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "KICK BACK (UNILAT. SIMULT.)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "NO BANCO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "MÁQUINA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PARALELA", series: "3", repeticoes: "10", carga: "" }
            ],
            abdominais: [
              { exercicio: "RODA ABDOMINAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ARCO (RETO)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ARCO (OBLIQUO)", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PARALELA ABDOMINAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ABDOMINAL INCLINADO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEV. PER PR. INCL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ELEVAÇÃO JOELHOS BARRA FIXA", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FLEXÃO LATERAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "FLEXÃO LATERAL BANCO", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "ABDOMINAL REMADOR", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PRANCHA LATERAL", series: "3", repeticoes: "10", carga: "" },
              { exercicio: "PRANCHA", series: "3", repeticoes: "10", carga: "" }
            ]
          }
        },
        1002: {
          descricaoGeral: "Plano básico para iniciante - aguardando anamnese completa",
          grupos: {
            pernas: [], gluteos: [], peitoral: [], bicepsAntebraco: [], dorsais: [], deltoides: [], triceps: [], abdominais: []
          }
        }
      },
      historicoTreinos: {},
      planoDefault: getDefaultPlanStructure(),
      alunosPendentesAnamnese: [1002]
    };
    
    db = { ...defaults, ...db };

    // Migração de dados existentes
    db.alunos = db.alunos.map(aluno => ({
        anamneseFeita: false,
        dataHoraAnamnese: null,
        observacoesAnamnese: '',
        solicitacaoAnamnesePendente: false,
        dataCadastro: new Date().toISOString().split('T')[0],
        ativo: true,
        ...aluno 
    }));

    db.instrutores = db.instrutores.map(instrutor => ({
        dataCadastro: new Date().toISOString().split('T')[0],
        ativo: true,
        ...instrutor 
    }));

    if (!db.planoDefault || !db.planoDefault.grupos || db.planoDefault.grupos.corpoTodo !== undefined) { 
        db.planoDefault = getDefaultPlanStructure();
    }
    for (const alunoId in db.planos) {
        if (!db.planos[alunoId] || !db.planos[alunoId].grupos || db.planos[alunoId].grupos.corpoTodo !== undefined) {
            const oldDesc = db.planos[alunoId]?.descricaoGeral || db.planos[alunoId]?.descricao; 
            db.planos[alunoId] = getDefaultPlanStructure();
            if(oldDesc) db.planos[alunoId].descricaoGeral = oldDesc;
        }
    }
    return db;
  }

  function saveDatabase() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  }

  function genUniqueId(collection) {
    if (!collection || collection.length === 0) return 1;
    return Math.max(0, ...collection.map(c => c.id || 0)) + 1;
  }

  let database = loadDatabase();
  let currentUser = null; 
  let selectedStudentIdForAnamnese = null;
  let selectedStudentIdForPlan = null;
  let selectedGrupoKeyForPlan = null; 
  let activeTimers = {};

  class Aluno {
    constructor(nome, senha, telefone, email) {
      this.id = genUniqueId(database.alunos);
      this.nome = nome; 
      this.senha = senha; 
      this.telefone = formatarTelefone(telefone); 
      this.email = email;
      this.anamneseFeita = false; 
      this.dataHoraAnamnese = null;
      this.observacoesAnamnese = ''; 
      this.solicitacaoAnamnesePendente = false;
      this.dataCadastro = new Date().toISOString().split('T')[0];
      this.ativo = true;
    }
  }

  class Instrutor {
    constructor(nome, senha, telefone, email, especialidade) {
      this.id = genUniqueId(database.instrutores);
      this.nome = nome; 
      this.senha = senha; 
      this.telefone = formatarTelefone(telefone); 
      this.email = email;
      this.especialidade = especialidade || 'Generalista';
      this.dataCadastro = new Date().toISOString().split('T')[0];
      this.ativo = true;
    }
  }

  function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
    } else {
      console.error(`View com ID '${viewId}' não encontrada.`);
      document.getElementById('landing-page').classList.add('active');
    }
    clearAllFeedback();
  }

  function clearAllFeedback() {
    const feedbackElements = document.querySelectorAll('.feedback-msg');
    feedbackElements.forEach(el => el.textContent = '');
  }
  
  function clearFormById(formId) {
    const form = document.getElementById(formId);
    if (form && typeof form.reset === 'function') {
      form.reset();
    }
  }

  // Funções administrativas
  function handleAdminLogin(e) {
    e.preventDefault();
    const usuario = document.getElementById('admin-usuario-login').value.trim();
    const senha = document.getElementById('admin-senha-login').value.trim();
    const feedbackEl = document.getElementById('feedback-admin-login');

    if (!usuario || !senha) {
      feedbackEl.textContent = 'Usuário e senha são obrigatórios.'; 
      return;
    }

    const admin = database.administradores.find(a => a.usuario === usuario && a.senha === senha);
    if (!admin) {
      feedbackEl.textContent = 'Usuário ou senha incorretos.'; 
      return;
    }

    currentUser = { tipo: 'admin', dados: admin };
    loadAdminDashboard();
    switchView('admin-dashboard-view');
    clearFormById('form-admin-login');
  }

  function loadAdminDashboard() {
    updateAdminStats();
    showAdminSection('dashboard');
  }

  function updateAdminStats() {
    document.getElementById('stat-total-alunos').textContent = database.alunos.length;
    document.getElementById('stat-total-instrutores').textContent = database.instrutores.length;
    document.getElementById('stat-anamneses-pendentes').textContent = database.alunosPendentesAnamnese.length;
    document.getElementById('stat-alunos-ativos').textContent = database.alunos.filter(a => a.ativo).length;
  }

  function showAdminSection(section) {
    // Atualizar botões ativos
    document.querySelectorAll('.admin-nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-admin-${section}`).classList.add('active');

    // Atualizar breadcrumb
    const breadcrumbMap = {
      'dashboard': 'Dashboard',
      'alunos': 'Gerenciar Alunos',
      'instrutores': 'Gerenciar Instrutores',
      'contatos': 'Lista de Contatos'
    };
    document.getElementById('current-section').textContent = breadcrumbMap[section] || section;

    // Mostrar seção correspondente
    document.getElementById('admin-dashboard-content').style.display = section === 'dashboard' ? 'block' : 'none';
    document.getElementById('admin-alunos-content').style.display = section === 'alunos' ? 'block' : 'none';
    document.getElementById('admin-instrutores-content').style.display = section === 'instrutores' ? 'block' : 'none';
    document.getElementById('admin-contatos-content').style.display = section === 'contatos' ? 'block' : 'none';

    if (section === 'alunos') {
      renderAdminAlunos();
    } else if (section === 'instrutores') {
      renderAdminInstrutores();
    } else if (section === 'contatos') {
      renderAdminContatos();
    }
  }

  function renderAdminAlunos(filtro = '') {
    const tbody = document.getElementById('admin-alunos-tbody');
    tbody.innerHTML = '';

    const alunosFiltrados = database.alunos.filter(aluno => 
      filtro === '' || 
      aluno.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      aluno.id.toString().includes(filtro) ||
      (aluno.email && aluno.email.toLowerCase().includes(filtro.toLowerCase()))
    );

    alunosFiltrados.forEach(aluno => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${aluno.id}</td>
        <td>${aluno.nome}</td>
        <td>${aluno.telefone || '-'}</td>
        <td>${aluno.email || '-'}</td>
        <td><span class="status-badge ${aluno.anamneseFeita ? 'status-ativo' : 'status-pendente'}">${aluno.anamneseFeita ? 'Realizada' : 'Pendente'}</span></td>
        <td><span class="status-badge ${aluno.ativo ? 'status-ativo' : 'status-inativo'}">${aluno.ativo ? 'Ativo' : 'Inativo'}</span></td>
        <td>
          <button onclick="toggleAlunoStatus(${aluno.id})" class="btn-aviso" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
            ${aluno.ativo ? 'Desativar' : 'Ativar'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderAdminInstrutores(filtro = '') {
    const tbody = document.getElementById('admin-instrutores-tbody');
    tbody.innerHTML = '';

    const instrutoresFiltrados = database.instrutores.filter(instrutor => 
      filtro === '' || 
      instrutor.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      instrutor.id.toString().includes(filtro) ||
      (instrutor.email && instrutor.email.toLowerCase().includes(filtro.toLowerCase()))
    );

    instrutoresFiltrados.forEach(instrutor => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${instrutor.id}</td>
        <td>${instrutor.nome}</td>
        <td>${instrutor.telefone || '-'}</td>
        <td>${instrutor.email || '-'}</td>
        <td>${instrutor.especialidade || '-'}</td>
        <td><span class="status-badge ${instrutor.ativo ? 'status-ativo' : 'status-inativo'}">${instrutor.ativo ? 'Ativo' : 'Inativo'}</span></td>
        <td>
          <button onclick="toggleInstrutorStatus(${instrutor.id})" class="btn-aviso" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
            ${instrutor.ativo ? 'Desativar' : 'Ativar'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderAdminContatos(filtro = '') {
    const tbody = document.getElementById('admin-contatos-tbody');
    tbody.innerHTML = '';

    const contatos = [];
    
    database.alunos.forEach(aluno => {
      if (aluno.ativo && (aluno.telefone || aluno.email)) {
        contatos.push({
          tipo: 'Aluno',
          id: aluno.id,
          nome: aluno.nome,
          telefone: aluno.telefone || '-',
          email: aluno.email || '-'
        });
      }
    });

    database.instrutores.forEach(instrutor => {
      if (instrutor.ativo && (instrutor.telefone || instrutor.email)) {
        contatos.push({
          tipo: 'Instrutor',
          id: instrutor.id,
          nome: instrutor.nome,
          telefone: instrutor.telefone || '-',
          email: instrutor.email || '-'
        });
      }
    });

    const contatosFiltrados = contatos.filter(contato => 
      filtro === '' || 
      contato.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      contato.telefone.includes(filtro) ||
      contato.email.toLowerCase().includes(filtro.toLowerCase())
    );

    contatosFiltrados.forEach(contato => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="status-badge ${contato.tipo === 'Aluno' ? 'status-ativo' : 'status-aviso'}">${contato.tipo}</span></td>
        <td>${contato.id}</td>
        <td>${contato.nome}</td>
        <td>${contato.telefone}</td>
        <td>${contato.email}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function toggleAlunoStatus(alunoId) {
    const aluno = database.alunos.find(a => a.id === alunoId);
    if (aluno) {
      aluno.ativo = !aluno.ativo;
      saveDatabase();
      updateAdminStats();
      renderAdminAlunos(document.getElementById('search-alunos').value);
    }
  }

  function toggleInstrutorStatus(instrutorId) {
    const instrutor = database.instrutores.find(i => i.id === instrutorId);
    if (instrutor) {
      instrutor.ativo = !instrutor.ativo;
      saveDatabase();
      updateAdminStats();
      renderAdminInstrutores(document.getElementById('search-instrutores').value);
    }
  }

  function exportarContatos() {
    const contatos = [];
    
    database.alunos.forEach(aluno => {
      if (aluno.ativo && (aluno.telefone || aluno.email)) {
        contatos.push(`Aluno,${aluno.id},${aluno.nome},${aluno.telefone || ''},${aluno.email || ''}`);
      }
    });

    database.instrutores.forEach(instrutor => {
      if (instrutor.ativo && (instrutor.telefone || instrutor.email)) {
        contatos.push(`Instrutor,${instrutor.id},${instrutor.nome},${instrutor.telefone || ''},${instrutor.email || ''}`);
      }
    });

    const csvContent = 'Tipo,ID,Nome,Telefone,Email\n' + contatos.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contatos_academia.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function setupEventListeners() {
    // Botões principais
    document.getElementById('btn-entrar-aluno').addEventListener('click', () => {
        clearFormById('form-aluno-login'); switchView('aluno-login-view');
    });
    document.getElementById('btn-entrar-instrutor').addEventListener('click', () => {
        clearFormById('form-instrutor-login'); switchView('instrutor-login-view');
    });
    document.getElementById('btn-entrar-admin').addEventListener('click', () => {
        clearFormById('form-admin-login'); switchView('admin-login-view');
    });
    document.getElementById('btn-cadastrar').addEventListener('click', () => switchView('cadastro-escolha-view'));

    // Botões voltar
    document.querySelectorAll('.btn-voltar').forEach(button => {
      button.addEventListener('click', () => {
        const targetView = button.dataset.targetview;
        const formToClear = button.dataset.formclear;
        if (formToClear) {
          clearFormById(formToClear);
        }
        if (targetView) switchView(targetView);
      });
    });
    
    // Cadastro
    document.getElementById('btn-tipo-cad-aluno').addEventListener('click', () => {
        clearFormById('form-cadastro-aluno'); switchView('cadastro-aluno-view');
    });
    document.getElementById('btn-tipo-cad-instrutor').addEventListener('click', () => {
        clearFormById('form-cadastro-instrutor'); switchView('cadastro-instrutor-view');
    });

    // Forms
    document.getElementById('form-admin-login').addEventListener('submit', handleAdminLogin);
    document.getElementById('form-aluno-login').addEventListener('submit', handleAlunoLogin);
    document.getElementById('form-instrutor-login').addEventListener('submit', handleInstrutorLogin);
    document.getElementById('form-cadastro-aluno').addEventListener('submit', handleAlunoCadastro);
    document.getElementById('form-cadastro-instrutor').addEventListener('submit', handleInstrutorCadastro);

    // Admin navigation
    document.getElementById('btn-admin-dashboard').addEventListener('click', () => showAdminSection('dashboard'));
    document.getElementById('btn-admin-alunos').addEventListener('click', () => showAdminSection('alunos'));
    document.getElementById('btn-admin-instrutores').addEventListener('click', () => showAdminSection('instrutores'));
    document.getElementById('btn-admin-contatos').addEventListener('click', () => showAdminSection('contatos'));

    // Search boxes
    document.getElementById('search-alunos').addEventListener('input', (e) => {
      renderAdminAlunos(e.target.value);
    });
    document.getElementById('search-instrutores').addEventListener('input', (e) => {
      renderAdminInstrutores(e.target.value);
    });
    document.getElementById('search-contatos').addEventListener('input', (e) => {
      renderAdminContatos(e.target.value);
    });
    
    // CÓDIGO ADICIONADO: Event listener para a busca do instrutor
    document.getElementById('search-aluno-instrutor').addEventListener('input', (e) => {
      renderListaAlunosParaPlanos(e.target.value);
    });

    // Export
    document.getElementById('btn-exportar-contatos').addEventListener('click', exportarContatos);

    // Anamnese e treino
    document.getElementById('btn-solicitar-anamnese').addEventListener('click', handleSolicitarAnamnese);
    document.getElementById('btn-logout-anamnese').addEventListener('click', handleLogout);
    document.getElementById('form-realizar-anamnese').addEventListener('submit', handleRealizarAnamneseSubmit);

    // Logout buttons
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('btn-logout-admin').addEventListener('click', handleLogout);
    document.getElementById('btn-atualizar-descricao-geral').addEventListener('click', handleAtualizarDescricaoGeralPlano);
    document.getElementById('form-gerenciar-exercicio').addEventListener('submit', handleAdicionarExercicioSubmit);

    // Aplicar máscaras de telefone
    aplicarMascaraTelefone(document.getElementById('cad-aluno-tel'));
    aplicarMascaraTelefone(document.getElementById('cad-instrutor-tel'));
  }

  function handleAlunoLogin(e) {
    e.preventDefault();
    const idAlunoStr = document.getElementById('aluno-id-login').value.trim();
    const senha = document.getElementById('aluno-senha-login').value.trim();
    const feedbackEl = document.getElementById('feedback-msg');

    if (!idAlunoStr || !senha) {
      feedbackEl.textContent = 'ID de Aluno e senha são obrigatórios.'; 
      return;
    }

    const idAluno = parseInt(idAlunoStr, 10);
    if (isNaN(idAluno)) {
        feedbackEl.textContent = 'ID de Aluno deve ser um número.'; 
        return;
    }

    const aluno = database.alunos.find(a => a.id === idAluno && a.senha === senha && a.ativo);
    if (!aluno) {
      feedbackEl.textContent = 'ID de Aluno ou senha incorretos, ou conta desativada.'; 
      return;
    }
    currentUser = { tipo: 'aluno', dados: aluno };
    selectedStudentIdForPlan = null; selectedStudentIdForAnamnese = null; selectedGrupoKeyForPlan = null;

    if (!currentUser.dados.anamneseFeita) {
      loadAnamnesePendenteView();
      switchView('aluno-anamnese-pendente-view');
    } else {
      loadPlanoTreinoView();
      switchView('plano-treino-view');
    }
    clearFormById('form-aluno-login');
  }
  
  function handleInstrutorLogin(e) {
    e.preventDefault();
    const idInstrutorStr = document.getElementById('instrutor-id-login').value.trim();
    const senha = document.getElementById('instrutor-senha-login').value.trim();
    const feedbackEl = document.getElementById('feedback-msg-instrutor');
    
    if (!idInstrutorStr || !senha) {
      feedbackEl.textContent = 'ID e senha são obrigatórios.'; return;
    }

    const idInstrutor = parseInt(idInstrutorStr, 10);
    if (isNaN(idInstrutor)) {
        feedbackEl.textContent = 'ID de Instrutor deve ser um número.'; 
        return;
    }

    const instrutor = database.instrutores.find(i => i.id === idInstrutor && i.senha === senha && i.ativo);
    if (!instrutor) {
      feedbackEl.textContent = 'ID ou senha incorretos, ou conta desativada.'; return;
    }
    currentUser = { tipo: 'instrutor', dados: instrutor };
    selectedStudentIdForPlan = null; selectedStudentIdForAnamnese = null; selectedGrupoKeyForPlan = null;
    loadPlanoTreinoView(); 
    switchView('plano-treino-view');
    clearFormById('form-instrutor-login');
  }

  function handleAlunoCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById('cad-aluno-nome').value.trim();
    const senha = document.getElementById('cad-aluno-senha').value.trim();
    const tel = document.getElementById('cad-aluno-tel').value.trim();
    const email = document.getElementById('cad-aluno-email').value.trim();
    const feedbackEl = document.getElementById('feedback-cad-aluno');

    if (!nome || !senha) {
      feedbackEl.textContent = 'Nome e senha são obrigatórios.'; return;
    }

    if (tel && !validarTelefone(tel)) {
      feedbackEl.textContent = 'Telefone deve ter exatamente 11 dígitos.'; return;
    }

    if (database.alunos.some(a => a.nome.toLowerCase() === nome.toLowerCase())) {
      feedbackEl.textContent = 'Aluno já cadastrado com este nome.'; return;
    }
    
    const novoAluno = new Aluno(nome, senha, tel, email);
    database.alunos.push(novoAluno);
    database.planos[novoAluno.id] = JSON.parse(JSON.stringify(database.planoDefault));
    saveDatabase();
    
    feedbackEl.textContent = `Aluno cadastrado com sucesso! Seu ID de Aluno é: ${novoAluno.id}. Use-o para fazer login.`;
    clearFormById('form-cadastro-aluno');
  }

  function handleInstrutorCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById('cad-instrutor-nome').value.trim();
    const senha = document.getElementById('cad-instrutor-senha').value.trim();
    const tel = document.getElementById('cad-instrutor-tel').value.trim();
    const email = document.getElementById('cad-instrutor-email').value.trim();
    const especialidade = document.getElementById('cad-instrutor-especialidade').value.trim();
    const feedbackEl = document.getElementById('feedback-cad-instrutor');

    if (!nome || !senha) {
      feedbackEl.textContent = 'Nome e senha são obrigatórios.'; return;
    }

    if (tel && !validarTelefone(tel)) {
      feedbackEl.textContent = 'Telefone deve ter exatamente 11 dígitos.'; return;
    }

    if (database.instrutores.some(i => i.nome.toLowerCase() === nome.toLowerCase())) {
      feedbackEl.textContent = 'Instrutor já cadastrado com este nome.'; return;
    }
    const novoInstrutor = new Instrutor(nome, senha, tel, email, especialidade);
    database.instrutores.push(novoInstrutor);
    saveDatabase();
    
    feedbackEl.textContent = `Instrutor cadastrado com sucesso! Seu ID de Instrutor é: ${novoInstrutor.id}. Use-o para fazer login.`;
    clearFormById('form-cadastro-instrutor');
  }

  function handleLogout() {
    currentUser = null; selectedStudentIdForPlan = null; selectedStudentIdForAnamnese = null; selectedGrupoKeyForPlan = null;
    document.getElementById('instrutor-dashboard-content').style.display = 'none';
    document.getElementById('aluno-plano-content').style.display = 'none';
    document.getElementById('instrutor-gerenciar-plano-container').style.display = 'none';
    document.getElementById('detalhes-grupo-selecionado-instrutor').style.display = 'none';
    switchView('landing-page');
  }

  function loadAnamnesePendenteView() {
    const aluno = currentUser.dados;
    const msgStatus = document.getElementById('msg-anamnese-status');
    const btnSolicitar = document.getElementById('btn-solicitar-anamnese');
    
    if (aluno.solicitacaoAnamnesePendente) {
      msgStatus.textContent = "Sua solicitação de anamnese foi enviada. Aguarde a liberação pelo instrutor.";
      btnSolicitar.style.display = 'none';
    } else {
      msgStatus.textContent = "Você precisa realizar uma anamnese com um instrutor. Clique abaixo para solicitar.";
      btnSolicitar.style.display = 'block';
    }
  }

  function handleSolicitarAnamnese() {
    const aluno = currentUser.dados;
    if (!aluno.solicitacaoAnamnesePendente) {
      aluno.solicitacaoAnamnesePendente = true;
      if (!database.alunosPendentesAnamnese.includes(aluno.id)) {
        database.alunosPendentesAnamnese.push(aluno.id);
      }
      saveDatabase();
      loadAnamnesePendenteView();
      document.getElementById('feedback-anamnese').textContent = "Solicitação enviada com sucesso!";
      setTimeout(() => document.getElementById('feedback-anamnese').textContent = "", 3000);
    }
  }

  function renderAlunosPendentesAnamneseList() {
    const ul = document.getElementById('lista-anamneses-pendentes');
    ul.innerHTML = '';
    const pendentes = database.alunos.filter(aluno => 
        database.alunosPendentesAnamnese.includes(aluno.id) && !aluno.anamneseFeita
    );

    if (pendentes.length === 0) {
      ul.innerHTML = '<li>Nenhuma anamnese pendente.</li>';
      document.getElementById('form-realizar-anamnese-container').style.display = 'none';
      return;
    }

    pendentes.forEach(aluno => {
      const li = document.createElement('li');
      li.textContent = `${aluno.nome} (ID: ${aluno.id})`;
      const btnRealizar = document.createElement('button');
      btnRealizar.textContent = "Realizar/Ver";
      btnRealizar.classList.add('btn-aviso');
      btnRealizar.onclick = () => {
        selectedStudentIdForAnamnese = aluno.id;
        document.getElementById('nome-aluno-anamnese').textContent = `${aluno.nome} (ID: ${aluno.id})`;
        document.getElementById('obs-anamnese').value = aluno.observacoesAnamnese || '';
        document.getElementById('form-realizar-anamnese-container').style.display = 'block';
      };
      li.appendChild(btnRealizar);
      ul.appendChild(li);
    });
  }

  function handleRealizarAnamneseSubmit(e) {
    e.preventDefault();
    if (!selectedStudentIdForAnamnese) return;
    const alunoIndex = database.alunos.findIndex(a => a.id === selectedStudentIdForAnamnese);
    if (alunoIndex === -1) return;

    const aluno = database.alunos[alunoIndex];
    aluno.anamneseFeita = true;
    aluno.dataHoraAnamnese = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    aluno.observacoesAnamnese = document.getElementById('obs-anamnese').value.trim();
    
    const pendenteIndex = database.alunosPendentesAnamnese.indexOf(aluno.id);
    if (pendenteIndex > -1) {
      database.alunosPendentesAnamnese.splice(pendenteIndex, 1);
    }
    saveDatabase();
    document.getElementById('feedback-geral-instrutor').textContent = `Anamnese de ${aluno.nome} realizada e acesso liberado.`;
    setTimeout(() => document.getElementById('feedback-geral-instrutor').textContent = "", 3000);
    
    document.getElementById('form-realizar-anamnese-container').style.display = 'none';
    selectedStudentIdForAnamnese = null;
    renderAlunosPendentesAnamneseList();
  }

  function loadPlanoTreinoView() {
    const userGreetingEl = document.getElementById('user-greeting');
    const alunoContent = document.getElementById('aluno-plano-content');
    const instrutorContent = document.getElementById('instrutor-dashboard-content');
    
    if (!currentUser) { switchView('landing-page'); return; }
    const nomeDisplay = currentUser.tipo === 'aluno' ? `${currentUser.dados.nome} (ID: ${currentUser.dados.id})` : `${currentUser.dados.nome} (ID: ${currentUser.dados.id})`;
    userGreetingEl.textContent = `Olá, ${nomeDisplay}!`;

    if (currentUser.tipo === 'aluno') {
      alunoContent.style.display = 'block'; instrutorContent.style.display = 'none';
      document.getElementById('plano-treino-titulo').textContent = "Seu Plano de Treino";
      renderPlanoAlunoView(currentUser.dados.id);
    } else if (currentUser.tipo === 'instrutor') {
      alunoContent.style.display = 'none'; instrutorContent.style.display = 'block';
      document.getElementById('plano-treino-titulo').textContent = "Dashboard do Instrutor";
      renderAlunosPendentesAnamneseList();
      renderListaAlunosParaPlanos();
      document.getElementById('instrutor-gerenciar-plano-container').style.display = 'none';
      document.getElementById('detalhes-grupo-selecionado-instrutor').style.display = 'none';
    }
  }

  function renderPlanoAlunoView(alunoId) {
    const plano = database.planos[alunoId] || getDefaultPlanStructure();
    const descricaoEl = document.getElementById('plano-descricao-geral-display');
    const exerciciosEl = document.getElementById('plano-exercicios-segmentado-display');

    descricaoEl.textContent = plano.descricaoGeral || "Nenhuma descrição geral definida.";

    // Organização por dias da semana - ordem específica: Domingo, Segunda-Sexta, Sábado
    const diasSemana = {
      'domingo': 'Domingo',
      'segunda': 'Segunda-feira',
      'terca': 'Terça-feira', 
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sabado': 'Sábado'
    };

    // Distribuição dos grupos musculares por dias
    const distribuicaoDias = {
      'domingo': ['abdominais'], // Descanso ativo
      'segunda': ['pernas', 'gluteos'],
      'terca': ['peitoral', 'triceps'],
      'quarta': ['dorsais', 'bicepsAntebraco'],
      'quinta': ['deltoides'],
      'sexta': ['pernas', 'gluteos'],
      'sabado': ['abdominais']
    };

    // Criar interface com botões dos dias
    let html = `
      <div class="plano-semanal-botoes">
        <div class="dias-botoes">`;
    
    for (const [diaKey, diaNome] of Object.entries(diasSemana)) {
      const gruposNoDia = distribuicaoDias[diaKey] || [];
      let temExercicios = false;
      
      // Verifica se há exercícios para este dia
      gruposNoDia.forEach(grupoKey => {
        const exercicios = plano.grupos[grupoKey] || [];
        if (exercicios.length > 0) {
          temExercicios = true;
        }
      });

      const statusClass = temExercicios ? 'com-treino' : 'sem-treino';
      const statusText = temExercicios ? '💪' : (diaKey === 'domingo' ? '💤' : '⚪');
      
      html += `
        <button class="dia-botao ${statusClass}" onclick="exibirTreinoDia('${diaKey}', '${alunoId}')">
          <span class="dia-nome">${diaNome}</span>
          <span class="dia-status">${statusText}</span>
        </button>`;
    }

    html += `
        </div>
        <div class="treino-detalhes" id="treino-detalhes">
          <div class="treino-placeholder">
            <h3>📅 Selecione um dia da semana</h3>
            <p>Clique em um dos botões acima para ver os exercícios programados para esse dia.</p>
          </div>
        </div>
      </div>`;

    exerciciosEl.innerHTML = html;
  }

  // Função para exibir treino do dia selecionado
  function exibirTreinoDia(diaKey, alunoId) {
    const plano = database.planos[alunoId] || getDefaultPlanStructure();
    const detalhesEl = document.getElementById('treino-detalhes');
    
    // Remove seleção anterior
    document.querySelectorAll('.dia-botao').forEach(btn => btn.classList.remove('selecionado'));
    // Adiciona seleção ao botão clicado
    event.target.closest('.dia-botao').classList.add('selecionado');

    const diasSemana = {
      'domingo': 'Domingo', 'segunda': 'Segunda-feira', 'terca': 'Terça-feira', 
      'quarta': 'Quarta-feira', 'quinta': 'Quinta-feira', 'sexta': 'Sexta-feira', 'sabado': 'Sábado'
    };

    const distribuicaoDias = {
      'domingo': ['abdominais'], 'segunda': ['pernas', 'gluteos'], 'terca': ['peitoral', 'triceps'],
      'quarta': ['dorsais', 'bicepsAntebraco'], 'quinta': ['deltoides'], 'sexta': ['pernas', 'gluteos'], 'sabado': ['abdominais']
    };

    const diaNome = diasSemana[diaKey];
    const gruposNoDia = distribuicaoDias[diaKey] || [];
    let exerciciosDoDia = [];

    gruposNoDia.forEach(grupoKey => {
      const exercicios = plano.grupos[grupoKey] || [];
      exercicios.forEach(ex => {
        exerciciosDoDia.push({ ...ex, grupo: GRUPOS_MUSCULARES[grupoKey] });
      });
    });

    let html = `<div class="treino-dia-selecionado"><h3>🗓️ ${diaNome}</h3>`;

    if (exerciciosDoDia.length > 0) {
      const gruposComExercicios = {};
      exerciciosDoDia.forEach(ex => {
        if (!gruposComExercicios[ex.grupo]) gruposComExercicios[ex.grupo] = [];
        gruposComExercicios[ex.grupo].push(ex);
      });

      for (const [grupoNome, exercicios] of Object.entries(gruposComExercicios)) {
        html += `<div class="grupo-muscular-detalhes"><h4>💪 ${grupoNome}</h4>
          <div style="overflow-x: auto;">
          <table class="exercicios-tabela-detalhes">
            <thead>
              <tr><th>Exercício</th><th>Séries</th><th>Repetições</th><th>Sua Carga (kg)</th><th>Vídeo</th><th>Status</th></tr>
            </thead>
            <tbody>`;
        
        exercicios.forEach((ex, index) => {
          const uniqueId = `row-${diaKey}-${grupoNome.replace(/\s/g, '')}-${index}`;
          
          let ultimaCarga = "Nenhuma";
          const historicoExercicio = database.historicoTreinos?.[alunoId]?.[ex.exercicio];
          if (historicoExercicio && historicoExercicio.length > 0) {
              historicoExercicio.sort((a, b) => new Date(b.data) - new Date(a.data));
              ultimaCarga = historicoExercicio[0].carga + " kg";
          }

          html += `<tr>
            <td>${ex.exercicio}</td>
            <td>${ex.series}</td>
            <td>${ex.repeticoes}</td>
            <td class="carga-cell">
              <div class="carga-input-group">
                <input type="text" placeholder="kg" id="carga-input-${uniqueId}" value="${ex.carga || ''}">
                <button onclick="salvarCarga(${alunoId}, '${ex.exercicio}', '${uniqueId}')">Salvar</button>
              </div>
              <small class="ultima-carga-display" id="ultima-carga-display-${uniqueId}">
                Última: ${ultimaCarga}
              </small>
            </td>
            <td><button onclick="playVideo('${ex.exercicio}')" style="background-color: var(--cor-laranja); color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">Ver</button></td>
            <td>
              <label style="cursor:pointer; display:flex; align-items:center; gap: 5px; white-space: nowrap;">
                <input type="checkbox" onchange="handleExercicioConcluido(this, '${uniqueId}')">
                <span>Concluído</span>
              </label>
              <span id="${uniqueId}" class="timer-display"></span>
            </td>
          </tr>`;
        });
        
        html += '</tbody></table></div></div>';
      }
    } else {
      if (diaKey === 'domingo') {
        html += '<div class="dia-descanso-detalhes">💤 <strong>Dia de descanso ativo</strong><br>Aproveite para relaxar e se recuperar!</div>';
      } else {
        html += '<div class="dia-vazio-detalhes">⚪ <strong>Nenhum exercício programado</strong><br>Aguarde o instrutor configurar seu treino.</div>';
      }
    }

    html += '</div>';
    detalhesEl.innerHTML = html;
  }

  function salvarCarga(alunoId, exercicioNome, uniqueId) {
      const inputEl = document.getElementById(`carga-input-${uniqueId}`);
      const cargaValue = inputEl.value.trim();

      if (cargaValue === '') {
          alert('Por favor, insira um valor para a carga.');
          return;
      }

      const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (!database.historicoTreinos) database.historicoTreinos = {};
      if (!database.historicoTreinos[alunoId]) database.historicoTreinos[alunoId] = {};
      if (!database.historicoTreinos[alunoId][exercicioNome]) database.historicoTreinos[alunoId][exercicioNome] = [];

      database.historicoTreinos[alunoId][exercicioNome].push({ data: hoje, carga: cargaValue });
      saveDatabase();

      const displayEl = document.getElementById(`ultima-carga-display-${uniqueId}`);
      displayEl.textContent = `Última: ${cargaValue} kg`;

      const button = document.querySelector(`#carga-input-${uniqueId} + button`);
      button.textContent = 'Salvo!';
      button.style.backgroundColor = 'var(--cor-sucesso)';
      setTimeout(() => {
          button.textContent = 'Salvar';
          button.style.backgroundColor = 'var(--cor-primaria)';
      }, 2000);
  }


  function handleExercicioConcluido(checkbox, timerId) {
    const timerEl = document.getElementById(timerId);

    if (activeTimers[timerId]) {
      clearInterval(activeTimers[timerId]);
      delete activeTimers[timerId];
    }

    if (!checkbox.checked) {
      timerEl.textContent = "";
      return;
    }

    checkbox.disabled = true;
    let tempoRestante = 60;
    timerEl.textContent = `⏳ ${tempoRestante}s`;
    timerEl.style.color = 'var(--cor-aviso)';

    const intervalId = setInterval(() => {
      tempoRestante--;
      timerEl.textContent = `⏳ ${tempoRestante}s`;

      if (tempoRestante <= 0) {
        clearInterval(intervalId);
        delete activeTimers[timerId];
        timerEl.textContent = "✅ Pode recomeçar!";
        timerEl.style.color = 'var(--cor-sucesso)';
        checkbox.disabled = false;
      }
    }, 1000);

    activeTimers[timerId] = intervalId;
  }
  
  // FUNÇÃO ATUALIZADA para incluir a lógica de busca
  function renderListaAlunosParaPlanos(filtro = '') {
    const ul = document.getElementById('lista-alunos-instrutor');
    ul.innerHTML = '';

    const filtroLowerCase = filtro.toLowerCase().trim();

    const alunosFiltrados = database.alunos.filter(aluno => {
      if (!aluno.ativo) return false;
      if (filtroLowerCase === '') return true;

      const nomeMatch = aluno.nome.toLowerCase().includes(filtroLowerCase);
      const idMatch = aluno.id.toString().includes(filtroLowerCase);

      return nomeMatch || idMatch;
    });

    if (alunosFiltrados.length === 0) {
      ul.innerHTML = '<li>Nenhum aluno encontrado.</li>';
      return;
    }

    alunosFiltrados.forEach(aluno => {
      const li = document.createElement('li');
      li.textContent = `${aluno.nome} (ID: ${aluno.id})`;
      const btnGerenciar = document.createElement('button');
      btnGerenciar.textContent = "Gerenciar Plano";
      btnGerenciar.classList.add('btn-sucesso');
      btnGerenciar.onclick = () => {
        selectedStudentIdForPlan = aluno.id;
        selectedGrupoKeyForPlan = null;
        document.getElementById('instrutor-nome-aluno-plano').textContent = `Plano de ${aluno.nome} (ID: ${aluno.id})`;
        document.getElementById('instrutor-gerenciar-plano-container').style.display = 'block';
        document.getElementById('detalhes-grupo-selecionado-instrutor').style.display = 'none';
        
        const plano = database.planos[aluno.id] || getDefaultPlanStructure();
        document.getElementById('txt-descricao-geral-plano').value = plano.descricaoGeral || '';
        
        renderListaGruposMusculares();
      };
      li.appendChild(btnGerenciar);
      ul.appendChild(li);
    });
  }

  function renderListaGruposMusculares() {
    const ul = document.getElementById('lista-grupos-musculares-instrutor');
    ul.innerHTML = '';

    for (const [grupoKey, grupoNome] of Object.entries(GRUPOS_MUSCULARES)) {
      const li = document.createElement('li');
      li.textContent = grupoNome;
      li.onclick = () => {
        selectedGrupoKeyForPlan = grupoKey;
        document.querySelectorAll('#lista-grupos-musculares-instrutor li').forEach(item => item.classList.remove('selected'));
        li.classList.add('selected');
        document.getElementById('titulo-grupo-selecionado').textContent = grupoNome;
        document.getElementById('detalhes-grupo-selecionado-instrutor').style.display = 'block';
        renderTabelaExerciciosGrupo(grupoKey);
        renderExercicioSelect(grupoKey);
      };
      ul.appendChild(li);
    }
  }

  function renderExercicioSelect(grupoKey) {
    const select = document.getElementById('instrutor-ex-nome');
    select.innerHTML = '<option value="" disabled selected>Escolha um exercício...</option>';
    const exerciciosDisponiveis = EXERCICIOS_LISTA[grupoKey] || [];
    exerciciosDisponiveis.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex;
      option.textContent = ex;
      select.appendChild(option);
    });
  }

  function renderTabelaExerciciosGrupo(grupoKey) {
    const plano = database.planos[selectedStudentIdForPlan] || getDefaultPlanStructure();
    const exercicios = plano.grupos[grupoKey] || [];
    const container = document.getElementById('tabela-exercicios-grupo-container');

    if (exercicios.length === 0) {
      container.innerHTML = '<p>Nenhum exercício cadastrado para este grupo.</p>';
      return;
    }

    let html = `<table class="exercicios-tabela">
      <thead>
        <tr><th>Exercício</th><th>Séries</th><th>Repetições</th><th>Carga</th><th>Vídeo</th><th>Ações</th></tr>
      </thead>
      <tbody>`;

    exercicios.forEach((ex, index) => {
      html += `<tr>
        <td>${ex.exercicio}</td>
        <td>${ex.series}</td>
        <td>${ex.repeticoes}</td>
        <td>${ex.carga || '-'}</td>
        <td><button onclick="playVideo('${ex.exercicio}')" style="background-color: var(--cor-laranja); color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">Ver</button></td>
        <td>
          <button onclick="removerExercicioInstrutor(${index})" class="btn-aviso">Remover</button>
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function removerExercicioInstrutor(index) {
    if (!selectedStudentIdForPlan || !selectedGrupoKeyForPlan) return;
    if (confirm('Tem certeza que deseja remover este exercício?')) {
      const plano = database.planos[selectedStudentIdForPlan];
      plano.grupos[selectedGrupoKeyForPlan].splice(index, 1);
      saveDatabase();
      renderTabelaExerciciosGrupo(selectedGrupoKeyForPlan);
    }
  }

  function handleAtualizarDescricaoGeralPlano() {
    if (!selectedStudentIdForPlan) return;
    const descricao = document.getElementById('txt-descricao-geral-plano').value.trim();
    
    if (!database.planos[selectedStudentIdForPlan]) {
      database.planos[selectedStudentIdForPlan] = getDefaultPlanStructure();
    }

    database.planos[selectedStudentIdForPlan].descricaoGeral = descricao;
    saveDatabase();
    document.getElementById('feedback-geral-instrutor').textContent = 'Descrição geral atualizada com sucesso!';
    setTimeout(() => document.getElementById('feedback-geral-instrutor').textContent = "", 3000);
  }

  function handleAdicionarExercicioSubmit(e) {
    e.preventDefault();
    if (!selectedStudentIdForPlan || !selectedGrupoKeyForPlan) return;
    
    const nome = document.getElementById('instrutor-ex-nome').value.trim();
    const series = document.getElementById('instrutor-ex-series').value.trim();
    const repeticoes = document.getElementById('instrutor-ex-repeticoes').value.trim();
    const carga = document.getElementById('instrutor-ex-carga').value.trim();

    if (!nome || !series || !repeticoes) {
      alert('Nome, séries e repetições são obrigatórios.');
      return;
    }

    const exercicio = { exercicio: nome, series, repeticoes, carga };
    
    if (!database.planos[selectedStudentIdForPlan]) {
      database.planos[selectedStudentIdForPlan] = getDefaultPlanStructure();
    }

    database.planos[selectedStudentIdForPlan].grupos[selectedGrupoKeyForPlan].push(exercicio);
    saveDatabase();
    renderTabelaExerciciosGrupo(selectedGrupoKeyForPlan);
    document.getElementById('form-gerenciar-exercicio').reset();
    document.getElementById('feedback-geral-instrutor').textContent = 'Exercício adicionado com sucesso!';
    setTimeout(() => document.getElementById('feedback-geral-instrutor').textContent = "", 3000);
  }

  // Mapa de vídeos para exercícios
  const VIDEO_MAP = {
    "AGACHAMENTO": { tipo: "youtube", url: "https://www.youtube.com/embed/3lnOuUI3EMs" },
    "ROSCA SCOTT": {tipo: "youtube", url: "https://www.youtube.com/embed/Plsc8KKglXY"},
    "CROSS-OVER":  {tipo:"youtube", url: "https://www.youtube.com/embed/oJGbmdDjer0?si=xcNJa8DluLdcZbZE"},
    "MÁQUINA PEITORAL": {tipo: "youtube", url: "https://www.youtube.com/embed/_HkzSNc2XYQ?si=OPFCZC2aTQzm9nQS"},
    "ARNOLD PRESS": {tipo: "youtube", url: "https://www.youtube.com/embed/7pzB1nC4-yw?si=7ZFeediUwN00m5M2"},
    "AGACHAMENTO NA PAREDE": {tipo: "youtube", url: "https://www.youtube.com/embed/IxTpek0dDXw?si=HoEgi0tHqtlks0Ag"},
    "AGACHAMENTO SUMO": {tipo: "youtube", url: "https://www.youtube.com/embed/9Ujgn3SsW40?si=tAj_Dk0ghVaLglif"},
  };

  function playVideo(exerciseName) {
    const videoData = VIDEO_MAP[exerciseName.toUpperCase()];
    const videoPlayer = document.getElementById('exerciseVideoPlayer');
    const youtubePlayer = document.getElementById('youtubeVideoPlayer');

    if (!videoData) {
      alert("Vídeo não disponível para este exercício.");
      return;
    }

    videoPlayer.style.display = "none";
    youtubePlayer.style.display = "none";

    if (videoData.tipo === "youtube") {
      // 1. Pega a URL original do seu VIDEO_MAP
      const originalUrl = videoData.url;

      // 2. Extrai o ID do vídeo da URL de forma segura
      const videoId = originalUrl.split('/').pop().split('?')[0];

      // 3. Monta a nova URL com os parâmetros de loop e autoplay
      const loopUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&playsinline=1`;

      // 4. Atribui a nova URL ao player do YouTube
      youtubePlayer.src = loopUrl;
      
      youtubePlayer.style.display = "block";
      videoPlayer.pause();
    } else {
      const videoSourceElement = document.getElementById('exerciseVideoSource');
      videoSourceElement.src = videoData.url;
      videoPlayer.load();
      videoPlayer.style.display = "block";
    }

    document.getElementById('videoModal').style.display = "block";
  }

  function closeModal() {
    const videoPlayer = document.getElementById('exerciseVideoPlayer');
    const youtubePlayer = document.getElementById('youtubeVideoPlayer');
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    youtubePlayer.src = '';
    document.getElementById('videoModal').style.display = "none";
  }

  // Inicialização
  document.addEventListener('DOMContentLoaded', setupEventListeners);
