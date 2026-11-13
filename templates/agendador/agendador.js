/**
 * agendador.js - Sistema de Agendamento Genérico Reutilizável
 * Converte interações de agendamento em mensagens estruturadas para WhatsApp.
 * Zero infraestrutura, zero banco de dados, taxa de conversão imediata.
 */

class GenericScheduler {
  constructor(config = {}) {
    this.containerId = config.containerId || 'agendador-root';
    this.businessName = config.businessName || 'Atendimento Expresso';
    this.whatsappNumber = config.whatsappNumber || '5511999999999';
    this.services = config.services || [
      { id: '1', name: 'Consulta / Avaliação', duration: '30 min', price: 'R$ 0' },
      { id: '2', name: 'Atendimento Padrão', duration: '60 min', price: 'Consulte' }
    ];
    this.slots = config.slots || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    
    this.state = {
      service: this.services[0].name,
      date: this.getTodayDateString(),
      slot: this.slots[0],
      clientName: '',
      clientPhone: ''
    };

    this.init();
  }

  getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatDateBR(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  init() {
    const root = document.getElementById(this.containerId);
    if (!root) {
      console.warn(`[Agendador] Elemento #${this.containerId} não encontrado.`);
      return;
    }
    this.render(root);
    this.bindEvents(root);
  }

  render(root) {
    root.innerHTML = `
      <div class="agendador-card">
        <div class="agendador-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3>Agendar Horário</h3>
            <span class="ag-badge-secure">Online</span>
          </div>
          <p>${this.businessName}</p>
        </div>

        <div class="ag-step">
          <label class="ag-step-label">1. Escolha o Serviço</label>
          <select class="ag-select" id="ag-select-service">
            ${this.services.map(s => `<option value="${s.name}">${s.name} (${s.duration})</option>`).join('')}
          </select>
        </div>

        <div class="ag-step">
          <label class="ag-step-label">2. Escolha o Dia</label>
          <input type="date" class="ag-input" id="ag-input-date" value="${this.state.date}" min="${this.getTodayDateString()}">
        </div>

        <div class="ag-step">
          <label class="ag-step-label">3. Escolha o Horário</label>
          <div class="ag-slots-grid" id="ag-slots-container">
            ${this.slots.map((s, idx) => `
              <button type="button" class="ag-slot-btn ${idx === 0 ? 'active' : ''}" data-slot="${s}">${s}</button>
            `).join('')}
          </div>
        </div>

        <div class="ag-step">
          <label class="ag-step-label">4. Seus Dados</label>
          <input type="text" class="ag-input" id="ag-input-name" placeholder="Seu Nome Completo" style="margin-bottom: 0.5rem;" required>
          <input type="tel" class="ag-input" id="ag-input-phone" placeholder="Seu Telefone / WhatsApp">
        </div>

        <div class="ag-summary" id="ag-summary-box">
          <strong>Resumo da Reserva:</strong><br>
          <span id="ag-summary-text">${this.state.service} • ${this.formatDateBR(this.state.date)} às ${this.state.slot}</span>
        </div>

        <button type="button" class="ag-btn-submit" id="ag-btn-confirm">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Confirmar no WhatsApp
        </button>
      </div>
    `;
  }

  bindEvents(root) {
    const serviceSelect = root.querySelector('#ag-select-service');
    const dateInput = root.querySelector('#ag-input-date');
    const slotBtns = root.querySelectorAll('.ag-slot-btn');
    const nameInput = root.querySelector('#ag-input-name');
    const phoneInput = root.querySelector('#ag-input-phone');
    const summaryText = root.querySelector('#ag-summary-text');
    const confirmBtn = root.querySelector('#ag-btn-confirm');

    const updateSummary = () => {
      summaryText.textContent = `${this.state.service} • ${this.formatDateBR(this.state.date)} às ${this.state.slot}`;
    };

    serviceSelect.addEventListener('change', (e) => {
      this.state.service = e.target.value;
      updateSummary();
    });

    dateInput.addEventListener('change', (e) => {
      this.state.date = e.target.value;
      updateSummary();
    });

    slotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        slotBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.slot = btn.getAttribute('data-slot');
        updateSummary();
      });
    });

    confirmBtn.addEventListener('click', () => {
      this.state.clientName = nameInput.value.trim();
      this.state.clientPhone = phoneInput.value.trim();

      if (!this.state.clientName) {
        alert('Por favor, informe seu nome para prosseguir com o agendamento.');
        nameInput.focus();
        return;
      }

      const msg = [
        `Olá! Gostaria de agendar um horário com *${this.businessName}*:\n`,
        `📌 *Serviço:* ${this.state.service}`,
        `📅 *Data:* ${this.formatDateBR(this.state.date)}`,
        `⏰ *Horário:* ${this.state.slot}`,
        `👤 *Cliente:* ${this.state.clientName}`,
        this.state.clientPhone ? `📞 *Contato:* ${this.state.clientPhone}\n` : '\n',
        `Poderia confirmar a disponibilidade deste horário?`
      ].join('\n');

      const cleanPhone = this.whatsappNumber.replace(/\D/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    });
  }
}

// Auto-inicialização caso seja passado via data-attributes ou globalmente
window.GenericScheduler = GenericScheduler;
