// ================================================================
//  ĐỀ: Số thập phân Lớp 5
//  type: 'fill' = điền đáp án (nhập vào ô trống)
//  type: 'choice' = trắc nghiệm (mặc định)
//  answer: chuỗi đáp án đúng (cho fill), hoặc index 0-3 (cho choice)
//  accept: mảng các đáp án chấp nhận được (tùy chọn, cho fill)
// ================================================================

module.exports = {
  meta: {
    id: 'so-thap-phan-lop5',
    title: 'Số Thập Phân',
    subtitle: 'Giới thiệu và cấu tạo số thập phân',
    icon: '🔢',
    timeLimit: 45,
    subject: 'Toán',
    grade: 'Lớp 5',
    group_id: 'toan-lop5',
    group_title: 'Toán Lớp 5',
    group_icon: '📐',
  },
  questions: [
    // ===== PHẦN 1: VIẾT SỐ THẬP PHÂN =====
    {
      id: 1,
      type: 'fill',
      question: "Viết phân số $\\frac{1}{10}$ dưới dạng số thập phân: ......",
      answer: '0.1',
      accept: ['0.1', '0,1'],
      explain: "$\\frac{1}{10} = 0,1$ (không phẩy một). Mẫu số có 1 chữ số 0 → dịch dấu phẩy 1 chữ số sang trái."
    },
    {
      id: 2,
      type: 'fill',
      question: "Viết phân số $\\frac{1}{100}$ dưới dạng số thập phân: ......",
      answer: '0.01',
      accept: ['0.01', '0,01'],
      explain: "$\\frac{1}{100} = 0,01$ (không phẩy không một). Mẫu số có 2 chữ số 0 → dịch dấu phẩy 2 chữ số sang trái."
    },
    {
      id: 3,
      type: 'fill',
      question: "Viết phân số $\\frac{1}{1000}$ dưới dạng số thập phân: ......",
      answer: '0.001',
      accept: ['0.001', '0,001'],
      explain: "$\\frac{1}{1000} = 0,001$ (không phẩy không trăm linh một). Mẫu số có 3 chữ số 0."
    },
    {
      id: 4,
      type: 'fill',
      question: "Viết phân số $\\frac{3}{10}$ dưới dạng số thập phân: ......",
      answer: '0.3',
      accept: ['0.3', '0,3'],
      explain: "$\\frac{3}{10} = 0,3$ (không phẩy ba)."
    },
    {
      id: 5,
      type: 'fill',
      question: "Viết phân số $\\frac{5}{100}$ dưới dạng số thập phân: ......",
      answer: '0.05',
      accept: ['0.05', '0,05'],
      explain: "$\\frac{5}{100} = 0,05$ (không phẩy không năm)."
    },
    {
      id: 6,
      type: 'fill',
      question: "Viết phân số $\\frac{8}{1000}$ dưới dạng số thập phân: ......",
      answer: '0.008',
      accept: ['0.008', '0,008'],
      explain: "$\\frac{8}{1000} = 0,008$ (không phẩy không trăm linh tám)."
    },
    {
      id: 7,
      type: 'fill',
      question: "Viết hỗn số $2\\frac{1}{10}$ dưới dạng số thập phân: ......",
      answer: '2.1',
      accept: ['2.1', '2,1'],
      explain: "$2\\frac{1}{10} = 2,1$ (hai phẩy một)."
    },
    {
      id: 8,
      type: 'fill',
      question: "Viết hỗn số $3\\frac{17}{100}$ dưới dạng số thập phân: ......",
      answer: '3.17',
      accept: ['3.17', '3,17'],
      explain: "$3\\frac{17}{100} = 3,17$ (ba phẩy mười bảy)."
    },
    {
      id: 9,
      type: 'fill',
      question: "Viết hỗn số $1\\frac{139}{1000}$ dưới dạng số thập phân: ......",
      answer: '1.139',
      accept: ['1.139', '1,139'],
      explain: "$1\\frac{139}{1000} = 1,139$ (một phẩy một trăm ba mươi chín)."
    },
    // ===== PHẦN 2: CẤU TẠO SỐ THẬP PHÂN =====
    {
      id: 10,
      type: 'fill',
      question: "Số thập phân 40,072 có phần nguyên là: ......",
      answer: '40',
      accept: ['40'],
      explain: "Số 40,072: phần nguyên là 40 (các chữ số bên trái dấu phẩy), phần thập phân là 072."
    },
    {
      id: 11,
      type: 'fill',
      question: "Số thập phân 40,072 có phần thập phân là: ......",
      answer: '072',
      accept: ['072', '0,072', '0.072'],
      explain: "Phần thập phân của 40,072 là 072 (các chữ số bên phải dấu phẩy)."
    },
    // ===== PHẦN 3: CHUYỂN PHÂN SỐ THÀNH SỐ THẬP PHÂN =====
    {
      id: 12,
      type: 'fill',
      question: "Chuyển phân số $\\frac{9}{10}$ thành số thập phân: ......",
      answer: '0.9',
      accept: ['0.9', '0,9'],
      explain: "$\\frac{9}{10}$: mẫu số có 1 chữ số 0, dịch dấu phẩy của 9 sang trái 1 chữ số → $0,9$."
    },
    {
      id: 13,
      type: 'fill',
      question: "Chuyển phân số $\\frac{238}{100}$ thành số thập phân: ......",
      answer: '2.38',
      accept: ['2.38', '2,38'],
      explain: "$\\frac{238}{100}$: mẫu số có 2 chữ số 0, dịch dấu phẩy của 238 sang trái 2 chữ số → $2,38$."
    },
    {
      id: 14,
      type: 'fill',
      question: "Chuyển phân số $\\frac{26}{1000}$ thành số thập phân: ......",
      answer: '0.026',
      accept: ['0.026', '0,026'],
      explain: "$\\frac{26}{1000}$: mẫu số có 3 chữ số 0, dịch dấu phẩy của 26 sang trái 3 chữ số → $0,026$."
    },
    {
      id: 15,
      type: 'fill',
      question: "Chuyển phân số $\\frac{3}{5}$ thành số thập phân: ......",
      answer: '0.6',
      accept: ['0.6', '0,6'],
      explain: "$\\frac{3}{5} = \\frac{6}{10} = 0,6$. Nhân cả tử và mẫu với 2 để được mẫu số 10."
    },
  ]
};
