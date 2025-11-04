// ===============================
// Navegación entre paneles (sin scroll)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".panel");
  const links = document.querySelectorAll(".menu a");
  
  console.log("Paneles encontrados:", sections.length);
  console.log("Links encontrados:", links.length);
  
  function showSection(hash) {
    console.log("Mostrando sección:", hash);
    const target = document.querySelector(hash);
    
    if (!target) {
      console.error("No se encontró la sección:", hash);
      return;
    }
    
    // Ocultar todas las secciones
    sections.forEach(sec => {
      sec.classList.remove("active");
      console.log("Ocultando:", sec.id);
    });
    
    // Remover clase active de todos los links
    links.forEach(link => link.classList.remove("active"));
    
    // Mostrar la nueva sección
    target.classList.add("active");
    console.log("Mostrando:", target.id);
    
    // Activar el link correspondiente
    const activeLink = document.querySelector(`.menu a[href="${hash}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
      console.log("Link activado:", hash);
    }
  }
  
  // Navegación con click
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const hash = link.getAttribute("href");
      console.log("Click en link:", hash);
      showSection(hash);
      
      // Actualizar URL sin scroll
      history.pushState(null, null, hash);
    });
  });
  
  // Manejar navegación del navegador (back/forward)
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash || "#inicio";
    showSection(hash);
  });
  
  // Mostrar sección inicial
  const initial = window.location.hash || "#inicio";
  console.log("Sección inicial:", initial);
  showSection(initial);
});