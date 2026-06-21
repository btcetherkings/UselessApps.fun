[
  {
    "name": "Runaway Button",
    "author": "You",
    "description": "A button that literally runs away from your cursor.",
    "file": "apps/runaway-button.html",
    "uselessness": 98,
    "vibe": "panic",
    "fakeCategory": "Button Avoidance Technology"
  },
  {
    "name": "Staring Pet Rock",
    "author": "Nature",
    "description": "A pet that does nothing but stare at you.",
    "file": "apps/pet-rock.html",
    "uselessness": 93,
    "vibe": "awkward",
    "fakeCategory": "Emotional Support Mineral"
  },
  {
    "name": "Useless To-Do List",
    "author": "You",
    "description": "A to-do list that deletes your tasks before you can do them.",
    "file": "apps/useless-todo.html",
    "uselessness": 99,
    "vibe": "productivity-destruction",
    "fakeCategory": "Anti-Productivity Software"
  },
  {
    "name": "Unhelpful Calculator",
    "author": "You",
    "description": "A calculator that refuses to give a straightforward result.",
    "file": "apps/unhelpful-calculator.html",
    "uselessness": 95,
    "vibe": "confusion",
    "fakeCategory": "Mathematical Sabotage"
  },
  {
    "name": "Endless Loading Spinner",
    "author": "You",
    "description": "A loading bar that never finishes.",
    "file": "apps/endless-spinner.html",
    "uselessness": 97,
    "vibe": "existential",
    "fakeCategory": "Infinite Waiting Technology"
  }
]


const container = document.getElementById('apps-container');
apps.forEach(app => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `<h3>${app.name}</h3><p class="author">by ${app.author}</p><p>${app.description}</p><div class="useless-meter">Uselessness: ${app.uselessness}%</div><small>(Click to run – it's useless, we promise)</small>`;
    card.addEventListener('click', () => runApp(app.file));
    container.appendChild(card);
});
function shuffleAndDisplayLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const shuffled = [...apps].sort(() => Math.random() - 0.5);
    shuffled.forEach(app => {
        const votes = Math.floor(Math.random() * 1000) + 1;
        const li = document.createElement('li');
        li.innerHTML = `${app.name} – <strong>${votes}</strong> useless votes`;
        list.appendChild(li);
    });
}
shuffleAndDisplayLeaderboard();
const modal = document.getElementById('app-modal');
const iframe = document.getElementById('app-iframe');
const closeModal = document.querySelector('.close');
function runApp(filePath) { iframe.src = filePath; modal.style.display = 'block'; }
closeModal.onclick = () => { modal.style.display = 'none'; iframe.src = ''; };
window.onclick = (e) => { if (e.target == modal) { modal.style.display = 'none'; iframe.src = ''; } };
document.getElementById('submit-btn').addEventListener('click', () => {
    alert("🎉 Congratulations! You've submitted your app! (Just kidding, nothing happened. To actually submit, open a PR on GitHub.)");
    launchConfetti();
});
const title = document.getElementById('main-title');
title.addEventListener('mouseover', () => {
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 100;
    title.style.transform = `translate(${x}px, ${y}px)`;
});
title.addEventListener('mouseout', () => { title.style.transform = 'translate(0,0)'; });
function launchConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}
const styleSheet = document.createElement('style');
styleSheet.textContent = `.confetti-piece { position: fixed; top: -10px; width: 10px; height: 10px; opacity: 0.8; animation: fall 3s linear forwards; z-index: 9999; } @keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`;
document.head.appendChild(styleSheet);
setInterval(launchConfetti, 30000);
