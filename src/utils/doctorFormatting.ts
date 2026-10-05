import { RoleName } from '../types';

export interface SpecialistConfig {
  id: string;
  label: string;
  degreeSuffix: string; // Gelar pendidikan spesialis di belakang nama
}

export const SPECIALIST_CATEGORIES: SpecialistConfig[] = [
  {
    id: 'Spesialis Obgyn',
    label: 'Spesialis Obgyn (Obstetri & Ginekologi)',
    degreeSuffix: 'Sp.OG',
  },
  {
    id: 'Spesialis Kecantikan',
    label: 'Spesialis Kecantikan (Estetika & Bedah Plastik)',
    degreeSuffix: 'Sp.BP-RE, M.Kes (Aest)',
  },
  {
    id: 'Spesialis Forensik',
    label: 'Spesialis Forensik (Kedokteran Forensik & Medikolegal)',
    degreeSuffix: 'Sp.FM',
  },
  {
    id: 'Spesialis Jantung',
    label: 'Spesialis Jantung (Kardiologi & Pembuluh Darah)',
    degreeSuffix: 'Sp.JP',
  },
  {
    id: 'Spesialis Bedah',
    label: 'Spesialis Bedah',
    degreeSuffix: 'Sp.B',
  },
  {
    id: 'Spesialis Kedokteran Jiwa & Psikiatri',
    label: 'Spesialis Kedokteran Jiwa & Psikiatri',
    degreeSuffix: 'Sp.KJ',
  },
  {
    id: 'Spesialis Kedokteran Gawat Darurat',
    label: 'Spesialis Kedokteran Gawat Darurat',
    degreeSuffix: 'Sp.EM',
  },
];

/**
 * Otomatis menambahkan gelar "dr." di depan nama dan gelar pendidikan di belakang nama
 * untuk Doctor (Level 5), Specialist Doctor (Level 6), maupun jajaran dokter pimpinan (Level 7+).
 */
export function formatDoctorNameWithTitleAndDegree(
  rawName: string,
  role: RoleName,
  specialtyStr?: string
): string {
  const trimmed = rawName.trim();
  if (!trimmed) return trimmed;

  // Hanya terapkan otomatis untuk jabatan Doctor ke atas (Doctor, Specialist Doctor, Heads, Deputy, CEO, Executive Board)
  const doctorRoles: RoleName[] = [
    'Doctor',
    'Specialist Doctor',
    'Heads of Departments',
    'Deputy Chief',
    'Chief Executive Officer',
    'Executive Board',
  ];

  if (!doctorRoles.includes(role)) {
    return trimmed;
  }

  // 1. Pastikan memiliki gelar "dr." di depan nama
  let baseName = trimmed;
  if (/^dr\.\s+/i.test(baseName)) {
    baseName = 'dr. ' + baseName.replace(/^dr\.\s+/i, '');
  } else {
    baseName = 'dr. ' + baseName;
  }

  // 2. Cek apakah sudah ada gelar pendidikan di belakang koma atau apakah perlu disesuaikan dengan spesialisasi
  const specLower = (specialtyStr || '').toLowerCase();
  let targetDegree = '';

  if (specLower.includes('obgyn') || specLower.includes('kandungan')) {
    targetDegree = 'Sp.OG';
  } else if (
    specLower.includes('kecantikan') ||
    specLower.includes('estetika') ||
    specLower.includes('bedah plastik')
  ) {
    targetDegree = 'Sp.BP-RE, M.Kes';
  } else if (specLower.includes('forensik')) {
    targetDegree = 'Sp.FM';
  } else if (specLower.includes('jantung') || specLower.includes('kardiologi')) {
    targetDegree = 'Sp.JP';
  } else if (specLower.includes('bedah toraks')) {
    targetDegree = 'Sp.BTKV';
  } else if (specLower.includes('bedah')) {
    targetDegree = 'Sp.B';
  } else if (specLower.includes('jiwa') || specLower.includes('psikiatri') || specLower.includes('psikologi')) {
    targetDegree = 'Sp.KJ';
  } else if (specLower.includes('gawat darurat')) {
    targetDegree = 'Sp.EM';
  } else if (role === 'Specialist Doctor') {
    targetDegree = 'Sp.PD';
  } else if (role === 'Doctor') {
    targetDegree = 'S.Ked';
  } else {
    targetDegree = 'M.Kes';
  }

  // Jika nama belum memiliki koma gelar di belakang, tambahkan otomatis;
  // Atau jika user memilih salah satu dari 4 spesialis baru (Obgyn, Kecantikan, Forensik, Jantung), pastikan gelar belakangnya sesuai.
  const commaIndex = baseName.indexOf(',');
  if (commaIndex === -1) {
    return `${baseName}, ${targetDegree}`;
  } else {
    // Jika spesialisasi eksplisit diubah ke Obgyn / Kecantikan / Forensik / Jantung / Bedah, perbarui gelar belakang agar sinkron
    if (
      specLower.includes('obgyn') ||
      specLower.includes('kecantikan') ||
      specLower.includes('forensik') ||
      specLower.includes('jantung')
    ) {
      const pureNameOnly = baseName.slice(0, commaIndex).trim();
      return `${pureNameOnly}, ${targetDegree}`;
    }
    return baseName;
  }
}
