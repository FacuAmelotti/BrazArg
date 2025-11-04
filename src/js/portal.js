async function loadPortal(mode = "argentina") {
  try {
    const response = await fetch(`../src/json/portal_${mode === "argentina" ? "arg" : "brz"}.json`);
    const data = await response.json();

    // Títulos
    document.querySelector(".portal-title").textContent = data.title;
    document.querySelector(".portal-subtitle").textContent = data.subtitle;

    // 🔹 Back en el nav
    const backLink = document.querySelector('[data-key="nav-back"]');
    if (backLink && data.nav_back) backLink.textContent = data.nav_back;

    const grid = document.getElementById("portalGrid");
    grid.innerHTML = "";

    // Tarjetas dinámicas
    data.areas.forEach(area => {
      const card = document.createElement("div");
      card.classList.add("portal-card");
      card.innerHTML = `
        <div class="portal-card-content">
          <div class="portal-icon">${area.icon}</div>
          <h2>${area.title}</h2>
          <p>${area.description}</p>
          <a href="${area.link}" class="portal-btn">${mode === "argentina" ? "Explorar" : "Explorar"}</a>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error cargando el portal:", err);
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  const mode = localStorage.getItem("mode") || "argentina";
  await loadPortal(mode);

  document.getElementById("modeToggle").addEventListener("click", async () => {
    const newMode = localStorage.getItem("mode") || "argentina";
    await loadPortal(newMode);
  });
});
