// ==================== المتغيرات العامة ====================
let questionsData = [];
let countriesData = [];
let currentQuestions = [];
let currentQIndex = 0;
let score = 0, correctCount = 0, streak = 0, maxStreak = 0, totalAnswered = 0;
let timerInterval, timeLeft = 15, quizActive = false;
let currentCategory = "الكل";
let mainMap, currentMarker;
let compareChart = null;

// الحقائق الجغرافية المهمة
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
        
        // تهيئة البيانات
        currentQuestions = [...questionsData];
        populateSelects();
        displayFacts();
        loadUserProgress();
        updateStats();
        
        document.getElementById('quickInfo').innerHTML = `
            🌍 عدد دول العالم: <strong>195 دولة</strong> معترف بها<br>
            🗺️ أكبر دولة مساحة: <strong>روسيا</strong> (17.1 مليون كم²)<br>
            👥 أكثر دولة سكاناً: <strong>الهند</strong> (1.4 مليار نسمة)<br>
            🏔️ أعلى قمة: <strong>إيفرست</strong> (8848 م)<br>
            🌊 أعمق نقطة: <strong>خندق ماريانا</strong> (11034 م)
        `;
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showToast('حدث خطأ في تحميل البيانات');
    }
}

// ==================== عرض الحقائق ====================
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

// ==================== إدارة المستخدم ====================
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
    const rank = level <= 2 ? "مستكشف" : level <= 4 ? "خبير جغرافي" : "أستاذ جغرافيا";
    
    document.getElementById('homeScore').innerText = score;
    document.getElementById('homeCorrect').innerText = correctCount;
    document.getElementById('homeAccuracy').innerText = accuracy + "%";
    document.getElementById('homeLevel').innerText = level;
    
    document.getElementById('statScore').innerText = score;
    document.getElementById('statCorrect').innerText = correctCount;
    document.getElementById('statStreak').innerText = maxStreak;
    document.getElementById('statAccuracy').innerText = accuracy + "%";
    document.getElementById('statRank').innerText = rank;
    
    saveUserProgress();
}

function resetProgress() {
    if (confirm('هل أنت متأكد من إعادة تعيين كل التقدم؟')) {
        score = 0;
        correctCount = 0;
        maxStreak = 0;
        totalAnswered = 0;
        streak = 0;
        updateStats();
        showToast('تم إعادة تعيين التقدم بنجاح');
    }
}

// ==================== نظام الأسئلة ====================
function changeCategory() {
    const categories = ["الكل", "عواصم", "معالم", "أنهار", "جبال", "دول", "جغرافيا طبيعية"];
    let idx = categories.indexOf(currentCategory);
    idx = (idx + 1) % categories.length;
    currentCategory = categories[idx];
    
    if (currentCategory === "الكل") {
        currentQuestions = [...questionsData];
    } else {
        currentQuestions = questionsData.filter(q => q.category === currentCategory);
        if (currentQuestions.length === 0) currentQuestions = [...questionsData];
    }
    
    document.getElementById('currentCategoryName').innerText = currentCategory;
    currentQIndex = 0;
    loadQuestion();
    showToast(`تم التبديل إلى فئة: ${currentCategory}`);
}

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
        document.getElementById('quizFeedback').innerHTML = `<span style="color: #81c784;">✅ صحيح! +${points} نقطة (سلسلة ${streak})</span>`;
    } else {
        btn.classList.add('wrong');
        allBtns[correct].classList.add('correct');
        streak = 0;
        document.getElementById('quizFeedback').innerHTML = `<span style="color: #ef9a9a;">❌ خطأ! الإجابة الصحيحة: ${q.a[correct]}</span>`;
    }
    
    updateStats();
    document.getElementById('nextBtn').style.display = 'block';
}

function handleTimeout() {
    quizActive = false;
    streak = 0;
    const q = currentQuestions[currentQIndex];
    document.getElementById('quizFeedback').innerHTML = `<span style="color: #d4a373;">⏰ انتهى الوقت! الإجابة: ${q.a[q.c]}</span>`;
    document.getElementById('nextBtn').style.display = 'block';
    const allBtns = document.querySelectorAll('#answers .answer-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    updateStats();
}

function nextQuestion() {
    currentQIndex = (currentQIndex + 1) % currentQuestions.length;
    loadQuestion();
}

// ==================== المقارنة الشاملة ====================
function populateSelects() {
    const sel1 = document.getElementById('country1');
    const sel2 = document.getElementById('country2');
    
    sel1.innerHTML = '<option value="">اختر دولة</option>';
    sel2.innerHTML = '<option value="">اختر دولة</option>';
    
    countriesData.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.name;
        opt1.innerText = `${c.flag} ${c.name}`;
        const opt2 = opt1.cloneNode(true);
        sel1.appendChild(opt1);
        sel2.appendChild(opt2);
    });
}

function filterCountries(selectNum) {
    const searchTerm = document.getElementById(`searchCountry${selectNum}`).value.trim().toLowerCase();
    const filtered = countriesData.filter(c => c.name.toLowerCase().includes(searchTerm));
    const select = document.getElementById(`country${selectNum}`);
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">اختر دولة</option>';
    filtered.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        option.innerText = `${c.flag} ${c.name}`;
        select.appendChild(option);
    });
    
    if (currentValue && filtered.some(c => c.name === currentValue)) {
        select.value = currentValue;
    }
}

function compareCountries() {
    const name1 = document.getElementById('country1').value;
    const name2 = document.getElementById('country2').value;
    
    if (!name1 || !name2 || name1 === name2) {
        document.getElementById('compareResult').innerHTML = '<p style="text-align: center; grid-column: span 2;">⚠️ يرجى اختيار دولتين مختلفتين للمقارنة</p>';
        if (compareChart) compareChart.destroy();
        return;
    }
    
    const c1 = countriesData.find(c => c.name === name1);
    const c2 = countriesData.find(c => c.name === name2);
    
    if (!c1 || !c2) return;
    
    document.getElementById('compareResult').innerHTML = `
        <div class="country-card">
            <div class="country-flag">${c1.flag}</div>
            <h3>${c1.name}</h3>
            <p><i class="fas fa-language"></i> اللغة الرسمية: ${c1.officialLanguage || 'غير محدد'}</p>
            <p><i class="fas fa-mosque"></i> الدين الرسمي: ${c1.officialReligion || 'غير محدد'}</p>
            <p><i class="fas fa-gavel"></i> نظام الحكم: ${c1.government || 'غير محدد'}</p>
            <p><i class="fas fa-city"></i> العاصمة: ${c1.capital}</p>
            <p><i class="fas fa-users"></i> عدد السكان: ${(c1.population / 1e6).toFixed(1)} مليون نسمة</p>
            <p><i class="fas fa-globe"></i> المساحة: ${(c1.area / 1e3).toFixed(0)} ألف كم²</p>
            <p><i class="fas fa-money-bill"></i> العملة: ${c1.currency}</p>
            <p><i class="fas fa-shield-alt"></i> التقييم العسكري: ${c1.militaryRank || 'غير محدد'}</p>
        </div>
        <div class="country-card">
            <div class="country-flag">${c2.flag}</div>
            <h3>${c2.name}</h3>
            <p><i class="fas fa-language"></i> اللغة الرسمية: ${c2.officialLanguage || 'غير محدد'}</p>
            <p><i class="fas fa-mosque"></i> الدين الرسمي: ${c2.officialReligion || 'غير محدد'}</p>
            <p><i class="fas fa-gavel"></i> نظام الحكم: ${c2.government || 'غير محدد'}</p>
            <p><i class="fas fa-city"></i> العاصمة: ${c2.capital}</p>
            <p><i class="fas fa-users"></i> عدد السكان: ${(c2.population / 1e6).toFixed(1)} مليون نسمة</p>
            <p><i class="fas fa-globe"></i> المساحة: ${(c2.area / 1e3).toFixed(0)} ألف كم²</p>
            <p><i class="fas fa-money-bill"></i> العملة: ${c2.currency}</p>
            <p><i class="fas fa-shield-alt"></i> التقييم العسكري: ${c2.militaryRank || 'غير محدد'}</p>
        </div>
    `;
    
    const ctx = document.getElementById('compareChart').getContext('2d');
    if (compareChart) compareChart.destroy();
    
    compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['عدد السكان (مليون)', 'المساحة (ألف كم²)'],
            datasets: [
                { label: c1.name, data: [c1.population / 1e6, c1.area / 1e3], backgroundColor: '#d4a373' },
                { label: c2.name, data: [c2.population / 1e6, c2.area / 1e3], backgroundColor: '#6b8c5c' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#f5e6d3' } }
            }
        }
    });
}

// ==================== الخرائط ====================
function initMap() {
    if (mainMap) return;
    mainMap = L.map('map').setView([23.5, 40], 3);
    changeLayer('street');
    
    mainMap.on('click', async (e) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
            const data = await res.json();
            document.getElementById('mapInfo').innerHTML = `<i class="fas fa-location-dot"></i> ${data.display_name || 'منطقة جغرافية'} (${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)})`;
        } catch (err) {
            document.getElementById('mapInfo').innerHTML = `<i class="fas fa-location-dot"></i> ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}`;
        }
    });
}

function changeLayer(type) {
    if (!mainMap) return;
    mainMap.eachLayer(layer => {
        if (layer._url) mainMap.removeLayer(layer);
    });
    
    let url = '';
    if (type === 'street') {
        url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (type === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    
    if (url) {
        L.tileLayer(url, { attribution: '© OpenStreetMap' }).addTo(mainMap);
    }
}

async function searchLocation() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data.length) {
            const { lat, lon, display_name } = data[0];
            mainMap.flyTo([lat, lon], 8);
            if (currentMarker) mainMap.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lon]).addTo(mainMap).bindPopup(display_name).openPopup();
            document.getElementById('mapInfo').innerHTML = `<i class="fas fa-search"></i> ${display_name}`;
        } else {
            showToast('لم يتم العثور على الموقع');
        }
    } catch (e) {
        showToast('حدث خطأ في البحث');
    }
}

// ==================== التنقل والإشعارات ====================
function navigateTo(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    document.getElementById(`nav-${sectionId}`).classList.add('active');
    
    if (sectionId === 'maps') {
        if (mainMap) mainMap.invalidateSize();
        else initMap();
    }
    if (sectionId === 'quiz' && currentQuestions.length) {
        if (!quizActive) loadQuestion();
    }
    if (sectionId === 'compare') compareCountries();
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ==================== تشغيل التطبيق ====================
loadData();
setTimeout(() => initMap(), 500);
