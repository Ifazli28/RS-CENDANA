import React, { useState, useEffect, useRef } from 'react';
import { ISHIHARA_20_PLATES, IshiharaPlateData } from '../utils/ishiharaPlates';
import { useApp } from '../context/AppContext';
import { Eye, Clock, CheckCircle2, RotateCcw, AlertCircle, Play, ArrowRight, ArrowLeft } from 'lucide-react';

const IshiharaCanvasPlate: React.FC<{ plate: IshiharaPlateData }> = ({ plate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (plate.imageUrl) return; // Ditampilkan langsung via tag img untuk ketajaman maksimal
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    const radius = 146;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Clear main canvas
    ctx.clearRect(0, 0, size, size);

    // 2. White circular disc background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // 3. Create offscreen canvas to sample the number shape
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const text = plate.expectedAnswer;
    const isSingle = text.length <= 1;
    const fontSize = isSingle ? 172 : 126;

    offCtx.font = `900 ${fontSize}px "Arial Black", "Montserrat", "Poppins", sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = '#000000';
    offCtx.fillText(text, cx, cy + (isSingle ? 4 : 2));

    const imgData = offCtx.getImageData(0, 0, size, size).data;

    const isInsideNumber = (x: number, y: number): boolean => {
      const px = Math.round(x);
      const py = Math.round(y);
      if (px < 0 || px >= size || py < 0 || py >= size) return false;
      return imgData[(py * size + px) * 4 + 3] > 80;
    };

    // 4. Deterministic PRNG seeded by plateNumber for consistent, flicker-free rendering
    let seed = plate.plateNumber * 7919 + 104729;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // 5. Generate packed dots across the entire circular disc (setipe dengan gambar referensi)
    const dots: { x: number; y: number; r: number; color: string }[] = [];
    const radii = [9.5, 8.0, 6.8, 5.5, 4.4, 3.4, 2.6];

    for (const r of radii) {
      const attempts = r >= 6.8 ? 750 : 1300;
      for (let attempt = 0; attempt < attempts; attempt++) {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * (radius - r - 2);
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        let overlaps = false;
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const dx = d.x - x;
          const dy = d.y - y;
          if (dx * dx + dy * dy < (d.r + r + 0.6) * (d.r + r + 0.6)) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) continue;

        // Check if this dot is in the number or background
        const inNum = isInsideNumber(x, y);
        const palette = inNum ? plate.fgColors : plate.bgColors;
        const color = palette[Math.floor(rand() * palette.length)];

        dots.push({ x, y, r, color });
      }
    }

    // 6. Draw all dots
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    }
  }, [plate]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#F8FAFC] rounded-3xl border border-slate-200/80 shadow-2xs">
      <div className="rounded-full bg-white p-2 shadow-md border border-slate-100 flex items-center justify-center overflow-hidden">
        {plate.imageUrl ? (
          <img
            src={plate.imageUrl}
            alt={plate.plateDescription}
            className="w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] rounded-full object-cover"
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] rounded-full"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold tracking-wide uppercase">
          {plate.levelBadge}
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-bold">
          {plate.plateDescription}
        </span>
      </div>
    </div>
  );
};

export const IshiharaTestSection: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { submitColorBlindResult } = useApp();
  const [step, setStep] = useState<'input_name' | 'instructions' | 'testing' | 'result'>('input_name');
  const [fullName, setFullName] = useState('');
  const [useTimer, setUseTimer] = useState(true);
  const [currentPlateIdx, setCurrentPlateIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(12);
  const [answers, setAnswers] = useState<
    { plateNumber: number; expected: string; userAnswer: string; isCorrect: boolean; type: string }[]
  >([]);
  const [finalResult, setFinalResult] = useState<{
    correctCount: number;
    wrongCount: number;
    scorePercentage: number;
    category: 'Normal' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia';
  } | null>(null);

  const currentPlate = ISHIHARA_20_PLATES[currentPlateIdx];
  const progressPercent = Math.round(((currentPlateIdx + 1) / ISHIHARA_20_PLATES.length) * 100);

  useEffect(() => {
    if (step !== 'testing' || !useTimer) return;
    setTimeLeft(12);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSelectAnswer('Tidak Ada Angka');
          return 12;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, currentPlateIdx, useTimer]);

  const handleSelectAnswer = (submittedAnswer: string) => {
    const cleanAns = submittedAnswer.trim() || 'Tidak Ada Angka';
    const isCorrect = cleanAns === currentPlate.expectedAnswer;
    const newEntry = {
      plateNumber: currentPlate.plateNumber,
      expected: currentPlate.expectedAnswer,
      userAnswer: cleanAns,
      isCorrect,
      type: currentPlate.plateType,
    };

    const updatedAnswers = [...answers.slice(0, currentPlateIdx), newEntry];
    setAnswers(updatedAnswers);
    setSelectedChoice('');

    if (currentPlateIdx + 1 < ISHIHARA_20_PLATES.length) {
      setCurrentPlateIdx((prev) => prev + 1);
    } else {
      const correctCount = updatedAnswers.filter((a) => a.isCorrect).length;
      const wrongCount = ISHIHARA_20_PLATES.length - correctCount;
      const scorePercentage = Math.round((correctCount / ISHIHARA_20_PLATES.length) * 100);

      let category: 'Normal' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' = 'Normal';
      if (correctCount < 16) {
        const protanErrors = updatedAnswers.filter(
          (a) => !a.isCorrect && a.type.includes('Protan')
        ).length;
        const deutanErrors = updatedAnswers.filter(
          (a) => !a.isCorrect && a.type.includes('Deutan')
        ).length;
        const tritanErrors = updatedAnswers.filter(
          (a) => !a.isCorrect && a.type.includes('Tritan')
        ).length;

        if (tritanErrors >= 2 && tritanErrors >= protanErrors && tritanErrors >= deutanErrors) {
          category = 'Tritanopia';
        } else if (protanErrors >= deutanErrors) {
          category = 'Protanopia';
        } else {
          category = 'Deuteranopia';
        }
      }

      const resObj = { correctCount, wrongCount, scorePercentage, category };
      setFinalResult(resObj);
      setStep('result');

      submitColorBlindResult({
        fullName: fullName.trim(),
        correctCount,
        wrongCount,
        totalPlates: 20,
        scorePercentage,
        category,
        answersDetail: updatedAnswers,
      });
    }
  };

  const handlePrevPlate = () => {
    if (currentPlateIdx > 0) {
      setCurrentPlateIdx((prev) => prev - 1);
    } else {
      setStep('instructions');
    }
  };

  const resetTest = () => {
    setStep('input_name');
    setCurrentPlateIdx(0);
    setAnswers([]);
    setSelectedChoice('');
    setFinalResult(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-red-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9E1B21] to-[#7F1D1D] flex items-center justify-center text-white">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Uji Penglihatan Warna — 20 Lempeng Ishihara
            </h3>
            <p className="text-xs text-slate-500">
              Lempeng Kontras Tinggi (Easy) · 3 Opsi Angka & 1 Opsi Tidak Ada Angka
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        )}
      </div>

      {step === 'input_name' && (
        <div className="max-w-lg mx-auto py-4 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Lengkap Peserta Tes <span className="text-[#9E1B21]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-600 focus:outline-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/40 border border-red-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Gunakan Timer Otomatis (12 Detik / Lempeng)
              </p>
              <p className="text-xs text-slate-500">
                Otomatis berpindah ke lempeng berikutnya jika waktu habis
              </p>
            </div>
            <input
              type="checkbox"
              checked={useTimer}
              onChange={(e) => setUseTimer(e.target.checked)}
              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
            />
          </div>

          <button
            disabled={!fullName.trim()}
            onClick={() => setStep('instructions')}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white font-semibold text-sm shadow-sm hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjut ke Instruksi Pemeriksaan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 'instructions' && (
        <div className="max-w-xl mx-auto py-2 space-y-6">
          <div className="p-5 rounded-2xl bg-red-50/40 border border-red-200/70 space-y-3">
            <div className="flex items-center gap-2 text-[#7F1D1D] font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Persiapan & Instruksi Penting Sebelum Memulai</span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700 list-disc pl-5">
              <li>
                <strong>Pencahayaan Sesuai:</strong> Pastikan ruangan cukup terang dan tingkat kecerahan layar berada pada level optimal (70%–100%).
              </li>
              <li>
                <strong>Jarak Layar Sekitar 50 cm:</strong> Posisikan mata Anda sejajar dengan layar pada jarak kurang lebih 50 cm.
              </li>
              <li>
                <strong>Matikan Eye Comfort / Night Shield:</strong> Wajib menonaktifkan fitur filter cahaya biru agar warna lempeng Ishihara akurat.
              </li>
              <li>
                <strong>Pilihan Ganda (3 Opsi Angka + 1 Opsi Tidak Ada Angka):</strong> Pada setiap lempeng, pilih salah satu dari 3 opsi angka yang tampak pada lingkaran Ishihara, atau pilih <em>Tidak Ada Angka</em>.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setStep('input_name')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              Kembali
            </button>
            <button
              onClick={() => {
                setCurrentPlateIdx(0);
                setAnswers([]);
                setSelectedChoice('');
                setStep('testing');
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white font-semibold text-sm shadow-sm hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Mulai Tes 20 Lempeng Ishihara Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {step === 'testing' && (
        <div className="space-y-6">
          {/* Top Progress Header matching screenshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">
                Lempeng {currentPlateIdx + 1} dari {ISHIHARA_20_PLATES.length}
              </div>
              <div className="flex items-center gap-3">
                {useTimer && (
                  <div className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 flex items-center gap-1 text-xs font-mono font-bold text-rose-600 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft} s</span>
                  </div>
                )}
                <span className="text-xs font-extrabold text-rose-600 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-[#9E1B21] transition-all duration-200 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main 2-Column Layout matching reference screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <IshiharaCanvasPlate plate={currentPlate} />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                  SOAL KE-{currentPlateIdx + 1} / {ISHIHARA_20_PLATES.length}
                </p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  Angka berapa yang tampak pada lingkaran Ishihara ini?
                </h4>
                <p className="text-xs sm:text-sm text-slate-500">
                  Pilih salah satu jawaban di bawah ini dengan cermat.
                </p>
              </div>

              {/* 2x2 Grid Choices (3 Number Options + 1 "Tidak Ada Angka") matching screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentPlate.choices.map((choiceText) => {
                  const isSelected = selectedChoice === choiceText;
                  return (
                    <button
                      key={choiceText}
                      type="button"
                      onClick={() => {
                        setSelectedChoice(choiceText);
                        handleSelectAnswer(choiceText);
                      }}
                      className={`px-5 py-4 rounded-2xl border transition flex items-center justify-between text-left cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50/60/70 text-[#7F1D1D] shadow-xs'
                          : 'border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-red-600 text-slate-900'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        {choiceText}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-red-600 bg-[#9E1B21]'
                            : 'border-slate-300 bg-slate-200/80'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevPlate}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
                <span className="text-[11px] font-semibold text-slate-400">
                  Clinical Ishihara 20-Plate WHO
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'result' && finalResult && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-red-50/40 border border-red-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#20C997]/15 text-[#20C997] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-slate-500">
              HASIL PEMERIKSAAN ISHIHARA — {fullName}
            </p>
            <h4 className="text-2xl font-bold text-slate-900">
              Kategori Diagnosis: <span className="text-[#9E1B21]">{finalResult.category}</span>
            </h4>
            <div className="flex items-center justify-center gap-6 pt-2 text-sm tabular-nums">
              <div>
                <span className="text-slate-500">Skor Akurasi:</span>{' '}
                <strong className="text-slate-900 font-mono">{finalResult.scorePercentage}%</strong>
              </div>
              <span>·</span>
              <div>
                <span className="text-slate-500">Benar:</span>{' '}
                <strong className="text-[#20C997] font-mono">{finalResult.correctCount}/20</strong>
              </div>
              <span>·</span>
              <div>
                <span className="text-slate-500">Salah:</span>{' '}
                <strong className="text-[#9E1B21] font-mono">{finalResult.wrongCount}/20</strong>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Data hasil pemeriksaan beserta Sertifikat Resmi telah otomatis tersimpan ke rekam medis RS Kota Baru dan dapat diunduh dalam format JPEG di Portal Staff.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetTest}
              className="px-5 py-2.5 rounded-xl border border-red-200 text-[#7F1D1D] text-sm font-semibold hover:bg-red-50/60 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Tes Buta Warna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
