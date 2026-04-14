// js/animations.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Intersection Observer para Fade-In Elements ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // 15% do elemento visivel
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Parar de observar depois que apareceu
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

});
