'use strict';

// ── Vietnamese number data ────────────────────────────────────────────────────
// note: pronunciation quirks are stored as hints
const NUMBERS = [
  { n: 0,    vi: 'không',          note: 'also means "zero" / "no"' },
  { n: 1,    vi: 'một',            note: '' },
  { n: 2,    vi: 'hai',            note: '' },
  { n: 3,    vi: 'ba',             note: '' },
  { n: 4,    vi: 'bốn',            note: '' },
  { n: 5,    vi: 'năm',            note: 'also means "year"' },
  { n: 6,    vi: 'sáu',            note: '' },
  { n: 7,    vi: 'bảy',            note: '' },
  { n: 8,    vi: 'tám',            note: '' },
  { n: 9,    vi: 'chín',           note: 'also means "ripe"' },
  { n: 10,   vi: 'mười',           note: '' },
  { n: 11,   vi: 'mười một',       note: '' },
  { n: 12,   vi: 'mười hai',       note: '' },
  { n: 13,   vi: 'mười ba',        note: '' },
  { n: 14,   vi: 'mười bốn',       note: '' },
  { n: 15,   vi: 'mười lăm',       note: '5 → "lăm" after mười' },
  { n: 16,   vi: 'mười sáu',       note: '' },
  { n: 17,   vi: 'mười bảy',       note: '' },
  { n: 18,   vi: 'mười tám',       note: '' },
  { n: 19,   vi: 'mười chín',      note: '' },
  { n: 20,   vi: 'hai mươi',       note: 'tens use "mươi" (no tone)' },
  { n: 21,   vi: 'hai mươi mốt',   note: '1 → "mốt" after mươi' },
  { n: 25,   vi: 'hai mươi lăm',   note: '5 → "lăm" after mươi' },
  { n: 30,   vi: 'ba mươi',        note: '' },
  { n: 40,   vi: 'bốn mươi',       note: '' },
  { n: 50,   vi: 'năm mươi',       note: '' },
  { n: 60,   vi: 'sáu mươi',       note: '' },
  { n: 70,   vi: 'bảy mươi',       note: '' },
  { n: 80,   vi: 'tám mươi',       note: '' },
  { n: 90,   vi: 'chín mươi',      note: '' },
  { n: 100,  vi: 'một trăm',       note: '"trăm" = hundred' },
  { n: 200,  vi: 'hai trăm',       note: '' },
  { n: 500,  vi: 'năm trăm',       note: '' },
  { n: 1000, vi: 'một nghìn',      note: '"nghìn" = thousand (Northern); "ngàn" in South' },
];

// ── Set definitions ───────────────────────────────────────────────────────────
const SETS = {
  '0-10':  d => d.n <= 10,
  '0-20':  d => d.n <= 20,
  '0-100': d => d.n <= 100,
  'all':   ()  => true,
};

// ── State ─────────────────────────────────────────────────────────────────────
let queue      = [];
let current    = null;
let correct    = 0;
let wrong      = 0;
let direction  = 'en-vi';  // 'en-vi' | 'vi-en'
let answered   = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
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
const dirEnVi       = document.getElementById('dir-en-vi');
const dirViEn       = document.getElementById('dir-vi-en');

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function activeSet() {
  return NUMBERS.filter(SETS[setSelect.value]);
}

// Pick 3 wrong options from the full pool (different from correct answer)
function wrongOptions(correctItem, pool) {
  const others = pool.filter(d => d.n !== correctItem.n);
  return shuffle(others).slice(0, 3);
}

function updateScore() {
  scoreCorrect.textContent = `✓ ${correct}`;
  scoreWrong.textContent   = `✗ ${wrong}`;
}

function updateProgress() {
  const total   = correct + wrong + queue.length + (current ? 1 : 0);
  const done    = correct + wrong;
  const pct     = total ? (done / total) * 100 : 0;
  progressBar.style.width   = pct + '%';
  progressLabel.textContent = `${done} / ${total}`;
}

// ── Quiz flow ─────────────────────────────────────────────────────────────────
function startSession() {
  const pool = activeSet();
  queue      = shuffle([...pool]);
  correct    = 0;
  wrong      = 0;
  answered   = false;
  updateScore();
  resultOverlay.classList.add('hidden');
  cardInner.classList.remove('flipped');
  cardBack.className = 'card-back';
  nextCard();
}

function nextCard() {
  if (!queue.length) {
    showResult();
    return;
  }

  answered = false;
  current  = queue.shift();

  // Reset card to front
  cardInner.classList.remove('flipped');
  cardBack.className = 'card-back';

  const pool = activeSet();

  if (direction === 'en-vi') {
    promptLabel.textContent = 'How do you say…';
    promptEl.textContent    = current.n;
    answerReveal.textContent  = current.vi;
  } else {
    promptLabel.textContent = 'What number is…';
    promptEl.textContent    = current.vi;
    answerReveal.textContent  = current.n;
  }
  noteReveal.textContent = current.note || '';

  updateProgress();
  buildChoices(pool);
}

function buildChoices(pool) {
  choicesEl.innerHTML = '';
  const distractors = wrongOptions(current, pool);
  const options     = shuffle([current, ...distractors]);

  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className   = 'choice-btn';
    btn.textContent = direction === 'en-vi' ? item.vi : item.n;
    btn.dataset.num = item.n;
    btn.addEventListener('click', () => handleChoice(btn));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(btn) {
  if (answered) return;
  answered = true;

  const chosen  = Number(btn.dataset.num);
  const isRight = chosen === current.n;

  // Flip card to reveal answer
  cardInner.classList.add('flipped');
  cardBack.classList.add(isRight ? 'correct' : 'wrong');

  // Highlight buttons
  choicesEl.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (Number(b.dataset.num) === current.n) b.classList.add('correct');
  });

  if (isRight) {
    correct++;
  } else {
    btn.classList.add('wrong');
    wrong++;
    // Re-add the card to queue so they see it again
    queue.push(current);
    // Shake the card
    cardInner.classList.add('shake');
    cardInner.addEventListener('animationend', () => cardInner.classList.remove('shake'), { once: true });
  }

  updateScore();
  updateProgress();

  setTimeout(nextCard, 1400);
}

function showResult() {
  const total = correct + wrong;
  const pct   = total ? Math.round((correct / total) * 100) : 0;
  let emoji   = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
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

setSelect.addEventListener('change', startSession);
restartBtn.addEventListener('click', startSession);
resultRestart.addEventListener('click', startSession);

// ── Boot ──────────────────────────────────────────────────────────────────────
startSession();
