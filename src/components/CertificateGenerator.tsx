import React, { useEffect, useRef } from 'react';
import { PsychologyRecord, ColorBlindResult } from '../types';
import { Download, Award, Printer } from 'lucide-react';

/**
 * Helper untuk menggambar Sertifikat Resmi RS Cendana pada HTML5 Canvas beresolusi tinggi (1600 x 1120)
 * dan menyediakan fitur Download langsung dalam format JPEG (.jpeg).
 */
function drawCertificateBase(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentPrimary: string,
  accentSecondary: string
) {
  // Background Putih Gading / Soft Rose
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.5, '#FFFBFD');
  bgGrad.addColorStop(1, '#FFF5F8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Ornamen Sudut Geometris Halus
  ctx.save();
  ctx.fillStyle = accentPrimary;
  ctx.globalAlpha = 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width, height, 340, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bingkai Luar Ganda (Outer & Inner Border)
  ctx.strokeStyle = accentPrimary;
  ctx.lineWidth = 8;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = accentSecondary;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(52, 52, width - 104, height - 104);

  // Corner Gold / Accent Markers
  const cornerSize = 28;
  ctx.fillStyle = accentPrimary;
  // Top-left
  ctx.fillRect(32, 32, cornerSize, 8);
  ctx.fillRect(32, 32, 8, cornerSize);
  // Top-right
  ctx.fillRect(width - 32 - cornerSize, 32, cornerSize, 8);
  ctx.fillRect(width - 40, 32, 8, cornerSize);
  // Bottom-left
  ctx.fillRect(32, height - 40, cornerSize, 8);
  ctx.fillRect(32, height - 32 - cornerSize, 8, cornerSize);
  // Bottom-right
  ctx.fillRect(width - 32 - cornerSize, height - 40, cornerSize, 8);
  ctx.fillRect(width - 40, height - 32 - cornerSize, 8, cornerSize);

  // Header Logo Medis & Kop Surat RS Cendana
  const cx = width / 2;

  // Emblem Cross Medis Cendana di tengah atas
  ctx.save();
  ctx.fillStyle = accentPrimary;
  ctx.beginPath();
  ctx.arc(cx, 118, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - 6, 100, 12, 36);
  ctx.fillRect(cx - 18, 112, 36, 12);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 26px "Poppins", Arial, sans-serif';
  ctx.fillText('PEMERINTAH KOTA CENDANA — DINAS KESEHATAN TERPADU', cx, 184);

  ctx.fillStyle = accentPrimary;
  ctx.font = 'bold 34px "Poppins", Arial, sans-serif';
  ctx.fillText('RUMAH SAKIT & PARAMEDIC CENDANA MEDICAL CENTER', cx, 224);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 17px "Poppins", Arial, sans-serif';
  ctx.fillText(
    'Instalasi Diagnostik Klinis, Kesehatan Jiwa & Penglihatan Warna Resmi Kota Cendana',
    cx,
    254
  );

  // Garis Pembatas Kop
  ctx.strokeStyle = '#FBCFE8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 276);
  ctx.lineTo(width - 140, 276);
  ctx.stroke();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export const PsychologyCertificateCard: React.FC<{
  record: PsychologyRecord;
  signerName?: string;
}> = ({ record, signerName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ghqScore = record.ghqScore ?? record.totalScore ?? 6;
  const ghqInterp =
    record.ghqInterpretation ||
    (ghqScore <= 11
      ? 'Kondisi psikologis stabil / Distres rendah.'
      : ghqScore <= 20
      ? 'Terdapat indikasi distres emosional sedang.'
      : 'Indikasi distres emosional tinggi (disarankan konsultasi dengan profesional kesehatan mental).');
  const depScore = record.dassDepressionScore ?? 4;
  const depCat = record.dassDepressionCategory || 'Normal';
  const anxScore = record.dassAnxietyScore ?? 4;
  const anxCat = record.dassAnxietyCategory || 'Normal';
  const strScore = record.dassStressScore ?? 8;
  const strCat = record.dassStressCategory || 'Normal';

  const recommendation =
    record.recommendation ||
    'DIREKOMENDASIKAN (LAYAK) — Kondisi kesehatan mental stabil, tingkat depresi, kecemasan, dan stres dalam batas wajar.';
  const doctorSigner =
    signerName || record.examinerName || 'dr. Reyhan Alfarizi, Sp.KJ';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1600;
    const height = 1120;
    const cx = width / 2;

    drawCertificateBase(ctx, width, height, '#D63384', '#20C997');

    // Judul Sertifikat
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 40px "Poppins", Arial, sans-serif';
    ctx.fillText('SERTIFIKAT HASIL TES & EVALUASI PSIKOLOGI', cx, 336);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(
      `Nomor Registrasi: PSY/${record.id.toUpperCase()}/CMC/${record.createdAt.slice(0, 4) || '2026'}`,
      cx,
      368
    );

    // Pengantar
    ctx.fillStyle = '#334155';
    ctx.font = '500 20px "Poppins", Arial, sans-serif';
    ctx.fillText(
      'Tim Penguji Kesehatan Mental & Psikiatri Rumah Sakit Cendana menerangkan bahwa:',
      cx,
      415
    );

    // Nama Peserta
    ctx.fillStyle = '#D63384';
    ctx.font = 'bold 46px "Poppins", Arial, sans-serif';
    ctx.fillText(record.fullName.toUpperCase(), cx, 474);

    // Garis bawah nama
    ctx.strokeStyle = '#D63384';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 280, 490);
    ctx.lineTo(cx + 280, 490);
    ctx.stroke();

    // Box Data Diri Peserta
    ctx.fillStyle = '#FFF5F8';
    ctx.strokeStyle = '#FBCFE8';
    ctx.lineWidth = 2;
    ctx.fillRect(160, 514, width - 320, 118);
    ctx.strokeRect(160, 514, width - 320, 118);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '600 19px "Poppins", Arial, sans-serif';
    ctx.fillText(`Tanggal Lahir / Umur : ${record.birthDate} (${record.age} Tahun)`, 195, 554);
    ctx.fillText(`Jenis Kelamin         : ${record.gender}`, 195, 598);

    ctx.fillText(`Pekerjaan / No. IC    : ${record.occupation} (${record.phoneOrIC})`, 820, 554);
    ctx.fillText(`Tujuan Pemeriksaan   : ${record.purpose}`, 820, 598);

    // Box Hasil Skoring & Interpretasi (GHQ-12 & DASS-21)
    const isLayak = ghqScore <= 20;
    ctx.fillStyle = isLayak ? '#ECFDF5' : '#FFFBEB';
    ctx.strokeStyle = isLayak ? '#6EE7B7' : '#FCD34D';
    ctx.lineWidth = 2.5;
    ctx.fillRect(160, 650, width - 320, 228);
    ctx.strokeRect(160, 650, width - 320, 228);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px "Poppins", Arial, sans-serif';
    ctx.fillText(
      `BAGIAN 1 (GHQ-12): SKOR ${ghqScore} / 36 — ${ghqInterp.toUpperCase()}`,
      cx,
      692
    );

    ctx.fillStyle = isLayak ? '#047857' : '#B45309';
    ctx.font = 'bold 21px "Poppins", Arial, sans-serif';
    ctx.fillText(
      `BAGIAN 2 (DASS-21 × 2): DEPRESI ${depScore} (${depCat.toUpperCase()})  |  KECEMASAN ${anxScore} (${anxCat.toUpperCase()})  |  STRES ${strScore} (${strCat.toUpperCase()})`,
      cx,
      732
    );

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px "Poppins", Arial, sans-serif';
    wrapCanvasText(ctx, `Kesimpulan & Rekomendasi: ${recommendation}`, cx, 778, width - 380, 27);

    // Footer Tanda Tangan & Stempel Resmi
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = '500 18px "Poppins", Arial, sans-serif';
    ctx.fillText(`Diterbitkan di : Kota Cendana`, 160, 935);
    ctx.fillText(`Tanggal Terbit : ${record.createdAt}`, 160, 965);
    ctx.fillText(`Status Dokumen : TERVERIFIKASI RESMI (VALID)`, 160, 995);

    // Stempel Digital Tengah
    ctx.save();
    ctx.strokeStyle = '#20C997';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, 968, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0D9488';
    ctx.font = 'bold 15px "Poppins", Arial, sans-serif';
    ctx.fillText('VERIFIED', cx, 962);
    ctx.fillText('RS CENDANA', cx, 982);
    ctx.restore();

    // Tanda Tangan Dokter Penguji Kanan
    const rightX = width - 380;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '500 18px "Poppins", Arial, sans-serif';
    ctx.fillText('Dokter / Psikiater Pemeriksa,', rightX, 925);

    ctx.fillStyle = '#D63384';
    ctx.font = 'italic bold 26px Georgia, serif';
    ctx.fillText('Cendana Psychiatric Seal', rightX, 972);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px "Poppins", Arial, sans-serif';
    ctx.fillText(doctorSigner, rightX, 1015);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 16px "Poppins", Arial, sans-serif';
    ctx.fillText('Instalasi Kesehatan Jiwa & Psikologi RS Cendana', rightX, 1040);
  }, [
    record,
    ghqScore,
    ghqInterp,
    depScore,
    depCat,
    anxScore,
    anxCat,
    strScore,
    strCat,
    recommendation,
    doctorSigner,
  ]);

  const handleDownloadJpeg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    const safeName = record.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Sertifikat_Psikologi_${safeName}.jpeg`;
    link.href = jpegUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFF5F8] p-3.5 rounded-xl border border-pink-200">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D63384]">
          <Award className="w-4 h-4" />
          <span>Sertifikat Resmi Hasil Tes & Evaluasi Psikologi (Format JPEG)</span>
        </div>
        <button
          type="button"
          onClick={handleDownloadJpeg}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:opacity-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Sertifikat (.JPEG)</span>
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-pink-200 bg-slate-900/5 p-2 shadow-inner">
        <canvas
          ref={canvasRef}
          width={1600}
          height={1120}
          className="w-full h-auto rounded-xl bg-white shadow-sm"
        />
      </div>
    </div>
  );
};

export const ColorBlindCertificateCard: React.FC<{
  result: ColorBlindResult;
  signerName?: string;
}> = ({ result, signerName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const doctorSigner = signerName || 'dr. Nadia Kusuma, S.Ked';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1600;
    const height = 1120;
    const cx = width / 2;

    drawCertificateBase(ctx, width, height, '#0D9488', '#E83E8C');

    // Judul Sertifikat
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 40px "Poppins", Arial, sans-serif';
    ctx.fillText('SERTIFIKAT HASIL PEMERIKSAAN BUTA WARNA (ISHIHARA)', cx, 336);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(
      `Nomor Registrasi: CB/${result.id.toUpperCase()}/CMC/${result.testDate.slice(0, 4) || '2026'}`,
      cx,
      368
    );

    // Pengantar
    ctx.fillStyle = '#334155';
    ctx.font = '500 20px "Poppins", Arial, sans-serif';
    ctx.fillText(
      'Instalasi Diagnostik Visual & Oftalmologi Rumah Sakit Cendana menerangkan bahwa:',
      cx,
      415
    );

    // Nama Peserta
    ctx.fillStyle = '#0D9488';
    ctx.font = 'bold 46px "Poppins", Arial, sans-serif';
    ctx.fillText(result.fullName.toUpperCase(), cx, 474);

    // Garis bawah nama
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 280, 490);
    ctx.lineTo(cx + 280, 490);
    ctx.stroke();

    // Box Ringkasan Pengujian
    ctx.fillStyle = '#F0FDFA';
    ctx.strokeStyle = '#99F6E4';
    ctx.lineWidth = 2;
    ctx.fillRect(160, 518, width - 320, 120);
    ctx.strokeRect(160, 518, width - 320, 120);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '600 20px "Poppins", Arial, sans-serif';
    ctx.fillText(`Metode Pengujian    : 20 Lempeng Pseudoisokromatik Ishihara`, 195, 560);
    ctx.fillText(`Tanggal Pemeriksaan : ${result.testDate}`, 195, 604);

    ctx.fillText(
      `Jawaban Benar / Salah : ${result.correctCount} Benar / ${result.wrongCount} Salah (Dari ${result.totalPlates} Lempeng)`,
      840,
      560
    );
    ctx.fillText(`Skor Akurasi Visual   : ${result.scorePercentage}%`, 840, 604);

    // Box Diagnosis Kategori
    const isNormal = result.category === 'Normal';
    ctx.fillStyle = isNormal ? '#ECFDF5' : '#FFF1F2';
    ctx.strokeStyle = isNormal ? '#34D399' : '#FDA4AF';
    ctx.lineWidth = 2.5;
    ctx.fillRect(160, 662, width - 320, 205);
    ctx.strokeRect(160, 662, width - 320, 205);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px "Poppins", Arial, sans-serif';
    ctx.fillText('KESIMPULAN DIAGNOSIS PENGLIHATAN WARNA:', cx, 708);

    ctx.fillStyle = isNormal ? '#047857' : '#BE123C';
    ctx.font = 'bold 34px "Poppins", Arial, sans-serif';
    ctx.fillText(
      isNormal
        ? 'NORMAL VISION (TIDAK BUTA WARNA)'
        : `INDIKASI DEFISIENSI WARNA: ${result.category.toUpperCase()}`,
      cx,
      755
    );

    const descText = isNormal
      ? 'Peserta memiliki persepsi penglihatan warna spektrum merah-hijau dan biru-kuning yang normal serta memenuhi syarat kelayakan medis.'
      : `Terdeteksi adanya defisiensi persepsi warna kategori ${result.category} berdasarkan pengujian 20 lempeng Ishihara. Disarankan evaluasi oftalmologi lanjutan.`;

    ctx.fillStyle = '#334155';
    ctx.font = '500 19px "Poppins", Arial, sans-serif';
    wrapCanvasText(ctx, descText, cx, 804, width - 380, 28);

    // Footer Tanda Tangan & Stempel
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = '500 18px "Poppins", Arial, sans-serif';
    ctx.fillText(`Diterbitkan di : Kota Cendana`, 160, 935);
    ctx.fillText(`Tanggal Terbit : ${result.testDate}`, 160, 965);
    ctx.fillText(`Status Dokumen : TERVERIFIKASI RESMI (VALID)`, 160, 995);

    // Stempel Digital Tengah
    ctx.save();
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, 968, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0D9488';
    ctx.font = 'bold 15px "Poppins", Arial, sans-serif';
    ctx.fillText('ISHIHARA', cx, 962);
    ctx.fillText('VERIFIED', cx, 982);
    ctx.restore();

    // Tanda Tangan Dokter Pemeriksa Kanan
    const rightX = width - 380;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '500 18px "Poppins", Arial, sans-serif';
    ctx.fillText('Dokter Pemeriksa Diagnostik Visual,', rightX, 925);

    ctx.fillStyle = '#0D9488';
    ctx.font = 'italic bold 26px Georgia, serif';
    ctx.fillText('Cendana Optical Seal', rightX, 972);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px "Poppins", Arial, sans-serif';
    ctx.fillText(doctorSigner, rightX, 1015);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 16px "Poppins", Arial, sans-serif';
    ctx.fillText('Instalasi Diagnostik Mata & Poli Umum RS Cendana', rightX, 1040);
  }, [result, doctorSigner]);

  const handleDownloadJpeg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    const safeName = result.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Sertifikat_Buta_Warna_${safeName}.jpeg`;
    link.href = jpegUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
          <Award className="w-4 h-4 text-[#20C997]" />
          <span>Sertifikat Resmi Hasil Tes Buta Warna (Format JPEG)</span>
        </div>
        <button
          type="button"
          onClick={handleDownloadJpeg}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#20C997] to-[#0D9488] text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:opacity-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Sertifikat (.JPEG)</span>
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-slate-900/5 p-2 shadow-inner">
        <canvas
          ref={canvasRef}
          width={1600}
          height={1120}
          className="w-full h-auto rounded-xl bg-white shadow-sm"
        />
      </div>
    </div>
  );
};
