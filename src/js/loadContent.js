// ===============================
// Carga dinámica de contenido desde JSON
// ===============================
async function loadContent(mode = "argentina") {
  try {
    const response = await fetch(`./src/json/index_${mode === "argentina" ? "arg" : "brz"}.json`);
    const data = await response.json();

    // Texto simple (por data-key)
    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.getAttribute("data-key");
      if (data[key]) el.textContent = data[key];
    });

    // Features dinámicos
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

    // Games dinámicos
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

    // Footer copyright
    const footerCopy = document.getElementById("footerCopy");
    if (footerCopy) footerCopy.textContent = data.footer_copy;

  } catch (err) {
    console.error("Error cargando contenido:", err);
  }
}
