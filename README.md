# 🎓 Hệ thống Trắc Nghiệm Online

Web trắc nghiệm cho học sinh, có đăng nhập, giới hạn lượt làm bài, lịch sử điểm và trang giáo viên quản lý.

---

## 🚀 Khởi động (local)

```
npm install
node server.js
```

Nếu `node` chưa có trong PATH:
```
"C:\Program Files\nodejs\node.exe" server.js
```

---

## 🌐 Các trang web

| URL | Mô tả |
|-----|-------|
| `/` | Trang chọn môn (yêu cầu đăng nhập học sinh) |
| `/student-login.html` | Đăng nhập học sinh |
| `/lessons.html?group=toan-lop5` | Danh sách bài của môn |
| `/quiz.html?subject=hon-so-lop5` | Làm bài |
| `/teacher.html` | Trang giáo viên (đăng nhập riêng) |

---

## 👩‍🏫 Tài khoản giáo viên

| | |
|--|--|
| **Username** | `giaovien` |
| **Password** | `toan123` |

Để đổi: mở `server.js`, sửa 2 dòng đầu `TEACHER_USERNAME` / `TEACHER_PASSWORD`, restart server.

---

## � Quản lý học sinh

Vào `teacher.html` → đăng nhập → cuộn xuống phần **"Tài khoản học sinh"**:
- **Thêm học sinh**: điền Họ tên + Tên đăng nhập + Mật khẩu → bấm Thêm
- **Xóa học sinh**: bấm nút Xóa cạnh tên
- Học sinh dùng tài khoản này để đăng nhập tại `/student-login.html`

---

## 🔒 Giới hạn lượt làm bài

- Mỗi học sinh được làm **tối đa 3 lần/đề**
- Trang danh sách bài hiện số lượt còn lại (3/3, 2/3...)
- Hết lượt → bài bị khóa, hiện thông báo
- Muốn đổi số lần: mở `server.js`, sửa dòng `const MAX_ATTEMPTS = 3`

---

## 📋 Lịch sử làm bài

- Học sinh bấm **📋 Lịch sử** ở header trang chủ
- Hiện tất cả các lần đã nộp: môn, ngày giờ, điểm /10

---

## 📚 Thêm đề mới

Tạo file trong `subjects/`, ví dụ `subjects/khoa-hoc-lop5.js`:

```js
module.exports = {
  meta: {
    id: 'khoa-hoc-lop5',
    title: 'Khoa Học',
    subtitle: 'Tự nhiên và xã hội',
    icon: '🔬',
    timeLimit: 45,          // phút
    subject: 'Khoa Học',
    grade: 'Lớp 5',
    group_id: 'khoahoc-lop5',
    group_title: 'Khoa Học Lớp 5',
    group_icon: '🔬',
  },
  questions: [
    {
      id: 1,
      question: "Câu hỏi?",
      options: ["A", "B", "C", "D"],
      answer: 0,            // 0=A, 1=B, 2=C, 3=D
      explain: "Giải thích (chỉ hiện khi đúng)"
    },
  ]
};
```

Restart server → đề tự hiện trên trang chủ.

---

## 🗂️ Cấu trúc project

```
WEB TOAN 4/
├── server.js              ← Backend (Express + auth + API)
├── package.json
├── data.json              ← Database kết quả + tài khoản học sinh
├── subjects/
│   ├── toan-lop5.js       ← Đề Toán Lớp 5 (Hỗn số)
│   └── van-lop5.js        ← Đề Tiếng Việt Lớp 5 (Đại từ)
└── public/
    ├── index.html         ← Trang chọn môn
    ├── student-login.html ← Đăng nhập học sinh
    ├── lessons.html       ← Danh sách bài của môn
    ├── quiz.html          ← Trang làm bài (dùng chung)
    ├── quiz.js            ← Logic làm bài
    ├── teacher.html       ← Trang giáo viên
    ├── effects.js         ← Hiệu ứng âm thanh, confetti, emoji
    └── style.css          ← Giao diện
```

---

## ⚡ Tính năng

- ✅ Đăng nhập học sinh — tài khoản do giáo viên tạo
- ✅ Giới hạn 3 lần làm bài/đề
- ✅ Lịch sử điểm — học sinh xem lại các lần đã làm
- ✅ Nhiều môn, nhiều đề — thêm thoải mái
- ✅ Đồng hồ đếm ngược, tự nộp khi hết giờ
- ✅ Nút Kiểm tra — xem đúng/sai từng câu ngay lập tức
- ✅ Giải thích đáp án khi chọn đúng
- ✅ Lưu tiến độ — tắt máy vẫn làm tiếp được
- ✅ Phím tắt 1/2/3/4, →, Esc
- ✅ Hiệu ứng confetti, emoji, âm thanh
- ✅ Trang giáo viên: thống kê, bảng điểm, quản lý học sinh
- ✅ Responsive — điện thoại và laptop

---

## 🚢 Deploy lên Railway (24/7)

Sau khi sửa code, push lên GitHub để Railway tự deploy:

```
git add .
git commit -m "mô tả thay đổi"
git push
```

Railway tự deploy lại trong ~2 phút. Link không đổi.
