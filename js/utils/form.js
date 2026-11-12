// js/utils/form.js
// Envio assíncrono (AJAX) sem redirecionamento para Formspree e feedback de UX premium

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contato-form');
    if (!contactForm) return;

    const submitBtn = contactForm.querySelector('.submit-btn');
    const feedbackBox = document.getElementById('form-feedback');
    const whatsappInput = document.getElementById('contato-whatsapp');

    // Máscara amigável para telefone/WhatsApp no formato brasileiro
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            if (value.length > 6) {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            } else if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length > 0) {
                value = `(${value}`;
            }
            e.target.value = value;
        });
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

        // Estado de Carregamento
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin-icon"></i> Enviando solicitação...';
            if (window.lucide) window.lucide.createIcons();
        }

        if (feedbackBox) {
            feedbackBox.className = 'form-feedback';
            feedbackBox.style.display = 'none';
            feedbackBox.innerHTML = '';
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Sucesso
                const nome = formData.get('nome') || 'você';
                const msgWa = encodeURIComponent(`Olá Victor, enviei meus dados pelo site (Nome: ${formData.get('nome')}) e gostaria de dar andamento.`);
                const waLink = `https://wa.me/5511975958383?text=${msgWa}`;

                if (feedbackBox) {
                    feedbackBox.className = 'form-feedback success';
                    feedbackBox.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1.05rem;">
                                <i data-lucide="check-circle" style="color: var(--accent-green);"></i>
                                <span>Solicitação enviada com sucesso!</span>
                            </div>
                            <p style="margin: 0; font-size: 0.92rem; color: var(--text-secondary);">
                                Obrigado, ${nome}! Entrarei em contato em breve pelo seu WhatsApp.
                            </p>
                            <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="margin-top: 0.5rem;">
                                <i data-lucide="message-circle"></i> Continuar agora no WhatsApp
                            </a>
                        </div>
                    `;
                    feedbackBox.style.display = 'block';
                    if (window.lucide) window.lucide.createIcons();
                }

                contactForm.reset();
            } else {
                // Erro de resposta do servidor
                const data = await response.json().catch(() => null);
                let errorMsg = 'Ocorreu um erro ao enviar. Por favor, tente novamente ou fale diretamente pelo WhatsApp.';
                if (data && data.errors && data.errors.length > 0) {
                    errorMsg = data.errors.map(err => err.message).join(', ');
                }

                if (feedbackBox) {
                    feedbackBox.className = 'form-feedback error';
                    feedbackBox.innerHTML = `
                        <p style="margin: 0;">${errorMsg}</p>
                        <a href="https://wa.me/5511975958383" target="_blank" rel="noopener" class="btn btn-whatsapp" style="margin-top: 0.75rem;">
                            <i data-lucide="message-circle"></i> Falar diretamente pelo WhatsApp
                        </a>
                    `;
                    feedbackBox.style.display = 'block';
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        } catch (error) {
            // Falha de rede ou timeout
            if (feedbackBox) {
                feedbackBox.className = 'form-feedback error';
                feedbackBox.innerHTML = `
                    <p style="margin: 0;">Falha na conexão ao enviar o formulário. Você pode falar diretamente pelo WhatsApp:</p>
                    <a href="https://wa.me/5511975958383" target="_blank" rel="noopener" class="btn btn-whatsapp" style="margin-top: 0.75rem;">
                        <i data-lucide="message-circle"></i> Falar no WhatsApp
                    </a>
                `;
                feedbackBox.style.display = 'block';
                if (window.lucide) window.lucide.createIcons();
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                if (window.lucide) window.lucide.createIcons();
            }
        }
    });
});
