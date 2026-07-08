const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MongoDB Connection =====
const MONGO_URI = process.env.MONGO_URI || 'mongodb://hten578_db_user:Dd04kqFahv1LoLTV@ac-voledem-shard-00-00.zfevfnp.mongodb.net:27017,ac-voledem-shard-00-01.zfevfnp.mongodb.net:27017,ac-voledem-shard-00-02.zfevfnp.mongodb.net:27017/quizapp?ssl=true&replicaSet=atlas-q4sqmh-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('  ✅ Đã kết nối MongoDB'))
  .catch(e => console.error('  ❌ MongoDB lỗi:', e.message));

// ===== Mongoose Schemas =====
const StudentSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: String,
  fullname: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ResultSchema = new mongoose.Schema({
  subject_id: String,
  subject_title: String,
  student_username: String,
  student_name: String,
  score: Number,
  total: Number,
  wrong: Number,
  skip: Number,
  attempt: Number,
  answers: [Number],
  submitted_at: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', StudentSchema);
const Result = mongoose.model('Result', ResultSchema);

// ===== Tài khoản giáo viên =====
const TEACHER_USERNAME = 'giaovien';
const TEACHER_PASSWORD = 'toan123';
const MAX_ATTEMPTS = 3;

// ===== Session (in-memory) =====
const sessions = new Map();
const studentSessions = new Map();
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

function hashPassword(pw) {
  return crypto.createHash('sha256').update(String(pw)).digest('hex');
}

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== Load đề thi =====
const SUBJECTS_DIR = path.join(__dirname, 'subjects');
const subjects = {};
fs.readdirSync(SUBJECTS_DIR).filter(f => f.endsWith('.js')).forEach(f => {
  try {
    const s = require(path.join(SUBJECTS_DIR, f));
    if (s.meta && s.questions) {
      subjects[s.meta.id] = s;
      console.log(`  📚 Loaded: ${s.meta.title} (${s.questions.length} câu)`);
    }
  } catch (e) { console.error(`  ❌ Lỗi load ${f}:`, e.message); }
});

// ===== AUTH APIs (Giáo viên) =====
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD)
    return res.json({ token: createSession() });
  return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
});
app.post('/api/logout', (req, res) => { sessions.delete(req.headers['x-auth-token']); res.json({ ok: true }); });
app.get('/api/auth-check', (req, res) => { res.json({ ok: isValidSession(req.headers['x-auth-token']) }); });

// ===== AUTH APIs (Học sinh) =====
app.post('/api/students', requireAuth, async (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password || !fullname) return res.status(400).json({ error: 'Thiếu thông tin.' });
  try {
    await Student.create({ username, passwordHash: hashPassword(password), fullname });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/students', requireAuth, async (req, res) => {
  const list = await Student.find({}, 'username fullname createdAt').lean();
  res.json(list);
});

app.delete('/api/students/:username', requireAuth, async (req, res) => {
  await Student.deleteOne({ username: req.params.username });
  res.json({ ok: true });
});

app.post('/api/student-login', async (req, res) => {
  const { username, password } = req.body;
  const student = await Student.findOne({ username }).lean();
  if (!student || student.passwordHash !== hashPassword(password))
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
  const token = createStudentSession(username);
  res.json({ token, fullname: student.fullname, username });
});

app.get('/api/student-auth-check', async (req, res) => {
  const username = getStudentFromToken(req.headers['x-student-token']);
  if (!username) return res.json({ ok: false });
  const student = await Student.findOne({ username }, 'fullname').lean();
  res.json({ ok: true, username, fullname: student?.fullname || username });
});

app.post('/api/student-logout', (req, res) => {
  studentSessions.delete(req.headers['x-student-token']);
  res.json({ ok: true });
});

app.get('/api/student/attempts/:subjectId', requireStudentAuth, async (req, res) => {
  const used = await Result.countDocuments({ student_username: req.studentUsername, subject_id: req.params.subjectId });
  res.json({ used, max: MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - used) });
});

app.get('/api/student/history', requireStudentAuth, async (req, res) => {
  const history = await Result.find({ student_username: req.studentUsername })
    .select('subject_id subject_title score total wrong skip attempt submitted_at')
    .sort({ submitted_at: -1 }).lean();
  res.json(history);
});

// ===== API: Nhóm môn + Đề =====
app.get('/api/subjects', (req, res) => {
  res.json(Object.values(subjects).map(s => ({ ...s.meta, totalQuestions: s.questions.length })));
});

app.get('/api/groups', (req, res) => {
  const groups = {};
  Object.values(subjects).forEach(s => {
    const gid = s.meta.group_id || s.meta.id;
    if (!groups[gid]) groups[gid] = {
      id: gid, title: s.meta.group_title || s.meta.title,
      icon: s.meta.group_icon || s.meta.icon || '📄',
      grade: s.meta.grade || '', subject: s.meta.subject || '', lessons: []
    };
    groups[gid].lessons.push({
      id: s.meta.id, title: s.meta.title, subtitle: s.meta.subtitle || '',
      icon: s.meta.icon || '📄', timeLimit: s.meta.timeLimit, totalQuestions: s.questions.length
    });
  });
  res.json(Object.values(groups));
});

app.get('/api/subjects/:id/questions', (req, res) => {
  const s = subjects[req.params.id];
  if (!s) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  res.json({ meta: s.meta, questions: s.questions.map(({ id, question, options }) => ({ id, question, options })) });
});

app.post('/api/subjects/:id/check', (req, res) => {
  const s = subjects[req.params.id];
  if (!s) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  const { questionId, selected } = req.body;
  const q = s.questions.find(x => x.id === questionId);
  if (!q) return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });
  const isCorrect = selected === q.answer;
  res.json({ isCorrect, correct: q.answer, explain: isCorrect ? (q.explain || null) : null });
});

// ===== API: Nộp bài =====
app.post('/api/subjects/:id/submit', requireStudentAuth, async (req, res) => {
  const s = subjects[req.params.id];
  if (!s) return res.status(404).json({ error: 'Không tìm thấy đề.' });
  const { answers } = req.body;
  const username = req.studentUsername;

  const used = await Result.countDocuments({ student_username: username, subject_id: req.params.id });
  if (used >= MAX_ATTEMPTS)
    return res.status(403).json({ error: `Bạn đã dùng hết ${MAX_ATTEMPTS} lần làm bài cho đề này.` });

  if (!Array.isArray(answers) || answers.length !== s.questions.length)
    return res.status(400).json({ error: 'Dữ liệu câu trả lời không hợp lệ.' });

  const student = await Student.findOne({ username }, 'fullname').lean();
  const student_name = student?.fullname || username;

  let score = 0, wrong = 0, skip = 0;
  const detailed = answers.map((ans, i) => {
    const q = s.questions[i];
    const isCorrect = ans === q.answer;
    if (ans === -1) skip++;
    else if (!isCorrect) wrong++;
    else score++;
    return { question: q.question, options: q.options, selected: ans, correct: q.answer, isCorrect,
      explain: isCorrect ? (q.explain || null) : null };
  });

  const record = await Result.create({
    subject_id: req.params.id, subject_title: s.meta.title,
    student_username: username, student_name,
    score, total: s.questions.length, wrong, skip,
    answers, attempt: used + 1
  });

  res.json({ id: record._id, student_name, score, total: record.total, detailed,
    attempt: record.attempt, remaining: MAX_ATTEMPTS - record.attempt });
});

// ===== API: Kết quả (giáo viên) =====
app.get('/api/results', requireAuth, async (req, res) => {
  const filter = req.query.subject ? { subject_id: req.query.subject } : {};
  const rows = await Result.find(filter)
    .select('subject_id subject_title student_name student_username score total attempt submitted_at')
    .sort({ submitted_at: -1 }).lean();
  res.json(rows);
});

app.delete('/api/results', requireAuth, async (req, res) => {
  const filter = req.query.subject ? { subject_id: req.query.subject } : {};
  await Result.deleteMany(filter);
  res.json({ message: 'Đã xóa kết quả.' });
});

// ===== Start =====
app.listen(PORT, () => {
  console.log('');
  console.log('  ✅ Server đã khởi động!');
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  👩‍🏫 http://localhost:${PORT}/teacher.html`);
  console.log('');
});
