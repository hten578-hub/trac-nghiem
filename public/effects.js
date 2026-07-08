// ================================================================
//  effects.js — Hiệu ứng mặc định cho mọi bài kiểm tra
//  File này độc lập, có thể copy sang bài khác mà không cần sửa
// ================================================================

// ===== ÂM THANH =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type, duration, volume = 0.3) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

// Âm khi chọn đáp án
function sfxSelect() {
  playTone(600, 'sine', 0.12, 0.15);
}

// Âm khi nộp bài thành công
function sfxSuccess() {
  playTone(523, 'sine', 0.15, 0.2);
  setTimeout(() => playTone(659, 'sine', 0.15, 0.2), 150);
  setTimeout(() => playTone(784, 'sine', 0.3, 0.25), 300);
}

// Âm khi kết quả xuất sắc
function sfxExcellent() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.2, 0.2), i * 120);
  });
}

// ===== CONFETTI =====
const canvas = document.getElementById('confetti-canvas');
const ctx2d = canvas ? canvas.getContext('2d') : null;
let confettiPieces = [];
let confettiRunning = false;

const CONFETTI_COLORS = [
  '#1890ff', '#52c41a', '#fa8c16', '#ff4d4f',
  '#722ed1', '#13c2c2', '#fadb14', '#eb2f96'
];

function launchConfetti(count = 120) {
  if (!canvas || !ctx2d) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  confettiPieces = [];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speed: Math.random() * 4 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 1.5,
    });
  }

  confettiRunning = true;
  requestAnimationFrame(animateConfetti);

  setTimeout(() => { confettiRunning = false; }, 4000);
}

function animateConfetti() {
  if (!confettiRunning) {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach(p => {
    p.y += p.speed;
    p.x += p.drift;
    p.angle += p.spin;
    if (p.y > canvas.height) {
      p.y = -p.h;
      p.x = Math.random() * canvas.width;
    }
    ctx2d.save();
    ctx2d.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx2d.rotate(p.angle);
    ctx2d.fillStyle = p.color;
    ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx2d.restore();
  });
  requestAnimationFrame(animateConfetti);
}

// ===== FLOATING EMOJIS =====
const EMOJIS_GOOD = ['🎉', '⭐', '🌟', '✨', '🎊', '👏', '🏆', '💯'];
const EMOJIS_OK   = ['👍', '📚', '💪', '🌈'];
const EMOJIS_BAD  = ['😅', '📖', '💡', '🔁'];

function spawnEmoji(emoji, x, y) {
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.textContent = emoji;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function burstEmojis(emojis, count = 8) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const x = Math.random() * w;
      const y = Math.random() * (h * 0.7) + h * 0.2;
      spawnEmoji(emoji, x, y);
    }, i * 120);
  }
}

// ===== RIPPLE EFFECT =====
document.addEventListener('click', e => {
  const option = e.target.closest('.qz-option');
  if (!option) return;

  const ripple = document.createElement('span');
  const rect = option.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    position:absolute;
    border-radius:50%;
    background:rgba(24,144,255,0.3);
    width:${size}px;
    height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
    transform:scale(0);
    animation:rippleAnim 0.5s linear;
    pointer-events:none;
  `;
  option.appendChild(ripple);
  sfxSelect();
  setTimeout(() => ripple.remove(), 600);
});

// Thêm keyframes ripple vào head
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(2); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

// ===== CELEBRATION THEO ĐIỂM =====
window.triggerResultEffects = function(pct) {
  if (pct >= 80) {
    sfxExcellent();
    launchConfetti(150);
    burstEmojis(EMOJIS_GOOD, 12);
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.remove('active'), 2000);
    }
  } else if (pct >= 50) {
    sfxSuccess();
    burstEmojis(EMOJIS_OK, 6);
  } else {
    playTone(350, 'sine', 0.4, 0.15);
    burstEmojis(EMOJIS_BAD, 4);
  }
};

// ===== HIỆU ỨNG SLIDE KHI CHUYỂN CÂU =====
window.animateQuestionChange = function(direction = 'next') {
  const card = document.querySelector('.qz-question-card');
  if (!card) return;
  const dx = direction === 'next' ? '-30px' : '30px';
  card.style.transition = 'none';
  card.style.opacity = '0';
  card.style.transform = `translateY(${dx})`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  });
};

console.log('✅ effects.js loaded');
