// Import Transformers.js
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js";

// Google Sheets URL (ЗАМЕНИТЕ НА ВАШ ПОСЛЕ ДЕПЛОЯ)
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxCLYXXKEckO5dWLMe3Ctyed8OGVWxW8FQkIw4UPoG-NWS-LjYpf105uUoHXJroflzS/exec';

let reviews = [];
let model = null;

const el = {
    status: document.getElementById('statusMessage'),
    error: document.getElementById('errorMessage'),
    btn: document.getElementById('analyzeButton'),
    review: document.getElementById('reviewText'),
    result: document.getElementById('resultBox'),
    icon: document.getElementById('resultIcon'),
    label: document.getElementById('resultLabel'),
    conf: document.getElementById('resultConfidence'),
    confidenceFill: document.getElementById('confidenceFill'),
    loading: document.getElementById('loadingSpinner'),
    // Ticket elements
    ticketBox: document.getElementById('ticketBox'),
    ticketTitle: document.getElementById('ticketTitle'),
    ticketSubtitle: document.getElementById('ticketSubtitle'),
    ticketBadge: document.getElementById('ticketBadge'),
    ticketMessage: document.getElementById('ticketMessage'),
    ticketActionBtn: document.getElementById('ticketActionBtn'),
    ticketSecondaryBtn: document.getElementById('ticketSecondaryBtn'),
    ticketId: document.getElementById('ticketId'),
    ticketTimestamp: document.getElementById('ticketTimestamp')
};

function setStatus(text) {
    el.status.textContent = text;
}

function showError(text) {
    el.error.style.display = 'block';
    el.error.querySelector('span').textContent = text;
}

function hideError() {
    el.error.style.display = 'none';
}

function generateTicketId() {
    return 'TKT_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 5).toUpperCase();
}

async function loadReviews() {
    const res = await fetch('reviews_test.tsv');
    const text = await res.text();
    
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            delimiter: '\t',
            complete: (r) => {
                const data = r.data.map(row => row.text).filter(t => t && t.trim());
                if (data.length === 0) reject(new Error('No reviews'));
                else resolve(data);
            },
            error: (e) => reject(e)
        });
    });
}

async function initModel() {
    setStatus('Loading AI model...');
    model = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    setStatus('System ready');
    el.btn.disabled = false;
}

function getRandom() {
    return reviews[Math.floor(Math.random() * reviews.length)];
}

async function classify(text) {
    const result = await model(text);
    return result[0];
}

function mapSentiment(result) {
    const { label, score } = result;
    
    if (label === 'POSITIVE' && score > 0.5) {
        return { type: 'positive', text: 'POSITIVE', score, icon: '😊' };
    } else if (label === 'NEGATIVE' && score > 0.5) {
        return { type: 'negative', text: 'NEGATIVE', score, icon: '😠' };
    } else {
        return { type: 'neutral', text: 'NEUTRAL', score, icon: '😐' };
    }
}

function showResult(data) {
    el.result.style.display = 'block';
    el.icon.textContent = data.icon;
    el.label.textContent = data.text;
    el.confidenceFill.style.width = `${data.score * 100}%`;
    el.conf.textContent = `${(data.score * 100).toFixed(1)}% confidence`;
}

/**
 * НОВАЯ ФУНКЦИЯ: Создает тикет в поддержку на основе отзыва
 */
function createSupportTicket(confidence, label, review) {
    let normalizedScore = 0.5;
    
    if (label === "POSITIVE") {
        normalizedScore = confidence;
    } else if (label === "NEGATIVE") {
        normalizedScore = 1.0 - confidence;
    }
    
    const ticketId = generateTicketId();
    const now = new Date();
    const timestamp = now.toLocaleString();
    
    if (normalizedScore <= 0.4) {
        // CRITICAL - Негативный отзыв, срочный тикет
        return {
            priority: 'critical',
            title: '🚨 CRITICAL SUPPORT TICKET',
            subtitle: 'Priority 1 - Immediate attention required',
            badge: 'P1 CRITICAL',
            message: `Customer is extremely dissatisfied. Review: "${review.substring(0, 100)}${review.length > 100 ? '...' : ''}"`,
            actionBtn: {
                text: '🔔 Assign to Senior Support',
                icon: 'fa-bolt',
                action: () => { alert('🚨 Ticket escalated to senior support team. They will contact customer within 15 minutes.'); }
            },
            secondaryBtn: {
                text: 'Call Customer Now',
                action: () => { alert('📞 Initiating call to customer... (Demo)'); }
            },
            actionCode: 'PRIORITY_1_TICKET',
            priorityLevel: 'CRITICAL'
        };
    } else if (normalizedScore < 0.7) {
        // MEDIUM - Нейтральный отзыв, обычный тикет
        return {
            priority: 'medium',
            title: '📋 FEEDBACK TICKET',
            subtitle: 'Standard priority - Review requested',
            badge: 'P3 MEDIUM',
            message: `Customer needs follow-up. Review: "${review.substring(0, 100)}${review.length > 100 ? '...' : ''}"`,
            actionBtn: {
                text: '✉️ Send Feedback Form',
                icon: 'fa-envelope',
                action: () => { alert('📨 Feedback form sent to customer email.'); }
            },
            secondaryBtn: {
                text: 'Add to CRM',
                action: () => { alert('✅ Customer added to CRM for follow-up.'); }
            },
            actionCode: 'FEEDBACK_TICKET',
            priorityLevel: 'MEDIUM'
        };
    } else {
        // LOW - Позитивный отзыв, лояльность
        return {
            priority: 'low',
            title: '⭐ LOYALTY PROGRAM',
            subtitle: 'VIP customer - Add to rewards',
            badge: 'P5 LOW',
            message: `Happy customer! Review: "${review.substring(0, 100)}${review.length > 100 ? '...' : ''}"`,
            actionBtn: {
                text: '🎁 Add to Loyalty Program',
                icon: 'fa-gift',
                action: () => { alert('✨ Customer added to VIP loyalty program! Bonus points awarded.'); }
            },
            secondaryBtn: {
                text: 'Send Thank You',
                action: () => { alert('💌 Thank you email sent with 10% discount code.'); }
            },
            actionCode: 'LOYALTY_TICKET',
            priorityLevel: 'LOW'
        };
    }
}

/**
 * НОВАЯ ФУНКЦИЯ: Отображает тикет в интерфейсе
 */
function showTicket(ticketData, ticketId) {
    // Устанавливаем класс приоритета
    el.ticketBox.className = 'ticket-box priority-' + ticketData.priority;
    el.ticketBox.style.display = 'block';
    
    // Заполняем данные
    el.ticketTitle.textContent = ticketData.title;
    el.ticketSubtitle.textContent = ticketData.subtitle;
    el.ticketBadge.textContent = ticketData.badge;
    el.ticketMessage.textContent = ticketData.message;
    
    // Настраиваем кнопки
    const actionBtn = el.ticketActionBtn;
    actionBtn.innerHTML = `<i class="fas ${ticketData.actionBtn.icon}"></i> ${ticketData.actionBtn.text}`;
    
    // Удаляем старые обработчики и добавляем новые
    const newActionBtn = actionBtn.cloneNode(true);
    actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
    el.ticketActionBtn = newActionBtn;
    
    el.ticketActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ticketData.actionBtn.action();
    });
    
    el.ticketSecondaryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ticketData.secondaryBtn.action();
    });
    
    // Ticket metadata
    el.ticketId.textContent = ticketId;
    el.ticketTimestamp.textContent = new Date().toLocaleString();
}

async function sendToSheets(review, sentiment, confidence, actionCode, priority, ticketId) {
    try {
        const payload = {
            ts_iso: new Date().toISOString(),
            event: 'ticket_created',
            variant: 'SUPPORT',
            userId: `user-${Date.now()}`,
            meta: JSON.stringify({ 
                url: window.location.href,
                userAgent: navigator.userAgent,
                ticket_generated: true
            }),
            review: review,
            sentiment_label: sentiment,
            sentiment_confidence: confidence,
            action_taken: actionCode,
            priority: priority,
            ticket_id: ticketId
        };
        
        await fetch(SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log('📊 Ticket logged to Sheets:', payload);
    } catch (e) {
        console.error('Sheets error:', e);
    }
}

async function analyze() {
    try {
        hideError();
        
        el.btn.disabled = true;
        el.loading.style.display = 'block';
        el.result.style.display = 'none';
        el.ticketBox.style.display = 'none';
        
        const review = getRandom();
        el.review.textContent = review;
        
        const result = await classify(review);
        const sentiment = mapSentiment(result);
        
        showResult(sentiment);
        
        // СОЗДАЕМ ТИКЕТ НА ОСНОВЕ ОТЗЫВА
        const ticketId = generateTicketId();
        const ticketData = createSupportTicket(result.score, result.label, review);
        showTicket(ticketData, ticketId);
        
        // Отправляем в Google Sheets
        await sendToSheets(
            review,
            sentiment.text,
            sentiment.score,
            ticketData.actionCode,
            ticketData.priorityLevel,
            ticketId
        );
        
    } catch (e) {
        showError(e.message);
    } finally {
        el.btn.disabled = false;
        el.loading.style.display = 'none';
    }
}

async function init() {
    try {
        reviews = await loadReviews();
        await initModel();
    } catch (e) {
        showError(e.message);
    }
}

el.btn.addEventListener('click', analyze);
document.addEventListener('DOMContentLoaded', init);
