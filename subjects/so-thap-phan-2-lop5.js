module.exports = {
  meta: {
    id: 'so-thap-phan-2-lop5',
    title: 'Số Thập Phân 1',
    subtitle: 'Tia số, đọc số, đổi đơn vị',
    icon: '🔢',
    timeLimit: 40,
    subject: 'Toán',
    grade: 'Lớp 5',
    group_id: 'toan-lop5',
    group_title: 'Toán Lớp 5',
    group_icon: '📐',
    createdAt: '2026-07-21',
  },
  questions: [
    // ===== PHẦN A: TIA SỐ =====
    {
      id: 1,
      type: 'fill',
      question: "Trên tia số, vạch ứng với $\\frac{4}{10}$ được viết dưới dạng số thập phân là: ......",
      answer: '0.4',
      accept: ['0.4', '0,4'],
      explain: "$\\frac{4}{10} = 0,4$ (không phẩy bốn)."
    },
    {
      id: 2,
      type: 'fill',
      question: "Trên tia số, vạch ứng với $\\frac{5}{10}$ được viết dưới dạng số thập phân là: ......",
      answer: '0.5',
      accept: ['0.5', '0,5'],
      explain: "$\\frac{5}{10} = 0,5$ (không phẩy năm)."
    },
    {
      id: 3,
      type: 'fill',
      question: "Trên tia số, vạch ứng với $\\frac{6}{10}$ được viết dưới dạng số thập phân là: ......",
      answer: '0.6',
      accept: ['0.6', '0,6'],
      explain: "$\\frac{6}{10} = 0,6$ (không phẩy sáu)."
    },
    {
      id: 4,
      type: 'fill',
      question: "Trên tia số, vạch ứng với $\\frac{7}{10}$ được viết dưới dạng số thập phân là: ......",
      answer: '0.7',
      accept: ['0.7', '0,7'],
      explain: "$\\frac{7}{10} = 0,7$ (không phẩy bảy)."
    },
    // ===== PHẦN B: ĐỌC SỐ THẬP PHÂN =====
    {
      id: 5,
      type: 'choice',
      question: "Số thập phân 0,4 đọc là:",
      options: [
        "Không phẩy bốn",
        "Không phẩy không bốn",
        "Bốn phần mười",
        "Bốn phẩy không"
      ],
      answer: 0,
      explain: "0,4 đọc là: không phẩy bốn. Phần nguyên là 0, phần thập phân là 4."
    },
    {
      id: 6,
      type: 'choice',
      question: "Số thập phân 0,04 đọc là:",
      options: [
        "Không phẩy bốn",
        "Không phẩy không bốn",
        "Không phẩy không không bốn",
        "Bốn phần trăm"
      ],
      answer: 1,
      explain: "0,04 đọc là: không phẩy không bốn. Phần thập phân có 2 chữ số: 0 và 4."
    },
    {
      id: 7,
      type: 'choice',
      question: "Số thập phân 0,5 đọc là:",
      options: [
        "Không phẩy không năm",
        "Năm phần mười",
        "Không phẩy năm",
        "Năm phẩy không"
      ],
      answer: 2,
      explain: "0,5 đọc là: không phẩy năm."
    },
    {
      id: 8,
      type: 'choice',
      question: "Số thập phân 0,05 đọc là:",
      options: [
        "Không phẩy năm",
        "Không phẩy không năm",
        "Không phẩy không không năm",
        "Năm phần trăm"
      ],
      answer: 1,
      explain: "0,05 đọc là: không phẩy không năm."
    },
    // ===== PHẦN C: ĐỔI ĐƠN VỊ =====
    {
      id: 9,
      type: 'fill',
      question: "$1\\text{ kg} = \\ldots \\text{ tấn}$ (viết dưới dạng số thập phân)",
      answer: '0.001',
      accept: ['0.001', '0,001'],
      explain: "$1\\text{ kg} = \\frac{1}{1000}\\text{ tấn} = 0,001\\text{ tấn}$"
    },
    {
      id: 10,
      type: 'fill',
      question: "$564\\text{ m} = \\ldots \\text{ km}$ (viết dưới dạng số thập phân)",
      answer: '0.564',
      accept: ['0.564', '0,564'],
      explain: "$564\\text{ m} = \\frac{564}{1000}\\text{ km} = 0,564\\text{ km}$"
    },
    {
      id: 11,
      type: 'fill',
      question: "$3,2\\text{ m} = \\ldots \\text{ mm}$",
      answer: '3200',
      accept: ['3200', '3 200'],
      explain: "$3,2\\text{ m} = 3\\frac{2}{10}\\text{ m} = 3\\text{ m } 200\\text{ mm} = 3200\\text{ mm}$"
    },
    {
      id: 12,
      type: 'fill',
      question: "$4,5\\text{ kg} = \\ldots \\text{ g}$",
      answer: '4500',
      accept: ['4500', '4 500'],
      explain: "$4,5\\text{ kg} = 4\\frac{5}{10}\\text{ kg} = 4\\text{ kg } 500\\text{ g} = 4500\\text{ g}$"
    },
    // ===== PHẦN D: TRẮC NGHIỆM TỔNG HỢP =====
    {
      id: 13,
      type: 'choice',
      question: "Số thập phân nào dưới đây bằng $\\frac{5}{10}$?",
      options: ["0,05", "0,5", "5,0", "0,005"],
      answer: 1,
      explain: "$\\frac{5}{10} = 0,5$. Mẫu số có 1 chữ số 0 → dịch dấu phẩy 1 chữ số sang trái."
    },
    {
      id: 14,
      type: 'choice',
      question: "Phần thập phân của số 3,17 là:",
      options: ["3", "17", "1", "7"],
      answer: 1,
      explain: "Số 3,17: phần nguyên là 3, phần thập phân là 17 (các chữ số bên phải dấu phẩy)."
    },
    {
      id: 15,
      type: 'choice',
      question: "$\\frac{148}{1000}$ viết dưới dạng số thập phân là:",
      options: ["1,48", "14,8", "0,148", "0,0148"],
      answer: 2,
      explain: "$\\frac{148}{1000}$: mẫu số có 3 chữ số 0, dịch dấu phẩy của 148 sang trái 3 chữ số → $0,148$."
    },
  ]
};
