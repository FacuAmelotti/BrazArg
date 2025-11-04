// ===============================
// 🌎 SISTEMA DE MODO ARG / BR BRAZARG
// ===============================

// 🔹 Detectar tipo de página
function getPageType() {
  const path = window.location.pathname;
  if (path.includes("temario")) return "temario";
  if (path.includes("portal")) return "portal";
  if (path.includes("unidad")) return "unidad";
  return "index";
}

// 🔹 Cargar estilos dinámicos
function applyTheme(mode) {
  const page = getPageType();

  const setStyle = (id, href) => {
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  };

  if (page === "temario") {
    setStyle("theme-style-base", `../src/styles/index_${mode === "argentina" ? "arg" : "brz"}.css`);
    setStyle("theme-style-extra", `../src/styles/temario_${mode === "argentina" ? "arg" : "brz"}.css`);
  } 
  else if (page === "portal") {
    setStyle("theme-style-base", `../src/styles/index_${mode === "argentina" ? "arg" : "brz"}.css`);
    setStyle("theme-style-extra", `../src/styles/portal_${mode === "argentina" ? "arg" : "brz"}.css`);
  } 
  else if (page === "unidad") {
    setStyle("theme-style-base", `../../src/styles/index_${mode === "argentina" ? "arg" : "brz"}.css`);
    setStyle("theme-style-extra", `../../src/styles/unidad_${mode === "argentina" ? "arg" : "brz"}.css`);
  } 
  else {
    setStyle("theme-style-base", `./src/styles/index_${mode === "argentina" ? "arg" : "brz"}.css`);
    const extra = document.getElementById("theme-style-extra");
    if (extra) extra.remove();
  }
}

// ===============================
// 🔄 Cargar contenido desde JSON
// ===============================
async function loadContent(mode = "argentina") {
  try {
    const page = getPageType();
    const basePath = page === "temario" ? "../src/json" : "./src/json";
    const filePrefix = page === "temario" ? "temario" : "index";

    const response = await fetch(`${basePath}/${filePrefix}_${mode === "argentina" ? "arg" : "brz"}.json`);
    const data = await response.json();

    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.getAttribute("data-key");
      if (data[key]) el.textContent = data[key];
    });

    // Solo aplica a index
    if (page === "index") {
      const featuresGrid = document.getElementById("featuresGrid");
      if (featuresGrid) {
        featuresGrid.innerHTML = "";
        data.features_items.forEach(item => {
          const div = document.createElement("div");
          div.classList.add("feature-card");
          div.innerHTML = `
            <div class="feature-icon">${item.icon}</div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          `;
          featuresGrid.appendChild(div);
        });
      }

      const gamesGrid = document.getElementById("gamesGrid");
      if (gamesGrid) {
        gamesGrid.innerHTML = "";
        data.games_items.forEach(item => {
          const div = document.createElement("div");
          div.classList.add("game-card");
          div.innerHTML = `
            <div class="game-card-content">
              <span class="game-emoji">${item.emoji}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </div>
          `;
          gamesGrid.appendChild(div);
        });
      }

      const footerCopy = document.getElementById("footerCopy");
      if (footerCopy) footerCopy.textContent = data.footer_copy;
    }
  } catch (err) {
    console.error("Error cargando contenido:", err);
  }
}

// ===============================
// 🚀 Alternar y guardar modo
// ===============================
async function toggleMode() {
  const current = localStorage.getItem("mode") || "argentina";
  const next = current === "argentina" ? "brasil" : "argentina";
  document.body.setAttribute("data-mode", next);
  localStorage.setItem("mode", next);

  const modeLabel = document.getElementById("modeLabel");
  modeLabel.textContent = next === "argentina" ? "🇦🇷 ARG" : "🇧🇷 BR";

  applyTheme(next);

  const page = getPageType();
  if (page === "temario") {
    await loadTemario(next);
  } 
  else if (page === "unidad") {
    await loadUnidad(next); // ✅ llama al script de unidad.js
  }
  else {
    await loadContent(next);
  }
}

// ===============================
// ⚙️ Inicialización global
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const savedMode = localStorage.getItem("mode") || "argentina";
  document.body.setAttribute("data-mode", savedMode);

  const modeLabel = document.getElementById("modeLabel");
  modeLabel.textContent = savedMode === "argentina" ? "🇦🇷 ARG" : "🇧🇷 BR";

  applyTheme(savedMode);

  const page = getPageType();
  if (page === "temario") {
    await loadTemario(savedMode);
  } 
  else if (page === "unidad") {
    await loadUnidad(savedMode);
  }
  else {
    await loadContent(savedMode);
  }

  const toggle = document.getElementById("modeToggle");
  if (toggle) toggle.addEventListener("click", toggleMode);
});
