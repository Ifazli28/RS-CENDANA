import { RoleName } from '../types';

export interface SpecialistConfig {
  id: string;
  label: string;
  degreeSuffix: string; // Gelar pendidikan spesialis di belakang nama
  description?: string;
}

export const SPECIALIST_CATEGORIES: SpecialistConfig[] = [
  {
    id: 'Spesialis Anak',
    label: 'Dokter Spesialis Anak (Sp.A)',
    degreeSuffix: 'Sp.A',
    description: 'Menangani kesehatan fisik, mental, dan perkembangan anak dari bayi hingga remaja.',
  },
  {
    id: 'Spesialis Penyakit Dalam',
    label: 'Dokter Spesialis Penyakit Dalam (Sp.PD)',
    degreeSuffix: 'Sp.PD',
    description: 'Menangani berbagai penyakit organ dalam pada orang dewasa dan lansia (internis).',
  },
  {
    id: 'Spesialis Bedah',
    label: 'Dokter Spesialis Bedah (Sp.B)',
    degreeSuffix: 'Sp.B',
    description: 'Menangani prosedur pembedahan untuk penyakit atau kondisi darurat.',
  },
  {
    id: 'Spesialis Bedah Ortopedi & Traumatologi',
    label: 'Dokter Spesialis Bedah Ortopedi & Traumatologi (Sp.OT / Sp.BO)',
    degreeSuffix: 'Sp.OT',
    description: 'Menangani masalah pada tulang, sendi, otot, dan cedera akibat trauma.',
  },
  {
    id: 'Spesialis Bedah Saraf',
    label: 'Dokter Spesialis Bedah Saraf (Sp.BS)',
    degreeSuffix: 'Sp.BS',
    description: 'Melakukan diagnosis dan pembedahan pada sistem saraf (otak, sumsum tulang belakang).',
  },
  {
    id: 'Spesialis Bedah Onkologi',
    label: 'Dokter Spesialis Bedah Onkologi (Sp.B.Onk)',
    degreeSuffix: 'Sp.B.Onk',
    description: 'Subspesialis bedah untuk penanganan dan diagnosis tumor serta kanker.',
  },
  {
    id: 'Spesialis Urologi',
    label: 'Dokter Spesialis Urologi (Sp.U)',
    degreeSuffix: 'Sp.U',
    description: 'Menangani gangguan saluran kemih serta organ reproduksi pria (ginjal, prostat, kandung kemih).',
  },
  {
    id: 'Spesialis Jantung',
    label: 'Dokter Spesialis Jantung dan Pembuluh Darah (Sp.JP)',
    degreeSuffix: 'Sp.JP',
    description: 'Menangani penyakit jantung dan pembuluh darah (kardiologi).',
  },
  {
    id: 'Spesialis Saraf / Neurologi',
    label: 'Dokter Spesialis Saraf / Neurologi (Sp.N / Sp.S)',
    degreeSuffix: 'Sp.N',
    description: 'Menangani gangguan otak, sumsum tulang belakang, dan saraf tepi (stroke, epilepsi, migrain).',
  },
  {
    id: 'Spesialis Obgyn',
    label: 'Dokter Spesialis Obstetri dan Ginekologi / Kandungan (Sp.OG)',
    degreeSuffix: 'Sp.OG',
    description: 'Menangani kesehatan sistem reproduksi wanita, kehamilan, dan persalinan.',
  },
  {
    id: 'Spesialis Kulit, Kelamin, dan Venereologi',
    label: 'Dokter Spesialis Kulit, Kelamin, dan Venereologi (Sp.KK / Sp.DVE)',
    degreeSuffix: 'Sp.DVE',
    description: 'Menangani masalah kulit, rambut, kuku, serta infeksi menular seksual.',
  },
  {
    id: 'Spesialis Mata',
    label: 'Dokter Spesialis Mata (Sp.M)',
    degreeSuffix: 'Sp.M',
    description: 'Menangani gangguan penglihatan dan penyakit mata.',
  },
  {
    id: 'Spesialis THT-KL',
    label: 'Dokter Spesialis Telinga, Hidung, Tenggorokan, dan Bedah Kepala Leher (Sp.THT-KL)',
    degreeSuffix: 'Sp.THT-KL',
    description: 'Menangani masalah pada area THT serta struktur kepala dan leher.',
  },
  {
    id: 'Spesialis Paru & Pernapasan',
    label: 'Dokter Spesialis Paru dan Pernapasan (Sp.P)',
    degreeSuffix: 'Sp.P',
    description: 'Menangani penyakit sistem pernapasan (asma, TBC, pneumonia).',
  },
  {
    id: 'Spesialis Kedokteran Jiwa & Psikiatri',
    label: 'Dokter Spesialis Kedokteran Jiwa / Psikiater (Sp.KJ)',
    degreeSuffix: 'Sp.KJ',
    description: 'Menangani kesehatan mental dan gangguan kejiwaan.',
  },
  {
    id: 'Spesialis Kedokteran Fisik & Rehabilitasi',
    label: 'Dokter Spesialis Kedokteran Fisik dan Rehabilitasi (Sp.KFR)',
    degreeSuffix: 'Sp.KFR',
    description: 'Membantu pemulihan fungsi tubuh pasien setelah cedera, stroke, atau operasi.',
  },
  {
    id: 'Spesialis Radiologi',
    label: 'Dokter Spesialis Radiologi (Sp.Rad)',
    degreeSuffix: 'Sp.Rad',
    description: 'Menangani pembacaan hasil pencitraan medis (Rontgen, USG, CT Scan, MRI).',
  },
  {
    id: 'Spesialis Patologi Klinik',
    label: 'Dokter Spesialis Patologi Klinik (Sp.PK)',
    degreeSuffix: 'Sp.PK',
    description: 'Melakukan pemeriksaan laboratorium medis (darah, urin, cairan tubuh).',
  },
  {
    id: 'Spesialis Kecantikan',
    label: 'Spesialis Kecantikan (Estetika & Bedah Plastik)',
    degreeSuffix: 'Sp.BP-RE, M.Kes (Aest)',
    description: 'Menangani estetika medis, perawatan kecantikan, serta bedah plastik rekonstruksi.',
  },
  {
    id: 'Spesialis Forensik',
    label: 'Spesialis Forensik (Kedokteran Forensik & Medikolegal)',
    degreeSuffix: 'Sp.FM',
    description: 'Menangani kedokteran forensik, visum, dan medikolegal rumah sakit.',
  },
  {
    id: 'Spesialis Kedokteran Gawat Darurat',
    label: 'Spesialis Kedokteran Gawat Darurat (Sp.EM)',
    degreeSuffix: 'Sp.EM',
    description: 'Menangani kegawatdaruratan medis dan triase instalasi gawat darurat.',
  },
];

function resolveSpecialistDegree(specialtyStr?: string): { degree: string; isExplicitSpecialty: boolean } {
  const specLower = (specialtyStr || '').trim().toLowerCase();
  if (!specLower) return { degree: '', isExplicitSpecialty: false };

  // Cek kecocokan langsung dengan ID kategori spesialis
  const exactCat = SPECIALIST_CATEGORIES.find(
    (c) => c.id.toLowerCase() === specLower || c.label.toLowerCase() === specLower
  );
  if (exactCat) {
    return {
      degree: exactCat.id === 'Spesialis Kecantikan' ? 'Sp.BP-RE, M.Kes' : exactCat.degreeSuffix,
      isExplicitSpecialty: true,
    };
  }

  const hasCode = (code: string) => new RegExp(`(^|[^a-z0-9.])${code.replace(/\./g, '\\.')}(?=$|[^a-z0-9])`, 'i').test(specLower);

  // Pencocokan kata kunci paling spesifik lebih dahulu
  if (specLower.includes('bedah saraf') || hasCode('sp.bs')) {
    return { degree: 'Sp.BS', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('ortopedi') ||
    specLower.includes('traumatologi') ||
    hasCode('sp.ot') ||
    hasCode('sp.bo')
  ) {
    return { degree: 'Sp.OT', isExplicitSpecialty: true };
  }
  if (specLower.includes('onkologi') || hasCode('sp.b.onk')) {
    return { degree: 'Sp.B.Onk', isExplicitSpecialty: true };
  }
  if (specLower.includes('bedah toraks') || hasCode('sp.btkv')) {
    return { degree: 'Sp.BTKV', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('kecantikan') ||
    specLower.includes('estetika') ||
    specLower.includes('bedah plastik') ||
    hasCode('sp.bp-re')
  ) {
    return { degree: 'Sp.BP-RE, M.Kes', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('tht') ||
    specLower.includes('telinga') ||
    specLower.includes('kepala leher')
  ) {
    return { degree: 'Sp.THT-KL', isExplicitSpecialty: true };
  }
  if (specLower.includes('bedah') || hasCode('sp.b')) {
    return { degree: 'Sp.B', isExplicitSpecialty: true };
  }
  if (specLower.includes('anak') || hasCode('sp.a')) {
    return { degree: 'Sp.A', isExplicitSpecialty: true };
  }
  if (specLower.includes('penyakit dalam') || specLower.includes('internis') || hasCode('sp.pd')) {
    return { degree: 'Sp.PD', isExplicitSpecialty: true };
  }
  if (specLower.includes('urologi') || hasCode('sp.u')) {
    return { degree: 'Sp.U', isExplicitSpecialty: true };
  }
  if (specLower.includes('jantung') || specLower.includes('kardiologi') || hasCode('sp.jp')) {
    return { degree: 'Sp.JP', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('saraf') ||
    specLower.includes('neurologi') ||
    hasCode('sp.n') ||
    hasCode('sp.s')
  ) {
    return { degree: 'Sp.N', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('obgyn') ||
    specLower.includes('obstetri') ||
    specLower.includes('ginekologi') ||
    specLower.includes('kandungan') ||
    hasCode('sp.og')
  ) {
    return { degree: 'Sp.OG', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('kulit') ||
    specLower.includes('kelamin') ||
    specLower.includes('venereologi') ||
    hasCode('sp.kk') ||
    hasCode('sp.dve')
  ) {
    return { degree: 'Sp.DVE', isExplicitSpecialty: true };
  }
  if (specLower.includes('mata') || hasCode('sp.m')) {
    return { degree: 'Sp.M', isExplicitSpecialty: true };
  }
  if (specLower.includes('paru') || specLower.includes('pernapasan') || hasCode('sp.p')) {
    return { degree: 'Sp.P', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('jiwa') ||
    specLower.includes('psikiatri') ||
    specLower.includes('psikiater') ||
    specLower.includes('psikologi') ||
    hasCode('sp.kj')
  ) {
    return { degree: 'Sp.KJ', isExplicitSpecialty: true };
  }
  if (
    specLower.includes('kedokteran fisik') ||
    specLower.includes('rehabilitasi') ||
    hasCode('sp.kfr')
  ) {
    return { degree: 'Sp.KFR', isExplicitSpecialty: true };
  }
  if (specLower.includes('radiologi') || hasCode('sp.rad')) {
    return { degree: 'Sp.Rad', isExplicitSpecialty: true };
  }
  if (specLower.includes('patologi klinik') || hasCode('sp.pk')) {
    return { degree: 'Sp.PK', isExplicitSpecialty: true };
  }
  if (specLower.includes('forensik') || hasCode('sp.fm')) {
    return { degree: 'Sp.FM', isExplicitSpecialty: true };
  }
  if (specLower.includes('gawat darurat') || hasCode('sp.em')) {
    return { degree: 'Sp.EM', isExplicitSpecialty: true };
  }

  return { degree: '', isExplicitSpecialty: false };
}

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

  // Hanya terapkan otomatis untuk jabatan Doctor ke atas (Doctor, Doctor Specialist, HRD, Sec & Treas, Deputy Dir, Director, Hospital Comitee)
  const doctorRoles: RoleName[] = [
    'Doctor',
    'Doctor Specialist',
    'Human Resources Department',
    'Secretary & Treasurer',
    'Deputy Director',
    'Director',
    'Hospital Comitee',
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
  const resolved = resolveSpecialistDegree(specialtyStr);
  let targetDegree = resolved.degree;

  if (!targetDegree) {
    if (role === 'Doctor Specialist') {
      targetDegree = 'Sp.PD';
    } else if (role === 'Doctor') {
      targetDegree = 'S.Ked';
    } else {
      targetDegree = 'M.Kes';
    }
  }

  // Jika nama belum memiliki koma gelar di belakang, tambahkan otomatis;
  // Jika user memilih spesialisasi eksplisit dari daftar spesialis, perbarui gelar belakang agar sinkron.
  const commaIndex = baseName.indexOf(',');
  if (commaIndex === -1) {
    return `${baseName}, ${targetDegree}`;
  } else {
    if (resolved.isExplicitSpecialty) {
      const pureNameOnly = baseName.slice(0, commaIndex).trim();
      return `${pureNameOnly}, ${targetDegree}`;
    }
    return baseName;
  }
}
