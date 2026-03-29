let questions = [];
let countries = [];
let currentQuizIndex = 0;
let userScore = 0;
let map, satelliteLayer, normalLayer;

// 1. إدارة التنقل
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    event.currentTarget.classList.add('active');

    if(pageId === 'maps') setTimeout(() => map.invalidateSize(), 200);
}

// 2. إدارة الخريطة (المنظور الطبيعي والقمر الصناعي)
function initMap() {
    map = L.map('mainMap').setView([26.8, 30.8], 5);
    
    normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
}

function toggleMapLayer() {
    if (map.hasLayer(normalLayer)) {
        map.removeLayer(normalLayer);
        map.addLayer(satelliteLayer);
        document.getElementById('layerBtn').innerHTML = '<i class="fas fa-map"></i>';
    } else {
        map.removeLayer(satelliteLayer);
        map.addLayer(normalLayer);
        document.getElementById('layerBtn').innerHTML = '<i class="fas fa-satellite"></i>';
    }
}

// 3. نظام الأسئلة (Quiz System)
async function startQuiz() {
    const res = await fetch('questions.json');
    questions = await res.json();
    currentQuizIndex = 0;
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQuizIndex];
    document.getElementById('question-text').innerText = q.q;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    q.a.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, q.c);
        container.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    if(selected === correct) {
        userScore += 10;
        document.getElementById('total-score').innerText = userScore;
    }
    currentQuizIndex++;
    if(currentQuizIndex < questions.length) {
        setTimeout(showQuestion, 1000);
    } else {
        document.getElementById('question-text').innerText = "انتهى التحدي!";
        updateStats();
    }
}

// 4. نظام المقارنة
async function loadCountries() {
    const res = await fetch('countries.json');
    countries = await res.json();
    const s1 = document.getElementById('country1');
    const s2 = document.getElementById('country2');
    
    countries.forEach(c => {
        const opt = `<option value="${c.name}">${c.flag} ${c.name}</option>`;
        s1.innerHTML += opt;
        s2.innerHTML += opt;
    });
}

function compareData() {
    const c1 = countries.find(c => c.name === document.getElementById('country1').value);
    const c2 = countries.find(c => c.name === document.getElementById('country2').value);
    
    document.getElementById('compare-result').innerHTML = `
        <div class="result-cards" style="display:flex; gap:10px; margin-top:20px;">
            <div class="card" style="background:#334155; padding:10px; border-radius:10px; flex:1">
                <h4>${c1.name}</h4>
                <p>السكان: ${c1.population.toLocaleString()}</p>
                <p>المساحة: ${c1.area} كم</p>
            </div>
            <div class="card" style="background:#334155; padding:10px; border-radius:10px; flex:1">
                <h4>${c2.name}</h4>
                <p>السكان: ${c2.population.toLocaleString()}</p>
                <p>المساحة: ${c2.area} كم</p>
            </div>
        </div>
    `;
}

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadCountries();
});
