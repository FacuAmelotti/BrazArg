// ===============================================================
// 🎮 REVOLUCIÓN NACIONAL (Versión BrazArg)
// Sistema bilingüe (ARG / BR) con carga dinámica de preguntas
// ===============================================================

let GAME = {
  player: null,
  mode: "argentina", // o "brasil"
  running: false,
  round: 1,
  turnIndex: 0,
  timeLeft: 20,
  timer: null,
  score: 0,
  best: 0,
  bonusActive: false,
  maxHP: 5,
  enemies: [],
  gridSize: 9,
};

// ===============================================================
// 🧩 INICIALIZACIÓN
// ===============================================================
window.addEventListener("DOMContentLoaded", () => {
  detectMode();
  setupUI();
  attachEventListeners();
});

// Detectar modo según URL
function detectMode() {
  if (window.location.pathname.includes("brz")) GAME.mode = "brasil";
  else GAME.mode = "argentina";
  applyGameTheme(GAME.mode);
}

// Aplicar tema visual
function applyGameTheme(mode) {
  const theme = document.getElementById("game-theme") || (() => {
    const link = document.createElement("link");
    link.id = "game-theme";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return link;
  })();

  theme.href = `../../src/styles/game_${mode === "argentina" ? "arg" : "brz"}.css`;
}

// ===============================================================
// ⚙️ CONFIGURAR INTERFAZ
// ===============================================================
function setupUI() {
  updateText("#round", GAME.round);
  updateText("#turnName", "—");
  updateText("#timeLeft", "20s");
  updateText("#score", GAME.score);
  updateText("#best", GAME.best);
  updateText("#tip", getRandomTip());

  // Celdas vacías iniciales
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let i = 1; i <= GAME.gridSize; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.id = "p" + i;
    grid.appendChild(div);
  }

  // Crear jugador en el centro
  const playerCell = document.getElementById("player");
  if (playerCell) playerCell.remove();
  const cell5 = document.getElementById("p5");
  const player = document.createElement("div");
  player.classList.add("player");
  player.id = "player";
  cell5.appendChild(player);

  GAME.player = {
    name: "Jugador",
    hp: GAME.maxHP,
    cell: 5,
  };

  renderHearts();
}

// ===============================================================
// 🎛️ EVENTOS DE INTERFAZ
// ===============================================================
function attachEventListeners() {
  document.getElementById("btnStart").addEventListener("click", startGame);
  document.getElementById("btnPlayAgain").addEventListener("click", resetGame);
  document.getElementById("btnRestart").addEventListener("click", resetGame);
  document.getElementById("btnExit").addEventListener("click", () => window.location.href = "../../pages/portal.html");
  document.getElementById("btnHelp").addEventListener("click", showHelp);

  document.getElementById("btnAttack").addEventListener("click", () => actionSelect("attack"));
  document.getElementById("btnFortify").addEventListener("click", () => actionSelect("fortify"));
  document.getElementById("btnRepair").addEventListener("click", () => actionSelect("repair"));
  document.getElementById("btnSpy").addEventListener("click", () => actionSelect("spy"));
}

// ===============================================================
// 🚀 INICIAR / REINICIAR
// ===============================================================
function startGame() {
  const nameInput = document.getElementById("playerNameInput");
  if (nameInput.value.trim() !== "") GAME.player.name = nameInput.value.trim();

  GAME.mode = document.querySelector("#modeFull").checked ? "argentina" : "brasil"; // temporal para test
  GAME.running = true;
  GAME.round = 1;
  GAME.turnIndex = 0;
  GAME.timeLeft = 20;
  GAME.score = 0;
  GAME.player.hp = GAME.maxHP;
  GAME.enemies = generateEnemies();
  updateHUD();
  toggleOverlay("startOverlay", false);
  nextTurn();
}

// Reiniciar partida
function resetGame() {
  clearInterval(GAME.timer);
  GAME.running = false;
  toggleOverlay("endOverlay", false);
  toggleOverlay("startOverlay", true);
  setupUI();
}

// ===============================================================
// 🕓 TURNOS Y RONDAS
// ===============================================================
function nextTurn() {
  if (!GAME.running) return;

  GAME.turnIndex++;
  GAME.timeLeft = 20;
  updateText("#turnName", GAME.player.name);
  updateText("#round", GAME.round);
  startTimer();

  // Enemigos se mueven al final del turno
  setTimeout(enemyActions, 3000 + Math.random() * 2000);
}

// ===============================================================
// ⏱️ TEMPORIZADOR
// ===============================================================
function startTimer() {
  clearInterval(GAME.timer);
  GAME.timer = setInterval(() => {
    GAME.timeLeft--;
    updateText("#timeLeft", `${GAME.timeLeft}s`);
    updateTimerBar();
    if (GAME.timeLeft <= 0) {
      clearInterval(GAME.timer);
      loseHP(1);
      logEvent("⏰ Tiempo agotado. Perdés 1 vida.");
      nextTurn();
    }
  }, 1000);
}

function updateTimerBar() {
  const fill = document.getElementById("timerFill");
  const percent = (GAME.timeLeft / 20) * 100;
  fill.style.width = percent + "%";
}

// ===============================================================
// ⚔️ ACCIONES DEL JUGADOR
// ===============================================================
function actionSelect(type) {
  if (!GAME.running) return;

  clearInterval(GAME.timer);
  showQuestion(type);
}

// ===============================================================
// ❓ PREGUNTAS Y RESPUESTAS
// ===============================================================
async function showQuestion(action) {
  const modal = document.getElementById("qModal");
  const title = document.getElementById("qTitle");
  const optionsBox = document.getElementById("qOptions");
  const explain = document.getElementById("qExplain");

  modal.classList.add("active");
  title.textContent = "Cargando pregunta...";

  // Cargar pregunta desde JSON (según modo)
  const jsonPath = `../../src/json/preguntas_${GAME.mode}.json`;
  let preguntas = [];
  try {
    const res = await fetch(jsonPath);
    preguntas = await res.json();
  } catch (e) {
    preguntas = [{ 
      question: "¿Cuál es la capital?", 
      options: ["Buenos Aires", "Río", "Lima"], 
      correct: 0,
      explanation: "Buenos Aires es la capital argentina."
    }];
  }

  const random = preguntas[Math.floor(Math.random() * preguntas.length)];
  title.textContent = random.question;
  optionsBox.innerHTML = "";
  explain.style.display = "none";

  random.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.classList.add("btn-ghost");
    btn.textContent = opt;
    btn.onclick = () => {
      if (idx === random.correct) {
        handleCorrectAnswer(action, random);
      } else {
        handleWrongAnswer(action, random);
      }
      explain.textContent = random.explanation;
      explain.style.display = "block";
    };
    optionsBox.appendChild(btn);
  });

  document.getElementById("btnCloseQuestion").onclick = () => {
    modal.classList.remove("active");
    nextTurn();
  };
}

// ===============================================================
// ✅ RESPUESTAS
// ===============================================================
function handleCorrectAnswer(action, q) {
  switch (action) {
    case "attack":
      damageEnemy(2);
      logEvent("⚔️ ¡Ataque exitoso! -2 HP enemigo");
      break;
    case "fortify":
      healHP(3);
      logEvent("🛡️ Fortificás tus defensas (+3 HP)");
      break;
    case "repair":
      healHP(1);
      logEvent("🔧 Reparación rápida (+1 HP)");
      break;
    case "spy":
      GAME.bonusActive = true;
      logEvent("🕵️ Activaste un bonus del 15% para el próximo turno.");
      break;
  }
  GAME.score += 10;
  updateHUD();
}

function handleWrongAnswer(action, q) {
  loseHP(1);
  logEvent("❌ Respuesta incorrecta. Perdés 1 vida.");
  updateHUD();
}

// ===============================================================
// ❤️ VIDA Y ESTADO
// ===============================================================
function renderHearts() {
  const hearts = document.getElementById("playerHearts");
  let out = "";
  for (let i = 0; i < GAME.player.hp; i++) out += "❤️";
  hearts.textContent = out || "💀";
}

function healHP(amount) {
  GAME.player.hp = Math.min(GAME.maxHP, GAME.player.hp + amount);
  renderHearts();
}

function loseHP(amount) {
  GAME.player.hp -= amount;
  renderHearts();
  if (GAME.player.hp <= 0) endGame(false);
}

function damageEnemy(dmg) {
  if (GAME.enemies.length > 0) {
    const target = GAME.enemies[Math.floor(Math.random() * GAME.enemies.length)];
    target.hp -= dmg;
    if (target.hp <= 0) {
      GAME.enemies = GAME.enemies.filter(e => e.hp > 0);
      logEvent(`💀 Enemigo ${target.name} derrotado.`);
      if (GAME.enemies.length === 0) endGame(true);
    }
  }
}

// ===============================================================
// 🤖 ENEMIGOS
// ===============================================================
function generateEnemies() {
  const count = 4 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => ({
    name: "Enemigo " + (i + 1),
    hp: 3 + Math.floor(Math.random() * 3),
  }));
}

function enemyActions() {
  if (!GAME.running) return;
  const dmg = Math.random() < 0.5 ? 1 : 2;
  loseHP(dmg);
  logEvent(`💥 Un enemigo te ataca (-${dmg} HP)`);
  updateHUD();
  nextTurn();
}

// ===============================================================
// 🧠 HUD / UTILIDADES
// ===============================================================
function updateHUD() {
  updateText("#score", GAME.score);
  updateText("#best", Math.max(GAME.best, GAME.score));
  renderHearts();
  updateText("#tip", getRandomTip());
}

function updateText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function toggleOverlay(id, state) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("active", state);
}

// ===============================================================
// 🏁 FIN DEL JUEGO
// ===============================================================
function endGame(victory) {
  GAME.running = false;
  clearInterval(GAME.timer);
  const end = document.getElementById("endOverlay");
  const title = document.getElementById("endTitle");
  const stats = document.getElementById("endStats");

  title.textContent = victory ? "🏆 ¡Victoria!" : "💀 Derrota...";
  stats.textContent = `Puntaje: ${GAME.score} | Ronda ${GAME.round}`;
  toggleOverlay("endOverlay", true);
}

// ===============================================================
// 📜 MISC
// ===============================================================
function logEvent(msg) {
  const log = document.getElementById("log");
  const p = document.createElement("p");
  p.textContent = msg;
  log.prepend(p);
  if (log.childNodes.length > 10) log.removeChild(log.lastChild);
}

function getRandomTip() {
  const tips = [
    "Atacá solo cuando estés listo.",
    "Fortificá antes de una gran ronda.",
    "Espiar puede darte ventaja estratégica.",
    "La paciencia es tu mejor arma.",
    "Cada respuesta correcta suma a tu legado.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function showHelp() {
  alert("🧠 Reglas básicas:\n\nAtacá, fortificá o curá respondiendo correctamente.\nLos enemigos atacan automáticamente.\nGaná eliminando a todos.");
}
