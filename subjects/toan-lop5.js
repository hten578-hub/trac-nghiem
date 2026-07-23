// ================================================================
//  ĐỀ: Toán Lớp 5 — Phân số, đo lường
//
//  meta: thông tin hiển thị trên trang chọn đề
//  questions: danh sách câu hỏi
//
//  Mỗi câu:
//  {
//    id, question, options: ["A","B","C","D"],
//    answer: 0-3,        // 0=A 1=B 2=C 3=D
//    explain: "..."      // chỉ hiện khi đúng (tuỳ chọn)
//  }
// ================================================================

module.exports = {
  meta: {
    id: 'hon-so-lop5',
    title: 'Hỗn Số',
    subtitle: 'Phân số, đo lường',
    icon: '📐',
    timeLimit: 60,          // phút
    subject: 'Toán',
    grade: 'Lớp 5',
    group_id: 'toan-lop5',         // ID nhóm môn
    group_title: 'Toán Lớp 5',    // Tên nhóm hiển thị
    group_icon: '📐',
    createdAt: '2026-07-07',
  },
  questions: [
    {
      id: 1,
      question: "Hỗn số $5 \\frac{3}{4}$ có phần nguyên là:",
      options: ["5", "3", "4", "$\\frac{3}{4}$"],
      answer: 0,
      explain: "Phần nguyên của hỗn số $5 \\frac{3}{4}$ là số đứng trước phân số, tức là số $5$."
    },
    {
      id: 2,
      question: "Số thích hợp điền vào chỗ chấm $3\\text{ dm}^2\\text{ 5 cm}^2 = \\ldots \\text{ cm}^2$ là:",
      options: ["35", "305", "350", "3005"],
      answer: 1,
      explain: "Đổi $3\\text{ dm}^2 = 300\\text{ cm}^2$. Vậy $300 + 5 = 305\\text{ cm}^2$."
    },
    {
      id: 3,
      question: "Kết quả của phép tính $\\frac{3}{5} + \\frac{2}{7}$ là:",
      options: ["$\\frac{5}{12}$", "$\\frac{5}{35}$", "$\\frac{31}{35}$", "$\\frac{6}{35}$"],
      answer: 2,
      explain: "Quy đồng mẫu số: $\\frac{3}{5} + \\frac{2}{7} = \\frac{21}{35} + \\frac{10}{35} = \\frac{31}{35}$."
    },
    {
      id: 4,
      question: "Một ô tô đi hết quãng đường trong 3 giờ. Giờ đầu ô tô đi được $\\frac{1}{4}$ quãng đường, giờ thứ hai ô tô đi được $\\frac{2}{5}$ quãng đường, giờ thứ ba ô tô đi được 28 km. Quãng đường ô tô đã đi dài số ki-lô-mét là:",
      options: ["80 km", "70 km", "60 km", "90 km"],
      answer: 0,
      explain: "Phân số chỉ 28 km: $1 - \\frac{1}{4} - \\frac{2}{5} = \\frac{7}{20}$. Quãng đường: $28 \\div \\frac{7}{20} = 80\\text{ km}$."
    },
    {
      id: 5,
      question: "Một kho chứa 180 kg gạo. Ngày thứ nhất kho xuất đi $\\frac{1}{3}$ số gạo. Ngày thứ hai kho xuất đi nhiều hơn ngày thứ nhất 15 kg gạo. Hỏi sau hai ngày, trong kho còn lại bao nhiêu ki-lô-gam gạo?",
      options: ["45 kg", "60 kg", "75 kg", "105 kg"],
      answer: 0,
      explain: "Ngày 1 xuất: $180 \\times \\frac{1}{3} = 60\\text{ kg}$. Ngày 2: $60+15=75\\text{ kg}$. Còn: $180-60-75=45\\text{ kg}$."
    },
    {
      id: 6,
      question: "Kết quả của phép tính $\\frac{5}{6} + \\frac{3}{4}$ là:",
      options: ["$\\frac{8}{10}$", "$\\frac{19}{12}$", "$\\frac{15}{24}$", "$\\frac{2}{3}$"],
      answer: 1,
      explain: "Quy đồng mẫu số 12: $\\frac{10}{12} + \\frac{9}{12} = \\frac{19}{12}$."
    },
    {
      id: 7,
      question: "Kết quả của phép tính $4 \\frac{1}{3} - 2 \\frac{2}{5}$ là:",
      options: ["$2 \\frac{1}{2}$", "$\\frac{29}{15}$", "$\\frac{31}{15}$", "$2 \\frac{1}{15}$"],
      answer: 1,
      explain: "Đổi sang phân số: $\\frac{13}{3} - \\frac{12}{5} = \\frac{65}{15} - \\frac{36}{15} = \\frac{29}{15}$."
    },
    {
      id: 8,
      question: "Kết quả của phép tính $\\frac{11}{5} : \\frac{4}{3}$ là:",
      options: ["$\\frac{44}{15}$", "$\\frac{33}{20}$", "$\\frac{15}{44}$", "$\\frac{20}{33}$"],
      answer: 1,
      explain: "Phép chia phân số: $\\frac{11}{5} \\times \\frac{3}{4} = \\frac{33}{20}$."
    },
    {
      id: 9,
      question: "Hỗn số $3 \\frac{4}{5}$ được viết dưới dạng phân số thập phân là:",
      options: ["$\\frac{34}{5}$", "$\\frac{19}{5}$", "$\\frac{38}{10}$", "$\\frac{34}{10}$"],
      answer: 2,
      explain: "$3 \\frac{4}{5} = \\frac{19}{5}$. Nhân tử và mẫu với 2: $\\frac{38}{10}$."
    },
    {
      id: 10,
      question: "Hỗn số $1 \\frac{7}{20}$ được viết dưới dạng phân số thập phân là:",
      options: ["$\\frac{135}{100}$", "$\\frac{27}{20}$", "$\\frac{17}{20}$", "$\\frac{135}{10}$"],
      answer: 0,
      explain: "$1 \\frac{7}{20} = \\frac{27}{20}$. Nhân tử và mẫu với 5: $\\frac{135}{100}$."
    },
    {
      id: 11,
      question: "Hỗn số $2 \\frac{3}{50}$ được viết dưới dạng phân số thập phân là:",
      options: ["$\\frac{23}{50}$", "$\\frac{103}{50}$", "$\\frac{206}{10}$", "$\\frac{206}{100}$"],
      answer: 3,
      explain: "$2 \\frac{3}{50} = \\frac{103}{50}$. Nhân tử và mẫu với 2: $\\frac{206}{100}$."
    },
    {
      id: 12,
      question: "Số thích hợp để điền vào chỗ chấm \"5 tấn 42 kg = ………. kg\" là:",
      options: ["542", "5042", "5420", "50042"],
      answer: 1,
      explain: "$5\\text{ tấn} = 5000\\text{ kg}$. Vậy $5000 + 42 = 5042\\text{ kg}$."
    },
    {
      id: 13,
      question: "Số thích hợp để điền vào chỗ chấm \"$400\\text{ cm}^2 = \\ldots \\text{ dm}^2$\" là:",
      options: ["4", "40", "4000", "40000"],
      answer: 0,
      explain: "$100\\text{ cm}^2 = 1\\text{ dm}^2$, nên $400\\text{ cm}^2 = 4\\text{ dm}^2$."
    },
    {
      id: 14,
      question: "Số thích hợp để điền vào chỗ chấm \"2 giờ 15 phút = ………. phút\" là:",
      options: ["35", "215", "135", "125"],
      answer: 2,
      explain: "$2\\text{ giờ} = 120\\text{ phút}$. Vậy $120 + 15 = 135\\text{ phút}$."
    },
    {
      id: 15,
      question: "Số thích hợp để điền vào chỗ chấm \"$\\frac{7}{10}$ thế kỉ = ………. năm\" là:",
      options: ["7", "70", "700", "75"],
      answer: 1,
      explain: "$1\\text{ thế kỉ} = 100\\text{ năm}$, nên $\\frac{7}{10} \\times 100 = 70\\text{ năm}$."
    },
    {
      id: 16,
      question: "Số thích hợp để điền vào chỗ chấm \"$\\frac{37}{10}$ yến = ………. kg\" là:",
      options: ["37", "370", "3,7", "3700"],
      answer: 0,
      explain: "$1\\text{ yến} = 10\\text{ kg}$, nên $\\frac{37}{10} \\times 10 = 37\\text{ kg}$."
    },
    {
      id: 17,
      question: "Số thích hợp để điền vào chỗ chấm \"$\\frac{13}{30}$ phút = ………. giây\" là:",
      options: ["13", "39", "26", "20"],
      answer: 2,
      explain: "$1\\text{ phút} = 60\\text{ giây}$, nên $\\frac{13}{30} \\times 60 = 26\\text{ giây}$."
    }
  ]
};
