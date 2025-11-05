// simplePageAnim.js - Animación simple y elegante para subpáginas
function initSubpageAnim() {
    // Crear overlay minimalista
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(20, 20, 20, 0.9) 100%);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
            
        transition: opacity 0.6s ease-out;
    `;
    
    // Crear contenido central simple
    const content = document.createElement('div');
    content.style.cssText = `
        text-align: center;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.8s ease-out 0.2s forwards;
    `;
    
    // Título de carga
    const title = document.createElement('div');
    title.textContent = '...';
    title.style.cssText = `
        font-family: 'Arial', sans-serif;
        font-size: 1.5rem;
        font-weight: 300;
        color: #ffffff;
        letter-spacing: 2px;
        margin-bottom: 20px;
    `;
    
    // Barra de progreso simple
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 200px;
        height: 2px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 1px;
        overflow: hidden;
        position: relative;
    `;
    
    const progress = document.createElement('div');
    progress.style.cssText = `
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
        animation: progressLoad 1.2s ease-out forwards;
    `;
    
    // Añadir estilos de animación
    const styles = document.createElement('style');
    styles.textContent = `
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes progressLoad {
            to {
                width: 100%;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: scale(1.05);
            }
        }
    `;
    
    document.head.appendChild(styles);
    
    // Ensamblar elementos
    progressBar.appendChild(progress);
    content.appendChild(title);
    content.appendChild(progressBar);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Ocultar contenido principal excepto el panel de fotos
    const mainContent = document.querySelector('main') || document.body;
    const elements = mainContent.querySelectorAll('*:not(script):not(style)');
    elements.forEach(el => {
        if (
            el !== overlay &&
            !overlay.contains(el) &&
            !el.closest('#photoPanel') // 👈 excluye el panel de fotos
        ) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(15px)';
        }
    });
    
    // Secuencia de animación
    setTimeout(() => {
        // Fade out del overlay
        overlay.style.animation = 'fadeOut 0.5s ease-out forwards';
        
        // Mostrar contenido principal (excepto panel de fotos)
        elements.forEach((el, index) => {
            if (
                el !== overlay &&
                !overlay.contains(el) &&
                !el.closest('#photoPanel') // 👈 excluye el panel también aquí
            ) {
                setTimeout(() => {
                    el.style.transition = 'all 0.4s ease-out';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 50);
            }
        });
        
        // Limpiar
        setTimeout(() => {
            overlay.remove();
            styles.remove();
        }, 800);
        
    }, 1500);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubpageAnim);
} else {
    initSubpageAnim();
}
