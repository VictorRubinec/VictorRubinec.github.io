// js/utils/form.js
document.addEventListener('DOMContentLoaded', () => {

    const forms = document.querySelectorAll('.contact-form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Como estamos usando o Formspree direto via action,
            // podemos apenas melhorar o UX mudando o texto do botão.
            
            // Opcionalmente, se quiser mandar via AJAX para o formspree para
            // não sair da página, a lógica mudaria aqui (usando fetch).
            // Manteremos simples (com redirect) para garantir recebimento inicial.
            
            const submitBtn = form.querySelector('.submit-btn');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin-icon"></i> Enviando...';
                submitBtn.disabled = true;
                
                // Recria icone se necessario pro spinner rodar
                if(window.lucide) {
                   window.lucide.createIcons();
                }

                // Volta o botão caso a ação falhe/demore (o formspree vai tentar redirecionar)
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    });

});
