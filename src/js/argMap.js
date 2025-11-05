let currentActivePoint = null;

// === Cargar datos desde provincias.json ===
async function loadProvincias() {
  try {
    const res = await fetch('../src/json/provincias.json');
    const data = await res.json();
    const locations = data.provincias;

    initializeMap(locations);
  } catch (err) {
    console.error('Error al cargar provincias:', err);
  }
}

// === Crear partículas ===
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 25 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    particlesContainer.appendChild(particle);
  }
}

// === Cursor personalizado ===
function initCursor() {
  const cursor = document.getElementById('cursor');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// === Efecto ripple ===
function createRipple(e) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 800);
}

// === Crear puntos interactivos del mapa ===
function initializeMap(locations) {
  const mapContainer = document.getElementById('mapContainer');

  // 🧹 Eliminar puntos anteriores (para evitar duplicados al cambiar idioma)
  mapContainer.querySelectorAll('.location-point').forEach(p => p.remove());

  // Crear nuevos puntos
  locations.forEach(location => {
    const point = document.createElement('div');
    point.className = 'location-point';
    point.dataset.locationId = location.id;
    point.style.left = location.x + '%';
    point.style.top = location.y + '%';

    point.addEventListener('click', (e) => {
      createRipple(e);
      openPhotoPanel(location);
    });

    mapContainer.appendChild(point);
  });
}


// === Abrir panel de fotos ===
function openPhotoPanel(location) {
  const panel = document.getElementById('photoPanel');
  const title = document.getElementById('locationTitle');
  const gallery = document.getElementById('photoGallery');

  // Limpiar galería antes de mostrar nueva info
  gallery.innerHTML = '';

  // 📍 Mostrar título
  title.textContent = location.name;

  // ✏️ Agregar descripción general debajo del título
  const descEl = document.createElement('p');
  descEl.classList.add('location-desc');
  descEl.textContent = location.desc || '';

  // Insertar la descripción justo después del título
  title.insertAdjacentElement('afterend', descEl);

  // 🖼️ Cargar fotos
  location.photos.forEach(photo => {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
      <img src="${photo.src}" alt="${photo.description}">
      <div class="photo-description">${photo.description}</div>
    `;
    gallery.appendChild(photoItem);
  });

  // Mostrar panel
  panel.classList.add('active');

  // Marcar punto activo
  if (currentActivePoint) currentActivePoint.classList.remove('active');
  const point = document.querySelector(`[data-location-id="${location.id}"]`);
  point.classList.add('active');
  currentActivePoint = point;
}

// === Cerrar panel de fotos ===
function closePhotoPanel() {
  const panel = document.getElementById('photoPanel');
  panel.classList.remove('active');

  // Eliminar descripción al cerrar
  const oldDesc = document.querySelector('.location-desc');
  if (oldDesc) oldDesc.remove();

  if (currentActivePoint) {
    currentActivePoint.classList.remove('active');
    currentActivePoint = null;
  }
}

// === Event listeners ===
document.getElementById('closeBtn').addEventListener('click', closePhotoPanel);
document.getElementById('photoPanel').addEventListener('click', (e) => {
  if (e.target.id === 'photoPanel') closePhotoPanel();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePhotoPanel();
});
document.addEventListener('click', createRipple);

// === Inicializar todo ===
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  loadProvincias();
});
