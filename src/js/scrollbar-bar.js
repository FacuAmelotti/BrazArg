// ==================================
// Barra de progreso de scroll (sin tocar overflow)
// ==================================
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  // Detectar el elemento que realmente scrollea
  const scrollTarget = document.querySelector(".unidad-container") || window;

  const updateProgress = () => {
    let scrollTop, scrollHeight, clientHeight;

    if (scrollTarget === window) {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = document.documentElement.clientHeight;
    } else {
      scrollTop = scrollTarget.scrollTop;
      scrollHeight = scrollTarget.scrollHeight;
      clientHeight = scrollTarget.clientHeight;
    }

    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = `${progress}%`;
  };

  scrollTarget.addEventListener("scroll", updateProgress);
  window.addEventListener("resize", updateProgress);
  updateProgress();
});
