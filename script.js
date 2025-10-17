
//@ts-check
'use strict';

// Importa os dados de um arquivo separado para melhor organização
import { GRUPOS_MUSCULARES, EXERCICIOS_LISTA } from './database.js';

// Chave para armazenamento local, garantindo que os dados persistam na sessão do usuário
const STORAGE_KEY = 'academia-unifev-db-v4';

/**
 * @typedef {object} Exercicio
 * @property {string} exercicio
 * @property {string} series
 * @property {string} repeticoes
 * @property {string} [carga]
 */

/**
 * @typedef {object} PlanoDeTreino
 * @property {string} descricaoGeral
 * @property {Record<string, Exercicio[]>} grupos
 */

/**
 * @typedef {object} Aluno
 * @property {number} id
 * @property {string} nome
 * @property {string} senha
 * @property {string} telefone
 * @property {string} email
 * @property {'ativo' | 'inativo' | 'pendente'} statusAnamnese
 */

/**
 * @typedef {object} Instrutor
 * @property {number} id
 * @property {string} nome
 * @property {string} senha
 * @property {string} telefone
 * @property {string} email
 * @property {string} especialidade
 */

/**
 * @typedef {object} Admin
 * @property {string} usuario
 * @property {string} senha
 */

/**
 * @typedef {object} Database
 * @property {Aluno[]} alunos
 * @property {Instrutor[]} instrutores
 * @property {Admin} admin
 * @property {Record<number, PlanoDeTreino>} planos
 * @property {any[]} anamneses
 */

// --- Funções de Manipulação do Banco de Dados Local ---

/**
 * Estrutura padrão para um novo plano de treino.
 * @returns {PlanoDeTreino}
 */
function getDefaultPlanStructure() {
  return {
    descricaoGeral: '',
    grupos: {
      pernas: [],
      gluteos: [],
      peitoral: [],
      bicepsAntebraco: [],
      dorsais: [],
      deltoides: [],
      triceps: [],
      abdominais: [],
    },
  };
}

/**
 * Carrega o banco de dados do Local Storage.
 * Se não existir, inicializa com uma estrutura padrão.
 * @returns {Database}
 */
function loadDatabase() {
  const dbString = localStorage.getItem(STORAGE_KEY);
  if (dbString) {
    return JSON.parse(dbString);
  } else {
    // Estrutura inicial do banco de dados com um admin padrão para testes
    return {
      alunos: [],
      instrutores: [],
      admin: { usuario: 'admin', senha: 'admin' }, // Admin padrão
      planos: {},
      anamneses: [],
    };
  }
}

/**
 * Salva o banco de dados no Local Storage.
 * @param {Database} db
 */
function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

let database = loadDatabase(); // Carrega o DB na inicialização

// --- Funções de Interface do Usuário (UI) ---

/**
 * Alterna a visibilidade das seções da página (views).
 * @param {string} viewId O ID da view a ser exibida.
 */
function showView(viewId) {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active');
    view.setAttribute('hidden', 'true');
  });
  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.classList.add('active');
    activeView.removeAttribute('hidden');
  }
}

/**
 * Exibe uma mensagem de feedback em um elemento específico.
 * @param {string} elementId O ID do elemento onde a mensagem será exibida.
 * @param {string} message A mensagem a ser exibida.
 * @param {boolean} isError Se a mensagem é de erro (true) ou sucesso/info (false).
 */
function showFeedback(elementId, message, isError = false) {
  const feedbackElement = document.getElementById(elementId);
  if (feedbackElement) {
    feedbackElement.textContent = message;
    feedbackElement.style.color = isError ? 'var(--cor-erro)' : 'var(--cor-sucesso)';
    setTimeout(() => {
      feedbackElement.textContent = '';
      feedbackElement.style.color = '';
    }, 5000);
  }
}

// --- Funções de Validação e Formatação ---

/**
 * Aplica uma máscara de formatação de telefone a um campo de input.
 * @param {HTMLInputElement | null} inputElement
 */
function aplicarMascaraTelefone(inputElement) {
  if (!inputElement) return;
  inputElement.addEventListener('input', (e) => {
    const input = /** @type {HTMLInputElement} */ (e.target);
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    input.value = value;

    // Validação visual
    if (value.replace(/\D/g, '').length === 11 || value === '') {
      input.classList.remove('error');
    } else {
      input.classList.add('error');
    }
  });
}

/**
 * Valida um número de telefone com base no formato brasileiro de 11 dígitos.
 * @param {string} telefone
 * @returns {boolean}
 */
function validarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, '');
  return digits.length === 11;
}

// --- Lógica de Autenticação ---

/**
 * Realiza o login de um administrador.
 * @param {Event} e
 */
function handleAdminLogin(e) {
  e.preventDefault();
  const form = /** @type {HTMLFormElement} */ (e.target);
  const usuarioInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('admin-usuario-login'));
  const senhaInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('admin-senha-login'));

  if (usuarioInput.value === database.admin.usuario && senhaInput.value === database.admin.senha) {
    showView('admin-dashboard-view');
    showFeedback('feedback-admin-login', 'Login de administrador bem-sucedido!', false);
    // Implementar lógica para carregar dados do admin dashboard
  } else {
    showFeedback('feedback-admin-login', 'Usuário ou senha do administrador inválidos.', true);
  }
}

/**
 * Realiza o login de um aluno.
 * @param {Event} e
 */
function handleAlunoLogin(e) {
  e.preventDefault();
  const form = /** @type {HTMLFormElement} */ (e.target);
  const idInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('aluno-id-login'));
  const senhaInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('aluno-senha-login'));

  const aluno = database.alunos.find(a => a.id === parseInt(idInput.value) && a.senha === senhaInput.value);

  if (aluno) {
    showFeedback('feedback-msg', `Bem-vindo, ${aluno.nome}!`, false);
    // Lógica para verificar status da anamnese e direcionar
    if (aluno.statusAnamnese === 'pendente') {
      showView('aluno-anamnese-pendente-view');
    } else {
      showView('plano-treino-view');
      // Renderizar plano de treino
    }
  } else {
    showFeedback('feedback-msg', 'ID de aluno ou senha inválidos.', true);
  }
}

/**
 * Realiza o login de um instrutor.
 * @param {Event} e
 */
function handleInstrutorLogin(e) {
  e.preventDefault();
  const form = /** @type {HTMLFormElement} */ (e.target);
  const idInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('instrutor-id-login'));
  const senhaInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('instrutor-senha-login'));

  const instrutor = database.instrutores.find(i => i.id === parseInt(idInput.value) && i.senha === senhaInput.value);

  if (instrutor) {
    showFeedback('feedback-msg-instrutor', `Bem-vindo, ${instrutor.nome}!`, false);
    showView('instrutor-dashboard-view');
    // Implementar lógica para carregar dados do instrutor dashboard
  } else {
    showFeedback('feedback-msg-instrutor', 'ID de instrutor ou senha inválidos.', true);
  }
}

// --- Lógica de Cadastro ---

/**
 * Realiza o cadastro de um novo aluno.
 * @param {Event} e
 */
function handleCadastroAluno(e) {
  e.preventDefault();
  const form = /** @type {HTMLFormElement} */ (e.target);
  const nomeInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-aluno-nome'));
  const senhaInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-aluno-senha'));
  const telInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-aluno-tel'));
  const emailInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-aluno-email'));

  if (!validarTelefone(telInput.value)) {
    showFeedback('feedback-cad-aluno', 'Por favor, insira um telefone válido com 11 dígitos.', true);
    return;
  }

  const newAluno = {
    id: database.alunos.length > 0 ? Math.max(...database.alunos.map(a => a.id)) + 1 : 1,
    nome: nomeInput.value,
    senha: senhaInput.value,
    telefone: telInput.value,
    email: emailInput.value,
    statusAnamnese: 'pendente',
  };

  database.alunos.push(newAluno);
  saveDatabase(database);
  showFeedback('feedback-cad-aluno', `Aluno ${newAluno.nome} cadastrado com sucesso! ID: ${newAluno.id}`, false);
  form.reset();
  setTimeout(() => showView('aluno-login-view'), 2000);
}

/**
 * Realiza o cadastro de um novo instrutor.
 * @param {Event} e
 */
function handleCadastroInstrutor(e) {
  e.preventDefault();
  const form = /** @type {HTMLFormElement} */ (e.target);
  const nomeInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-instrutor-nome'));
  const senhaInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-instrutor-senha'));
  const telInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-instrutor-tel'));
  const emailInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-instrutor-email'));
  const especialidadeInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('cad-instrutor-especialidade'));

  if (!validarTelefone(telInput.value)) {
    showFeedback('feedback-cad-instrutor', 'Por favor, insira um telefone válido com 11 dígitos.', true);
    return;
  }

  const newInstrutor = {
    id: database.instrutores.length > 0 ? Math.max(...database.instrutores.map(i => i.id)) + 1 : 1,
    nome: nomeInput.value,
    senha: senhaInput.value,
    telefone: telInput.value,
    email: emailInput.value,
    especialidade: especialidadeInput.value,
  };

  database.instrutores.push(newInstrutor);
  saveDatabase(database);
  showFeedback('feedback-cad-instrutor', `Instrutor ${newInstrutor.nome} cadastrado com sucesso! ID: ${newInstrutor.id}`, false);
  form.reset();
  setTimeout(() => showView('instrutor-login-view'), 2000);
}

// --- Lógica do Modal de Vídeo ---

const VIDEO_MAP = {
  "AGACHAMENTO": { tipo: "youtube", url: "https://www.youtube.com/embed/3lnOuUI3EMs" },
  "ROSCA SCOTT": { tipo: "youtube", url: "https://www.youtube.com/embed/Plsc8KKglXY" },
  "CROSS-OVER": { tipo: "youtube", url: "https://www.youtube.com/embed/oJGbmdDjer0?si=xcNJa8DluLdcZbZE" },
  "MÁQUINA PEITORAL": { tipo: "youtube", url: "https://www.youtube.com/embed/_HkzSNc2XYQ?si=OPFCZC2aTQzm9nQS" },
  "ARNOLD PRESS": { tipo: "youtube", url: "https://www.youtube.com/embed/7pzB1nC4-yw?si=7ZFeediUwN00m5M2" },
  "AGACHAMENTO NA PAREDE": { tipo: "youtube", url: "https://www.youtube.com/embed/IxTpek0dDXw?si=HoEgi0tHqtlks0Ag" },
  "AGACHAMENTO SUMO": { tipo: "youtube", url: "https://www.youtube.com/embed/9Ujgn3SsW40?si=tAj_Dk0ghVaLglif" },
  // Adicione mais exercícios e seus vídeos aqui
};

/**
 * Abre o modal de vídeo e reproduz o vídeo do exercício.
 * @param {string} exerciseName O nome do exercício para buscar o vídeo.
 */
function playVideo(exerciseName) {
  const videoData = VIDEO_MAP[exerciseName.toUpperCase()];
  const videoModal = document.getElementById('videoModal');
  const exerciseVideoPlayer = /** @type {HTMLVideoElement} */ (document.getElementById('exerciseVideoPlayer'));
  const youtubeVideoPlayer = /** @type {HTMLIFrameElement} */ (document.getElementById('youtubeVideoPlayer'));

  if (!videoData || !videoModal || !exerciseVideoPlayer || !youtubeVideoPlayer) {
    showFeedback('feedback-geral', 'Vídeo não disponível para este exercício.', true);
    return;
  }

  exerciseVideoPlayer.style.display = 'none';
  youtubeVideoPlayer.style.display = 'none';

  if (videoData.tipo === 'youtube') {
    const url = new URL(videoData.url);
    const videoId = url.pathname.split('/').pop();
    youtubeVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&playsinline=1`;
    youtubeVideoPlayer.style.display = 'block';
    exerciseVideoPlayer.pause();
  } else {
    exerciseVideoPlayer.src = videoData.url;
    exerciseVideoPlayer.load();
    exerciseVideoPlayer.style.display = 'block';
  }

  videoModal.removeAttribute('hidden');
  videoModal.style.display = 'flex'; // Para centralizar o modal
}

/**
 * Fecha o modal de vídeo e para a reprodução.
 */
function closeModal() {
  const videoModal = document.getElementById('videoModal');
  const exerciseVideoPlayer = /** @type {HTMLVideoElement} */ (document.getElementById('exerciseVideoPlayer'));
  const youtubeVideoPlayer = /** @type {HTMLIFrameElement} */ (document.getElementById('youtubeVideoPlayer'));

  if (!videoModal || !exerciseVideoPlayer || !youtubeVideoPlayer) return;

  exerciseVideoPlayer.pause();
  exerciseVideoPlayer.currentTime = 0;
  youtubeVideoPlayer.src = ''; // Limpa o src do iframe para parar o vídeo do YouTube
  videoModal.setAttribute('hidden', 'true');
  videoModal.style.display = 'none';
}

// --- Inicialização e Event Listeners Globais ---

document.addEventListener('DOMContentLoaded', () => {
  // Aplica máscara aos campos de telefone
  aplicarMascaraTelefone(document.getElementById('cad-aluno-tel'));
  aplicarMascaraTelefone(document.getElementById('cad-instrutor-tel'));

  // --- Navegação Principal ---
  document.getElementById('btn-entrar-aluno')?.addEventListener('click', () => showView('aluno-login-view'));
  document.getElementById('btn-entrar-instrutor')?.addEventListener('click', () => showView('instrutor-login-view'));
  document.getElementById('btn-entrar-admin')?.addEventListener('click', () => showView('admin-login-view'));
  document.getElementById('btn-cadastrar')?.addEventListener('click', () => showView('cadastro-escolha-view'));

  document.querySelectorAll('.btn-voltar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = /** @type {HTMLElement} */ (e.currentTarget).dataset.targetview;
      if (targetView) showView(targetView);
    });
  });

  // --- Cadastro ---
  document.getElementById('btn-tipo-cad-aluno')?.addEventListener('click', () => showView('cadastro-aluno-view'));
  document.getElementById('btn-tipo-cad-instrutor')?.addEventListener('click', () => showView('cadastro-instrutor-view'));
  document.getElementById('form-cadastro-aluno')?.addEventListener('submit', handleCadastroAluno);
  document.getElementById('form-cadastro-instrutor')?.addEventListener('submit', handleCadastroInstrutor);

  // --- Logins ---
  document.getElementById('form-aluno-login')?.addEventListener('submit', handleAlunoLogin);
  document.getElementById('form-instrutor-login')?.addEventListener('submit', handleInstrutorLogin);
  document.getElementById('form-admin-login')?.addEventListener('submit', handleAdminLogin);

  // --- Modal de Vídeo ---
  document.querySelector('.modal .close-btn')?.addEventListener('click', closeModal);
  document.body.addEventListener('click', (e) => {
    if (e.target && /** @type {HTMLElement} */ (e.target).matches('.play-video-btn')) {
      const exerciseName = /** @type {HTMLElement} */ (e.target).dataset.exercise;
      if (exerciseName) playVideo(exerciseName);
    }
  });

  // --- Lógica do Dashboard Admin (navegação por abas) ---
  const adminNavButtons = document.querySelectorAll('.admin-nav button[role="tab"]');
  adminNavButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetButton = /** @type {HTMLButtonElement} */ (e.currentTarget);
      const targetPanelId = targetButton.getAttribute('aria-controls');

      adminNavButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-content').forEach(panel => {
        panel.setAttribute('hidden', 'true');
      });

      targetButton.classList.add('active');
      targetButton.setAttribute('aria-selected', 'true');
      document.getElementById(targetPanelId)?.removeAttribute('hidden');

      // Atualiza o breadcrumb (exemplo simples)
      const sectionName = targetButton.textContent?.replace('📊 ', '').replace('👥 ', '').replace('🏋️ ', '').replace('📞 ', '').trim();
      const currentSectionSpan = document.getElementById('current-section');
      if (currentSectionSpan && sectionName) {
        currentSectionSpan.textContent = sectionName;
      }
    });
  });

  // --- Lógica do Dashboard Instrutor (navegação por abas) ---
  const instrutorNavButtons = document.querySelectorAll('.admin-nav button[role="tab"]'); // Reutiliza a classe admin-nav
  instrutorNavButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetButton = /** @type {HTMLButtonElement} */ (e.currentTarget);
      const targetPanelId = targetButton.getAttribute('aria-controls');

      instrutorNavButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#instrutor-dashboard-view .tab-content').forEach(panel => {
        panel.setAttribute('hidden', 'true');
      });

      targetButton.classList.add('active');
      targetButton.setAttribute('aria-selected', 'true');
      document.getElementById(targetPanelId)?.removeAttribute('hidden');

      // Atualiza o breadcrumb (exemplo simples)
      const sectionName = targetButton.textContent?.replace('📊 ', '').replace('👥 ', '').replace('📝 ', '').replace('🏋️ ', '').trim();
      const currentSectionSpan = document.getElementById('instrutor-current-section');
      if (currentSectionSpan && sectionName) {
        currentSectionSpan.textContent = sectionName;
      }
    });
  });

  // Lógica de logout
  document.getElementById('btn-logout-admin')?.addEventListener('click', () => {
    // Limpar estado de login se houver
    showView('landing-page');
  });
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    // Limpar estado de login se houver
    showView('landing-page');
  });
  document.getElementById('btn-logout-anamnese')?.addEventListener('click', () => {
    // Limpar estado de login se houver
    showView('landing-page');
  });

  // Inicializa a view padrão
  showView('landing-page');
});

