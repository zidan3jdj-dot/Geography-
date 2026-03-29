// Scroll smooth
function go(id){
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
}

// Scroll Animation
const fades = document.querySelectorAll('.fade');
window.addEventListener('scroll', ()=>{
  fades.forEach(el=>{
    if(el.getBoundingClientRect().top < window.innerHeight - 100){
      el.classList.add('show');
    }
  });
});

// QUIZ SYSTEM
let score = 0;
let current = 0;

fetch("questions.json")
.then(res => res.json())
.then(data => {
  window.qs = data;
  loadQ();
});

function loadQ(){
  let q = qs[current];
  document.getElementById("question").innerText = q.q;

  let div = document.getElementById("answers");
  div.innerHTML = "";

  q.options.forEach((op,i)=>{
    let btn = document.createElement("button");
    btn.innerText = op;
    btn.onclick = ()=>check(i);
    div.appendChild(btn);
  });
}

function check(i){
  let q = qs[current];

  if(i === q.answer){
    score++;
    document.getElementById("result").innerText = "✔️ صح";
  } else {
    document.getElementById("result").innerText = "❌ غلط";
  }

  current = (current + 1) % qs.length;
  setTimeout(loadQ,1000);
}

// LEAFLET MAP
var map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// عند الضغط
map.on('click', function(e){
  L.popup()
    .setLatLng(e.latlng)
    .setContent("📍 " + e.latlng.toString())
    .openOn(map);
});
