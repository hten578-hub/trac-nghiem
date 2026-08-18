// ================================================================
//  ĐỀ: Toán Lớp 5 — Viết số đo đại lượng dưới dạng số thập phân
// ================================================================

module.exports = {
  meta: {
    id: 'viet-so-do-dai-luong-lop5',
    title: 'Viết Số Đo Đại Lượng Dạng STP',
    subtitle: 'Đổi đơn vị đo độ dài, khối lượng sang số thập phân',
    icon: '📏',
    timeLimit: 45,
    subject: 'Toán',
    grade: 'Lớp 5',
    group_id: 'toan-lop5',
    group_title: 'Toán Lớp 5',
    group_icon: '📐',
    createdAt: '2026-08-18',
  },
  questions: [

    // ══════════════════════════════════════════════════════════
    //  PHẦN 1 — TRẮC NGHIỆM (Câu 1 – 30)
    // ══════════════════════════════════════════════════════════

    // ── Đo độ dài: m, dm, cm, mm ────────────────────────────
    {
      id: 1,
      question: '6 m 8 dm = …… m. Số thập phân thích hợp là:',
      options: ['A. 6,8', 'B. 6,08', 'C. 6,808', 'D. 68'],
      answer: 0,
      explain: '8 dm = 8/10 m = 0,8 m → 6 m 8 dm = 6,8 m.',
    },
    {
      id: 2,
      question: '15 m 45 cm = …… m. Số thập phân thích hợp là:',
      options: ['A. 15,450', 'B. 15,45', 'C. 15,045', 'D. 154,5'],
      answer: 1,
      explain: '45 cm = 45/100 m = 0,45 m → 15 m 45 cm = 15,45 m.',
    },
    {
      id: 3,
      question: '4 m 5 cm = …… m. Số thập phân thích hợp là:',
      options: ['A. 4,5', 'B. 4,50', 'C. 4,05', 'D. 4,005'],
      answer: 2,
      explain: '5 cm = 5/100 m = 0,05 m → 4 m 5 cm = 4,05 m. (Không có dm nên hàng phần mười là 0)',
    },
    {
      id: 4,
      question: '9 m 3 mm = …… m. Số thập phân thích hợp là:',
      options: ['A. 9,3', 'B. 9,03', 'C. 9,003', 'D. 9,300'],
      answer: 2,
      explain: '3 mm = 3/1000 m = 0,003 m → 9 m 3 mm = 9,003 m.',
    },
    {
      id: 5,
      question: '78 dm = …… m. Số thập phân thích hợp là:',
      options: ['A. 0,78', 'B. 7,8', 'C. 78,0', 'D. 7,08'],
      answer: 1,
      explain: '78 dm = 78/10 m = 7,8 m.',
    },
    {
      id: 6,
      question: '245 cm = …… m. Số thập phân thích hợp là:',
      options: ['A. 2,45', 'B. 24,5', 'C. 0,245', 'D. 2,045'],
      answer: 0,
      explain: '245 cm = 245/100 m = 2,45 m.',
    },

    // ── Đo độ dài: m → km ───────────────────────────────────
    {
      id: 7,
      question: '650 m = …… km. Số thập phân thích hợp là:',
      options: ['A. 6,5', 'B. 0,65', 'C. 0,065', 'D. 65,0'],
      answer: 1,
      explain: '650 m = 650/1000 km = 0,65 km.',
    },
    {
      id: 8,
      question: '85 m = …… km. Số thập phân thích hợp là:',
      options: ['A. 0,85', 'B. 8,5', 'C. 0,085', 'D. 0,0085'],
      answer: 2,
      explain: '85 m = 85/1000 km = 0,085 km.',
    },
    {
      id: 9,
      question: '3 km 500 m = …… km. Số thập phân thích hợp là:',
      options: ['A. 3,5', 'B. 3,05', 'C. 3,005', 'D. 35,0'],
      answer: 0,
      explain: '500 m = 500/1000 km = 0,5 km → 3 km 500 m = 3,5 km.',
    },
    {
      id: 10,
      question: '7 km 65 m = …… km. Số thập phân thích hợp là:',
      options: ['A. 7,65', 'B. 7,065', 'C. 7,605', 'D. 76,5'],
      answer: 1,
      explain: '65 m = 65/1000 km = 0,065 km → 7 km 65 m = 7,065 km.',
    },
    {
      id: 11,
      question: '12 km 9 m = …… km. Số thập phân thích hợp là:',
      options: ['A. 12,9', 'B. 12,09', 'C. 12,009', 'D. 129,0'],
      answer: 2,
      explain: '9 m = 9/1000 km = 0,009 km → 12 km 9 m = 12,009 km.',
    },
    {
      id: 12,
      question: '20 m 4 mm = …… m. Số thập phân thích hợp là:',
      options: ['A. 20,4', 'B. 20,04', 'C. 20,004', 'D. 204,0'],
      answer: 2,
      explain: '4 mm = 4/1000 m = 0,004 m → 20 m 4 mm = 20,004 m.',
    },

    // ── Đo khối lượng: kg, g ────────────────────────────────
    {
      id: 13,
      question: '3 kg 500 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 3,5', 'B. 3,05', 'C. 3,005', 'D. 35,0'],
      answer: 0,
      explain: '500 g = 500/1000 kg = 0,5 kg → 3 kg 500 g = 3,5 kg.',
    },
    {
      id: 14,
      question: '7 kg 45 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 7,45', 'B. 7,045', 'C. 7,405', 'D. 74,5'],
      answer: 1,
      explain: '45 g = 45/1000 kg = 0,045 kg → 7 kg 45 g = 7,045 kg.',
    },
    {
      id: 15,
      question: '12 kg 8 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 12,8', 'B. 12,08', 'C. 12,008', 'D. 128,0'],
      answer: 2,
      explain: '8 g = 8/1000 kg = 0,008 kg → 12 kg 8 g = 12,008 kg.',
    },
    {
      id: 16,
      question: '8 kg 600 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 8,6', 'B. 8,06', 'C. 8,006', 'D. 86,0'],
      answer: 0,
      explain: '600 g = 600/1000 kg = 0,6 kg → 8 kg 600 g = 8,6 kg.',
    },
    {
      id: 17,
      question: '5 kg 95 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 5,95', 'B. 5,095', 'C. 5,905', 'D. 59,5'],
      answer: 1,
      explain: '95 g = 95/1000 kg = 0,095 kg → 5 kg 95 g = 5,095 kg.',
    },
    {
      id: 18,
      question: '10 kg 4 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 10,4', 'B. 10,04', 'C. 10,004', 'D. 104,0'],
      answer: 2,
      explain: '4 g = 4/1000 kg = 0,004 kg → 10 kg 4 g = 10,004 kg.',
    },

    // ── Đo khối lượng: tấn, tạ, kg ──────────────────────────
    {
      id: 19,
      question: '5 tấn 300 kg = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 5,3', 'B. 5,03', 'C. 5,003', 'D. 53,0'],
      answer: 0,
      explain: '300 kg = 300/1000 tấn = 0,3 tấn → 5 tấn 300 kg = 5,3 tấn.',
    },
    {
      id: 20,
      question: '4 tấn 60 kg = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 4,6', 'B. 4,06', 'C. 4,60', 'D. 4,006'],
      answer: 1,
      explain: '60 kg = 60/1000 tấn = 0,06 tấn → 4 tấn 60 kg = 4,06 tấn.',
    },
    {
      id: 21,
      question: '8 tấn 5 kg = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 8,5', 'B. 8,05', 'C. 8,005', 'D. 85,0'],
      answer: 2,
      explain: '5 kg = 5/1000 tấn = 0,005 tấn → 8 tấn 5 kg = 8,005 tấn.',
    },
    {
      id: 22,
      question: '25 tạ = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 0,25', 'B. 2,5', 'C. 25,0', 'D. 0,025'],
      answer: 1,
      explain: '1 tạ = 100 kg; 1 tấn = 1000 kg → 1 tạ = 0,1 tấn. Vậy 25 tạ = 2,5 tấn.',
    },
    {
      id: 23,
      question: '850 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 8,5', 'B. 0,85', 'C. 0,085', 'D. 85,0'],
      answer: 1,
      explain: '850 g = 850/1000 kg = 0,85 kg.',
    },
    {
      id: 24,
      question: '60 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 0,6', 'B. 0,06', 'C. 0,006', 'D. 6,0'],
      answer: 1,
      explain: '60 g = 60/1000 kg = 0,06 kg.',
    },
    {
      id: 25,
      question: '450 kg = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 4,5', 'B. 0,45', 'C. 0,045', 'D. 45,0'],
      answer: 1,
      explain: '450 kg = 450/1000 tấn = 0,45 tấn.',
    },
    {
      id: 26,
      question: '80 kg = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 0,8', 'B. 0,08', 'C. 0,008', 'D. 8,0'],
      answer: 1,
      explain: '80 kg = 80/1000 tấn = 0,08 tấn.',
    },
    {
      id: 27,
      question: '9 g = …… kg. Số thập phân thích hợp là:',
      options: ['A. 0,9', 'B. 0,09', 'C. 0,009', 'D. 0,0009'],
      answer: 2,
      explain: '9 g = 9/1000 kg = 0,009 kg.',
    },
    {
      id: 28,
      question: '18 tạ = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 1,8', 'B. 0,18', 'C. 18,0', 'D. 0,018'],
      answer: 0,
      explain: '18 tạ = 18 × 100 kg = 1800 kg = 1800/1000 tấn = 1,8 tấn.',
    },
    {
      id: 29,
      question: '7 tạ = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 7,0', 'B. 0,7', 'C. 0,07', 'D. 0,007'],
      answer: 1,
      explain: '7 tạ = 700 kg = 700/1000 tấn = 0,7 tấn.',
    },
    {
      id: 30,
      question: '35 kg = …… tấn. Số thập phân thích hợp là:',
      options: ['A. 0,35', 'B. 0,035', 'C. 0,0035', 'D. 3,5'],
      answer: 1,
      explain: '35 kg = 35/1000 tấn = 0,035 tấn.',
    },

    // ══════════════════════════════════════════════════════════
    //  PHẦN 2 — ĐÚNG / SAI (Câu 31 – 40)
    // ══════════════════════════════════════════════════════════

    {
      id: 31,
      question: 'Câu sau ĐÚNG hay SAI?\n3 m 75 cm = 3,75 m',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 0,
      explain: '75 cm = 75/100 m = 0,75 m → 3 m 75 cm = 3,75 m. ✔ ĐÚNG',
    },
    {
      id: 32,
      question: 'Câu sau ĐÚNG hay SAI?\n1 m 1 cm = 1,1 m',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 1,
      explain: '1 cm = 1/100 m = 0,01 m → 1 m 1 cm = 1,01 m (không phải 1,1 m). ✘ SAI',
    },
    {
      id: 33,
      question: 'Câu sau ĐÚNG hay SAI?\n180 cm = 1,8 m',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 0,
      explain: '180 cm = 180/100 m = 1,80 m = 1,8 m. ✔ ĐÚNG',
    },
    {
      id: 34,
      question: 'Câu sau ĐÚNG hay SAI?\n9 m = 0,09 km',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 1,
      explain: '9 m = 9/1000 km = 0,009 km (không phải 0,09 km). ✘ SAI',
    },
    {
      id: 35,
      question: 'Câu sau ĐÚNG hay SAI?\n1 km 80 m = 1,08 km',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 0,
      explain: '80 m = 80/1000 km = 0,08 km → 1 km 80 m = 1,08 km. ✔ ĐÚNG',
    },
    {
      id: 36,
      question: 'Câu sau ĐÚNG hay SAI?\n2 kg 75 g = 2,75 kg',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 1,
      explain: '75 g = 75/1000 kg = 0,075 kg → 2 kg 75 g = 2,075 kg (không phải 2,75 kg). ✘ SAI',
    },
    {
      id: 37,
      question: 'Câu sau ĐÚNG hay SAI?\n6 kg 1 g = 6,001 kg',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 0,
      explain: '1 g = 1/1000 kg = 0,001 kg → 6 kg 1 g = 6,001 kg. ✔ ĐÚNG',
    },
    {
      id: 38,
      question: 'Câu sau ĐÚNG hay SAI?\n1 tấn 20 kg = 1,02 tấn',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 0,
      explain: '20 kg = 20/1000 tấn = 0,02 tấn → 1 tấn 20 kg = 1,02 tấn. ✔ ĐÚNG',
    },
    {
      id: 39,
      question: 'Câu sau ĐÚNG hay SAI?\n320 g = 0,032 kg',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 1,
      explain: '320 g = 320/1000 kg = 0,32 kg (không phải 0,032 kg). ✘ SAI',
    },
    {
      id: 40,
      question: 'Câu sau ĐÚNG hay SAI?\n5 kg = 0,005 tấn',
      options: ['Đ. Đúng', 'S. Sai'],
      answer: 0,
      explain: '5 kg = 5/1000 tấn = 0,005 tấn. ✔ ĐÚNG',
    },
  ],
};
