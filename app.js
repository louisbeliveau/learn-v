'use strict';

// ── Module registry (data files must be loaded before this script) ────────────
const MODULES = [NUMBERS_MODULE, GREETINGS_MODULE];

// ── State ─────────────────────────────────────────────────────────────────────
let moduleIdx = 0;
let setIdx    = 0;
let queue     = [];
let current   = null;
let correct   = 0;
let wrong     = 0;
let direction = 'en-vi';   // 'en-vi' | 'vi-en'
let answered  = false;

const mod   = () => MODULES[moduleIdx];
const items = () => mod().sets[setIdx].items;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const moduleNav     = document.getElementById('module-nav');
const cardInner     = document.getElementById('card-inner');
const cardBack      = document.getElementById('card-back');
const promptEl      = document.getElementById('prompt');
const promptLabel   = document.getElementById('prompt-label');
const answerReveal  = document.getElementById('answer-reveal');
const noteReveal    = document.getElementById('note-reveal');
const choicesEl     = document.getElementById('choices');
const progressBar   = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
const scoreCorrect  = document.getElementById('score-correct');
const scoreWrong    = document.getElementById('score-wrong');
const restartBtn    = document.getElementById('restart-btn');
const resultOverlay = document.getElementById('result-overlay');
const resultSummary = document.getElementById('result-summary');
const resultRestart = document.getElementById('result-restart');
const setSelect     = document.getElementById('set');
const delaySelect   = document.getElementById('delay');
const dirEnVi       = document.getElementById('dir-en-vi');
const dirViEn       = document.getElementById('dir-vi-en');

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wrongOptions(correctItem, pool) {
  return shuffle(pool.filter(d => d.vi !== correctItem.vi)).slice(0, 3);
}

function setPrompt(text) {
  promptEl.textContent = text;
  promptEl.classList.toggle('long', text.length > 12);
}

// ── Module nav ────────────────────────────────────────────────────────────────
function buildModuleNav() {
  moduleNav.innerHTML = '';
  MODULES.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className   = 'module-btn' + (i === moduleIdx ? ' active' : '');
    btn.textContent = m.name;
    btn.addEventListener('click', () => switchModule(i));
    moduleNav.appendChild(btn);
  });
}

function switchModule(i) {
  moduleIdx = i;
  setIdx    = mod().defaultSet;
  buildModuleNav();
  buildSetSelect();
  startSession();
}

// ── Set selector ──────────────────────────────────────────────────────────────
function buildSetSelect() {
  setSelect.innerHTML = '';
  mod().sets.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value       = i;
    opt.textContent = s.label;
    opt.selected    = i === setIdx;
    setSelect.appendChild(opt);
  });
}

// ── Progress & score ──────────────────────────────────────────────────────────
function updateScore() {
  scoreCorrect.textContent = `✓ ${correct}`;
  scoreWrong.textContent   = `✗ ${wrong}`;
}

function updateProgress() {
  const total = correct + wrong + queue.length + (current ? 1 : 0);
  const done  = correct + wrong;
  progressBar.style.width   = total ? (done / total * 100) + '%' : '0%';
  progressLabel.textContent = `${done} / ${total}`;
}

// ── Quiz flow ─────────────────────────────────────────────────────────────────
function startSession() {
  queue    = shuffle(items());
  correct  = 0;
  wrong    = 0;
  answered = false;
  updateScore();
  resultOverlay.classList.add('hidden');
  cardInner.classList.remove('flipped');
  cardBack.className = 'card-back';
  nextCard();
}

function nextCard() {
  if (!queue.length) { showResult(); return; }

  answered = false;
  current  = queue.shift();

  cardInner.classList.remove('flipped');
  cardBack.className = 'card-back';

  if (direction === 'en-vi') {
    promptLabel.textContent   = 'How do you say…';
    setPrompt(current.en);
    answerReveal.textContent  = current.vi;
  } else {
    promptLabel.textContent   = 'What does this mean?';
    setPrompt(current.vi);
    answerReveal.textContent  = current.en;
  }
  noteReveal.textContent = current.note || '';

  updateProgress();
  buildChoices();
}

function buildChoices() {
  choicesEl.innerHTML = '';
  const pool       = items();
  const distractors = wrongOptions(current, pool);
  const options    = shuffle([current, ...distractors]);

  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className     = 'choice-btn';
    btn.textContent   = direction === 'en-vi' ? item.vi : item.en;
    btn.dataset.vi    = item.vi;
    btn.addEventListener('click', () => handleChoice(btn));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(btn) {
  if (answered) return;
  answered = true;

  const isRight = btn.dataset.vi === current.vi;

  cardInner.classList.add('flipped');
  cardBack.classList.add(isRight ? 'correct' : 'wrong');

  choicesEl.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.vi === current.vi) b.classList.add('correct');
  });

  if (isRight) {
    correct++;
  } else {
    btn.classList.add('wrong');
    wrong++;
    queue.push(current);   // re-queue so they see it again
    cardInner.classList.add('shake');
    cardInner.addEventListener('animationend', () => cardInner.classList.remove('shake'), { once: true });
  }

  updateScore();
  updateProgress();
  setTimeout(nextCard, +delaySelect.value);
}

function showResult() {
  const total = correct + wrong;
  const pct   = total ? Math.round(correct / total * 100) : 0;
  let emoji = '📚';
  if (pct === 100) emoji = '🏆';
  else if (pct >= 80) emoji = '🎉';
  else if (pct >= 60) emoji = '👍';
  resultSummary.textContent = `${emoji}  ${correct} correct out of ${total} attempts (${pct}%)`;
  resultOverlay.classList.remove('hidden');
}

// ── Event listeners ───────────────────────────────────────────────────────────
dirEnVi.addEventListener('click', () => {
  direction = 'en-vi';
  dirEnVi.classList.add('active');
  dirViEn.classList.remove('active');
  startSession();
});

dirViEn.addEventListener('click', () => {
  direction = 'vi-en';
  dirViEn.classList.add('active');
  dirEnVi.classList.remove('active');
  startSession();
});

setSelect.addEventListener('change', () => {
  setIdx = +setSelect.value;
  startSession();
});

restartBtn.addEventListener('click', startSession);
resultRestart.addEventListener('click', startSession);

// ── Boot ──────────────────────────────────────────────────────────────────────
buildModuleNav();
buildSetSelect();
startSession();
