# 🎓 Hệ thống Trắc Nghiệm Online

Web trắc nghiệm cho học sinh, có trang giáo viên xem kết quả. Hỗ trợ nhiều môn/đề khác nhau.

---

## 🚀 Khởi động

### Lần đầu cài đặt
```
npm install
```

### Chạy server
```
node server.js
```
Hoặc nếu `node` chưa có trong PATH:
```
"C:\Program Files\nodejs\node.exe" server.js
```

---

## 🌐 Các trang web

| URL | Mô tả |
|-----|-------|
| `http://localhost:3000` | Trang chọn đề (học sinh nhập tên + chọn môn) |
| `http://localhost:3000/quiz.html?subject=toan-lop5` | Làm bài Toán Lớp 5 |
| `http://localhost:3000/quiz.html?subject=van-lop5` | Làm bài Tiếng Việt Lớp 5 |
| `http://localhost:3000/teacher.html` | Trang giáo viên (cần đăng nhập) |

---

## 👩‍🏫 Tài khoản giáo viên

| | |
|--|--|
| **Username** | `giaovien` |
| **Password** | `toan123` |

Để đổi mật khẩu: mở `server.js`, sửa 2 dòng đầu:
```js
const TEACHER_USERNAME = 'giaovien';
const TEACHER_PASSWORD = 'toan123';
```
Sau đó restart server.

---

## 📚 Thêm đề mới

Tất cả đề nằm trong thư mục `subjects/`. Server tự động load tất cả file `.js` trong đó.

### Bước 1 — Tạo file đề mới
Copy file mẫu `subjects/van-lop5.js` và đổi tên, ví dụ `subjects/khoa-hoc-lop5.js`.

### Bước 2 — Điền thông tin đề
```js
module.exports = {
  meta: {
    id: 'khoa-hoc-lop5',      // ID duy nhất, không dấu, không cách
    title: 'Khoa Học Lớp 5',  // Tên hiển thị
    subtitle: 'Tự nhiên và xã hội',
    icon: '🔬',               // Emoji icon
    timeLimit: 45,            // Thời gian làm bài (phút)
    subject: 'Khoa Học',
    grade: 'Lớp 5',
  },
  questions: [
    {
      id: 1,
      question: "Nội dung câu hỏi?",
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      answer: 0,        // 0=A, 1=B, 2=C, 3=D
      explain: "Giải thích khi đúng (không bắt buộc)"
    },
    // thêm câu tiếp theo...
  ]
};
```

### Bước 3 — Restart server
```
node server.js
```
Đề mới sẽ tự hiện trên trang chọn đề.

---

## ✏️ Sửa câu hỏi

Mở file trong `subjects/` tương ứng, sửa trực tiếp rồi restart server.

Hỗ trợ công thức toán LaTeX: dùng `$...$`
```
"Kết quả của $\\frac{3}{5} + \\frac{2}{7}$ là:"
```

---

## 🗂️ Cấu trúc project

```
WEB TOAN 4/
├── server.js           ← Backend (Express + auth + API)
├── package.json
├── questions.js        ← (cũ, không dùng nữa)
├── data.json           ← Database kết quả (tự tạo khi chạy)
├── subjects/           ← THƯ MỤC ĐỀ THI
│   ├── toan-lop5.js    ← Đề Toán Lớp 5
│   └── van-lop5.js     ← Đề Tiếng Việt Lớp 5
└── public/
    ├── index.html      ← Trang chọn đề
    ├── quiz.html       ← Trang làm bài (dùng chung mọi đề)
    ├── quiz.js         ← Logic làm bài
    ├── teacher.html    ← Trang giáo viên
    ├── effects.js      ← Hiệu ứng âm thanh, confetti, emoji
    └── style.css       ← Giao diện
```

---

## ⚡ Tính năng

- ✅ Nhiều đề thi, nhiều môn — thêm thoải mái
- ✅ Đồng hồ đếm ngược, tự nộp khi hết giờ
- ✅ Nút **Kiểm tra** — xem đúng/sai từng câu ngay lập tức
- ✅ Giải thích đáp án khi chọn đúng
- ✅ Lưu tiến độ — tắt máy vẫn làm tiếp được
- ✅ Phím tắt: `1/2/3/4` chọn đáp án, `→` câu tiếp, `Esc` bỏ qua
- ✅ Hiệu ứng confetti, emoji, âm thanh khi nộp bài
- ✅ Trang giáo viên: thống kê, bảng điểm, đăng nhập bảo mật
- ✅ Responsive — dùng được trên điện thoại và laptop
