import { OfficialLetter, RoleName } from '../types';

export interface LetterTemplateMeta {
  id: string;
  name: string;
  badge: string;
  description: string;
  createDraft: (authorName: string, authorRole: RoleName) => OfficialLetter;
}

const DEFAULT_KOP = {
  kopTitle: 'RUMAH SAKIT KOTABARU ROLEPLAY',
  kopSubtitle: 'RUMAH SAKIT PILLBOX MEDICAL CENTER',
  kopAddress: 'Alamat: Pillbox Medical Center, Koordinat 201 — KotaBaru Roleplay',
};

function formatIndonesianToday(): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const now = new Date();
  return `KotaBaru, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export const LETTER_TEMPLATES: LetterTemplateMeta[] = [
  {
    id: 'kontrak-kerjasama-polisi',
    name: 'Kontrak Kerja Sama (Kepolisian / Instansi)',
    badge: 'Template PDF Resmi',
    description:
      'Template resmi Surat Pengajuan Kontrak Kerja Sama Keamanan & Fasilitas Medis RS KotaBaru sesuai lampiran PDF.',
    createDraft: (authorName, authorRole) => {
      const nowIso = new Date().toISOString();
      return {
        id: `ltr-${Date.now()}`,
        templateId: 'kontrak-kerjasama-polisi',
        ...DEFAULT_KOP,
        nomorSurat: '002/SPK/RSKB/XI/2026',
        lampiran: '1 (Satu) Berkas Draf Kerjasama',
        perihal: 'Pengajuan Kontrak Kerjasama Keamanan & Fasilitas Medis',
        kotaTanggal: 'KotaBaru, 1 November 2026',
        kepadaYthLine1: 'Kepada Yth.',
        kepadaYthLine2: 'Jendral KotaBaru Police Department',
        kepadaYthLine3: 'Di Tempat',
        salamPembuka: 'Dengan hormat,',
        paragrafPembuka:
          'Sehubungan dengan upaya peningkatan efisiensi operasional serta jaminan keamanan harian bagi seluruh staf dan karyawan medis, pihak **Paramedic KotaBaru Roleplay (Pihak Pertama)** bermaksud mengajukan penawaran kontrak kerjasama pasokan keamanan kepada pihak **KotaBaru Police Department (Pihak Kedua)**.',
        sections: [
          {
            id: 'sec-a',
            type: 'table',
            heading: 'A. KETENTUAN PASOKAN KEAMANAN KARYAWAN',
            intro:
              'Pihak Kedua memberikan pasokan Keamanan guna melindungi dan kebutuhan operasional karyawan Rumah Sakit KotaBaru Roleplay dengan rincian sebagai berikut:',
            tableHeaders: ['No', 'Item Pengadaan', 'Kesepakatan', 'Keterangan'],
            tableRows: [
              [
                '1',
                'teaser',
                'Menyesuaikan karyawan EMS',
                '1. Teaser di 1/orang karyawan medis\n2. Setelah di tunjukan KTA resmi dan berseragam medis/duty.',
              ],
              ['2', 'Harga lisensi (senjata, berkendara)', 'Diskon 20%', ''],
            ],
          },
          {
            id: 'sec-b',
            type: 'table',
            heading: 'B. IMBALAN & HAK FASILITAS MEDIS PIHAK KEPOLISIAN KOTABARU',
            intro:
              'Sebagai bentuk imbalan dan dukungan penuh kesehatan kerja, pihak Paramedic KotaBaru Roleplay memberikan jatah pasokan fasilitas medis harian kepada seluruh anggota Kepolisian KotaBaru:',
            tableHeaders: ['No', 'Jenis Paket Medis', 'Kesepakatan', 'Keterangan'],
            tableRows: [
              [
                '1',
                '1 Paket Perban (Isi 10 Buah)',
                '1 Paket / Orang',
                'Pembelian berlaku 2x dalam Sehari',
              ],
              ['2', 'Melakukan evak di tempat', 'Diskon 20%', ''],
            ],
          },
          {
            id: 'sec-b-notice',
            type: 'notice',
            noticeTitle: 'Syarat & Ketentuan Klaim Jatah Medis:',
            noticeBody:
              'Seluruh anggota Kepolisian dapat mengambil jatah medis tersebut dengan syarat wajib datang langsung ke lokasi Rumah Sakit **Pillbox Medical Center (Koordinat 201)** serta menunjukkan **Kartu Tanda Anggota (KTA) Kepolisian** yang aktif kepada petugas medis yang bertugas.',
          },
        ],
        paragrafPenutup:
          'Demikian surat pengajuan kontrak ini kami sampaikan. Atas perhatian, kesediaan, dan kerjasama yang baik dari Pihak Kedua, kami ucapkan terima kasih.',
        signatures: [
          {
            id: 'sig-1',
            topLabel: 'Penanggung Jawab Kontrak',
            name: 'Yuzuriha M Bimantara',
            roleLabel: 'HRD Rumah Sakit',
            isBlankLine: false,
          },
          {
            id: 'sig-2',
            topLabel: 'Persetujuan Pihak Pertama',
            name: 'Antonio Vermilion Century',
            roleLabel: 'Direktur Rumah Sakit',
            isBlankLine: false,
          },
          {
            id: 'sig-3',
            topLabel: 'Persetujuan Pihak Kedua',
            name: '',
            roleLabel: 'Jendral KotaBaru Police Department',
            isBlankLine: true,
          },
        ],
        footerTitle: 'Paramedic KotaBaru Roleplay — Surat Pengajuan Kontrak Kerja Sama',
        fontStyle: 'serif',
        createdBy: authorName,
        createdByRole: authorRole,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    },
  },
  {
    id: 'kontrak-kerjasama-instansi',
    name: 'MoU Kerja Sama Medis (Perusahaan / Komunitas)',
    badge: 'MoU Instansi',
    description:
      'Template perjanjian layanan kesehatan korporasi/instansi dengan tabel kesepakatan biaya dan benefit pasien.',
    createDraft: (authorName, authorRole) => {
      const nowIso = new Date().toISOString();
      return {
        id: `ltr-${Date.now()}`,
        templateId: 'kontrak-kerjasama-instansi',
        ...DEFAULT_KOP,
        nomorSurat: '003/MOU/RSKB/XI/2026',
        lampiran: '1 (Satu) Berkas Rincian Layanan',
        perihal: 'Penawaran Perjanjian Kerja Sama Layanan Kesehatan (MoU)',
        kotaTanggal: formatIndonesianToday(),
        kepadaYthLine1: 'Kepada Yth.',
        kepadaYthLine2: 'Pimpinan Instansi / Perusahaan Mitra',
        kepadaYthLine3: 'Di Tempat',
        salamPembuka: 'Dengan hormat,',
        paragrafPembuka:
          'Dalam rangka mendukung produktivitas serta menjamin kesiapan kesehatan seluruh anggota maupun karyawan mitra, pihak **Rumah Sakit KotaBaru Roleplay (Pihak Pertama)** bermaksud mengajukan perjanjian kerja sama layanan medis bersama **Instansi / Perusahaan Mitra (Pihak Kedua)**.',
        sections: [
          {
            id: 'sec-mou-1',
            type: 'table',
            heading: 'A. FASILITAS & TARIF LAYANAN MEDIS MITRA',
            intro:
              'Berikut adalah rincian hak fasilitas medis yang diberikan kepada anggota Pihak Kedua selama masa kontrak berlangsung:',
            tableHeaders: ['No', 'Jenis Layanan Medis', 'Ketentuan / Kuota', 'Keterangan'],
            tableRows: [
              ['1', 'Pemeriksaan Surat Keterangan Sehat (SKS)', 'Diskon 25%', 'Berlaku untuk seluruh anggota terdaftar'],
              ['2', 'Penanganan Evakuasi Medis & Gawat Darurat', 'Prioritas Triase IGD', 'Menghubungi layanan darurat RSKB'],
              ['3', 'Paket Perban & Obat Farmasi', 'Harga Khusus Mitra', 'Menunjukkan kartu identitas instansi di loket'],
            ],
          },
          {
            id: 'sec-mou-2',
            type: 'notice',
            noticeTitle: 'Ketentuan Administrasi & Masa Berlaku:',
            noticeBody:
              'Perjanjian kerja sama ini berlaku selama **1 (Satu) Bulan** terhitung sejak tanggal penandatanganan di **Pillbox Medical Center (Koordinat 201)** dan dapat diperpanjang berdasarkan kesepakatan kedua belah pihak.',
          },
        ],
        paragrafPenutup:
          'Demikian penawaran kerja sama ini kami sampaikan. Besar harapan kami agar sinergi ini dapat terjalin dengan baik demi pelayanan keselamatan bersama.',
        signatures: [
          {
            id: 'sig-1',
            topLabel: 'Penanggung Jawab Kontrak',
            name: authorName,
            roleLabel: `${authorRole} Rumah Sakit`,
          },
          {
            id: 'sig-2',
            topLabel: 'Mengetahui & Menyetujui',
            name: 'Antonio Vermilion Century',
            roleLabel: 'Direktur Rumah Sakit',
          },
          {
            id: 'sig-3',
            topLabel: 'Persetujuan Pihak Kedua',
            name: '',
            roleLabel: 'Pimpinan Instansi Mitra',
            isBlankLine: true,
          },
        ],
        footerTitle: 'Paramedic KotaBaru Roleplay — Perjanjian Kerja Sama Layanan Medis',
        fontStyle: 'serif',
        createdBy: authorName,
        createdByRole: authorRole,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    },
  },
  {
    id: 'surat-edaran-resmi',
    name: 'Surat Edaran / Pengumuman Resmi',
    badge: 'Edaran Internal/Publik',
    description:
      'Template surat edaran resmi Rumah Sakit KotaBaru untuk pengumuman kebijakan, SOP baru, atau informasi publik.',
    createDraft: (authorName, authorRole) => {
      const nowIso = new Date().toISOString();
      return {
        id: `ltr-${Date.now()}`,
        templateId: 'surat-edaran-resmi',
        ...DEFAULT_KOP,
        nomorSurat: '004/SE/RSKB/XI/2026',
        lampiran: '-',
        perihal: 'Surat Edaran Penyesuaian Jam Operasional & Prosedur Pelayanan',
        kotaTanggal: formatIndonesianToday(),
        kepadaYthLine1: 'Kepada Yth.',
        kepadaYthLine2: 'Seluruh Staff Medis & Warga KotaBaru',
        kepadaYthLine3: 'Di Tempat',
        salamPembuka: 'Dengan hormat,',
        paragrafPembuka:
          'Sehubungan dengan peningkatan kualitas pelayanan kesehatan di lingkungan **Rumah Sakit Pillbox Medical Center (Koordinat 201)**, Manajemen **Rumah Sakit KotaBaru Roleplay** menyampaikan beberapa ketentuan penting yang wajib diperhatikan dan dipatuhi bersama.',
        sections: [
          {
            id: 'sec-se-1',
            type: 'list',
            heading: 'A. POKOK-POKOK KEBIJAKAN PELAYANAN',
            intro: 'Adapun poin-poin penyesuaian yang mulai berlaku sejak tanggal diterbitkannya surat ini meliputi:',
            listStyle: 'numbered',
            listItems: [
              'Seluruh staf medis yang sedang bertugas (**On-Duty**) wajib menggunakan seragam dinas lengkap dan atribut KTA resmi Rumah Sakit.',
              'Pelayanan **Loket Farmasi** melayani pembelian paket perban dan obat antidepresan dengan verifikasi KTP/Kartu Pasien secara langsung.',
              'Pengajuan Surat Keterangan Sehat (SKS), Tes Psikologi, dan Operasi Plastik diproses secara berurutan melalui Portal Resmi RS KotaBaru.',
            ],
          },
          {
            id: 'sec-se-2',
            type: 'notice',
            noticeTitle: 'Perhatian Khusus:',
            noticeBody:
              'Setiap pelanggaran terhadap ketentuan operasional akan ditindaklanjuti sesuai **Regulasi & Kode Etik Paramedic KotaBaru** oleh tim Human Resources Department (HRD).',
          },
        ],
        paragrafPenutup:
          'Demikian surat edaran ini disampaikan untuk dilaksanakan dengan penuh tanggung jawab. Atas perhatian dan kerja samanya kami ucapkan terima kasih.',
        signatures: [
          {
            id: 'sig-1',
            topLabel: 'Diterbitkan Oleh',
            name: authorName,
            roleLabel: `${authorRole}`,
          },
          {
            id: 'sig-2',
            topLabel: 'Mengetahui',
            name: 'Antonio Vermilion Century',
            roleLabel: 'Direktur Rumah Sakit',
          },
        ],
        footerTitle: 'Paramedic KotaBaru Roleplay — Surat Edaran Resmi Rumah Sakit',
        fontStyle: 'serif',
        createdBy: authorName,
        createdByRole: authorRole,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    },
  },
  {
    id: 'surat-tugas-staff',
    name: 'Surat Tugas / Penunjukan Resmi Staff',
    badge: 'Kepegawaian HRD',
    description:
      'Template surat tugas, mandat penempatan divisi, atau penugasan acara khusus bagi staf medis RS KotaBaru.',
    createDraft: (authorName, authorRole) => {
      const nowIso = new Date().toISOString();
      return {
        id: `ltr-${Date.now()}`,
        templateId: 'surat-tugas-staff',
        ...DEFAULT_KOP,
        nomorSurat: '005/ST/RSKB/XI/2026',
        lampiran: '-',
        perihal: 'Surat Tugas Penugasan Tim Medis Lapangan',
        kotaTanggal: formatIndonesianToday(),
        kepadaYthLine1: 'Kepada Yth.',
        kepadaYthLine2: 'Personel Medis Yang Ditunjuk',
        kepadaYthLine3: 'Di Tempat',
        salamPembuka: 'Dengan hormat,',
        paragrafPembuka:
          'Berdasarkan kebutuhan operasional dan kesiapsiagaan medis **Rumah Sakit KotaBaru Roleplay**, Manajemen menugaskan personel berikut untuk melaksanakan tugas pelayanan medis serta koordinasi lapangan sesuai jadwal yang ditetapkan.',
        sections: [
          {
            id: 'sec-st-1',
            type: 'table',
            heading: 'A. DAFTAR PERSONEL YANG DITUGASKAN',
            intro: 'Berikut adalah daftar staf medis yang diberikan mandat tugas:',
            tableHeaders: ['No', 'Nama Staff Medis', 'Jabatan', 'Penugasan & Lokasi'],
            tableRows: [
              ['1', 'dr. Farhan Alamsyah, Sp.JP', 'Doctor Specialist', 'Tim Siaga Medis — Pillbox Medical Center'],
              ['2', 'Raka Mahendra', 'Nurse', 'Unit Ambulans & Evakuasi Lapangan'],
            ],
          },
          {
            id: 'sec-st-2',
            type: 'paragraph',
            heading: 'B. KETENTUAN PELAKSANAAN TUGAS',
            body: 'Personel yang namanya tercantum di atas wajib melaporkan kesiapan kepada **HRD / Pimpinan Jaga** sebelum bertugas, menjaga kelengkapan peralatan medis (P3K, tandu, perban), serta menyerahkan laporan hasil penugasan setelah kegiatan selesai.',
          },
        ],
        paragrafPenutup:
          'Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh dedikasi dan integritas profesi medis.',
        signatures: [
          {
            id: 'sig-1',
            topLabel: 'Kepala Bagian HRD',
            name: authorName,
            roleLabel: `${authorRole}`,
          },
          {
            id: 'sig-2',
            topLabel: 'Disetujui Oleh',
            name: 'Antonio Vermilion Century',
            roleLabel: 'Direktur Rumah Sakit',
          },
        ],
        footerTitle: 'Paramedic KotaBaru Roleplay — Surat Tugas Resmi',
        fontStyle: 'serif',
        createdBy: authorName,
        createdByRole: authorRole,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    },
  },
];
