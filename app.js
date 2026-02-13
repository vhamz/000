// Import Transformers.js
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js";

// Google Sheets URL (ЗАМЕНИТЕ НА ВАШ ПОСЛЕ ДЕПЛОЯ)
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzki9Ny8eomw4ewwgnGLuLgL5rBPMy7s4ETWGiYMHK1JGRa2dt6yAmT5bDwmoamNDrI/exec';

// База данных песен для разных настроений
const SONGS = {
    sad: {
        title: "Someone Like You - Adele",
        embedUrl: "https://open.spotify.com/embed/track/4kflIGfjdZJW4ot2ioixTB",
        linkUrl: "https://open.spotify.com/track/4kflIGfjdZJW4ot2ioixTB",
        icon: "😢"
    },
    chill: {
        title: "Sunflower - Post Malone",
        embedUrl: "https://open.spotify.com/embed/track/4EpRuFi5jOCV96qE9tI5sV",
        linkUrl: "https://open.spotify.com/track/4EpRuFi5jOCV96qE9tI5sV",
        icon: "😌"
    },
    happy: {
        title: "Happy - Pharrell Williams",
        embedUrl: "https://open.spotify.com/embed/track/60nZcImufyMA1MKQY3dcCH",
        linkUrl: "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH",
        icon: "😊"
    }
};

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
    loading: document.getElementById('loadingSpinner'),
    // Новые элементы для музыки
    musicBox: document.getElementById('musicBox'),
    musicMessage: document.getElementById('musicMessage'),
    musicIcon: document.getElementById('musicIcon'),
    musicPlayer: document.getElementById('musicPlayer'),
    musicButton: document.getElementById('musicButton')
};

function setStatus(text) {
    el.status.textContent = text;
}

function showError(text) {
    el.error.textContent = text;
    el.error.style.display = 'block';
}

function hideError() {
    el.error.style.display = 'none';
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
    setStatus('🎛️ Loading AI model...');
    model = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    setStatus('🎵 Ready to DJ!');
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
        return { type: 'negative', text: 'NEGATIVE', score, icon: '😢' };
    } else {
        return { type: 'neutral', text: 'NEUTRAL', score, icon: '😐' };
    }
}

function showResult(data) {
    el.result.style.display = 'block';
    el.icon.textContent = data.icon;
    el.label.textContent = data.text;
    el.conf.textContent = `${(data.score * 100).toFixed(1)}% confidence`;
}

/**
 * НОВАЯ ФУНКЦИЯ: Определяет музыку под настроение
 */
function determineMusicMood(confidence, label) {
    let normalizedScore = 0.5;
    
    if (label === "POSITIVE") {
        normalizedScore = confidence;
    } else if (label === "NEGATIVE") {
        normalizedScore = 1.0 - confidence;
    }
    
    if (normalizedScore <= 0.4) {
        // Грустное настроение
        return {
            mood: "sad",
            message: "We hear you... 😢 Here's a song for when you need to feel understood",
            song: SONGS.sad,
            actionCode: "PLAY_SAD_SONG"
        };
    } else if (normalizedScore < 0.7) {
        // Нейтральное/чилловое настроение
        return {
            mood: "chill",
            message: "Chill mode activated 🎧 Just relax and enjoy",
            song: SONGS.chill,
            actionCode: "PLAY_CHILL_SONG"
        };
    } else {
        // Счастливое настроение
        return {
            mood: "happy",
            message: "You're awesome! 🎉 Here's a happy tune for you",
            song: SONGS.happy,
            actionCode: "PLAY_HAPPY_SONG"
        };
    }
}

/**
 * НОВАЯ ФУНКЦИЯ: Отображает музыкальный плеер
 */
function showMusicPlayer(moodData) {
    el.musicBox.style.display = 'block';
    el.musicBox.style.borderColor = moodData.mood === 'sad' ? '#9b59b6' : (moodData.mood === 'chill' ? '#3498db' : '#f1c40f');
    
    el.musicMessage.textContent = moodData.message;
    el.musicIcon.textContent = moodData.song.icon;
    
    // Создаем iframe для Spotify
    el.musicPlayer.innerHTML = `
        <iframe style="border-radius:12px" 
                src="${moodData.song.embedUrl}?utm_source=generator" 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
        </iframe>
    `;
    
    el.musicButton.href = moodData.song.linkUrl;
}

async function sendToSheets(review, sentiment, confidence, actionCode, songUrl) {
    try {
        const payload = {
            ts_iso: new Date().toISOString(),
            event: 'sentiment_dj',
            variant: 'DJ',
            userId: `user-${Date.now()}`,
            meta: JSON.stringify({ 
                url: window.location.href,
                userAgent: navigator.userAgent 
            }),
            review: review,
            sentiment_label: sentiment,
            sentiment_confidence: confidence,
            action_taken: actionCode,
            song_url: songUrl  // НОВОЕ ПОЛЕ
        };
        
        await fetch(SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log('🎵 Data sent to Sheets:', payload);
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
        el.musicBox.style.display = 'none';
        
        const review = getRandom();
        el.review.textContent = review;
        
        const result = await classify(review);
        const sentiment = mapSentiment(result);
        
        showResult(sentiment);
        
        // НОВОЕ: определяем музыку под настроение
        const moodData = determineMusicMood(result.score, result.label);
        showMusicPlayer(moodData);
        
        // Отправляем в Sheets
        await sendToSheets(
            review, 
            sentiment.text, 
            sentiment.score, 
            moodData.actionCode,
            moodData.song.linkUrl
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
