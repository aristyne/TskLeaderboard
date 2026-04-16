// Simple in-browser scoreboard with localStorage persistence

const HOUSES = [
  { key: 'Anselm', color: '#6A0DAD' },
  { key: 'Bancroft', color: '#2E8B57' },
  { key: 'Cranmer', color: '#FF69B4' },
  { key: 'Grindal', color: '#FF8C00' },
];

let scores = {
  Anselm: 0,
  Bancroft: 0,
  Cranmer: 0,
  Grindal: 0,
};

function loadScores() {
  const saved = localStorage.getItem('ih_scores');
  if (saved) {
    try {
      const obj = JSON.parse(saved);
      for (const k of Object.keys(obj)) {
        if (k in scores) scores[k] = obj[k];
      }
    } catch (e) { /* ignore */ }
  }
}

function saveScores() {
  localStorage.setItem('ih_scores', JSON.stringify(scores));
}

function renderScores() {
  HOUSES.forEach(h => {
    const el = document.getElementById(`points-${h.key}`);
    if (el) el.textContent = scores[h.key];
  });
  renderPodium();
}

function renderPodium() {
  const podium = document.getElementById('podium');
  podium.innerHTML = '';
  const entries = HOUSES.map(h => ({ key: h.key, display: h.key, score: scores[h.key] }));
  const top = entries.sort((a, b) => b.score - a.score).slice(0, 3);
  top.forEach((e, idx) => {
    const medal = idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze';
    const div = document.createElement('div');
    div.className = `podium-spot ${medal}`;
    div.innerHTML = `
      <div class="podium-name">${e.display}</div>
      <div class="podium-points">${e.score} pts</div>
    `;
    podium.appendChild(div);
  });
}

function loadHeadline() {
  const el = document.getElementById('headline');
  const saved = localStorage.getItem('ih_headline');
  if (saved && el) {
    el.textContent = saved;
  }
}

function initHeadline() {
  const el = document.getElementById('headline');
  if (!el) return;
  el.addEventListener('blur', () => {
    localStorage.setItem('ih_headline', el.textContent.trim());
  });
}

function bindUI() {
  // Toggle entry panel
  const toggle = document.getElementById('toggleEntry');
  const panel = document.getElementById('data-entry');
  toggle.addEventListener('click', () => {
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    toggle.setAttribute('aria-expanded', String(!isHidden));
  });

  // Entry form
  const form = document.getElementById('entryForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // accumulate points
    HOUSES.forEach(h => {
      const input = document.getElementById(`add-${h.key}`);
      if (input) {
        const delta = parseInt(input.value || '0', 10) || 0;
        if (delta > 0) scores[h.key] += delta;
      }
    });
    saveScores();
    renderScores();
    // clear inputs to 0
    HOUSES.forEach(h => {
      const input = document.getElementById(`add-${h.key}`);
      if (input) input.value = '0';
    });
  });

  // Clear inputs button
  const clearBtn = document.getElementById('clearInputs');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      HOUSES.forEach(h => {
        const input = document.getElementById(`add-${h.key}`);
        if (input) input.value = '0';
      });
    });
  }

  // Reset all with confirmation
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    const ok = confirm('Reset all points to zero? This action cannot be undone.');
    if (ok) {
      HOUSES.forEach(h => scores[h.key] = 0);
      saveScores();
      renderScores();
    }
  });
}

function init() {
  loadScores();
  loadHeadline();
  renderScores();
  initHeadline();
  bindUI();
}

document.addEventListener('DOMContentLoaded', init);
