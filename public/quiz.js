// ===== STATE =====
let questions = [];
let answers = [];
let checked = []; // track câu nào đã bấm Kiểm tra rồi (không cho chọn lại)
let checkResults = []; // lưu kết quả {isCorrect, correct, explain} của từng câu
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
    studentName, answers, checked, checkResults, current, timeLeft, savedAt: Date.now()
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

  // Đọc thông tin học sinh từ localStorage (đã đăng nhập)
  studentName = localStorage.getItem('student_fullname') || sessionStorage.getItem('student_name') || 'Học sinh';
  const token = localStorage.getItem('student_token');
  if (!token) { location.href = 'student-login.html'; return; }

  try {
    const authRes = await fetch('/api/student-auth-check', { headers: { 'x-student-token': token } });
    const auth = await authRes.json();
    if (!auth.ok) {
      localStorage.removeItem('student_token');
      localStorage.removeItem('student_username');
      localStorage.removeItem('student_fullname');
      location.href = 'student-login.html';
      return;
    }
    studentName = auth.fullname || studentName;
    localStorage.setItem('student_fullname', studentName);
  } catch {
    location.href = 'student-login.html';
    return;
  }

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

  // Kiểm tra số lần làm còn lại
  try {
    const ar = await fetch(`/api/student/attempts/${subjectId}`, { headers: { 'x-student-token': token } });
    if (ar.status === 401) { location.href = 'student-login.html'; return; }
    const att = await ar.json();
    if (att.remaining <= 0) {
      document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f5ff;font-family:sans-serif;">
        <div style="background:#fff;border-radius:16px;padding:40px;text-align:center;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.1);">
          <div style="font-size:52px;margin-bottom:16px;">🚫</div>
          <h2 style="margin-bottom:10px;">Đã hết lượt làm bài</h2>
          <p style="color:#8c8c8c;margin-bottom:24px;">Bạn đã sử dụng hết ${att.max} lần làm bài cho đề này.</p>
          <a href="index.html" style="display:inline-block;background:#1890ff;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;">← Về trang chủ</a>
        </div>
      </div>`;
      return;
    }
    // Hiện số lần còn lại
    if (att.remaining <= att.max) {
      const notice = document.createElement('div');
      notice.style.cssText = 'background:#fffbe6;border-bottom:1px solid #ffe58f;padding:7px 20px;font-size:.82rem;color:#614700;text-align:center;';
      notice.textContent = `⚠️ Bạn còn ${att.remaining}/${att.max} lần làm bài cho đề này.`;
      document.querySelector('.qz-header').after(notice);
    }
  } catch {}

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
    checked = saved.checked || new Array(questions.length).fill(false);
    checkResults = saved.checkResults || new Array(questions.length).fill(null);
    current = saved.current || 0;
    timeLeft = saved.timeLeft > 0 ? saved.timeLeft : (subjectMeta.timeLimit || 60) * 60;
  } else {
    answers = new Array(questions.length).fill(-1);
    checked = new Array(questions.length).fill(false);
    checkResults = new Array(questions.length).fill(null);
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
  const isChecked = checked[current]; // đã kiểm tra rồi?
  // console.log(`Câu ${current+1}: checked=${isChecked}, answer=${answers[current]}`); // debug

  document.getElementById('q-badge').textContent = `Câu ${current + 1}`;
  document.getElementById('nav-center').textContent = `Câu ${current + 1} / ${total}`;
  document.getElementById('btn-prev').disabled = current === 0;
  document.getElementById('btn-next').disabled = current === total - 1;
  document.getElementById('q-text').innerHTML = q.question;

  const container = document.getElementById('q-options');
  container.innerHTML = '';

  if (q.type === 'fill') {
    // Dạng điền đáp án
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:8px;';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.id = 'fill-input';
    inp.placeholder = 'Nhập đáp án vào đây...';
    inp.style.cssText = 'width:100%;max-width:300px;height:46px;padding:0 14px;border:1.5px solid #d9d9d9;border-radius:8px;font-size:1.1rem;outline:none;transition:border-color .2s;';
    inp.value = (answers[current] !== -1 && answers[current] !== undefined) ? String(answers[current]) : '';
    if (isChecked) {
      inp.disabled = true;
      inp.style.background = '#f5f5f5';
      inp.style.cursor = 'default';
    } else {
      inp.addEventListener('input', () => {
        answers[current] = inp.value;
        saveProgress();
      });
      inp.addEventListener('focus', () => inp.style.borderColor = '#1890ff');
      inp.addEventListener('blur', () => inp.style.borderColor = '#d9d9d9');
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
    }
    wrap.appendChild(inp);
    container.appendChild(wrap);
  } else {
    // Dạng trắc nghiệm
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'qz-option' + (answers[current] === i ? ' selected' : '');
      btn.innerHTML = `<span class="qz-opt-label">${LABELS[i]}</span><span class="qz-opt-text">${opt}</span>`;
      if (isChecked) {
        btn.classList.add('locked');
        btn.setAttribute('disabled', 'true');
        btn.setAttribute('onclick', 'return false');
        btn.style.cssText += ';pointer-events:none!important;cursor:default!important;';
      } else {
        btn.addEventListener('click', () => selectOption(i));
      }
      container.appendChild(btn);
    });
  }

  updateNumGrid();
  updateProgress();
  renderDots();

  // Nếu đã check: khôi phục feedback cũ và đổi nút
  if (isChecked) {
    restoreCheckedState();
  } else {
    resetCheckState();
  }

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetClear([document.getElementById('q-text'), container]);
    MathJax.typesetPromise([document.getElementById('q-text'), container]).catch(() => {});
  }
}

function selectOption(index) {
  if (checked[current]) return; // đã check rồi, không cho đổi
  if (answers[current] === index) return; // đã chọn rồi
  answers[current] = index;
  document.querySelectorAll('.qz-option').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
  });
  updateNumGrid(); updateProgress(); renderDots();
  saveProgress();
}

function restoreCheckedState() {
  const result = checkResults[current];
  const fb = document.getElementById('check-feedback');

  if (result && fb) {
    const q = questions[current];
    if (result.isCorrect) {
      fb.innerHTML = `<div class="feedback-correct">
        <div class="feedback-header"><span class="feedback-icon">✅</span> Chính xác!</div>
        ${result.explain ? `<div class="feedback-explain">💡 ${result.explain}</div>` : ''}
      </div>`;
      // Tô xanh đáp án đúng
      document.querySelectorAll('.qz-option').forEach((opt, i) => {
        if (i === result.correct) opt.classList.add('correct-ans');
      });
    } else {
      fb.innerHTML = `<div class="feedback-wrong">
        <div class="feedback-header"><span class="feedback-icon">❌</span> Chưa đúng rồi!</div>
      </div>`;
      // Tô đỏ đáp án đã chọn sai
      document.querySelectorAll('.qz-option').forEach((opt, i) => {
        if (i === result.selected) opt.classList.add('wrong-ans');
      });
    }
  }

  // Đổi nút thành Câu tiếp theo
  const btn = document.getElementById('btn-check');
  if (btn) {
    btn.disabled = false;
    btn.textContent = current < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả';
    btn.onclick = () => {
      if (current < questions.length - 1) nextQ();
      else confirmSubmit();
    };
  }
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
  const fb = document.getElementById('check-feedback');
  const btn = document.getElementById('btn-check');
  const token = localStorage.getItem('student_token') || '';

  // ---- Câu điền đáp án ----
  if (q.type === 'fill') {
    const inp = document.getElementById('fill-input');
    const fillVal = inp ? inp.value.trim() : '';
    if (!fillVal) {
      fb.innerHTML = `<div class="feedback-wrong"><div class="feedback-header"><span class="feedback-icon">⚠️</span> Bạn chưa nhập đáp án!</div></div>`;
      return;
    }
    answers[current] = fillVal;
    btn.disabled = true; btn.textContent = 'Đang kiểm tra...';
    try {
      const res = await fetch(`/api/subjects/${subjectId}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-student-token': token },
        body: JSON.stringify({ questionId: q.id, fillAnswer: fillVal })
      });
      const data = await res.json();
      if (inp) { inp.disabled = true; inp.style.background = '#f5f5f5'; inp.style.color = data.isCorrect ? '#52c41a' : '#ff4d4f'; }
      if (data.isCorrect) {
        fb.innerHTML = `<div class="feedback-correct"><div class="feedback-header"><span class="feedback-icon">✅</span> Chính xác!</div>${data.explain ? `<div class="feedback-explain">💡 ${data.explain}</div>` : ''}</div>`;
        if (window.sfxSuccess) sfxSuccess();
        if (window.burstEmojis) burstEmojis(['⭐','✨','🎉'], 5);
      } else {
        fb.innerHTML = `<div class="feedback-wrong"><div class="feedback-header"><span class="feedback-icon">❌</span> Chưa đúng! Đáp án đúng là: <strong>${data.correct}</strong></div></div>`;
        if (window.playTone) playTone(300, 'sine', 0.3, 0.15);
      }
      btn.disabled = false;
      btn.textContent = current < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả';
      btn.onclick = () => { if (current < questions.length - 1) nextQ(); else confirmSubmit(); };
      checked[current] = true;
      checkResults[current] = { isCorrect: data.isCorrect, correct: data.correct, explain: data.explain, selected: fillVal, type: 'fill' };
      saveProgress();
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([fb]).catch(() => {});
    } catch (e) { btn.disabled = false; btn.textContent = 'Kiểm tra'; alert('Lỗi: ' + e.message); }
    return;
  }

  // ---- Câu trắc nghiệm ----
  const selected = answers[current];
  if (selected === -1) {
    fb.innerHTML = `<div class="feedback-wrong"><div class="feedback-header"><span class="feedback-icon">⚠️</span> Bạn chưa chọn đáp án!</div></div>`;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra...';

  try {
    const res = await fetch(`/api/subjects/${subjectId}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-student-token': token },
      body: JSON.stringify({ questionId: q.id, selected })
    });
    const data = await res.json();

    document.querySelectorAll('.qz-option').forEach((opt, i) => {
      opt.classList.add('locked');
      opt.setAttribute('disabled', 'true');
      opt.style.cssText += ';pointer-events:none!important;';
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
    btn.onclick = () => { if (current < questions.length - 1) nextQ(); else confirmSubmit(); };

    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([fb]).catch(() => {});
    checked[current] = true;
    checkResults[current] = { isCorrect: data.isCorrect, correct: data.correct, explain: data.explain, selected };
    saveProgress();

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
    const token = localStorage.getItem('student_token') || '';
    const res = await fetch(`/api/subjects/${subjectId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-student-token': token },
      body: JSON.stringify({ answers })
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

  // Quy về thang 10
  const score10 = Math.round((score / total) * 10 * 10) / 10; // 1 chữ số thập phân

  document.getElementById('sc-num').textContent = score10;
  document.getElementById('sc-denom').textContent = `/10`;
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
    if (item.type === 'fill') {
      // Câu điền đáp án
      if (item.isCorrect) {
        answersHTML = `<div class="rc-ans-row ra-selected-correct"><span class="ra-icon">✓</span><span>Bạn điền: <strong>${item.selected}</strong></span></div>`;
      } else if (item.selected === -1 || item.selected === '') {
        answersHTML = `<div class="rc-ans-row ra-correct"><span class="ra-icon">→</span><span>Chưa điền. Đáp án đúng: <strong>${item.correct}</strong></span></div>`;
      } else {
        answersHTML = `
          <div class="rc-ans-row ra-selected-wrong"><span class="ra-icon">✗</span><span>Bạn điền: <strong>${item.selected}</strong></span></div>
          <div class="rc-ans-row ra-correct"><span class="ra-icon">✓</span><span>Đáp án đúng: <strong>${item.correct}</strong></span></div>`;
      }
    } else {
      // Câu trắc nghiệm
      if (item.isCorrect) {
        answersHTML = `<div class="rc-ans-row ra-selected-correct"><span class="ra-icon">✓</span><span class="ra-label">${LABELS[item.selected]}.</span><span>${q.options?.[item.selected] || ''}</span></div>`;
      } else if (item.selected === -1) {
        answersHTML = `<div class="rc-ans-row ra-correct"><span class="ra-icon">→</span><span class="ra-label">${LABELS[item.correct]}.</span><span>Đáp án đúng: ${q.options?.[item.correct] || ''}</span></div>`;
      } else {
        answersHTML = `
          <div class="rc-ans-row ra-selected-wrong"><span class="ra-icon">✗</span><span class="ra-label">${LABELS[item.selected]}.</span><span>${q.options?.[item.selected] || ''}</span></div>
          <div class="rc-ans-row ra-correct"><span class="ra-icon">✓</span><span class="ra-label">${LABELS[item.correct]}.</span><span>Đáp án đúng: ${q.options?.[item.correct] || ''}</span></div>`;
      }
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
async function retake() {
  closeRetakeModal();
  const token = localStorage.getItem('student_token') || '';
  try {
    const ar = await fetch(`/api/student/attempts/${subjectId}`, { headers: { 'x-student-token': token } });
    if (ar.status === 401) { location.href = 'student-login.html'; return; }
    const att = await ar.json();
    if (att.remaining <= 0) {
      alert(`Bạn đã dùng hết ${att.max} lần làm bài cho đề này.`);
      location.href = 'index.html';
      return;
    }
  } catch {}
  stopTimer(); clearProgress();
  current = 0;
  answers = new Array(questions.length).fill(-1);
  checked = new Array(questions.length).fill(false);
  checkResults = new Array(questions.length).fill(null);
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
