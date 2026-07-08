const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

// ===== Tài khoản giáo viên =====
const TEACHER_USERNAME = 'giaovien';
const TEACHER_PASSWORD = 'toan123';

// ===== Session =====
const sessions = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now() });
  return token;
}
function isValidSession(token) {
  if (!token || !sessions.has(token)) return false;
  const s = sessions.get(token);
  if (Date.now() - s.createdAt > SESSION_TTL_MS) { sessions.delete(token); return false; }
  return true;
}
function requireAuth(req, res, next) {
  if (!isValidSession(req.headers['x-auth-token']))
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn.' });
  next();
}

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== Load tất cả đề từ subjects/ =====
const SUBJECTS_DIR = path.join(__dirname, 'subjects');
const subjects = {}; // { subjectId: { meta, questions } }

fs.readdirSync(SUBJECTS_DIR)
  .filter(f => f.endsWith('.js'))
  .forEach(f => {
    try {
      const subject = require(path.join(SUBJECTS_DIR, f));
      if (subject.meta && subject.questions) {
        subjects[subject.meta.id] = subject;
        console.log(`  📚 Loaded: ${subject.meta.title} (${subject.questions.length} câu)`);
      }
    } catch (e) {
      console.error(`  ❌ Lỗi load ${f}:`, e.message);
    }
  });

// ===== DB helpers =====
function readDB() {
  if (!fs.existsSync(DB_FILE))
    fs.writeFileSync(DB_FILE, JSON.stringify({ results: [], nextId: 1, students: {} }));
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.students) db.students = {};
  return db;
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const MAX_ATTEMPTS = 3; // Giới hạn số lần làm bài

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function verifyStudentPassword(student, password) {
  if (!student) return false;
  if (student.passwordHash) return student.passwordHash === hashPassword(password);
  return student.password === password;
}

// ===== Student session =====
const studentSessions = new Map();

function createStudentSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  studentSessions.set(token, { username, createdAt: Date.now() });
  return token;
}
function getStudentFromToken(token) {
  if (!token || !studentSessions.has(token)) return null;
  const s = studentSessions.get(token);
  if (Date.now() - s.createdAt > SESSION_TTL_MS) { studentSessions.delete(token); return null; }
  return s.username;
}
function requireStudentAuth(req, res, next) {
  const username = getStudentFromToken(req.headers['x-student-token']);
  if (!username) return res.status(401).json({ error: 'Chưa đăng nhập.' });
  req.studentUsername = username;
  next();
}

// ===== AUTH APIs (Giáo viên) =====
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD)
    return res.json({ token: createSession() });
  return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
});
app.post('/api/logout', (req, res) => {
  sessions.delete(req.headers['x-auth-token']);
  res.json({ ok: true });
});
app.get('/api/auth-check', (req, res) => {
  res.json({ ok: isValidSession(req.headers['x-auth-token']) });
});

// ===== AUTH APIs (Học sinh) =====
// Đăng ký tài khoản học sinh (giáo viên tạo)
app.post('/api/students', requireAuth, (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password || !fullname)
    return res.status(400).json({ error: 'Thiếu thông tin.' });
  const db = readDB();
  if (db.students[username])
    return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
  db.students[username] = { passwordHash: hashPassword(password), fullname, createdAt: new Date().toISOString() };
  writeDB(db);
  res.json({ ok: true });
});

// Lấy danh sách học sinh (giáo viên)
app.get('/api/students', requireAuth, (req, res) => {
  const db = readDB();
  const list = Object.entries(db.students).map(([username, s]) => ({
    username, fullname: s.fullname, createdAt: s.createdAt
  }));
  res.json(list);
});

// Xóa học sinh (giáo viên)
app.delete('/api/students/:username', requireAuth, (req, res) => {
  const db = readDB();
  delete db.students[req.params.username];
  writeDB(db);
  res.json({ ok: true });
});

// Đăng nhập học sinh
app.post('/api/student-login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const student = db.students[username];
  if (!verifyStudentPassword(student, password))
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
  if (!student.passwordHash) {
    student.passwordHash = hashPassword(password);
    delete student.password;
    writeDB(db);
  }
  const token = createStudentSession(username);
  res.json({ token, fullname: student.fullname, username });
});

// Kiểm tra session học sinh
app.get('/api/student-auth-check', (req, res) => {
  const username = getStudentFromToken(req.headers['x-student-token']);
  if (!username) return res.json({ ok: false });
  const db = readDB();
  const student = db.students[username];
  res.json({ ok: true, username, fullname: student?.fullname || username });
});

// Đăng xuất học sinh
app.post('/api/student-logout', (req, res) => {
  studentSessions.delete(req.headers['x-student-token']);
  res.json({ ok: true });
});

// Kiểm tra số lần làm bài còn lại
app.get('/api/student/attempts/:subjectId', requireStudentAuth, (req, res) => {
  const db = readDB();
  const used = db.results.filter(r =>
    r.student_username === req.studentUsername && r.subject_id === req.params.subjectId
  ).length;
  res.json({ used, max: MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - used) });
});

// Lịch sử làm bài của học sinh
app.get('/api/student/history', requireStudentAuth, (req, res) => {
  const db = readDB();
  const history = db.results
    .filter(r => r.student_username === req.studentUsername)
    .map(({ id, subject_id, subject_title, score, total, submitted_at, attempt }) =>
      ({ id, subject_id, subject_title, score, total, submitted_at, attempt })
    ).reverse();
  res.json(history);
});

// ===== API: Danh sách đề =====
app.get('/api/subjects', (req, res) => {
  const list = Object.values(subjects).map(s => ({
    ...s.meta,
    totalQuestions: s.questions.length
  }));
  res.json(list);
});

// ===== API: Danh sách nhóm môn =====
app.get('/api/groups', (req, res) => {
  const groups = {};
  Object.values(subjects).forEach(s => {
    const gid = s.meta.group_id || s.meta.id;
    if (!groups[gid]) {
      groups[gid] = {
        id: gid,
        title: s.meta.group_title || s.meta.title,
        icon: s.meta.group_icon || s.meta.icon || '📄',
        grade: s.meta.grade || '',
        subject: s.meta.subject || '',
        lessons: []
      };
    }
    groups[gid].lessons.push({
      id: s.meta.id,
      title: s.meta.title,
      subtitle: s.meta.subtitle || '',
      icon: s.meta.icon || '📄',
      timeLimit: s.meta.timeLimit,
      totalQuestions: s.questions.length
    });
  });
  res.json(Object.values(groups));
});

// ===== API: Câu hỏi theo đề =====
app.get('/api/subjects/:id/questions', (req, res) => {
  const subject = subjects[req.params.id];
  if (!subject) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  const safe = subject.questions.map(({ id, question, options }) => ({ id, question, options }));
  res.json({ meta: subject.meta, questions: safe });
});

// ===== API: Kiểm tra 1 câu =====
app.post('/api/subjects/:id/check', (req, res) => {
  const subject = subjects[req.params.id];
  if (!subject) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  const { questionId, selected } = req.body;
  const q = subject.questions.find(x => x.id === questionId);
  if (!q) return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });
  const isCorrect = selected === q.answer;
  res.json({ isCorrect, correct: q.answer, explain: isCorrect ? (q.explain || null) : null });
});

// ===== API: Nộp bài =====
app.post('/api/subjects/:id/submit', requireStudentAuth, (req, res) => {
  const subject = subjects[req.params.id];
  if (!subject) return res.status(404).json({ error: 'Không tìm thấy đề.' });

  const { answers } = req.body;
  const username = req.studentUsername;
  const db = readDB();

  // Kiểm tra giới hạn
  const used = db.results.filter(r =>
    r.student_username === username && r.subject_id === req.params.id
  ).length;
  if (used >= MAX_ATTEMPTS)
    return res.status(403).json({ error: `Bạn đã dùng hết ${MAX_ATTEMPTS} lần làm bài cho đề này.` });

  const student = db.students[username];
  const student_name = student?.fullname || username;

  if (!Array.isArray(answers) || answers.length !== subject.questions.length)
    return res.status(400).json({ error: 'Dữ liệu câu trả lời không hợp lệ.' });

  let score = 0;
  const detailed = answers.map((ans, i) => {
    const q = subject.questions[i];
    const isCorrect = ans === q.answer;
    if (isCorrect) score++;
    return { question: q.question, options: q.options, selected: ans, correct: q.answer, isCorrect,
      explain: isCorrect ? (q.explain || null) : null };
  });

  const record = {
    id: db.nextId++,
    subject_id: req.params.id,
    subject_title: subject.meta.title,
    student_username: username,
    student_name,
    score, total: subject.questions.length,
    answers, submitted_at: new Date().toISOString(),
    attempt: used + 1
  };
  db.results.push(record);
  writeDB(db);

  res.json({
    id: record.id, student_name, score, total: record.total, detailed,
    attempt: record.attempt, remaining: MAX_ATTEMPTS - record.attempt
  });
});

// ===== API: Kết quả (giáo viên) =====
app.get('/api/results', requireAuth, (req, res) => {
  const db = readDB();
  const { subject } = req.query;
  let rows = db.results;
  if (subject) rows = rows.filter(r => r.subject_id === subject);
  res.json(rows.map(({ id, subject_id, subject_title, student_name, student_username, score, total, submitted_at, attempt }) =>
    ({ id, subject_id, subject_title, student_name, student_username, score, total, submitted_at, attempt })
  ).reverse());
});

app.delete('/api/results', requireAuth, (req, res) => {
  const db = readDB();
  const { subject } = req.query;
  if (subject) db.results = db.results.filter(r => r.subject_id !== subject);
  else { db.results = []; db.nextId = 1; }
  writeDB(db);
  res.json({ message: 'Đã xóa kết quả.' });
});

// ===== Giữ backward compat cho API cũ =====
app.get('/api/questions', (req, res) => {
  const s = subjects['hon-so-lop5'] || subjects[Object.keys(subjects)[0]];
  if (!s) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  res.json(s.questions.map(({ id, question, options }) => ({ id, question, options })));
});
app.post('/api/check', (req, res) => {
  const s = subjects['hon-so-lop5'] || subjects[Object.keys(subjects)[0]];
  if (!s) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  const { questionId, selected } = req.body;
  const q = s.questions.find(x => x.id === questionId);
  if (!q) return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });
  const isCorrect = selected === q.answer;
  res.json({ isCorrect, correct: q.answer, explain: isCorrect ? (q.explain || null) : null });
});
app.post('/api/submit', (req, res) => {
  const s = subjects['hon-so-lop5'] || subjects[Object.keys(subjects)[0]];
  if (!s) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  const { student_name, answers } = req.body;
  if (!student_name?.trim()) return res.status(400).json({ error: 'Tên học sinh không được để trống.' });
  if (!Array.isArray(answers) || answers.length !== s.questions.length)
    return res.status(400).json({ error: 'Dữ liệu câu trả lời không hợp lệ.' });
  let score = 0;
  const detailed = answers.map((ans, i) => {
    const q = s.questions[i];
    const isCorrect = ans === q.answer;
    if (isCorrect) score++;
    return { question: q.question, options: q.options, selected: ans, correct: q.answer, isCorrect,
      explain: isCorrect ? (q.explain || null) : null };
  });
  const db = readDB();
  const record = { id: db.nextId++, subject_id: s.meta.id, subject_title: s.meta.title,
    student_name: student_name.trim(), score, total: s.questions.length, answers, submitted_at: new Date().toISOString() };
  db.results.push(record);
  writeDB(db);
  res.json({ id: record.id, student_name: record.student_name, score, total: record.total, detailed });
});

// ===== Start =====
app.listen(PORT, () => {
  console.log('');
  console.log('  ✅ Server đã khởi động!');
  console.log(`  🌐 Mở trình duyệt: http://localhost:${PORT}`);
  console.log(`  👩‍🏫 Trang giáo viên: http://localhost:${PORT}/teacher.html`);
  console.log('');
});
