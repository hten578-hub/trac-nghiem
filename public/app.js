// ===== STATE =====
let questions = [];
let answers = [];
let current = 0;
let studentName = '';
const LABELS = ['A', 'B', 'C', 'D'];

// Timer
let timerInterval = null;
let timeLeft = 0; // giây
const TIME_LIMIT = 60 * 60; // 60 phút — đổi ở đây nếu cần

// ===== LOCALSTORAGE — lưu/khôi phục trạng thái =====
const SAVE_KEY = 'quiz_progress';

function saveProgress() {
  const state = {
    studentName,
    answers,
    current,
    timeLeft,
    savedAt: Date.now()
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Bỏ qua nếu đã quá 24 giờ
    if (Date.now() - state.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return state;
  } catch { return null; }
}

function clearProgress() {
  localStorage.removeItem(SAVE_KEY);
}

// ===== LOAD =====
async function loadQuestions() {
  try {
    const res = await fetch('/api/questions');
    questions = await res.json();
    answers = new Array(questions.length).fill(-1);
  } catch {
    alert('Không thể kết nối server!');
  }
}

// ===== START =====
async function startQuiz() {
  const inp = document.getElementById('student-name');
  const name = inp.value.trim();
  if (!name) {
    inp.classList.add('error');
    inp.focus();
    inp.placeholder = 'Vui lòng nhập họ tên!';
    return;
  }
  inp.classList.remove('error');
  studentName = name;

  if (!questions.length) await loadQuestions();
  current = 0;
  answers = new Array(questions.length).fill(-1);

  document.getElementById('header-student-name').textContent = name;
  document.getElementById('avatar-letter').textContent = name.trim().split(' ').pop()[0].toUpperCase();

  buildNumGrid();
  renderQuestion();
  startTimer();
  showPage('page-quiz');
}

// ===== TIMER =====
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = TIME_LIMIT;
  renderTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft % 10 === 0) saveProgress(); // lưu mỗi 10 giây
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('⏰ Hết giờ! Bài làm của bạn sẽ được nộp tự động.');
      submitQuiz();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function renderTimer() {
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const pad = n => String(n).padStart(2, '0');
  const txt = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  const el = document.getElementById('timer-display');
  if (el) {
    el.textContent = txt;
    // Đỏ khi còn dưới 5 phút
    el.classList.toggle('timer-warning', timeLeft <= 300);
  }
}

// ===== RENDER QUESTION =====
function renderQuestion() {
  const q = questions[current];
  const total = questions.length;

  document.getElementById('q-badge').textContent = `Câu ${current + 1}`;
  document.getElementById('nav-center').textContent = `Câu ${current + 1} / ${total}`;
  document.getElementById('btn-prev').disabled = current === 0;
  document.getElementById('btn-next').disabled = current === total - 1;

  // Dùng innerHTML để MathJax render được công thức
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

  // Reset feedback + nút kiểm tra
  resetCheckState();

  if (window.MathJax?.typesetPromise) {
    // typesetClear để tránh MathJax cache câu cũ
    MathJax.typesetClear([document.getElementById('q-text'), container]);
    MathJax.typesetPromise([
      document.getElementById('q-text'),
      container
    ]).catch(() => {});
  }
}

function selectOption(index) {
  answers[current] = index;
  document.querySelectorAll('.qz-option').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
  });
  updateNumGrid();
  updateProgress();
  renderDots();
  saveProgress(); // lưu ngay khi chọn
}

// ===== CHECK ANSWER =====
async function checkAnswer() {
  const q = questions[current];
  const selected = answers[current];

  if (selected === -1) {
    // Chưa chọn đáp án
    const fb = document.getElementById('check-feedback');
    fb.innerHTML = `<div class="feedback-wrong">
      <div class="feedback-header"><span class="feedback-icon">⚠️</span> Bạn chưa chọn đáp án!</div>
    </div>`;
    return;
  }

  // Gọi API kiểm tra
  const btn = document.getElementById('btn-check');
  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra...';

  try {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, selected })
    });
    const data = await res.json();

    // Lock các đáp án — khi sai chỉ highlight ô đã chọn đỏ, không tô xanh đáp án đúng
    document.querySelectorAll('.qz-option').forEach((opt, i) => {
      opt.classList.add('locked');
      if (data.isCorrect && i === data.correct) opt.classList.add('correct-ans');
      if (!data.isCorrect && i === selected) opt.classList.add('wrong-ans');
    });

    // Hiện feedback
    const fb = document.getElementById('check-feedback');
    if (data.isCorrect) {
      fb.innerHTML = `<div class="feedback-correct">
        <div class="feedback-header">
          <span class="feedback-icon">✅</span> Chính xác!
        </div>
        ${data.explain ? `<div class="feedback-explain">💡 ${data.explain}</div>` : ''}
      </div>`;
      if (window.sfxSuccess) sfxSuccess();
      if (window.burstEmojis) burstEmojis(['⭐','✨','🎉'], 5);
    } else {
      fb.innerHTML = `<div class="feedback-wrong">
        <div class="feedback-header">
          <span class="feedback-icon">❌</span> Chưa đúng rồi!
        </div>
      </div>`;
      if (window.playTone) playTone(300, 'sine', 0.3, 0.15);
    }

    // Đổi nút thành "Câu tiếp theo"
    btn.disabled = false;
    btn.textContent = current < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả';
    btn.onclick = () => {
      if (current < questions.length - 1) {
        nextQ();
      } else {
        confirmSubmit();
      }
    };

    // MathJax render feedback
    if (window.MathJax?.typesetPromise) {
      MathJax.typesetPromise([fb]).catch(() => {});
    }

  } catch(e) {
    btn.disabled = false;
    btn.textContent = 'Kiểm tra';
    alert('Lỗi kết nối: ' + e.message);
  }
}
function nextQ() {
  if (current < questions.length - 1) {
    current++;
    if (window.animateQuestionChange) animateQuestionChange('next');
    saveProgress();
    renderQuestion();
  }
}
function prevQ() {
  if (current > 0) {
    current--;
    if (window.animateQuestionChange) animateQuestionChange('prev');
    saveProgress();
    renderQuestion();
  }
}

function resetCheckState() {
  const fb = document.getElementById('check-feedback');
  if (fb) fb.innerHTML = '';
  const btn = document.getElementById('btn-check');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Kiểm tra';
    btn.onclick = checkAnswer;
  }
}
function skipQ() {
  // Bỏ qua = giữ -1, chuyển câu tiếp (hoặc vòng lại câu đầu chưa làm)
  const next = findNextUnanswered();
  if (next !== -1) { current = next; renderQuestion(); }
  else { nextQ(); }
}
function findNextUnanswered() {
  for (let i = current + 1; i < questions.length; i++) {
    if (answers[i] === -1) return i;
  }
  for (let i = 0; i < current; i++) {
    if (answers[i] === -1) return i;
  }
  return -1;
}

// ===== PHÍM TẮT =====
document.addEventListener('keydown', e => {
  // Chỉ active khi đang ở trang làm bài
  if (!document.getElementById('page-quiz').classList.contains('active')) return;
  // Không kích hoạt khi đang focus input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case '1': selectOption(0); break;
    case '2': selectOption(1); break;
    case '3': selectOption(2); break;
    case '4': selectOption(3); break;
    case 'ArrowRight':
    case 'Enter':
      e.preventDefault();
      nextQ();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prevQ();
      break;
    case 'Escape':
      // Bỏ qua câu hiện tại (reset về -1 rồi sang câu tiếp)
      answers[current] = -1;
      updateNumGrid(); updateProgress(); renderDots();
      nextQ();
      break;
  }
});

// ===== NUM GRID (chỉ còn mobile panel) =====
function buildNumGrid() {
  const mpGrid = document.getElementById('mp-grid');
  if (mpGrid) {
    mpGrid.innerHTML = '';
    questions.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'qz-num-btn';
      btn.textContent = i + 1;
      btn.addEventListener('click', () => {
        current = i; renderQuestion(); closeMobilePanel();
      });
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

// ===== DOTS TIẾN ĐỘ (bottom bar) =====
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

  // Sidebar (đã bị ẩn nhưng giữ null-safe)
  const sc = document.getElementById('answered-count');
  const pb = document.getElementById('qz-progress-bar');
  if (sc) sc.textContent = done;
  if (pb) pb.style.width = pct;

  // Mobile bar
  const mb = document.getElementById('mb-answered');
  const mbar = document.getElementById('mb-bar');
  if (mb) mb.textContent = done;
  if (mbar) mbar.style.width = pct;

  // Bottom bar text
  const bt = document.getElementById('bottom-answered-text');
  if (bt) bt.textContent = `Câu ${current + 1}/${total}`;
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
  let msg = unanswered === 0
    ? `Bạn đã trả lời đủ <strong>${questions.length} câu</strong>. Xác nhận nộp bài?`
    : `<span class="modal-warn">⚠️ Còn ${unanswered} câu chưa trả lời!</span><br><br>Các câu chưa trả lời sẽ bị tính sai. Bạn có chắc muốn nộp không?`;
  document.getElementById('modal-msg').innerHTML = msg;
  document.getElementById('modal').classList.add('open');
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

async function submitQuiz() {
  closeModal();
  stopTimer();
  clearProgress(); // xóa progress sau khi nộp
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, answers })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    renderResult(data);
    showPage('page-result');
  } catch (e) {
    alert('Lỗi khi nộp bài: ' + e.message);
  }
}

// ===== RESULT =====
function renderResult(data) {
  const { score, total, student_name, detailed } = data;
  const pct = Math.round(score / total * 100);
  const wrong = detailed.filter(d => !d.isCorrect && d.selected !== -1).length;
  const skip = detailed.filter(d => d.selected === -1).length;

  // Quy về thang 10
  const score10 = Math.round((score / total) * 10 * 10) / 10;

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
    if (item.isCorrect) {
      answersHTML = `<div class="rc-ans-row ra-selected-correct"><span class="ra-icon">✓</span><span class="ra-label">${LABELS[item.selected]}.</span><span>${q.options[item.selected]}</span></div>`;
    } else if (item.selected === -1) {
      answersHTML = `<div class="rc-ans-row ra-correct"><span class="ra-icon">→</span><span class="ra-label">${LABELS[item.correct]}.</span><span>Đáp án đúng: ${q.options[item.correct]}</span></div>`;
    } else {
      answersHTML = `
        <div class="rc-ans-row ra-selected-wrong"><span class="ra-icon">✗</span><span class="ra-label">${LABELS[item.selected]}.</span><span>${q.options[item.selected]}</span></div>
        <div class="rc-ans-row ra-correct"><span class="ra-icon">✓</span><span class="ra-label">${LABELS[item.correct]}.</span><span>Đáp án đúng: ${q.options[item.correct]}</span></div>`;
    }

    // Giải thích (chỉ hiện khi đúng)
    const explainHTML = item.isCorrect && item.explain
      ? `<div class="explain-box show" style="margin-top:10px;"><span class="explain-icon">💡</span><span>${item.explain}</span></div>`
      : '';

    const card = document.createElement('div');
    card.className = `review-card ${cardClass}`;
    card.innerHTML = `
      <div class="rc-header"><span class="rc-num">Câu ${i + 1}</span><span class="rc-badge">${badgeText}</span></div>
      <div class="rc-question">${item.question}</div>
      <div class="rc-answers">${answersHTML}</div>
      ${explainHTML}`;
    list.appendChild(card);
  });

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([document.getElementById('review-list'), document.querySelector('.score-summary')]).catch(() => {});
  }

  // Trigger hiệu ứng kết quả
  if (window.triggerResultEffects) triggerResultEffects(pct);
}

// ===== RETAKE =====
function confirmRetake() {
  document.getElementById('modal-retake').classList.add('open');
}
function closeRetakeModal() {
  document.getElementById('modal-retake').classList.remove('open');
}
function retake() {
  closeRetakeModal();
  stopTimer();
  clearProgress(); // xóa progress khi làm lại
  current = 0; answers = [];
  document.getElementById('student-name').value = '';
  showPage('page-start');
}

// ===== PAGE SWITCH =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadQuestions();

  const totalEl = document.getElementById('start-total');
  if (totalEl) totalEl.textContent = questions.length;

  document.getElementById('student-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') startQuiz();
  });

  // Kiểm tra có progress cũ không
  const saved = loadProgress();
  if (saved && saved.studentName && saved.answers?.length === questions.length) {
    const inp = document.getElementById('student-name');
    inp.value = saved.studentName;
    showResumeBar(saved);
  }
});

function showResumeBar(saved) {
  // Tạo banner thông báo ở trang start
  const done = saved.answers.filter(a => a !== -1).length;
  const total = saved.answers.length;
  const m = Math.floor(saved.timeLeft / 60);
  const s = String(saved.timeLeft % 60).padStart(2, '0');

  const banner = document.createElement('div');
  banner.id = 'resume-banner';
  banner.style.cssText = `
    background:#e6f4ff;border:1.5px solid #91caff;border-radius:8px;
    padding:14px 16px;margin-top:16px;text-align:left;font-size:0.88rem;
    color:#003a8c;line-height:1.6;
  `;
  banner.innerHTML = `
    <div style="font-weight:700;margin-bottom:6px;">🔄 Bạn có bài làm dở dang</div>
    <div>Học sinh: <strong>${saved.studentName}</strong> · Đã làm: <strong>${done}/${total} câu</strong> · Còn lại: <strong>${m}:${s}</strong></div>
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button onclick="resumeQuiz()" style="background:#1890ff;color:#fff;border:none;border-radius:6px;padding:7px 16px;font-weight:700;cursor:pointer;font-size:0.85rem;">▶ Tiếp tục làm</button>
      <button onclick="discardResume()" style="background:#fff;color:#595959;border:1px solid #d9d9d9;border-radius:6px;padding:7px 16px;font-weight:600;cursor:pointer;font-size:0.85rem;">✕ Làm bài mới</button>
    </div>
  `;
  document.querySelector('.start-card').appendChild(banner);
}

async function resumeQuiz() {
  const saved = loadProgress();
  if (!saved) return;

  if (!questions.length) await loadQuestions();

  studentName = saved.studentName;
  answers = saved.answers;
  current = saved.current;

  document.getElementById('header-student-name').textContent = studentName;
  document.getElementById('avatar-letter').textContent = studentName.trim().split(' ').pop()[0].toUpperCase();

  buildNumGrid();
  renderQuestion();

  // Khôi phục timer
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = saved.timeLeft > 0 ? saved.timeLeft : TIME_LIMIT;
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

  showPage('page-quiz');
}

function discardResume() {
  clearProgress();
  const banner = document.getElementById('resume-banner');
  if (banner) banner.remove();
}
