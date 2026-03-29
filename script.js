let coins = 1123;
let currentLvlIndex = 0;

// 1. نظام توليد الخريطة (زي صور كلمات كراش)
function renderMap() {
    const container = document.getElementById('map-container');
    container.innerHTML = "";
    allLevels.forEach((lvl, index) => {
        const div = document.createElement('div');
        div.className = `map-node ${index <= currentLvlIndex ? 'active' : 'locked'}`;
        div.innerText = lvl.id;
        div.style.left = lvl.pos.x + "%";
        div.style.top = lvl.pos.y + "%";
        div.onclick = () => { if(index <= currentLvlIndex) startLevel(index); };
        container.appendChild(div);
    });
}

// 2. تدوير الحروف (Shuffle)
function shuffleGrid(letters) {
    let arr = letters.split(" ");
    return arr.sort(() => Math.random() - 0.5);
}

// 3. عجلة الحظ (Logic)
function spinWheel() {
    const wheel = document.getElementById('main-wheel');
    let deg = Math.floor(5000 + Math.random() * 5000);
    wheel.style.transition = 'all 5s ease-out';
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        coins += 20; // جائزة افتراضية
        updateCoins();
        alert("مبروك فزت بـ 20 قطعة ذهبية!");
    }, 5000);
}

function startLevel(index) {
    currentLvlIndex = index;
    const lvl = allLevels[index];
    document.getElementById('map-screen').style.display = "none";
    document.getElementById('game-screen').style.display = "block";
    document.getElementById('q-text').innerText = lvl.q;
    
    // توليد الشبكة مع بعثرة الحروف
    const grid = document.getElementById('grid');
    grid.innerHTML = "";
    shuffleGrid(lvl.grid).forEach(char => {
        const b = document.createElement('button');
        b.className = "letter-btn";
        b.innerText = char;
        b.onclick = () => { /* منطق الضغط */ };
        grid.appendChild(b);
    });
}

function updateCoins() {
    document.getElementById('coins-map').innerText = coins;
    document.getElementById('coins-game').innerText = coins;
}

window.onload = renderMap;
