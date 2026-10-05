import React, { useState, useEffect, useRef } from 'react';
import { ISHIHARA_20_PLATES, IshiharaPlateData } from '../utils/ishiharaPlates';
import { useApp } from '../context/AppContext';
import { Eye, Clock, CheckCircle2, RotateCcw, AlertCircle, Play, ArrowRight, ArrowLeft } from 'lucide-react';

const IshiharaCanvasPlate: React.FC<{ plate: IshiharaPlateData }> = ({ plate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    const radius = 142;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Create offscreen mask canvas for the number text with bold, easy-to-read proportions
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = size;
    maskCanvas.height = size;
    const mCtx = maskCanvas.getContext('2d')!;
    mCtx.fillStyle = '#000000';
    mCtx.fillRect(0, 0, size, size);
    mCtx.fillStyle = '#FFFFFF';
    const fontSize = plate.expectedAnswer.length > 1 ? 132 : 156;
    mCtx.font = `900 ${fontSize}px "Poppins", Arial, sans-serif`;
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillText(plate.expectedAnswer, cx, cy + 4);

    const maskData = mCtx.getImageData(0, 0, size, size).data;

    // 2. Clear main canvas
    ctx.clearRect(0, 0, size, size);

    // Deterministic pseudo-random based on plateNumber so each plate has organic dense dot packing like the reference image
    let seed = plate.plateNumber * 12973;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const dots: { x: number; y: number; r: number; isFg: boolean }[] = [];
    // Dense multi-size dots like clinical easy Ishihara plate in the user's screenshot
    const radii = [7.2, 5.8, 4.8, 4.0, 3.3];

    for (const r of radii) {
      for (let attempt = 0; attempt < 1800; attempt++) {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * (radius - r - 2);
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        let overlaps = false;
        for (const d of dots) {
          const dx = d.x - x;
          const dy = d.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < d.r + r + 0.8) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          const px = Math.floor(x);
          const py = Math.floor(y);
          const idx = (py * size + px) * 4;
          const isFg = maskData[idx] > 128;
          dots.push({ x, y, r, isFg });
        }
      }
    }

    // White circular disc plate background with subtle border
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Draw all dots
    for (const d of dots) {
      const palette = d.isFg ? plate.fgColors : plate.bgColors;
      const color = palette[Math.floor(rand() * palette.length)];
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [plate]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#F8FAFC] rounded-3xl border border-slate-200/80 shadow-2xs">
      <div className="rounded-full bg-white p-2 shadow-md border border-slate-100">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] rounded-full"
        />
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
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] flex items-center justify-center text-white">
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
              Nama Lengkap Peserta Tes <span className="text-[#E83E8C]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FFF5F8] border border-pink-100">
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
              className="w-5 h-5 accent-[#E83E8C] rounded cursor-pointer"
            />
          </div>

          <button
            disabled={!fullName.trim()}
            onClick={() => setStep('instructions')}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white font-semibold text-sm shadow-sm hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjut ke Instruksi Pemeriksaan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 'instructions' && (
        <div className="max-w-xl mx-auto py-2 space-y-6">
          <div className="p-5 rounded-2xl bg-[#FFF5F8] border border-pink-200/70 space-y-3">
            <div className="flex items-center gap-2 text-[#D63384] font-bold text-sm">
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
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white font-semibold text-sm shadow-sm hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
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
                className="h-full bg-gradient-to-r from-rose-600 to-[#E83E8C] transition-all duration-200 rounded-full"
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
                          ? 'border-[#E83E8C] bg-pink-50/70 text-[#D63384] shadow-xs'
                          : 'border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-[#E83E8C] text-slate-900'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        {choiceText}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#E83E8C] bg-[#E83E8C]'
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
          <div className="p-6 rounded-2xl bg-[#FFF5F8] border border-pink-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#20C997]/15 text-[#20C997] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-slate-500">
              HASIL PEMERIKSAAN ISHIHARA — {fullName}
            </p>
            <h4 className="text-2xl font-bold text-slate-900">
              Kategori Diagnosis: <span className="text-[#E83E8C]">{finalResult.category}</span>
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
                <strong className="text-[#E83E8C] font-mono">{finalResult.wrongCount}/20</strong>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Data hasil pemeriksaan beserta Sertifikat Resmi telah otomatis tersimpan ke rekam medis RS Cendana dan dapat diunduh dalam format JPEG di Portal Staff.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetTest}
              className="px-5 py-2.5 rounded-xl border border-pink-200 text-[#D63384] text-sm font-semibold hover:bg-pink-50 flex items-center gap-2 cursor-pointer"
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
