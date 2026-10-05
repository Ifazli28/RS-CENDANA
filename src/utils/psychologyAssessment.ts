import { PsychologyQuestionAnswer } from '../types';

export interface GHQ12QuestionItem {
  number: number; // 1 - 12
  itemType: 'Item Positif' | 'Item Negatif';
  questionText: string;
  options: {
    code: 'A' | 'B' | 'C' | 'D';
    label: string;
    score: number; // Likert 0 - 3: A=0, B=1, C=2, D=3
  }[];
}

export interface DASS21QuestionItem {
  number: number; // 1 - 21
  subscale: 'Depresi' | 'Kecemasan' | 'Stres';
  questionText: string;
  options: {
    code: '0' | '1' | '2' | '3';
    label: string;
    score: number; // 0 - 3
  }[];
}

export const GHQ12_OPTIONS: GHQ12QuestionItem['options'] = [
  { code: 'A', label: 'A: Sama sekali tidak', score: 0 },
  { code: 'B', label: 'B: Tidak lebih dari biasanya', score: 1 },
  { code: 'C', label: 'C: Lebih dari biasanya', score: 2 },
  { code: 'D', label: 'D: Jauh lebih dari biasanya', score: 3 },
];

export const DASS21_OPTIONS: DASS21QuestionItem['options'] = [
  { code: '0', label: '0: Tidak pernah', score: 0 },
  { code: '1', label: '1: Kadang-kadang', score: 1 },
  { code: '2', label: '2: Sering', score: 2 },
  { code: '3', label: '3: Sangat sering', score: 3 },
];

/**
 * BAGIAN 1: Skrining Kesehatan Mental Umum (GHQ-12)
 * Petunjuk: Pilih jawaban berdasarkan kondisi yang Anda rasakan selama 2 minggu terakhir.
 * Metode Skoring GHQ-12 (Metode Likert 0–3):
 * - Item Positif (Soal 1, 3, 4, 7, 8, 12): A = 0, B = 1, C = 2, D = 3
 * - Item Negatif (Soal 2, 5, 6, 9, 10, 11): A = 0, B = 1, C = 2, D = 3
 */
export const GHQ12_QUESTIONS: GHQ12QuestionItem[] = [
  {
    number: 1,
    itemType: 'Item Positif',
    questionText: 'Apakah Anda mampu berkonsentrasi pada apa pun yang sedang Anda lakukan?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 2,
    itemType: 'Item Negatif',
    questionText: 'Apakah Anda kehilangan waktu tidur karena khawatir?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 3,
    itemType: 'Item Positif',
    questionText: 'Apakah Anda merasa memainkan peran yang berguna dalam berbagai hal?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 4,
    itemType: 'Item Positif',
    questionText: 'Apakah Anda merasa mampu mengambil keputusan tentang berbagai hal?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 5,
    itemType: 'Item Negatif',
    questionText: 'Apakah Anda merasa terus-menerus berada di bawah tekanan?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 6,
    itemType: 'Item Negatif',
    questionText: 'Apakah Anda merasa tidak dapat mengatasi kesulitan-kesulitan Anda?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 7,
    itemType: 'Item Positif',
    questionText: 'Apakah Anda mampu menikmati kegiatan sehari-hari Anda?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 8,
    itemType: 'Item Positif',
    questionText: 'Apakah Anda mampu menghadapi masalah-masalah Anda?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 9,
    itemType: 'Item Negatif',
    questionText: 'Apakah Anda merasa tidak bahagia dan depresi?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 10,
    itemType: 'Item Negatif',
    questionText: 'Apakah Anda kehilangan rasa percaya diri?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 11,
    itemType: 'Item Negatif',
    questionText: 'Apakah Anda berpikir bahwa diri Anda tidak berguna?',
    options: GHQ12_OPTIONS,
  },
  {
    number: 12,
    itemType: 'Item Positif',
    questionText: 'Apakah Anda merasa relatif bahagia, secara umum?',
    options: GHQ12_OPTIONS,
  },
];

/**
 * BAGIAN 2: Skala Depresi, Kecemasan, dan Stres (DASS-21)
 * Petunjuk: Berikan penilaian seberapa sering pernyataan berikut berlaku untuk Anda selama seminggu terakhir.
 * Skala: 0: Tidak pernah, 1: Kadang-kadang, 2: Sering, 3: Sangat sering
 */
export const DASS21_QUESTIONS: DASS21QuestionItem[] = [
  {
    number: 1,
    subscale: 'Stres',
    questionText: 'Saya merasa sulit untuk menenangkan diri.',
    options: DASS21_OPTIONS,
  },
  {
    number: 2,
    subscale: 'Kecemasan',
    questionText: 'Saya menyadari mulut saya terasa kering.',
    options: DASS21_OPTIONS,
  },
  {
    number: 3,
    subscale: 'Depresi',
    questionText: 'Saya tidak dapat merasakan perasaan positif sama sekali.',
    options: DASS21_OPTIONS,
  },
  {
    number: 4,
    subscale: 'Kecemasan',
    questionText: 'Saya mengalami kesulitan bernapas (misalnya napas cepat, terengah-engah).',
    options: DASS21_OPTIONS,
  },
  {
    number: 5,
    subscale: 'Depresi',
    questionText: 'Saya merasa sulit untuk memulai melakukan sesuatu.',
    options: DASS21_OPTIONS,
  },
  {
    number: 6,
    subscale: 'Stres',
    questionText: 'Saya cenderung bereaksi berlebihan terhadap situasi.',
    options: DASS21_OPTIONS,
  },
  {
    number: 7,
    subscale: 'Kecemasan',
    questionText: 'Saya merasa gemetar (misalnya pada tangan).',
    options: DASS21_OPTIONS,
  },
  {
    number: 8,
    subscale: 'Stres',
    questionText: 'Saya merasa menggunakan banyak energi gelisah.',
    options: DASS21_OPTIONS,
  },
  {
    number: 9,
    subscale: 'Kecemasan',
    questionText: 'Saya khawatir tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri.',
    options: DASS21_OPTIONS,
  },
  {
    number: 10,
    subscale: 'Depresi',
    questionText: 'Saya merasa tidak ada hal yang dapat dinantikan di masa depan.',
    options: DASS21_OPTIONS,
  },
  {
    number: 11,
    subscale: 'Stres',
    questionText: 'Saya merasa gelisah.',
    options: DASS21_OPTIONS,
  },
  {
    number: 12,
    subscale: 'Stres',
    questionText: 'Saya merasa sulit untuk bersantai.',
    options: DASS21_OPTIONS,
  },
  {
    number: 13,
    subscale: 'Depresi',
    questionText: 'Saya merasa sedih dan tertekan.',
    options: DASS21_OPTIONS,
  },
  {
    number: 14,
    subscale: 'Stres',
    questionText: 'Saya tidak toleran terhadap apa pun yang menghalangi saya melanjutkan apa yang sedang saya lakukan.',
    options: DASS21_OPTIONS,
  },
  {
    number: 15,
    subscale: 'Kecemasan',
    questionText: 'Saya merasa hampir panik.',
    options: DASS21_OPTIONS,
  },
  {
    number: 16,
    subscale: 'Depresi',
    questionText: 'Saya tidak mampu merasa antusias tentang apa pun.',
    options: DASS21_OPTIONS,
  },
  {
    number: 17,
    subscale: 'Depresi',
    questionText: 'Saya merasa saya tidak berharga sebagai seorang manusia.',
    options: DASS21_OPTIONS,
  },
  {
    number: 18,
    subscale: 'Stres',
    questionText: 'Saya merasa agak perasa/sensitif.',
    options: DASS21_OPTIONS,
  },
  {
    number: 19,
    subscale: 'Kecemasan',
    questionText: 'Saya menyadari kerja jantung saya tanpa adanya latihan fisik (misalnya detak jantung meningkat).',
    options: DASS21_OPTIONS,
  },
  {
    number: 20,
    subscale: 'Kecemasan',
    questionText: 'Saya merasa takut tanpa alasan yang jelas.',
    options: DASS21_OPTIONS,
  },
  {
    number: 21,
    subscale: 'Depresi',
    questionText: 'Saya merasa hidup ini tidak berarti.',
    options: DASS21_OPTIONS,
  },
];

export type DASSCategory = 'Normal' | 'Ringan' | 'Sedang' | 'Berat' | 'Sangat Berat';

/**
 * Interpretasi Skor Total GHQ-12 (0 - 36):
 * - Skor 0–11: Kondisi psikologis stabil / Distres rendah.
 * - Skor 12–20: Terdapat indikasi distres emosional sedang.
 * - Skor 21–36: Indikasi distres emosional tinggi (disarankan konsultasi dengan profesional kesehatan mental).
 */
export function interpretGHQ12Score(score: number): string {
  if (score <= 11) {
    return 'Kondisi psikologis stabil / Distres rendah.';
  }
  if (score <= 20) {
    return 'Terdapat indikasi distres emosional sedang.';
  }
  return 'Indikasi distres emosional tinggi (disarankan konsultasi dengan profesional kesehatan mental).';
}

/**
 * Tabel Interpretasi Skor Akhir DASS-21 (Setelah dikalikan 2 untuk menyetarakannya dengan DASS-42):
 * - Depresi   : Normal (0-9), Ringan (10-13), Sedang (14-20), Berat (21-27), Sangat Berat (>=28)
 * - Kecemasan : Normal (0-7), Ringan (8-9), Sedang (10-14), Berat (15-19), Sangat Berat (>=20)
 * - Stres     : Normal (0-14), Ringan (15-18), Sedang (19-25), Berat (26-33), Sangat Berat (>=34)
 */
export function interpretDASSDepression(finalScore: number): DASSCategory {
  if (finalScore <= 9) return 'Normal';
  if (finalScore <= 13) return 'Ringan';
  if (finalScore <= 20) return 'Sedang';
  if (finalScore <= 27) return 'Berat';
  return 'Sangat Berat';
}

export function interpretDASSAnxiety(finalScore: number): DASSCategory {
  if (finalScore <= 7) return 'Normal';
  if (finalScore <= 9) return 'Ringan';
  if (finalScore <= 14) return 'Sedang';
  if (finalScore <= 19) return 'Berat';
  return 'Sangat Berat';
}

export function interpretDASSStress(finalScore: number): DASSCategory {
  if (finalScore <= 14) return 'Normal';
  if (finalScore <= 18) return 'Ringan';
  if (finalScore <= 25) return 'Sedang';
  if (finalScore <= 33) return 'Berat';
  return 'Sangat Berat';
}

export function evaluateFullPsychologyAssessment(
  ghqAnswers: Record<number, { code: string; label: string; score: number }>,
  dassAnswers: Record<number, { code: string; label: string; score: number }>
) {
  const answersDetail: PsychologyQuestionAnswer[] = [];

  // 1. Hitung Skor GHQ-12 (Metode Likert 0-3)
  let ghqScore = 0;
  for (const q of GHQ12_QUESTIONS) {
    const ans = ghqAnswers[q.number];
    const score = ans ? ans.score : 0;
    ghqScore += score;
    answersDetail.push({
      questionNumber: q.number,
      section: 'GHQ-12',
      subscale: q.itemType,
      questionText: q.questionText,
      selectedOptionCode: ans?.code || 'A',
      selectedOptionLabel: ans?.label || 'A: Sama sekali tidak',
      score,
    });
  }
  const ghqMaxScore = 36;
  const ghqInterpretation = interpretGHQ12Score(ghqScore);

  // 2. Hitung Skor DASS-21 (Jumlahkan masing-masing subskala lalu kalikan 2)
  let dassDepressionRaw = 0;
  let dassAnxietyRaw = 0;
  let dassStressRaw = 0;

  for (const q of DASS21_QUESTIONS) {
    const ans = dassAnswers[q.number];
    const score = ans ? ans.score : 0;
    if (q.subscale === 'Depresi') dassDepressionRaw += score;
    if (q.subscale === 'Kecemasan') dassAnxietyRaw += score;
    if (q.subscale === 'Stres') dassStressRaw += score;

    answersDetail.push({
      questionNumber: q.number,
      section: 'DASS-21',
      subscale: q.subscale,
      questionText: `${q.questionText} (${q.subscale})`,
      selectedOptionCode: ans?.code || '0',
      selectedOptionLabel: ans?.label || '0: Tidak pernah',
      score,
    });
  }

  const dassDepressionScore = dassDepressionRaw * 2;
  const dassAnxietyScore = dassAnxietyRaw * 2;
  const dassStressScore = dassStressRaw * 2;

  const dassDepressionCategory = interpretDASSDepression(dassDepressionScore);
  const dassAnxietyCategory = interpretDASSAnxiety(dassAnxietyScore);
  const dassStressCategory = interpretDASSStress(dassStressScore);

  // Ringkasan Evaluasi Terpadu
  const isHighDistress =
    ghqScore >= 21 ||
    dassDepressionCategory === 'Berat' ||
    dassDepressionCategory === 'Sangat Berat' ||
    dassAnxietyCategory === 'Berat' ||
    dassAnxietyCategory === 'Sangat Berat' ||
    dassStressCategory === 'Berat' ||
    dassStressCategory === 'Sangat Berat';

  const isModerateDistress =
    !isHighDistress &&
    (ghqScore >= 12 ||
      dassDepressionCategory === 'Sedang' ||
      dassAnxietyCategory === 'Sedang' ||
      dassStressCategory === 'Sedang');

  let interpretationCategory = 'Kondisi Psikologis Stabil / Distres Rendah';
  let recommendation =
    'DIREKOMENDASIKAN (LAYAK) — Kondisi kesehatan mental stabil, tingkat depresi, kecemasan, dan stres dalam batas wajar.';

  if (isHighDistress) {
    interpretationCategory =
      'Indikasi Distres Emosional Tinggi (Disarankan Konsultasi Profesional Kesehatan Mental)';
    recommendation =
      'PERLU KONSULTASI PROFESIONAL KESEHATAN MENTAL — Disarankan menjalani evaluasi klinis dan pendampingan psikologis lebih lanjut di Poli Psikiatri RS Cendana.';
  } else if (isModerateDistress) {
    interpretationCategory = 'Terdapat Indikasi Distres Emosional Sedang';
    recommendation =
      'LAYAK DENGAN CATATAN OBSERVASI — Disarankan menjaga pola istirahat, manajemen beban kerja, serta konsultasi suportif bila diperlukan.';
  }

  const interpretationSummary = `GHQ-12: Skor ${ghqScore}/36 (${ghqInterpretation}) | DASS-21 (x2): Depresi ${dassDepressionScore} (${dassDepressionCategory}), Kecemasan ${dassAnxietyScore} (${dassAnxietyCategory}), Stres ${dassStressScore} (${dassStressCategory}).`;

  return {
    ghqScore,
    ghqMaxScore,
    ghqInterpretation,
    dassDepressionRaw,
    dassDepressionScore,
    dassDepressionCategory,
    dassAnxietyRaw,
    dassAnxietyScore,
    dassAnxietyCategory,
    dassStressRaw,
    dassStressScore,
    dassStressCategory,
    totalScore: ghqScore,
    maxScore: ghqMaxScore,
    scorePercentage: Math.round(((ghqMaxScore - ghqScore) / ghqMaxScore) * 100),
    interpretationCategory,
    interpretationSummary,
    recommendation,
    answersDetail,
  };
}
