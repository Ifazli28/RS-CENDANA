import React, { useState, useEffect, useRef } from 'react';
import { ISHIHARA_20_PLATES, IshiharaPlateData } from '../utils/ishiharaPlates';
import { useApp } from '../context/AppContext';
import { Eye, Clock, CheckCircle2, RotateCcw, AlertCircle, Play, ArrowRight } from 'lucide-react';

const IshiharaCanvasPlate: React.FC<{ plate: IshiharaPlateData }> = ({ plate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    const radius = 128;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Create offscreen mask canvas for the number text
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = size;
    maskCanvas.height = size;
    const mCtx = maskCanvas.getContext('2d')!;
    mCtx.fillStyle = '#000000';
    mCtx.fillRect(0, 0, size, size);
    mCtx.fillStyle = '#FFFFFF';
    mCtx.font = '900 132px "Poppins", Arial, sans-serif';
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillText(plate.expectedAnswer, cx, cy + 6);

    const maskData = mCtx.getImageData(0, 0, size, size).data;

    // 2. Clear main canvas
    ctx.clearRect(0, 0, size, size);

    // Deterministic pseudo-random based on plateNumber so each plate has consistent dot layout
    let seed = plate.plateNumber * 9973;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const dots: { x: number; y: number; r: number; isFg: boolean }[] = [];
    const radii = [10, 8, 6.5, 5, 4];

    for (const r of radii) {
      for (let attempt = 0; attempt < 950; attempt++) {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * (radius - r - 3);
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        let overlaps = false;
        for (const d of dots) {
          const dx = d.x - x;
          const dy = d.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < d.r + r + 1.6) {
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

    // Draw outer soft ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF5F8';
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
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
      <canvas ref={canvasRef} width={280} height={280} className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]" />
    </div>
  );
};

export const IshiharaTestSection: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { submitColorBlindResult } = useApp();
  const [step, setStep] = useState<'input_name' | 'instructions' | 'testing' | 'result'>('input_name');
  const [fullName, setFullName] = useState('');
  const [useTimer, setUseTimer] = useState(true);
  const [currentPlateIdx, setCurrentPlateIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
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

  useEffect(() => {
    if (step !== 'testing' || !useTimer) return;
    setTimeLeft(10);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextPlate('');
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, currentPlateIdx, useTimer]);

  const handleNextPlate = (submittedAnswer?: string) => {
    const cleanAns = (submittedAnswer !== undefined ? submittedAnswer : userInput).trim() || '-';
    const isCorrect = cleanAns === currentPlate.expectedAnswer;
    const newEntry = {
      plateNumber: currentPlate.plateNumber,
      expected: currentPlate.expectedAnswer,
      userAnswer: cleanAns,
      isCorrect,
      type: currentPlate.plateType,
    };

    const updatedAnswers = [...answers, newEntry];
    setAnswers(updatedAnswers);
    setUserInput('');

    if (currentPlateIdx + 1 < ISHIHARA_20_PLATES.length) {
      setCurrentPlateIdx((prev) => prev + 1);
    } else {
      // Calculate final result
      const correctCount = updatedAnswers.filter((a) => a.isCorrect).length;
      const wrongCount = ISHIHARA_20_PLATES.length - correctCount;
      const scorePercentage = Math.round((correctCount / ISHIHARA_20_PLATES.length) * 100);

      let category: 'Normal' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' = 'Normal';
      if (correctCount < 17) {
        const protanErrors = updatedAnswers.filter((a) => !a.isCorrect && a.type.includes('Protan')).length;
        const deutanErrors = updatedAnswers.filter((a) => !a.isCorrect && a.type.includes('Deutan')).length;
        const tritanErrors = updatedAnswers.filter((a) => !a.isCorrect && a.type.includes('Tritan')).length;

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

  const resetTest = () => {
    setStep('input_name');
    setCurrentPlateIdx(0);
    setAnswers([]);
    setUserInput('');
    setFinalResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] flex items-center justify-center text-white">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Uji Penglihatan Warna — 20 Lempeng Ishihara</h3>
            <p className="text-xs text-slate-500">Metode Diagnostik Standar RS Cendana</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
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
              <p className="text-sm font-semibold text-slate-800">Gunakan Timer Otomatis (10 Detik / Lempeng)</p>
              <p className="text-xs text-slate-500">Otomatis berpindah ke lempeng berikutnya setelah 10 detik</p>
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
                <strong>Matikan Eye Comfort / Night Shield:</strong> Wajib menonaktifkan fitur filter cahaya biru (Night Shift / Eye Comfort / True Tone) agar warna lempeng Ishihara akurat.
              </li>
              <li>
                <strong>20 Lempeng Ishihara:</strong> Anda akan melihat 20 lempeng secara berurutan. Ketik angka yang terlihat lalu tekan Lanjut.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setStep('input_name')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Kembali
            </button>
            <button
              onClick={() => {
                setCurrentPlateIdx(0);
                setAnswers([]);
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-700 tabular-nums">
              Lempeng <span className="text-[#E83E8C] font-bold">{currentPlateIdx + 1}</span> dari 20
            </div>
            {useTimer && (
              <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-[#D63384] tabular-nums">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-[#E83E8C] to-[#20C997] transition-all duration-200"
              style={{ width: `${((currentPlateIdx + 1) / 20) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <IshiharaCanvasPlate plate={currentPlate} />

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Peserta: {fullName}</p>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Angka berapa yang Anda lihat pada lempeng #{currentPlate.plateNumber}?
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleNextPlate();
                    }
                  }}
                  placeholder="Ketik angka (misal: 12)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#E83E8C] focus:outline-none text-lg font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNextPlate('0')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Tidak Terlihat Angka
                </button>
                <button
                  type="button"
                  onClick={() => handleNextPlate()}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 cursor-pointer"
                >
                  {currentPlateIdx === 19 ? 'Selesai & Hitung Hasil' : 'Lempeng Berikutnya →'}
                </button>
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
            <p className="text-xs font-semibold text-slate-500">HASIL PEMERIKSAAN ISHIHARA — {fullName}</p>
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
              Data hasil pemeriksaan telah otomatis tersimpan ke rekam medis RS Cendana dan dapat ditinjau oleh Dokter.
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
