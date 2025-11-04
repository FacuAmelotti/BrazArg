// ===============================
// 📘 CONTROLADOR DE UNIDADES BRAZARG con Hover Bilingüe
// ===============================

let cachedData = { arg: null, brz: null };

// 🔹 Detectar número de unidad actual
function getUnidadId() {
  const path = window.location.pathname;
  const match = path.match(/unidad(\d+)/);
  return match ? match[1] : "1";
}

// 🔹 Cargar ambas versiones del JSON y preparar el modo actual
async function loadUnidad(mode = "argentina") {
  try {
    const unidadId = getUnidadId();

    // Cargar ambos idiomas si no están en caché
    if (!cachedData.arg) {
      const [argData, brzData] = await Promise.all([
        fetch(`../../src/json/unidad${unidadId}_arg.json`).then(r => r.json()),
        fetch(`../../src/json/unidad${unidadId}_brz.json`).then(r => r.json())
      ]);
      cachedData = { arg: argData, brz: brzData };
    }

    // Usar idioma actual
    const data = mode === "argentina" ? cachedData.arg : cachedData.brz;
    const altData = mode === "argentina" ? cachedData.brz : cachedData.arg;

    renderUnidad(data, mode, altData);

  } catch (err) {
    console.error("Error al cargar unidad:", err);
  }
}



// 📊 Barra de progreso
function initScrollProgress() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const percent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = `${percent}%`;
  });
}

// 🎯 Progreso
function updateUnidadProgress(unidadId, mode) {
  const sections = document.querySelectorAll(".section");
  const studied = Array.from(sections).filter(s => s.classList.contains("studied")).length;
  const total = sections.length;
  const progress = total ? Math.round((studied / total) * 100) : 0;

  let bar = document.getElementById("studyProgressBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "studyProgressBar";
    bar.innerHTML = `<div class="study-progress-fill"></div><span class="study-progress-text"></span>`;
    document.querySelector(".unidad-container").appendChild(bar);
  }

  bar.querySelector(".study-progress-fill").style.width = `${progress}%`;
  bar.querySelector(".study-progress-text").textContent =
    `${mode === "argentina" ? "Progreso" : "Progresso"}: ${progress}%`;
}

// 🔹 Render dinámico bilingüe
function renderUnidad(data, mode, altData) {
  const unidadId = getUnidadId();

  document.getElementById("unidadTitle").textContent = data.title;
  document.getElementById("unidadSubtitle").textContent = data.subtitle;

  const backBtn = document.getElementById("navBack");
  if (backBtn) backBtn.textContent = data.nav_back;

  const content = document.getElementById("unidadContent");
  content.innerHTML = "";

  data.sections.forEach((sec, i) => {
const secKey = `unidad${unidadId}_sec${i}`; 

    const studied = localStorage.getItem(secKey) === "true";

    const section = document.createElement("section");
    section.classList.add("section");
    if (studied) section.classList.add("studied");

    section.innerHTML = `
      <h2>${sec.title}</h2>
      <div class="section-content">${sec.content}</div>
      <button class="mark-btn">
        ${studied
          ? (mode === "argentina" ? "✓ Estudiado" : "✓ Estudado")
          : (mode === "argentina" ? "Marcar como estudiado" : "Marcar como estudado")}
      </button>
    `;

    const btn = section.querySelector(".mark-btn");
    btn.addEventListener("click", () => {
      const nowStudied = section.classList.toggle("studied");
      localStorage.setItem(secKey, nowStudied);
      btn.textContent = nowStudied
        ? (mode === "argentina" ? "✓ Estudiado" : "✓ Estudado")
        : (mode === "argentina" ? "Marcar como estudiado" : "Marcar como estudado");
      updateUnidadProgress(unidadId, mode);
    });

    content.appendChild(section);
  });

  updateUnidadProgress(unidadId, mode);

  // 👇 Post-procesa el DOM ya pintado para preparar el hover por elemento
  transformarContenidoBilingue(mode, altData);
}


function initHoverBilingue(mode) {
  const isArg = mode === "argentina";

  // Sólo elementos que tengan ambas props preparadas
  document.querySelectorAll(".section-content p, .section-content li, .section-content td, .section-content th, .section-content span, .section-content strong, .section-content em")
    .forEach(el => {
      if (!el.__argHTML || !el.__brzHTML) return;

      const currentHTML = isArg ? el.__argHTML : el.__brzHTML;
      const altHTML     = isArg ? el.__brzHTML : el.__argHTML;

      // IMPORTANTE: remover listeners previos si se re-renderiza
      el.onmouseenter = null;
      el.onmouseleave = null;

      el.addEventListener("mouseenter", () => {
        el.innerHTML = altHTML;
        el.classList.add("hover-bilingue");
      });
      el.addEventListener("mouseleave", () => {
        el.innerHTML = currentHTML;
        el.classList.remove("hover-bilingue");
      });
    });
}


function transformarContenidoBilingue(mode, altData) {
  document.querySelectorAll(".section-content").forEach((div, i) => {
    const altHTML = altData.sections[i]?.content;
    if (!altHTML) return;

    const parser = new DOMParser();
    const altDoc = parser.parseFromString(altHTML, "text/html");

    // Seleccionamos nodos HO-VEREABLES en ambos idiomas
    const currNodes = div.querySelectorAll("p, li, td, th, span, strong, em");
    const altNodes  = altDoc.body.querySelectorAll("p, li, td, th, span, strong, em");

    const len = Math.min(currNodes.length, altNodes.length);
    for (let k = 0; k < len; k++) {
      const currEl = currNodes[k];
      const altEl  = altNodes[k];

      // Guardamos el HTML crudo en propiedades del elemento (no atributos)
      currEl.__argHTML = (mode === "argentina") ? currEl.innerHTML : altEl.innerHTML;
      currEl.__brzHTML = (mode === "argentina") ? altEl.innerHTML : currEl.innerHTML;

      // También, por si querés debug, podemos dejar data-* mínimos (no se usan para el swap)
      // currEl.dataset.arg = "1"; currEl.dataset.brz = "1";
      // pero NO guardamos el HTML en data-* para evitar escapes.
    }
  });

  initHoverBilingue(mode);
}




function renderBilingualTable(spanish, portuguese) {
  const table = document.createElement("table");
  const head = document.createElement("tr");
  head.innerHTML = `
    <th data-arg="Momento del día" data-brz="Momento do dia">Momento del día</th>
    <th data-arg="Formal" data-brz="Formal">Formal</th>
    <th data-arg="Informal" data-brz="Informal">Informal</th>
  `;
  table.appendChild(head);

  for (let i = 0; i < spanish.length; i++) {
    const es = spanish[i];
    const pt = portuguese[i];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-arg="${es.moment}" data-brz="${pt.moment}">${es.moment}</td>
      <td data-arg="${es.formal}" data-brz="${pt.formal}">${es.formal}</td>
      <td data-arg="${es.informal}" data-brz="${pt.informal}">${es.informal}</td>
    `;
    table.appendChild(row);
  }

  return table;
}




// 🚀 Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  let mode = localStorage.getItem("mode") || "argentina";
  document.body.setAttribute("data-mode", mode);
  initScrollProgress();
  await loadUnidad(mode);

  const toggle = document.getElementById("modeToggle");
  if (toggle) {
    toggle.addEventListener("click", async () => {
      mode = mode === "argentina" ? "brasil" : "argentina";
      localStorage.setItem("mode", mode);
      document.body.setAttribute("data-mode", mode);
      await loadUnidad(mode);
    });
  }
});
