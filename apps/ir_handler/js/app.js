import { threatDatabase } from './database.js';

class IncidentResponseApp {
    constructor(db) {
        this.db = db;
        this.activeCards = [];
        
        // Cache de elementos do DOM
        this.container = document.getElementById('timelineContainer');
        this.emptyMsg = document.getElementById('emptyMsg');
        this.reportArea = document.getElementById('finalReport');
        this.stepCounter = document.getElementById('stepCounterDisplay');
        
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        this.container.addEventListener('change', (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                this.updateReport();
            }
        });

        this.container.addEventListener('input', (e) => {
            if (e.target.classList.contains('custom-input')) {
                this.updateReport();
            }
        });
    }

    addCard(type) {
        const templateData = this.db[type];
        if (!templateData) return;

        const cardId = 'card-' + Date.now();
        
        const cardObj = {
            id: cardId,
            title: templateData.title,
            color: templateData.color,
            element: null
        };
        this.activeCards.push(cardObj);

        const cardHTML = this.buildCardHTML(cardObj, templateData.steps);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const newCardEl = tempDiv.firstElementChild;
        cardObj.element = newCardEl;

        this.emptyMsg.style.display = 'none';
        this.container.appendChild(newCardEl);

        this.refreshState();
        newCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    removeCard(id) {
        const index = this.activeCards.findIndex(c => c.id === id);
        if (index > -1) {
            this.activeCards[index].element.remove();
            this.activeCards.splice(index, 1);
        }
        this.refreshState();
    }

    moveCard(id, direction) {
        const index = this.activeCards.findIndex(c => c.id === id);
        if (index < 0) return;

        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= this.activeCards.length) return;

        const temp = this.activeCards[index];
        this.activeCards[index] = this.activeCards[targetIndex];
        this.activeCards[targetIndex] = temp;

        this.activeCards.forEach(card => {
            this.container.appendChild(card.element);
        });

        this.refreshState();
    }

    resetAll() {
        if(confirm("ATENÇÃO: Todo o progresso será perdido. Confirmar?")) {
            this.activeCards.forEach(c => c.element.remove());
            this.activeCards = [];
            this.refreshState();
        }
    }

    refreshState() {
        if (this.activeCards.length === 0) {
            this.emptyMsg.style.display = 'block';
        }
        this.updateStepNumbers();
        this.updateReport();
    }

    updateStepNumbers() {
        this.stepCounter.innerText = `${this.activeCards.length} Vetores`;
        this.activeCards.forEach((card, index) => {
            const badge = card.element.querySelector('.step-badge');
            if (badge) badge.innerText = `SUGESTÃO ${index + 1}`;
        });
    }

    buildCardHTML(cardObj, steps) {
        let stepsHtml = steps.map(step => `
            <div class="checklist-item">
                <input type="checkbox">
                <div style="width: 100%;">
                    <span class="tool-tag">${step.tool}</span>
                    <strong>${step.text}</strong>
                    <div class="cmd-box">$ ${step.cmd}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="investigation-card" id="${cardObj.id}">
                <div class="card-header" style="border-left: 4px solid ${cardObj.color}">
                    <div>
                        <span class="step-badge" style="color: #0a0a0a">SUGESTÃO ?</span>
                        <span style="font-weight: 600; color: #fff;">${cardObj.title}</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-btn" onclick="app.moveCard('${cardObj.id}', -1)" title="Subir">▲</button>
                        <button class="card-btn" onclick="app.moveCard('${cardObj.id}', 1)" title="Descer">▼</button>
                        <button class="card-btn btn-close" onclick="app.removeCard('${cardObj.id}')" title="Excluir">×</button>
                    </div>
                </div>
                <div class="card-body">
                    <p style="color: #6b7280; font-size: 0.85em; margin-top: 0; font-style: italic; margin-bottom: 15px;">
                        Sugestões de comandos e validações táticas (opcionais):
                    </p>
                    ${stepsHtml}
                    <div class="custom-evidence-area">
                        <textarea class="custom-input" placeholder=">> Adicionar notas customizadas, IoCs ou evidências extras aqui..."></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    updateReport() {
        let report = `=== RELATÓRIO DE INVESTIGAÇÃO (SUGESTÕES TÁTICAS) ===\n`;
        report += `Data: ${new Date().toLocaleString()}\n`;
        report += `Vetores Analisados: ${this.activeCards.length}\n\n`;

        this.activeCards.forEach((card, index) => {
            const stepName = `SUGESTÃO ${index + 1}`;
            
            report += `----------------------------------------\n`;
            report += `[ ${stepName} ] : ${card.title}\n`;
            report += `----------------------------------------\n`;

            const items = card.element.querySelectorAll('.checklist-item');
            let hasAction = false;

            items.forEach(item => {
                const checkbox = item.querySelector('input');
                const text = item.querySelector('strong').innerText;
                const cmd = item.querySelector('.cmd-box').innerText.replace('$ ', '');

                if (checkbox.checked) {
                    hasAction = true;
                    item.classList.add('checked');
                    report += `[x] ${text}\n    Ref: ${cmd}\n`;
                } else {
                    item.classList.remove('checked');
                }
            });

            const customText = card.element.querySelector('.custom-input').value.trim();
            if(customText) {
                hasAction = true;
                report += `\n[+] NOTAS CUSTOMIZADAS:\n${customText}\n`;
            }

            if (!hasAction) report += "(Análise conduzida de forma customizada / Nenhuma flag padrão utilizada)\n";
            report += "\n";
        });

        report += `=== SUGESTÕES DE MITIGAÇÃO / PRÓXIMOS PASSOS ===\n`;
        report += "- Avaliar a viabilidade de isolar os hosts afetados.\n";
        report += "- Considerar a revogação e reset preventivo das credenciais envolvidas.\n";
        report += "- Analisar a oportunidade de bloqueio de novos IoCs mapeados no perímetro de rede.\n";

        this.reportArea.value = report;
    }

    generatePDF() {
        const reportText = this.reportArea.value;
        if(this.activeCards.length === 0) return alert("Adicione playbooks de sugestões antes de exportar.");

        const element = document.createElement('div');
        element.style.padding = '20px';
        element.style.backgroundColor = '#0a0a0a'; 
        element.style.color = '#d1d5db'; 
        element.style.fontFamily = '"Cascadia Code", "Fira Code", monospace';
        element.style.whiteSpace = 'pre-wrap'; 
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';
        
        element.innerHTML = `
            <div style="border-bottom: 2px solid #b286fd; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin:0; font-family: 'Segoe UI', sans-serif;">IR Handler Report</h1>
                <small style="color: #b286fd;">Gerado em: ${new Date().toLocaleString()}</small>
            </div>
            <div>${reportText}</div>
            <div style="margin-top: 30px; border-top: 1px solid #262626; padding-top: 10px; text-align: center; color: #6b7280;">
                <small>Generated by 0xtiltas_ IR Handler v1.2 // TLP:AMBER</small>
            </div>
        `;

        const opt = {
            margin:       0.5,
            filename:     `IR_Report_${Date.now()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, backgroundColor: '#0a0a0a' }, 
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    }

    copyReport() {
        this.reportArea.select();
        document.execCommand("copy");
        alert("Relatório copiado para a área de transferência!");
    }
}

window.app = new IncidentResponseApp(threatDatabase);