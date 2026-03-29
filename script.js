let currentLevel = 0;
let questions = [];
let userAnswer = "";

async function loadGame() {
    const response = await fetch('questions.json');
    questions = await response.json();
    displayLevel();
}

function displayLevel() {
    const q = questions[currentLevel];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('category-tag').innerText = q.category;
    
    const slotsContainer = document.querySelector('.answer-slots');
    slotsContainer.innerHTML = '';
    for(let i=0; i<q.answer.length; i++) {
        slotsContainer.innerHTML += `<div class="slot" id="slot-${i}"></div>`;
    }

    const grid = document.querySelector('.letters-grid');
    grid.innerHTML = '';
    const letters = q.letters.split(' ');
    letters.forEach(char => {
        grid.innerHTML += `<button class="letter-btn" onclick="addLetter('${char}')">${char}</button>`;
    });
}

function addLetter(char) {
    const q = questions[currentLevel];
    if (userAnswer.length < q.answer.length) {
        document.getElementById(`slot-${userAnswer.length}`).innerText = char;
        userAnswer += char;
        
        if (userAnswer === q.answer) {
            alert("إجابة صحيحة!");
            nextLevel();
        }
    }
}

function nextLevel() {
    userAnswer = "";
    currentLevel++;
    if (currentLevel < questions.length) {
        displayLevel();
    } else {
        alert("مبروك! ختمت النسخة التجريبية.");
    }
}

loadGame();
