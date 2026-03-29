// بيانات اللعبة مدمجة (Production Data)
const gameData = [
    { id: 1, q: "ما هي عاصمة دولة فلسطين؟", a: "القدس", cat: "عواصم", grid: "ا ل ق د س م و ن ر ت ج ب" },
    { id: 2, q: "أطول نهر في العالم؟", a: "النيل", cat: "تضاريس", grid: "ا ل ن ي ل ف ر ا ت م ك هـ" },
    { id: 3, q: "أين توجد أهرامات الجيزة؟", a: "مصر", cat: "معالم", grid: "م ص ر س ع و د ي ا ل هـ" },
    { id: 4, q: "أكبر دولة مساحة في العالم؟", a: "روسيا", cat: "جغرافيا سياسية", grid: "ر و س ي ا ص ي ن ك ن د ا" }
];

let currentLevel = 0;
let coins = 1103;
let currentInput = "";

function initGame() {
    const level = gameData[currentLevel];
    document.getElementById('level-number').innerText = `مرحلة ${level.id}`;
    document.getElementById('category-badge').innerText = level.cat;
    document.getElementById('question-text').innerText = level.q;
    document.getElementById('coin-count').innerText = coins;
    
    // إنشاء الخانات
    const slots = document.getElementById('answer-slots');
    slots.innerHTML = "";
    for(let i=0; i < level.a.length; i++) {
        slots.innerHTML += `<div class="slot" id="s-${i}"></div>`;
    }

    // إنشاء الشبكة
    const grid = document.getElementById('letters-grid');
    grid.innerHTML = "";
    level.grid.split(" ").forEach(char => {
        const btn = document.createElement('button');
        btn.className = "letter-btn";
        btn.innerText = char;
        btn.onclick = () => handleLetterClick(char, btn);
        grid.appendChild(btn);
    });
    currentInput = "";
}

function handleLetterClick(char, btn) {
    const level = gameData[currentLevel];
    if (currentInput.length < level.a.length) {
        document.getElementById(`s-${currentInput.length}`).innerText = char;
        currentInput += char;
        btn.style.visibility = "hidden"; // إخفاء الحرف المستخدم

        if (currentInput === level.a) {
            setTimeout(showWin, 300);
        } else if (currentInput.length === level.a.length) {
            setTimeout(() => {
                alert("إجابة خاطئة!");
                clearCurrentAnswer();
            }, 200);
        }
    }
}

function clearCurrentAnswer() {
    currentInput = "";
    initGame(); // إعادة تحميل المرحلة لتظهر الحروف المخفية
}

function showWin() {
    coins += 20;
    document.getElementById('win-overlay').style.display = "flex";
}

function nextLevel() {
    currentLevel++;
    if (currentLevel < gameData.length) {
        document.getElementById('win-overlay').style.display = "none";
        initGame();
    } else {
        alert("مبروك! ختمت اللعبة بالكامل.");
        location.reload();
    }
}

function useHint() {
    if (coins >= 20) {
        const level = gameData[currentLevel];
        alert(`تلميح: يبدأ بـ (${level.a[0]})`);
        coins -= 20;
        document.getElementById('coin-count').innerText = coins;
    }
}

window.onload = initGame;
