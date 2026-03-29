// ==================== البيانات ====================
let questionsData = [];
let countriesData = [];
let currentQuestions = [];
let currentQIndex = 0;
let score = 0, correctCount = 0, streak = 0, maxStreak = 0, totalAnswered = 0;
let timerInterval, timeLeft = 15, quizActive = false;
let currentCategory = "الكل";
let mainMap, currentMarker;
let compareChart = null;

// بيانات القارات
const continentsData = {
    asia: {
        name: "آسيا",
        img: "asia.jpg",
        description: "آسيا هي أكبر قارة في العالم من حيث المساحة وعدد السكان. تضم 48 دولة، وتقع فيها أعلى قمة في العالم (إيفرست) وأخفض نقطة (البحر الميت).",
        countries: ["الصين", "الهند", "إندونيسيا", "باكستان", "اليابان", "السعودية", "الإمارات", "قطر", "الكويت", "الأردن", "لبنان", "سوريا", "العراق", "اليمن", "عمان"]
    },
    africa: {
        name: "أفريقيا",
        img: "africa.jpg",
        description: "أفريقيا هي ثاني أكبر قارة في العالم. تضم 54 دولة، وتعتبر مهد البشرية. فيها أكبر صحراء حارة في العالم (الصحراء الكبرى) وأطول نهر (النيل).",
        countries: ["مصر", "الجزائر", "المغرب", "السودان", "تونس", "ليبيا", "موريتانيا", "الصومال", "جيبوتي", "جزر القمر"]
    },
    europe: {
        name: "أوروبا",
        img: "europe.jpg",
        description: "أوروبا هي سادس أكبر قارة من حيث المساحة، ولكنها ثالثة من حيث عدد السكان. تضم 44 دولة، وتعتبر مهد الحضارة الغربية.",
        countries: ["روسيا", "ألمانيا", "فرنسا", "إيطاليا", "إسبانيا", "المملكة المتحدة", "تركيا", "السويد", "النرويج", "سويسرا", "النمسا", "بلجيكا", "هولندا", "البرتغال"]
    },
    america: {
        name: "أمريكا",
        img: "america.jpg",
        description: "أمريكا هي ثاني أكبر قارة في العالم من حيث المساحة. تنقسم إلى أمريكا الشمالية وأمريكا الجنوبية، وتضم 35 دولة.",
        countries: ["الولايات المتحدة", "كندا", "المكسيك", "البرازيل", "الأرجنتين", "تشيلي", "كولومبيا", "بيرو", "فنزويلا", "كوبا"]
    },
    australia: {
        name: "أستراليا (أوقيانوسيا)",
        img: "australia.jpg",
        description: "أوقيانوسيا هي أصغر قارة في العالم. تضم أستراليا ونيوزيلندا والجزر المحيطية. تتميز بتنوعها الطبيعي الفريد.",
        countries: ["أستراليا", "نيوزيلندا", "بابوا غينيا الجديدة", "فيجي", "جزر سليمان"]
    }
};

// الحقائق الجغرافية
const importantFacts = [
    { icon: "fa-water", title: "أعمق نقطة في المحيطات", fact: "خندق ماريانا في المحيط الهادئ، عمقه 11,034 متراً." },
    { icon: "fa-mountain", title: "أعلى قمة جبلية", fact: "قمة إيفرست في الهيمالايا، ارتفاعها 8,848 متراً." },
    { icon: "fa-sun", title: "أكبر صحراء حارة", fact: "الصحراء الكبرى في أفريقيا، مساحتها 9.2 مليون كم²." },
    { icon: "fa-globe", title: "أكبر دولة مساحة", fact: "روسيا، بمساحة 17.1 مليون كيلومتر مربع." },
    { icon: "fa-umbrella-beach", title: "أكثر دولة من حيث الجزر", fact: "السويد، تضم أكثر من 221,800 جزيرة." },
    { icon: "fa-fire", title: "أخفض نقطة على الأرض", fact: "البحر الميت، 430 متراً تحت سطح البحر." },
    { icon: "fa-mountain", title: "أطول سلسلة جبلية", fact: "جبال الأنديز في أمريكا الجنوبية، بطول 7,000 كم." },
    { icon: "fa-water", title: "أطول نهر في العالم", fact: "نهر النيل بطول 6,650 كم." }
];

// ==================== تحميل البيانات ====================
async function loadData() {
    try {
        const [questionsRes, countriesRes] = await Promise.all([
            fetch('questions.json'),
            fetch('countries.json')
        ]);
        
        questionsData = await questionsRes.json();
        countriesData = await countriesRes.json();
        
        currentQuestions = [...questionsData];
        populateSelects();
        displayFacts();
        displayContinents();
        displayContinentsDetailed();
        loadUserProgress();
        updateStats();
        
        document.getElementById('quickInfo').innerHTML = `
            <p><i class="fas fa-globe"></i> عدد دول العالم: <strong>195 دولة</strong></p>
            <p><i class="fas fa-ruler-combined"></i> أكبر دولة مساحة: <strong>روسيا</strong> (17.1 مليون كم²)</p>
            <p><i class="fas fa-users"></i> أكثر دولة سكاناً: <strong>الهند</strong> (1.4 مليار)</p>
            <p><i class="fas fa-mountain"></i> أعلى قمة: <strong>إيفرست</strong> (8848 م)</p>
            <p><i class="fas fa-water"></i> أعمق نقطة: <strong>خندق ماريانا</strong> (11034 م)</p>
            <p><i class="fas fa-money-bill"></i> أقوى عملة: <strong>دينار كويتي</strong></p>
        `;
        
    } catch (error) {
        console.error('خطأ:', error);
        showToast('حدث خطأ في تحميل البيانات');
    }
}

// عرض بطاقات القارات في الرئيسية
function displayContinents() {
    const container = document.getElementById('continentsGrid');
    const continents = [
        { id: 'asia', name: 'آسيا', img: 'asia.jpg' },
        { id: 'africa', name: 'أفريقيا', img: 'africa.jpg' },
        { id: 'europe', name: 'أوروبا', img: 'europe.jpg' },
        { id: 'america', name: 'أمريكا', img: 'america.jpg' },
        { id: 'australia', name: 'أوقيانوسيا', img: 'australia.jpg' }
    ];
    
    container.innerHTML = continents.map(c => `
        <div class="continent-card" onclick="showContinentDetail('${c.id}')">
            <img src="${c.img}" alt="${c.name}" onerror="this.src='https://placehold.co/300x150/3d2b1a/d4a373?text=${c.name}'">
            <h3>${c.name}</h3>
            <p>استكشف القارة</p>
        </div>
    `).join('');
}

// عرض القارات في صفحة القارات
function displayContinentsDetailed() {
    const container = document.getElementById('continentsDetailed');
    const continents = [
        { id: 'asia', name: 'آسيا', img: 'asia.jpg', desc: 'أكبر قارة في العالم من حيث المساحة وعدد السكان.' },
        { id: 'africa', name: 'أفريقيا', img: 'africa.jpg', desc: 'ثاني أكبر قارة، مهد البشرية وأكبر الصحاري.' },
        { id: 'europe', name: 'أوروبا', img: 'europe.jpg', desc: 'مهد الحضارة الغربية وأكثر القارات تطوراً.' },
        { id: 'america', name: 'أمريكا', img: 'america.jpg', desc: 'تمتد من القطب الشمالي إلى الجنوبي.' },
        { id: 'australia', name: 'أوقيانوسيا', img: 'australia.jpg', desc: 'أصغر قارة، تضم أستراليا والجزر المحيطية.' }
    ];
    
    container.innerHTML = continents.map(c => `
        <div class="continent-card" onclick="showContinentDetail('${c.id}')">
            <img src="${c.img}" alt="${c.name}" onerror="this.src='https://placehold.co/300x150/3d2b1a/d4a373?text=${c.name}'">
            <h3>${c.name}</h3>
            <p>${c.desc}</p>
        </div>
    `).join('');
}

// عرض تفاصيل القارة
window.showContinentDetail = function(continentId) {
    const continent = continentsData[continentId];
    if (!continent) return;
    
    const detailDiv = document.getElementById('continentDetail');
    detailDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3><i class="fas fa-globe"></i> ${continent.name}</h3>
            <button class="category-btn" onclick="document.getElementById('continentDetail').classList.remove('active')">✕ إغلاق</button>
        </div>
        <img src="${continent.img}" alt="${continent.name}" onerror="this.src='https://placehold.co/800x300/3d2b1a/d4a373?text=${continent.name}'">
        <p>${continent.description}</p>
        <h4 style="color: #d4a373; margin: 15px 0 10px 0;"><i class="fas fa-flag"></i> دول القارة:</h4>
        <div class="country-list">
            ${continent.countries.map(c => `<div class="country-tag">${c}</div>`).join('')}
        </div>
    `;
    detailDiv.classList.add('active');
    detailDiv.scrollIntoView({ behavior: 'smooth' });
};

function displayFacts() {
    const container = document.getElementById('factsContainer');
    container.innerHTML = importantFacts.map(f => `
        <div class="fact-card">
            <i class="fas ${f.icon}"></i>
            <h3>${f.title}</h3>
            <p>${f.fact}</p>
        </div>
    `).join('');
}

// ==================== إدارة التقدم ====================
function loadUserProgress() {
    const saved = localStorage.getItem('geoCenter');
    if (saved) {
        const d = JSON.parse(saved);
        score = d.score || 0;
        correctCount = d.correctCount || 0;
        maxStreak = d.maxStreak || 0;
        totalAnswered = d.totalAnswered || 0;
    }
}

function saveUserProgress() {
    localStorage.setItem('geoCenter', JSON.stringify({ 
        score, correctCount, maxStreak, totalAnswered 
    }));
}

function updateStats() {
    const accuracy = totalAnswered === 0 ? 0 : Math.round((correctCount / totalAnswered) * 100);
    const level = Math.floor(score / 100) + 1;
    let rank = "🌱 مبتدئ";
    if (level >= 3) rank = "📚 خبير جغرافي";
    if (level >= 5) rank = "🏆 أستاذ جغرافيا";
    if (level >= 8) rank = "👑 أسطورة جغرافية";
    
    document.getElementById('homeScore').innerText = score;
    document.getElementById('homeCorrect').innerText = correctCount;
    document.getElementById('homeAccuracy').innerText = accuracy + "%";
    document.getElementById('homeLevel').innerText = level;
    
    document.getElementById('statScore').innerText = score;
    document.getElementById('statCorrect').innerText = correctCount;
    document.getElementById('statStreak').innerText = maxStreak;
    document.getElementById('statAccuracy').innerText = accuracy + "%";
    document.getElementById('statRank').innerHTML = rank;
    
    saveUserProgress();
}

window.resetProgress = function() {
    if (confirm('⚠️ هل أنت متأكد من إعادة تعيين كل التقدم؟')) {
        score = 0;
        correctCount = 0;
        maxStreak = 0;
        totalAnswered = 0;
        streak = 0;
        updateStats();
        showToast('✨ تم إعادة تعيين التقدم بنجاح');
    }
};

// ==================== نظام الأسئلة ====================
window.changeCategory = function() {
    const categories = ["الكل", "عواصم", "معالم", "أنهار", "جبال", "دول", "جغرافيا"];
    let idx = categories.indexOf(currentCategory);
    idx = (idx + 1) % categories.length;
    currentCategory = categories[idx];
    
    if (currentCategory === "الكل") {
        currentQuestions = [...questionsData];
    } else {
        currentQuestions = questionsData.filter(q => q.category === currentCategory);
        if (currentQuestions.length === 0) currentQuestions = [...questionsData];
    }
    
    document.getElementById('currentCategory').innerHTML = currentCategory;
    currentQIndex = 0;
    loadQuestion();
    showToast(`📂 تم التبديل إلى فئة: ${currentCategory}`);
};

function loadQuestion() {
    if (timerInterval) clearInterval(timerInterval);
    if (currentQuestions.length === 0) currentQuestions = [...questionsData];
    
    const q = currentQuestions[currentQIndex];
    if (!q) return;
    
    quizActive = true;
    timeLeft = 15;
    document.getElementById('timer').innerHTML = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
    
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        } else {
            timeLeft--;
            document.getElementById('timer').innerHTML = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
        }
    }, 1000);
    
    document.getElementById('question').innerHTML = q.q;
    const container = document.getElementById('answers');
    container.innerHTML = '';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('quizFeedback').innerHTML = '';
    
    q.a.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = `${String.fromCharCode(65 + idx)}. ${ans}`;
        btn.onclick = () => checkAnswer(idx, q.c, btn);
        container.appendChild(btn);
    });
}

function checkAnswer(selected, correct, btn) {
    if (!quizActive) return;
    clearInterval(timerInterval);
    quizActive = false;
    
    const allBtns = document.querySelectorAll('#answers .answer-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    
    const q = currentQuestions[currentQIndex];
    
    if (selected === correct) {
        btn.classList.add('correct');
        const points = 10 + (streak * 2);
        score += points;
        correctCount++;
        streak++;
        totalAnswered++;
        if (streak > maxStreak) maxStreak = streak;
        document.getElementById('quizFeedback').innerHTML = `<span style="color: #95d5b2;">✅ صحيح! +${points} نقطة (سلسلة ${streak})</span>`;
    } else {
        btn.classList.add('wrong');
        allBtns[correct].classList.add('correct');
        streak = 0;
        document.getElementById('quizFeedback').innerHTML = `<span style="color: #ff9999;">❌ خطأ! الإجابة الصحيحة: ${q.a[correct]}</span>`;
    }
    
    updateStats();
    document.getElementById('nextBtn').style.display = 'block';
}

function handleTimeout() {
    quizActive = false;
    streak = 0;
    const q = currentQuestions[currentQIndex];
    document.getElementById('quizFeedback').innerHTML = `<span style="color: #ffb74d;">⏰ انتهى الوقت! الإجابة: ${q.a[q.c]}</span>`;
    document.getElementById('nextBtn').style.display = 'block';
    const allBtns = document.querySelectorAll('#answers .answer-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    updateStats();
}

window.nextQuestion = function() {
    currentQIndex = (currentQIndex + 1) % currentQuestions.length;
    loadQuestion();
};

// ==================== المقارنة ====================
function populateSelects() {
    const sel1 = document.getElementById('country1');
    const sel2 = document.getElementById('country2');
    
    sel1.innerHTML = '<option value="">🔍 اختر دولة</option>';
    sel2.innerHTML = '<option value="">🔍 اختر دولة</option>';
    
    countriesData.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.name;
        opt1.innerText = `${c.flag} ${c.name}`;
        const opt2 = opt1.cloneNode(true);
        sel1.appendChild(opt1);
        sel2.appendChild(opt2);
    });
}

window.compareCountries = function() {
    const name1 = document.getElementById('country1').value;
    const name2 = document.getElementById('country2').value;
    
    if (!name1 || !name2 || name1 === name2) {
        document.getElementById('compareResult').innerHTML = '<p style="text-align: center; padding: 40px;">⚠️ يرجى اختيار دولتين مختلفتين للمقارنة</p>';
        if (compareChart) compareChart.destroy();
        return;
    }
    
    const c1 = countriesData.find(c => c.name === name1);
    const c2 = countriesData.find(c => c.name === name2);
    
    if (!c1 || !c2) return;
    
    document.getElementById('compareResult').innerHTML = `
        <div class="compare-card">
            <div class="flag">${c1.flag}</div>
            <h3>${c1.name}</h3>
            <p><i class="fas fa-language"></i> اللغة: ${c1.officialLanguage}</p>
            <p><i class="fas fa-mosque"></i> الدين: ${c1.officialReligion}</p>
            <p><i class="fas fa-gavel"></i> الحكم: ${c1.government}</p>
            <p><i class="fas fa-city"></i> العاصمة: ${c1.capital}</p>
            <p><i class="fas fa-users"></i> السكان: ${(c1.population / 1e6).toFixed(1)} مليون</p>
            <p><i class="fas fa-globe"></i> المساحة: ${(c1.area / 1e3).toFixed(0)} ألف كم²</p>
            <p><i class="fas fa-money-bill"></i> العملة: ${c1.currency}</p>
            <p><i class="fas fa-shield-alt"></i> التصنيف: ${c1.militaryRank}</p>
        </div>
        <div class="compare-card">
            <div class="flag">${c2.flag}</div>
            <h3>${c2.name}</h3>
            <p><i class="fas fa-language"></i> اللغة: ${c2.officialLanguage}</p>
            <p><i class="fas fa-mosque"></i> الدين: ${c2.officialReligion}</p>
            <p><i class="fas fa-gavel"></i> الحكم: ${c2.government}</p>
            <p><i class="fas fa-city"></i> العاصمة: ${c2.capital}</p>
            <p><i class="fas fa-users"></i> السكان: ${(c2.population / 1e6).toFixed(1)} مليون</p>
            <p><i class="fas fa-globe"></i> المساحة: ${(c2.area / 1e3).toFixed(0)} ألف كم²</p>
            <p><i class="fas fa-money-bill"></i> العملة: ${c2.currency}</p>
            <p><i class="fas fa-shield-alt"></i> التصنيف: ${c2.militaryRank}</p>
        </div>
    `;
    
    const ctx = document.getElementById('compareChart').getContext('2d');
    if (compareChart) compareChart.destroy();
    
    compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['عدد السكان (مليون)', 'المساحة (ألف كم²)'],
            datasets: [
                { label: c1.name, data: [c1.population / 1e6, c1.area / 1e3], backgroundColor: '#d4a373', borderRadius: 10 },
                { label: c2.name, data: [c2.population / 1e6, c2.area / 1e3], backgroundColor: '#8b6946', borderRadius: 10 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#f5e6d3' } }
            },
            scales: {
                y: { ticks: { color: '#f5e6d3' }, grid: { color: 'rgba(212, 163, 115, 0.2)' } },
                x: { ticks: { color: '#f5e6d3' }, grid: { color: 'rgba(212, 163, 115, 0.2)' } }
            }
        }
    });
};

// ==================== الخريطة ====================
function initMap() {
    if (mainMap) return;
    mainMap = L.map('map').setView([23.5, 40], 3);
    changeLayer('street');
    
    mainMap.on('click', async (e) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
            const data = await res.json();
            document.getElementById('mapInfo').innerHTML = `<i class="fas fa-location-dot"></i> ${data.display_name || 'منطقة جغرافية'}`;
        } catch (err) {
            document.getElementById('mapInfo').innerHTML = `<i class="fas fa-location-dot"></i> ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}`;
        }
    });
}

window.changeLayer = function(type) {
    if (!mainMap) return;
    mainMap.eachLayer(layer => {
        if (layer._url) mainMap.removeLayer(layer);
    });
    
    let url = type === 'street' 
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    
    L.tileLayer(url, { attribution: '© OpenStreetMap' }).addTo(mainMap);
};

window.searchLocation = async function() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data.length) {
            const { lat, lon, display_name } = data[0];
            mainMap.flyTo([lat, lon], 10);
            if (currentMarker) mainMap.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lon]).addTo(mainMap).bindPopup(display_name).openPopup();
            document.getElementById('mapInfo').innerHTML = `<i class="fas fa-search"></i> ${display_name}`;
        } else {
            showToast('❌ لم يتم العثور على الموقع');
        }
    } catch (e) {
        showToast('⚠️ حدث خطأ في البحث');
    }
};

// ==================== التنقل ====================
window.navigateTo = function(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`.nav-btn[data-page="${pageId}"]`).classList.add('active');
    
    if (pageId === 'maps') {
        if (mainMap) mainMap.invalidateSize();
        else initMap();
    }
    if (pageId === 'quiz' && currentQuestions.length && !quizActive) {
        loadQuestion();
    }
    if (pageId === 'compare') {
        compareCountries();
    }
};

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ربط أزرار التنقل
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.page);
    });
});

// ==================== تشغيل التطبيق ====================
loadData();
setTimeout(() => initMap(), 500);
