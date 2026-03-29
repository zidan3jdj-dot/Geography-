let currentScore = localStorage.getItem('geoScore') || 0;
let countriesData = [];
let quizCategory = 'عواصم';
let map, layers = {};

// 1. إدارة التنقل وحفظ الحالة
function nav(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    event.currentTarget.classList.add('active');
    if(viewId === 'map-view') setTimeout(() => map.invalidateSize(), 200);
}

// 2. نظام الخريطة الثلاثي
function initAdvancedMap() {
    map = L.map('map', { zoomControl: false }).setView([20, 10], 3);
    layers.street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    layers.sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    layers.street.addTo(map);
}

function switchLayer(type) {
    map.eachLayer(l => map.removeLayer(l));
    layers[type].addTo(map);
}

// 3. نظام الأسئلة الاحترافي
async function loadQuiz() {
    const res = await fetch('questions.json');
    const allQuestions = await res.json();
    const filtered = allQuestions.filter(q => q.category === quizCategory);
    renderQuestion(filtered[Math.floor(Math.random() * filtered.length)]);
}

function renderQuestion(q) {
    document.getElementById('q-text').innerText = q.q;
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    q.a.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.innerText = opt;
        btn.onclick = (e) => handleAnswer(e.target, idx === q.c);
        grid.appendChild(btn);
    });
}

function handleAnswer(element, isCorrect) {
    if(isCorrect) {
        element.style.background = 'var(--success)';
        currentScore = parseInt(currentScore) + 10;
    } else {
        element.style.background = 'var(--error)';
    }
    localStorage.setItem('geoScore', currentScore);
    document.getElementById('score').innerText = currentScore;
    setTimeout(loadQuiz, 1200);
}

function setCategory(cat) {
    quizCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    loadQuiz();
}

// 4. المقارنة العسكرية والاقتصادية الشاملة
async function initCompare() {
    const res = await fetch('countries.json');
    countriesData = await res.json();
    const s1 = document.getElementById('c1');
    const s2 = document.getElementById('c2');
    
    countriesData.forEach(c => {
        const op = `<option value="${c.name}">${c.flag} ${c.name}</option>`;
        s1.innerHTML += op; s2.innerHTML += op;
    });
}

function performGlobalCompare() {
    const d1 = countriesData.find(c => c.name === document.getElementById('c1').value);
    const d2 = countriesData.find(c => c.name === document.getElementById('c2').value);
    
    const fields = [
        {k: 'السكان', v: 'population'}, {k: 'المساحة', v: 'area'}, 
        {k: 'العملة', v: 'currency'}, {k: 'التصنيف العسكري', v: 'militaryRank'},
        {k: 'نظام الحكم', v: 'government'}, {k: 'الدين الرسمي', v: 'officialReligion'}
    ];

    document.getElementById('compare-results-grid').innerHTML = fields.map(f => `
        <div class="data-row">
            <div class="side-a"><strong>${d1[f.v]}</strong></div>
            <div class="label-mid" style="color:var(--accent)">${f.k}</div>
            <div class="side-b"><strong>${d2[f.v]}</strong></div>
        </div>
    `).join('');
}

// البدء
document.addEventListener('DOMContentLoaded', () => {
    initAdvancedMap();
    initCompare();
    loadQuiz();
    document.getElementById('score').innerText = currentScore;
});
