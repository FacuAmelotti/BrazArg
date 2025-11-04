async function loadTemario(mode = "argentina") {
  try {
    const response = await fetch(`../src/json/temario_${mode === "argentina" ? "arg" : "brz"}.json`);
    const data = await response.json();

    // Títulos principales
    document.querySelector(".temario-title").textContent = data.title;
    document.querySelector(".temario-subtitle").textContent = data.subtitle;

    // 🔹 Texto del botón “Volver / Voltar”
    const backLink = document.querySelector('[data-key="nav-back"]');
    if (backLink && data.nav_back) backLink.textContent = data.nav_back;

    const grid = document.getElementById("chaptersGrid");
    grid.innerHTML = "";

    // Unidades dinámicas
    data.units.forEach((unit) => {
      const card = document.createElement("div");
      card.classList.add("chapter-card", "active");
      card.innerHTML = `
        <div id="${unit.id}" class="chapter-info">
          <h2 class="chapter-title">${unit.title}</h2>
          <p class="chapter-description">${unit.description}</p>
          <div class="chapter-topics">
            ${unit.topics.map(t => `<span class="topic-tag">${t}</span>`).join("")}
          </div>
        </div>
        <div class="chapter-action">
          <span class="status-badge available">${mode === "argentina" ? "Disponible" : "Disponível"}</span>
          <a href="./unidades/${unit.id}.html" class="chapter-btn">${mode === "argentina" ? "Estudiar" : "Estudar"}</a>
          <button class="chapter-btn mark-studied-btn" data-id="${unit.id}">
            ${mode === "argentina" ? "Marcar como estudiado" : "Marcar como estudado"}
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Aplicar estado de “estudiado”
    restoreStudiedState();
  } catch (error) {
    console.error("Error cargando temario:", error);
  }
}

function restoreStudiedState() {
  const studied = JSON.parse(localStorage.getItem("studiedUnits") || "[]");
  studied.forEach(id => {
    const btn = document.querySelector(`.mark-studied-btn[data-id="${id}"]`);
    const card = document.querySelector(`#${id}`)?.closest(".chapter-card");
    if (btn && card) {
      btn.classList.add("active");
      btn.textContent = "✅ Estudiado";
      card.classList.add("studied");
    }
  });

  document.querySelectorAll(".mark-studied-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleStudy(btn));
  });
}

function toggleStudy(btn) {
  const id = btn.dataset.id;
  const card = document.querySelector(`#${id}`)?.closest(".chapter-card");
  let studied = JSON.parse(localStorage.getItem("studiedUnits") || "[]");

  if (studied.includes(id)) {
    studied = studied.filter(u => u !== id);
    btn.classList.remove("active");
    btn.textContent = "Marcar como estudiado";
    card?.classList.remove("studied");
  } else {
    studied.push(id);
    btn.classList.add("active");
    btn.textContent = "✅ Estudiado";
    card?.classList.add("studied");
  }

  localStorage.setItem("studiedUnits", JSON.stringify(studied));
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  const mode = localStorage.getItem("mode") || "argentina";
  await loadTemario(mode);

  // Vuelve a cargar el temario al cambiar idioma
  document.getElementById("modeToggle").addEventListener("click", async () => {
    const newMode = localStorage.getItem("mode") || "argentina";
    await loadTemario(newMode);
  });
});
