// ===== STATE =====
let questions = [];
let answers = [];
let current = 0;
let studentName = '';
let subjectId = '';
let subjectMeta = {};
const LABELS = ['A', 'B', 'C', 'D'];

let timerInterval = null;
let timeLeft = 0;

const SAVE_KEY = () => `quiz_progress_${subjectId}`;

// ===== LOCALSTORAGE =====
function saveProgress() {
  localStorage.setItem(SAVE_KEY(), JSON.stringify({
    studentName, answers, current, timeLeft, savedAt: Date.now()
  }));
}
function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY());
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.savedAt > 24 * 60 * 60 * 1000) { localStorage.removeItem(SAVE_KEY()); return null; }
    return s;
  } catch { return null; }
}
function clearProgress() { localStorage.removeItem(SAVE_KEY()); }

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  // Đọc subject từ URL
  const params = new URLSearchParams(window.location.search);
  subjectId = params.get('subject');
  if (!subjectId) { window.location.href = 'index.html'; return; }

  // Đọc tên từ sessionStorage (set bởi index.html)
  studentName = sessionStorage.getItem('student_name') || '';
  if (!studentName) { window.location.href = 'index.html'; return; }

  // Load câu hỏi
  try {
    const res = await fetch(`/api/subjects/${subjectId}/questions`);
    if (!res.ok) throw new Error('Không tìm thấy đề');
    const data = await res.json();
    subjectMeta = data.meta;
    questions = data.questions;
    answers = new Array(questions.length).fill(-1);
  } catch (e) {
    alert('Lỗi: ' + e.message);
    window.location.href = 'index.html';
    return;
  }

  // Cập nhật header
  document.title = subjectMeta.title + ' — Trắc nghiệm';
  document.getElementById('subject-icon').textContent = subjectMeta.icon || '📝';
  document.getElementById('subject-title').textContent = subjectMeta.title;
  document.getElementById('subject-subtitle').textContent = subjectMeta.subtitle || '';
  document.getElementById('header-student-name').textContent = studentName;
  document.getElementById('avatar-letter').textContent = studentName.trim().split(' ').pop()[0].toUpperCase();

  // Kiểm tra progress cũ
  const saved = loadProgress();
  if (saved && saved.studentName === studentName && saved.answers?.length === questions.length) {
    answers = saved.answers;
    current = saved.current || 0;
    timeLeft = saved.timeLeft > 0 ? saved.timeLeft : (subjectMeta.timeLimit || 60) * 60;
  } else {
    timeLeft = (subjectMeta.timeLimit || 60) * 60;
  }

  buildNumGrid();
  renderQuestion();
  startTimer();

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKey);
});

// ===== TIMER =====
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  renderTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft % 10 === 0) saveProgress();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('⏰ Hết giờ! Bài làm của bạn sẽ được nộp tự động.');
      submitQuiz();
    }
  }, 1000);
}
function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }
function renderTimer() {
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const pad = n => String(n).padStart(2, '0');
  const txt = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  const el = document.getElementById('timer-display');
  if (el) { el.textContent = txt; el.classList.toggle('timer-warning', timeLeft <= 300); }
}

// ===== RENDER =====
function renderQuestion() {
  const q = questions[current];
  const total = questions.length;

  document.getElementById('q-badge').textContent = `Câu ${current + 1}`;
  document.getElementById('nav-center').textContent = `Câu ${current + 1} / ${total}`;
  document.getElementById('btn-prev').disabled = current === 0;
  document.getElementById('btn-next').disabled = current === total - 1;
  document.getElementById('q-text').innerHTML = q.question;

  const container = document.getElementById('q-options');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'qz-option' + (answers[current] === i ? ' selected' : '');
    btn.innerHTML = `<span class="qz-opt-label">${LABELS[i]}</span><span class="qz-opt-text">${opt}</span>`;
    btn.addEventListener('click', () => selectOption(i));
    container.appendChild(btn);
  });

  updateNumGrid();
  updateProgress();
  renderDots();
  resetCheckState();

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetClear([document.getElementById('q-text'), container]);
    MathJax.typesetPromise([document.getElementById('q-text'), container]).catch(() => {});
  }
}

function selectOption(index) {
  answers[current] = index;
  document.querySelectorAll('.qz-option').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
  });
  updateNumGrid(); updateProgress(); renderDots();
  saveProgress();
}

// ===== NAVIGATION =====
function nextQ() {
  if (current < questions.length - 1) {
    current++;
    if (window.animateQuestionChange) animateQuestionChange('next');
    saveProgress(); renderQuestion();
  }
}
function prevQ() {
  if (current > 0) {
    current--;
    if (window.animateQuestionChange) animateQuestionChange('prev');
    saveProgress(); renderQuestion();
  }
}

// ===== KEYBOARD =====
function handleKey(e) {
  if (!document.getElementById('page-quiz').classList.contains('active')) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key) {
    case '1': selectOption(0); break;
    case '2': selectOption(1); break;
    case '3': selectOption(2); break;
    case '4': selectOption(3); break;
    case 'ArrowRight': case 'Enter': e.preventDefault(); nextQ(); break;
    case 'ArrowLeft': e.preventDefault(); prevQ(); break;
    case 'Escape':
      answers[current] = -1;
      updateNumGrid(); updateProgress(); renderDots(); saveProgress();
      nextQ(); break;
  }
}

// ===== NUM GRID =====
function buildNumGrid() {
  const mpGrid = document.getElementById('mp-grid');
  if (mpGrid) {
    mpGrid.innerHTML = '';
    questions.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'qz-num-btn';
      btn.textContent = i + 1;
      btn.addEventListener('click', () => { current = i; renderQuestion(); closeMobilePanel(); });
      mpGrid.appendChild(btn);
    });
  }
  const mbTotal = document.getElementById('mb-total');
  if (mbTotal) mbTotal.textContent = questions.length;
}

function updateNumGrid() {
  document.querySelectorAll('.qz-num-btn').forEach((btn, i) => {
    btn.classList.remove('answered', 'current');
    if (i === current) btn.classList.add('current');
    else if (answers[i] !== -1) btn.classList.add('answered');
  });
}

function renderDots() {
  const wrap = document.getElementById('progress-dots');
  if (!wrap) return;
  wrap.innerHTML = '';
  questions.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'prog-dot';
    if (i === current) d.classList.add('dot-current');
    else if (answers[i] !== -1) d.classList.add('dot-answered');
    d.addEventListener('click', () => { current = i; renderQuestion(); });
    wrap.appendChild(d);
  });
}

function updateProgress() {
  const done = answers.filter(a => a !== -1).length;
  const total = questions.length;
  const pct = `${(done / total) * 100}%`;
  const mb = document.getElementById('mb-answered');
  const mbar = document.getElementById('mb-bar');
  if (mb) mb.textContent = done;
  if (mbar) mbar.style.width = pct;
  const bt = document.getElementById('bottom-answered-text');
  if (bt) bt.textContent = `Câu ${current + 1}/${total}`;
}

// ===== CHECK =====
async function checkAnswer() {
  const q = questions[current];
  const selected = answers[current];
  const fb = document.getElementById('check-feedback');

  if (selected === -1) {
    fb.innerHTML = `<div class="feedback-wrong"><div class="feedback-header"><span class="feedback-icon">⚠️</span> Bạn chưa chọn đáp án!</div></div>`;
    return;
  }

  const btn = document.getElementById('btn-check');
  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra...';

  try {
    const res = await fetch(`/api/subjects/${subjectId}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, selected })
    });
    const data = await res.json();

    document.querySelectorAll('.qz-option').forEach((opt, i) => {
      opt.classList.add('locked');
      if (data.isCorrect && i === data.correct) opt.classList.add('correct-ans');
      if (!data.isCorrect && i === selected) opt.classList.add('wrong-ans');
    });

    if (data.isCorrect) {
      fb.innerHTML = `<div class="feedback-correct">
        <div class="feedback-header"><span class="feedback-icon">✅</span> Chính xác!</div>
        ${data.explain ? `<div class="feedback-explain">💡 ${data.explain}</div>` : ''}
      </div>`;
      if (window.sfxSuccess) sfxSuccess();
      if (window.burstEmojis) burstEmojis(['⭐','✨','🎉'], 5);
    } else {
      fb.innerHTML = `<div class="feedback-wrong">
        <div class="feedback-header"><span class="feedback-icon">❌</span> Chưa đúng rồi!</div>
      </div>`;
      if (window.playTone) playTone(300, 'sine', 0.3, 0.15);
    }

    btn.disabled = false;
    btn.textContent = current < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả';
    btn.onclick = () => {
      if (current < questions.length - 1) nextQ();
      else confirmSubmit();
    };

    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([fb]).catch(() => {});
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Kiểm tra';
    alert('Lỗi: ' + e.message);
  }
}

function resetCheckState() {
  const fb = document.getElementById('check-feedback');
  if (fb) fb.innerHTML = '';
  const btn = document.getElementById('btn-check');
  if (btn) { btn.disabled = false; btn.textContent = 'Kiểm tra'; btn.onclick = checkAnswer; }
}

// ===== MOBILE PANEL =====
function openMobilePanel() {
  document.getElementById('mobile-overlay').classList.add('open');
  document.getElementById('mobile-panel').classList.add('open');
}
function closeMobilePanel() {
  document.getElementById('mobile-overlay').classList.remove('open');
  document.getElementById('mobile-panel').classList.remove('open');
}

// ===== SUBMIT =====
function confirmSubmit() {
  const unanswered = answers.filter(a => a === -1).length;
  document.getElementById('modal-msg').innerHTML = unanswered === 0
    ? `Bạn đã trả lời đủ <strong>${questions.length} câu</strong>. Xác nhận nộp bài?`
    : `<span class="modal-warn">⚠️ Còn ${unanswered} câu chưa trả lời!</span><br><br>Các câu chưa trả lời sẽ bị tính sai.`;
  document.getElementById('modal').classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }

async function submitQuiz() {
  closeModal(); stopTimer(); clearProgress();
  try {
    const res = await fetch(`/api/subjects/${subjectId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, answers })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    renderResult(data);
    showPage('page-result');
  } catch (e) { alert('Lỗi khi nộp bài: ' + e.message); }
}

// ===== RESULT =====
function renderResult(data) {
  const { score, total, student_name, detailed } = data;
  const pct = Math.round(score / total * 100);
  const wrong = detailed.filter(d => !d.isCorrect && d.selected !== -1).length;
  const skip = detailed.filter(d => d.selected === -1).length;

  document.getElementById('sc-num').textContent = score;
  document.getElementById('sc-denom').textContent = `/${total}`;
  document.getElementById('sc-name').textContent = student_name;
  document.getElementById('sc-correct').textContent = `${score} đúng`;
  document.getElementById('sc-wrong').textContent = `${wrong} sai`;
  document.getElementById('sc-skip').textContent = `${skip} bỏ qua`;

  const rankEl = document.getElementById('sc-rank');
  let rankClass, rankText;
  if (pct >= 90) { rankClass = 'rank-excellent'; rankText = '🌟 Xuất sắc'; }
  else if (pct >= 75) { rankClass = 'rank-good'; rankText = '👍 Giỏi'; }
  else if (pct >= 50) { rankClass = 'rank-average'; rankText = '📘 Đạt yêu cầu'; }
  else { rankClass = 'rank-weak'; rankText = '💪 Cần cố gắng thêm'; }
  rankEl.className = `score-rank ${rankClass}`;
  rankEl.textContent = rankText + ` · ${pct}%`;

  const list = document.getElementById('review-list');
  list.innerHTML = '';
  detailed.forEach((item, i) => {
    const q = questions[i];
    let cardClass, badgeText;
    if (item.isCorrect) { cardClass = 'rc-correct'; badgeText = '✓ Đúng'; }
    else if (item.selected === -1) { cardClass = 'rc-skip'; badgeText = 'Bỏ qua'; }
    else { cardClass = 'rc-wrong'; badgeText = '✗ Sai'; }

    let answersHTML = '';
    if (item.isCorrect) {
      answersHTML = `<div class="rc-ans-row ra-selected-correct"><span class="ra-icon">✓</span><span class="ra-label">${LABELS[item.selected]}.</span><span>${q.options[item.selected]}</span></div>`;
    } else if (item.selected === -1) {
      answersHTML = `<div class="rc-ans-row ra-correct"><span class="ra-icon">→</span><span class="ra-label">${LABELS[item.correct]}.</span><span>Đáp án đúng: ${q.options[item.correct]}</span></div>`;
    } else {
      answersHTML = `
        <div class="rc-ans-row ra-selected-wrong"><span class="ra-icon">✗</span><span class="ra-label">${LABELS[item.selected]}.</span><span>${q.options[item.selected]}</span></div>
        <div class="rc-ans-row ra-correct"><span class="ra-icon">✓</span><span class="ra-label">${LABELS[item.correct]}.</span><span>Đáp án đúng: ${q.options[item.correct]}</span></div>`;
    }

    const explainHTML = item.isCorrect && item.explain
      ? `<div class="explain-box show" style="margin-top:10px;"><span class="explain-icon">💡</span><span>${item.explain}</span></div>` : '';

    const card = document.createElement('div');
    card.className = `review-card ${cardClass}`;
    card.innerHTML = `
      <div class="rc-header"><span class="rc-num">Câu ${i + 1}</span><span class="rc-badge">${badgeText}</span></div>
      <div class="rc-question">${item.question}</div>
      <div class="rc-answers">${answersHTML}</div>${explainHTML}`;
    list.appendChild(card);
  });

  if (window.MathJax?.typesetPromise)
    MathJax.typesetPromise([list, document.querySelector('.score-summary')]).catch(() => {});
  if (window.triggerResultEffects) triggerResultEffects(pct);
}

// ===== RETAKE =====
function confirmRetake() { document.getElementById('modal-retake').classList.add('open'); }
function closeRetakeModal() { document.getElementById('modal-retake').classList.remove('open'); }
function retake() {
  closeRetakeModal(); stopTimer(); clearProgress();
  current = 0; answers = new Array(questions.length).fill(-1);
  timeLeft = (subjectMeta.timeLimit || 60) * 60;
  buildNumGrid(); renderQuestion(); startTimer();
  showPage('page-quiz');
}

// ===== PAGE SWITCH =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}
