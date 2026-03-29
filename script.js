// بيانات المحرك
const GameState = {
    xp: parseInt(localStorage.getItem('geoXP')) || 0,
    gold: parseInt(localStorage.getItem('geoGold')) || 0,
    level: 1,
    currentQuestions: [],
    map: null,
    isSatellite: false
};

const Ranks = [
    { min: 0, title: "مستكشف مبتدئ", icon: "🥉" },
    { min: 100, title: "رحالة خبير", icon: "🥈" },
    { min: 500, title: "سفير جيو", icon: "🥇" },
    { min: 1000, title: "إمبراطور العالم", icon: "👑" }
];

// 1. تشغيل النظام
function initGame() {
    updateHUD();
    initMap();
    loadBattleData();
    populateWarRoom();
}

// 2. تحديث الواجهة والدرجات
function updateHUD() {
    const rank = Ranks.reverse().find(r => GameState.xp >= r.min) || Ranks[0];
    document.getElementById('player-title').innerText = rank.title;
    document.getElementById('rank-icon').innerText = rank.icon;
    document.getElementById('gold-count').innerText = GameState.gold;
    
    const xpPercent = (GameState.xp % 100);
    document.getElementById('xp-fill').style.width = xpPercent + "%";
    
    // حفظ البيانات
    localStorage.setItem('geoXP', GameState.xp);
    localStorage.setItem('geoGold', GameState.gold);
}

// 3. محرك المعركة (الأسئلة المتدرجة)
async function loadBattleData() {
    const res = await fetch('questions.json');
    const data = await res.json();
    
    // تدرج الصعوبة: فرز الأسئلة بناءً على الصعوبة (لو أضفت حقل difficulty في JSON)
    // حالياً سنختار عشوائياً
    GameState.currentQuestions = data.sort(() => Math.random() - 0.5);
    nextQuestion();
}

function nextQuestion() {
    const q = GameState.currentQuestions[0];
    document.getElementById('question-text').innerText = q.q;
    const container = document.getElementById('options');
    container.innerHTML = '';

    q.a.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkBattleAnswer(btn, idx === q.c);
        container.appendChild(btn);
    });
}

function checkBattleAnswer(el, isCorrect) {
    if(isCorrect) {
        el.classList.add('correct');
        GameState.xp += 20;
        GameState.gold += 50;
        // تأثير اهتزاز بسيط للنجاح
    } else {
        el.classList.add('wrong');
        GameState.xp = Math.max(0, GameState.xp - 10);
    }
    
    updateHUD();
    setTimeout(() => {
        GameState.currentQuestions.shift();
        nextQuestion();
    }, 1000);
}

// 4. خريطة الرادار
function initMap() {
    GameState.map = L.map('map', { zoomControl: false }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(GameState.map);
}

function toggleSatellite() {
    GameState.isSatellite = !GameState.isSatellite;
    GameState.map.eachLayer(l => GameState.map.removeLayer(l));
    const url = GameState.isSatellite ? 
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' :
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(url).addTo(GameState.map);
}

// 5. التنقل السلس
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// تشغيل اللعبة
document.addEventListener('DOMContentLoaded', initGame);
