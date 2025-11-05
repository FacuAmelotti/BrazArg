// ======================================
// 🌎 BRAZARG MAPA - MODO ARG/BR
// ======================================

// Cargar textos y provincias según idioma
async function loadMapLanguage(mode = "argentina") {
  const langFile = mode === "argentina" ? "map_arg.json" : "map_brz.json";
  const dataPath = `../src/json/${langFile}`;

  try {
    const res = await fetch(dataPath);
    const data = await res.json();

    // Actualizar textos del encabezado
    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.getAttribute("data-key");
      if (data[key]) el.textContent = data[key];
    });

    // Cargar provincias/estados
    await loadProvincias(mode);
  } catch (err) {
    console.error("Error cargando idioma:", err);
  }
}

// Cargar provincias segun idioma
async function loadProvincias(mode) {
  const file = mode === "argentina" ? "provincias_argentinas_arg.json" : "provincias_argentinas_brz.json";
  try {
    const res = await fetch(`../src/json/${file}`);
    const data = await res.json();
    const locations = data.provincias || data.estados;
    initializeMap(locations);
  } catch (err) {
    console.error("Error cargando provincias/estados:", err);
  }
}

// Alternar idioma
async function toggleMode() {
  const current = document.body.getAttribute("data-mode") || localStorage.getItem("mode") || "argentina";
  const next = current === "argentina" ? "brasil" : "argentina";

  document.body.setAttribute("data-mode", next);
  localStorage.setItem("mode", next);

  const modeLabel = document.getElementById("modeLabel");
  modeLabel.textContent = next === "argentina" ? "🇦🇷 ARG" : "🇧🇷 BR";
closePhotoPanel(); // Cierra panel abierto si había uno

  await loadMapLanguage(next);
  
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  const savedMode = localStorage.getItem("mode") || "argentina";
  document.body.setAttribute("data-mode", savedMode);

  const modeLabel = document.getElementById("modeLabel");
  modeLabel.textContent = savedMode === "argentina" ? "🇦🇷 ARG" : "🇧🇷 BR";

  await loadMapLanguage(savedMode);

  const toggle = document.getElementById("modeToggle");
  if (toggle) toggle.addEventListener("click", toggleMode);
});
