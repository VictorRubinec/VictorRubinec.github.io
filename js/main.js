// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica de Modais ---
    const modalOverlay = document.getElementById('modal-container');
    const openModalButtons = document.querySelectorAll('.open-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const modalContents = document.querySelectorAll('.modal-content');

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function openModal(modalId) {
        // Esconde todos os modais primeiro
        modalContents.forEach(modal => modal.classList.remove('active'));
        
        // Se existir o modal alvo, mostra
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
            const scrollbarWidth = getScrollbarWidth();
            
            targetModal.classList.add('active');
            modalOverlay.classList.add('active');
            
            // Evita scroll do fundo e previne pulo (shift) compensando a barra de rolagem
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            // Compensa a navbar também para não pular
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.paddingRight = `${scrollbarWidth}px`;
            }
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        // Espera a animação de fade pra esconder
        setTimeout(() => {
            modalContents.forEach(modal => modal.classList.remove('active'));
            // Volta o scroll e remove a compensação de padding
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.paddingRight = '';
            }
        }, 300);
    }

    // Eventos de clique para abrir
    openModalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Eventos de clique para fechar
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Fechar ao clicar fora do modal
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

});
