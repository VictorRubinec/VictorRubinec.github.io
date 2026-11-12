// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Alternância de Tema Noturno (Dark / Light) ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i data-lucide="sun"></i>';
                themeToggleBtn.setAttribute('aria-label', 'Ativar modo diurno');
                themeToggleBtn.setAttribute('title', 'Ativar modo diurno');
            }
        } else {
            htmlElement.removeAttribute('data-theme');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i data-lucide="moon"></i>';
                themeToggleBtn.setAttribute('aria-label', 'Ativar modo noturno');
                themeToggleBtn.setAttribute('title', 'Ativar modo noturno');
            }
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Carregar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', nextTheme);
            applyTheme(nextTheme);
        });
    }

    // Rolagem suave para links de âncora internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Suporte a ícones e interações gerais ---
    if (window.lucide) {
        window.lucide.createIcons();
    }

});
