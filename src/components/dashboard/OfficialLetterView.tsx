import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LetterSection,
  LetterSectionType,
  LetterSignatureItem,
  OfficialLetter,
} from '../../types';
import { LETTER_TEMPLATES } from '../../utils/letterTemplates';
import {
  A4_LOGICAL_WIDTH,
  A4_LOGICAL_HEIGHT,
  renderLetterToA4Canvases,
  exportLetterToPdf,
  exportLetterPageImage,
  exportLetterCombinedImage,
} from '../../utils/letterRenderer';
import {
  FileText,
  Download,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  FolderOpen,
  PenTool,
  Upload,
  X,
  ShieldAlert,
  Table as TableIcon,
  AlignLeft,
  ListOrdered,
  AlertCircle,
  CheckCircle2,
  Copy,
  Layers,
  Eye,
  Edit3,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

// Mini Signature Drawing Modal
const SignaturePadModal: React.FC<{
  signerLabel: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}> = ({ signerLabel, onSave, onClose }) => {
  const padRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = padRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) * canvas.width) / rect.width,
      y: ((clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = padRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    const canvas = padRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const clearPad = () => {
    const canvas = padRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = padRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-red-100 p-5 max-w-md w-full space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Gambar Tanda Tangan Digital</h3>
            <p className="text-[11px] text-slate-500">{signerLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden touch-none">
          <canvas
            ref={padRef}
            width={440}
            height={170}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
            className="w-full h-40 cursor-crosshair block"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={clearPad}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Bersihkan Kanvas
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-bold hover:bg-[#7F1D1D] cursor-pointer"
            >
              Gunakan TTD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OfficialLetterView: React.FC = () => {
  const {
    currentUser,
    officialLetters,
    saveOfficialLetter,
    deleteOfficialLetter,
    requestDelete,
    addToast,
  } = useApp();

  // Access Control: HRD ke atas (minLevel 8)
  if (!currentUser || currentUser.level < 8) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4 max-w-xl mx-auto shadow-sm my-12">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#9E1B21] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Terbatas: HRD ke Atas</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Modul Pembuatan Surat Resmi Rumah Sakit KotaBaru hanya dapat diakses oleh pejabat manajemen{' '}
          <strong>Human Resources Department (HRD, Level 8) ke atas</strong>.
        </p>
      </div>
    );
  }

  const [letter, setLetter] = useState<OfficialLetter>(() =>
    LETTER_TEMPLATES[0].createDraft(currentUser.name, currentUser.role)
  );
  const [editorTab, setEditorTab] = useState<'header' | 'body' | 'signatures'>('header');
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false);
  const [signaturePadTargetId, setSignaturePadTargetId] = useState<string | null>(null);

  // Rendered A4 Canvases & Preview Data URLs
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(false);

  const renderPages = useCallback(async (docToRender: OfficialLetter) => {
    setIsRendering(true);
    try {
      const rendered = await renderLetterToA4Canvases(docToRender);
      setCanvases(rendered);
      setPagePreviews(rendered.map((c) => c.toDataURL('image/png')));
    } catch (err) {
      console.error('Failed to render A4 pages:', err);
    } finally {
      setIsRendering(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void renderPages(letter);
    }, 160);
    return () => clearTimeout(timer);
  }, [letter, renderPages]);

  const handleApplyTemplate = (templateId: string) => {
    const tmpl = LETTER_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    setLetter(tmpl.createDraft(currentUser.name, currentUser.role));
    addToast('info', 'Template Diterapkan', `Template "${tmpl.name}" dimuat ke editor surat A4.`);
  };

  const handleSaveToArchive = () => {
    saveOfficialLetter({
      ...letter,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicateAsNew = () => {
    const nowIso = new Date().toISOString();
    setLetter((prev) => ({
      ...prev,
      id: `ltr-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: currentUser.name,
      createdByRole: currentUser.role,
    }));
    addToast('info', 'Draft Baru Dibuat', 'Salinan surat siap diedit sebagai dokumen baru.');
  };

  const handleExportPdf = async () => {
    const activeCanvases = canvases.length > 0 ? canvases : await renderLetterToA4Canvases(letter);
    exportLetterToPdf(letter, activeCanvases);
    addToast(
      'success',
      'PDF A4 Berhasil Diekspor',
      `Dokumen (${activeCanvases.length} halaman A4) telah diunduh sebagai file PDF.`
    );
  };

  const handleExportAllImages = async (format: 'png' | 'jpeg', merged = false) => {
    const activeCanvases = canvases.length > 0 ? canvases : await renderLetterToA4Canvases(letter);
    if (merged) {
      exportLetterCombinedImage(letter, activeCanvases, format);
      addToast(
        'success',
        `Gambar ${format.toUpperCase()} Diekspor`,
        `Seluruh ${activeCanvases.length} halaman digabung ke 1 gambar ${format.toUpperCase()}.`
      );
    } else {
      activeCanvases.forEach((c, idx) => {
        setTimeout(() => {
          exportLetterPageImage(letter, c, idx + 1, activeCanvases.length, format);
        }, idx * 180);
      });
      addToast(
        'success',
        `Gambar ${format.toUpperCase()} Diekspor`,
        `${activeCanvases.length} halaman A4 sedang diunduh sebagai gambar ${format.toUpperCase()}.`
      );
    }
  };

  // Section helpers
  const addSection = (type: LetterSectionType) => {
    const id = `sec-${Date.now()}`;
    let newSec: LetterSection;
    if (type === 'table') {
      newSec = {
        id,
        type: 'table',
        heading: 'C. KETENTUAN TAMBAHAN',
        intro: 'Berikut rincian ketentuan tambahan yang disepakati:',
        tableHeaders: ['No', 'Item / Poin', 'Kesepakatan', 'Keterangan'],
        tableRows: [['1', 'Uraian poin kesepakatan', 'Detail kesepakatan', 'Catatan tambahan']],
      };
    } else if (type === 'list') {
      newSec = {
        id,
        type: 'list',
        heading: 'C. DAFTAR KETENTUAN',
        intro: 'Adapun ketentuan yang berlaku meliputi:',
        listStyle: 'numbered',
        listItems: ['Poin ketentuan pertama yang wajib dipenuhi.', 'Poin ketentuan kedua.'],
      };
    } else if (type === 'notice') {
      newSec = {
        id,
        type: 'notice',
        noticeTitle: 'Syarat & Ketentuan Tambahan:',
        noticeBody:
          'Seluruh pihak wajib mematuhi aturan operasional Rumah Sakit **Pillbox Medical Center (Koordinat 201)**.',
      };
    } else {
      newSec = {
        id,
        type: 'paragraph',
        heading: 'C. PENJELASAN LANJUTAN',
        body: 'Tuliskan isi paragraf resmi di sini. Gunakan tanda **teks tebal** untuk menebalkan frasa tertentu.',
      };
    }
    setLetter((prev) => ({ ...prev, sections: [...prev.sections, newSec] }));
  };

  const updateSection = (id: string, patch: Partial<LetterSection>) => {
    setLetter((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= letter.sections.length) return;
    setLetter((prev) => {
      const next = [...prev.sections];
      const [removed] = next.splice(index, 1);
      next.splice(targetIdx, 0, removed);
      return { ...prev, sections: next };
    });
  };

  const removeSection = (id: string) => {
    setLetter((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  // Signature helpers
  const addSignature = () => {
    if (letter.signatures.length >= 3) {
      addToast('warning', 'Maksimal 3 Kolom', 'Layout standar surat A4 mendukung maksimal 3 kolom tanda tangan.');
      return;
    }
    const newSig: LetterSignatureItem = {
      id: `sig-${Date.now()}`,
      topLabel: 'Mengetahui',
      name: '',
      roleLabel: 'Pejabat Terkait',
      isBlankLine: true,
    };
    setLetter((prev) => ({ ...prev, signatures: [...prev.signatures, newSig] }));
  };

  const updateSignature = (id: string, patch: Partial<LetterSignatureItem>) => {
    setLetter((prev) => ({
      ...prev,
      signatures: prev.signatures.map((sig) => (sig.id === id ? { ...sig, ...patch } : sig)),
    }));
  };

  const removeSignature = (id: string) => {
    setLetter((prev) => ({
      ...prev,
      signatures: prev.signatures.filter((sig) => sig.id !== id),
    }));
  };

  const handleUploadSignatureImg = (sigId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const maxW = 500;
        const maxH = 220;
        const ratio = Math.min(1, maxW / img.width, maxH / img.height);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          updateSignature(sigId, { signatureDataUrl: canvas.toDataURL('image/png') });
        } else {
          updateSignature(sigId, { signatureDataUrl: String(reader.result) });
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const activePadSigner = letter.signatures.find((s) => s.id === signaturePadTargetId);

  return (
    <div className="space-y-5">
      {/* Top Banner & Action Toolbar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-red-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1B21] mb-1">
              <FileText className="w-4 h-4 text-[#9E1B21]" />
              <span>Administrasi & Tata Naskah Dinas · Akses HRD ke Atas</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Pembuatan Surat Resmi Rumah Sakit KotaBaru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Format standar kertas <strong>A4 (210 × 297 mm)</strong> otomatis berlanjut ke halaman berikutnya jika konten melebihi 1 halaman, siap ekspor ke <strong>PDF</strong> & <strong>Gambar</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowArchiveDrawer((p) => !p)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <FolderOpen className="w-4 h-4 text-[#9E1B21]" />
              <span>Arsip ({officialLetters.length})</span>
            </button>

            <button
              type="button"
              onClick={handleDuplicateAsNew}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              title="Buat dokumen baru dari isi surat saat ini"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplikat Baru</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToArchive}
              className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Arsip</span>
            </button>

            <button
              type="button"
              onClick={() => void handleExportPdf()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor PDF (A4)</span>
            </button>

            <button
              type="button"
              onClick={() => void handleExportAllImages('png', false)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Ekspor PNG</span>
            </button>

            <button
              type="button"
              onClick={() => void handleExportAllImages('jpeg', false)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <ImageIcon className="w-4 h-4 text-[#9E1B21]" />
              <span>Ekspor JPG</span>
            </button>

            {canvases.length > 1 && (
              <button
                type="button"
                onClick={() => void handleExportAllImages('png', true)}
                className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#7F1D1D] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                title="Gabungkan seluruh halaman A4 menjadi 1 gambar vertikal"
              >
                <Layers className="w-4 h-4" />
                <span>Gabung 1 Gambar</span>
              </button>
            )}
          </div>
        </div>

        {/* Template Picker Strip */}
        <div className="pt-3 border-t border-red-100 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#9E1B21]" />
            Template Surat RS KotaBaru:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {LETTER_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.id)}
                title={tmpl.description}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                  letter.templateId === tmpl.id
                    ? 'bg-[#9E1B21] text-white border-[#9E1B21] shadow-xs'
                    : 'bg-red-50/40 text-[#7F1D1D] border-red-200 hover:bg-red-100'
                }`}
              >
                <span>{tmpl.name}</span>
                {tmpl.id === 'kontrak-kerjasama-polisi' && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      letter.templateId === tmpl.id
                        ? 'bg-white/20 text-white'
                        : 'bg-red-200/70 text-[#7F1D1D]'
                    }`}
                  >
                    Utama
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Letters Archive Drawer */}
      {showArchiveDrawer && (
        <div className="p-5 rounded-3xl bg-white border border-red-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#9E1B21]" />
              <h3 className="text-sm font-bold text-slate-900">Arsip Surat Resmi Tersimpan</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowArchiveDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {officialLetters.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Belum ada surat yang disimpan ke arsip. Klik tombol <strong>Simpan Arsip</strong> untuk menyimpan surat ini ke Database.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {officialLetters.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                    item.id === letter.id ? 'border-[#9E1B21] bg-red-50/30' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#9E1B21] truncate">
                        {item.nomorSurat}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{item.perihal}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Kepada: {item.kepadaYthLine2 || '-'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => {
                        setLetter(item);
                        setShowArchiveDrawer(false);
                        addToast('info', 'Surat Dimuat', `Membuka arsip "${item.nomorSurat}".`);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#9E1B21] text-white text-[11px] font-bold hover:bg-[#7F1D1D] cursor-pointer"
                    >
                      Buka & Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestDelete(
                          'Hapus Arsip Surat',
                          `Hapus surat "${item.nomorSurat} — ${item.perihal}" dari arsip database?`,
                          () => deleteOfficialLetter(item.id)
                        )
                      }
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Hapus Arsip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile View Switcher */}
      <div className="flex xl:hidden gap-2 bg-white p-1.5 rounded-2xl border border-red-100">
        <button
          type="button"
          onClick={() => setMobilePane('editor')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobilePane === 'editor' ? 'bg-[#9E1B21] text-white' : 'text-slate-600'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor Surat</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePane('preview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobilePane === 'preview' ? 'bg-[#9E1B21] text-white' : 'text-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pratinjau A4 ({pagePreviews.length} Hal)</span>
        </button>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: LETTER EDITOR */}
        <div
          className={`xl:col-span-5 bg-white rounded-3xl border border-red-100 shadow-xs overflow-hidden ${
            mobilePane === 'editor' ? 'block' : 'hidden xl:block'
          }`}
        >
          {/* Editor Sub-tabs */}
          <div className="flex border-b border-red-100 bg-slate-50/70 p-1.5 gap-1">
            {[
              { id: 'header' as const, label: '1. Kop & Tujuan' },
              { id: 'body' as const, label: '2. Isi & Tabel' },
              { id: 'signatures' as const, label: '3. TTD & Footer' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setEditorTab(t.id)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  editorTab === t.id
                    ? 'bg-white text-[#9E1B21] shadow-xs border border-red-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* EDITOR TAB 1: KOP & METADATA */}
            {editorTab === 'header' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-red-50/40 border border-red-100 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E1B21] block">
                    Kop Surat Resmi
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Instansi Utama
                    </label>
                    <input
                      type="text"
                      value={letter.kopTitle}
                      onChange={(e) => setLetter({ ...letter, kopTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Subjudul Rumah Sakit
                    </label>
                    <input
                      type="text"
                      value={letter.kopSubtitle}
                      onChange={(e) => setLetter({ ...letter, kopSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Alamat Kop Surat
                    </label>
                    <input
                      type="text"
                      value={letter.kopAddress}
                      onChange={(e) => setLetter({ ...letter, kopAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nomor Surat
                    </label>
                    <input
                      type="text"
                      value={letter.nomorSurat}
                      onChange={(e) => setLetter({ ...letter, nomorSurat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kota & Tanggal
                    </label>
                    <input
                      type="text"
                      value={letter.kotaTanggal}
                      onChange={(e) => setLetter({ ...letter, kotaTanggal: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Lampiran
                    </label>
                    <input
                      type="text"
                      value={letter.lampiran}
                      onChange={(e) => setLetter({ ...letter, lampiran: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Gaya Huruf Dokumen
                    </label>
                    <select
                      value={letter.fontStyle}
                      onChange={(e) =>
                        setLetter({ ...letter, fontStyle: e.target.value as 'serif' | 'sans' })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="serif">Klasik Resmi (Serif — Seperti PDF)</option>
                      <option value="sans">Modern Bersih (Sans-Serif)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Perihal Surat
                  </label>
                  <textarea
                    rows={2}
                    value={letter.perihal}
                    onChange={(e) => setLetter({ ...letter, perihal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Tujuan Penerima Surat
                  </span>
                  <input
                    type="text"
                    value={letter.kepadaYthLine1}
                    onChange={(e) => setLetter({ ...letter, kepadaYthLine1: e.target.value })}
                    placeholder="Kepada Yth."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={letter.kepadaYthLine2}
                    onChange={(e) => setLetter({ ...letter, kepadaYthLine2: e.target.value })}
                    placeholder="Jabatan / Nama Pihak Kedua"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={letter.kepadaYthLine3}
                    onChange={(e) => setLetter({ ...letter, kepadaYthLine3: e.target.value })}
                    placeholder="Di Tempat"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* EDITOR TAB 2: ISI SURAT & TABEL DINAMIS */}
            {editorTab === 'body' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  Tip: Gunakan tanda <code className="font-bold">**kata tebal**</code> untuk menebalkan teks di paragraf, kotak catatan, atau sel tabel. Jika isi panjang melebihi 1 halaman A4, sistem otomatis memecah ke halaman ke-2 dan seterusnya.
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Salam Pembuka
                  </label>
                  <input
                    type="text"
                    value={letter.salamPembuka}
                    onChange={(e) => setLetter({ ...letter, salamPembuka: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Paragraf Pembuka
                  </label>
                  <textarea
                    rows={4}
                    value={letter.paragrafPembuka}
                    onChange={(e) => setLetter({ ...letter, paragrafPembuka: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
                  />
                </div>

                {/* Dynamic Sections */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Bagian / Seksi Surat ({letter.sections.length})
                    </span>
                  </div>

                  {letter.sections.map((sec, sIdx) => (
                    <div
                      key={sec.id}
                      className="p-3.5 rounded-2xl border border-red-100 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#7F1D1D] text-[10px] font-bold uppercase">
                          {sec.type === 'table'
                            ? 'Tabel Formal'
                            : sec.type === 'notice'
                            ? 'Kotak Syarat / Catatan'
                            : sec.type === 'list'
                            ? 'Daftar Poin'
                            : 'Paragraf'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(sIdx, -1)}
                            disabled={sIdx === 0}
                            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            title="Naikkan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(sIdx, 1)}
                            disabled={sIdx === letter.sections.length - 1}
                            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                            title="Turunkan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(sec.id)}
                            className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="Hapus Bagian"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {sec.type !== 'notice' && (
                        <>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Judul Bagian (Opsional)
                            </label>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSection(sec.id, { heading: e.target.value })}
                              placeholder="Contoh: A. KETENTUAN PASOKAN..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#8B1E22]"
                            />
                          </div>
                          {(sec.type === 'table' || sec.type === 'list') && (
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                                Pengantar Bagian (Opsional)
                              </label>
                              <textarea
                                rows={2}
                                value={sec.intro || ''}
                                onChange={(e) => updateSection(sec.id, { intro: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* Type-specific inputs */}
                      {sec.type === 'paragraph' && (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Isi Paragraf
                          </label>
                          <textarea
                            rows={4}
                            value={sec.body || ''}
                            onChange={(e) => updateSection(sec.id, { body: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        </div>
                      )}

                      {sec.type === 'notice' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Judul Kotak Catatan
                            </label>
                            <input
                              type="text"
                              value={sec.noticeTitle || ''}
                              onChange={(e) => updateSection(sec.id, { noticeTitle: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Isi Kotak Catatan
                            </label>
                            <textarea
                              rows={3}
                              value={sec.noticeBody || ''}
                              onChange={(e) => updateSection(sec.id, { noticeBody: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {sec.type === 'list' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-500">
                              Item Daftar
                            </label>
                            <select
                              value={sec.listStyle || 'numbered'}
                              onChange={(e) =>
                                updateSection(sec.id, {
                                  listStyle: e.target.value as 'numbered' | 'bullet',
                                })
                              }
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px]"
                            >
                              <option value="numbered">Angka (1, 2, 3)</option>
                              <option value="bullet">Bullet (•)</option>
                            </select>
                          </div>
                          {(sec.listItems || []).map((item, iIdx) => (
                            <div key={iIdx} className="flex gap-1.5">
                              <textarea
                                rows={2}
                                value={item}
                                onChange={(e) => {
                                  const next = [...(sec.listItems || [])];
                                  next[iIdx] = e.target.value;
                                  updateSection(sec.id, { listItems: next });
                                }}
                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = (sec.listItems || []).filter((_, i) => i !== iIdx);
                                  updateSection(sec.id, { listItems: next });
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 self-start cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateSection(sec.id, {
                                listItems: [...(sec.listItems || []), 'Poin tambahan baru.'],
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-[#9E1B21] hover:bg-red-50 cursor-pointer"
                          >
                            + Tambah Poin
                          </button>
                        </div>
                      )}

                      {sec.type === 'table' && (
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Header Kolom Tabel
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(sec.tableHeaders || []).map((hdr, hIdx) => (
                                <input
                                  key={hIdx}
                                  type="text"
                                  value={hdr}
                                  onChange={(e) => {
                                    const nextHdrs = [...(sec.tableHeaders || [])];
                                    nextHdrs[hIdx] = e.target.value;
                                    updateSection(sec.id, { tableHeaders: nextHdrs });
                                  }}
                                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-semibold text-slate-500">
                              Baris Data Tabel
                            </label>
                            {(sec.tableRows || []).map((row, rIdx) => (
                              <div
                                key={rIdx}
                                className="p-2 rounded-xl bg-white border border-slate-200 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-slate-500">
                                    Baris #{rIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextRows = (sec.tableRows || []).filter((_, i) => i !== rIdx);
                                      updateSection(sec.id, { tableRows: nextRows });
                                    }}
                                    className="text-rose-500 hover:text-rose-700 cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {(sec.tableHeaders || []).map((hdr, cIdx) => (
                                    <div key={cIdx}>
                                      <span className="text-[9px] font-semibold text-slate-400 block">
                                        {hdr}
                                      </span>
                                      <textarea
                                        rows={cIdx === (sec.tableHeaders || []).length - 1 ? 2 : 1}
                                        value={row[cIdx] || ''}
                                        onChange={(e) => {
                                          const nextRows = (sec.tableRows || []).map((r, ri) =>
                                            ri === rIdx
                                              ? (sec.tableHeaders || []).map((_, ci) =>
                                                  ci === cIdx ? e.target.value : r[ci] || ''
                                                )
                                              : r
                                          );
                                          updateSection(sec.id, { tableRows: nextRows });
                                        }}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const colCount = (sec.tableHeaders || []).length;
                                const nextNum = String((sec.tableRows || []).length + 1);
                                const newRow = Array.from({ length: colCount }, (_, i) =>
                                  i === 0 ? nextNum : ''
                                );
                                updateSection(sec.id, {
                                  tableRows: [...(sec.tableRows || []), newRow],
                                });
                              }}
                              className="w-full py-1.5 rounded-xl border border-dashed border-red-300 text-[#9E1B21] text-xs font-bold hover:bg-red-50/50 cursor-pointer"
                            >
                              + Tambah Baris Tabel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Quick Add Section Buttons */}
                  <div className="p-3 rounded-2xl border border-dashed border-red-200 bg-red-50/20 space-y-2">
                    <span className="text-[11px] font-bold text-[#9E1B21] block">
                      + Tambah Bagian Baru ke Surat:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => addSection('table')}
                        className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#9E1B21] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-[#9E1B21]" />
                        <span>Tabel Formal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addSection('paragraph')}
                        className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#9E1B21] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlignLeft className="w-3.5 h-3.5 text-[#9E1B21]" />
                        <span>Paragraf</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addSection('list')}
                        className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#9E1B21] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ListOrdered className="w-3.5 h-3.5 text-[#9E1B21]" />
                        <span>Daftar Poin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addSection('notice')}
                        className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#9E1B21] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-[#9E1B21]" />
                        <span>Kotak Catatan</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Paragraf Penutup
                  </label>
                  <textarea
                    rows={3}
                    value={letter.paragrafPenutup}
                    onChange={(e) => setLetter({ ...letter, paragrafPenutup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* EDITOR TAB 3: TANDA TANGAN & FOOTER */}
            {editorTab === 'signatures' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Kolom Penandatangan ({letter.signatures.length}/3)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dapat menggambar tanda tangan digital, mengunggah gambar TTD, atau membiarkan kosong `(   )`.
                    </p>
                  </div>
                  {letter.signatures.length < 3 && (
                    <button
                      type="button"
                      onClick={addSignature}
                      className="px-3 py-1.5 rounded-xl bg-[#9E1B21] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
                </div>

                {letter.signatures.map((sig, idx) => (
                  <div
                    key={sig.id}
                    className="p-3.5 rounded-2xl border border-red-100 bg-slate-50/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#9E1B21]">
                        Penandatangan #{idx + 1}
                      </span>
                      {letter.signatures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSignature(sig.id)}
                          className="p-1 rounded-lg bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Label Atas TTD
                        </label>
                        <input
                          type="text"
                          value={sig.topLabel}
                          onChange={(e) => updateSignature(sig.id, { topLabel: e.target.value })}
                          placeholder="Contoh: Penanggung Jawab Kontrak"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(sig.isBlankLine)}
                            onChange={(e) =>
                              updateSignature(sig.id, { isBlankLine: e.target.checked })
                            }
                            className="rounded border-slate-300 text-[#9E1B21]"
                          />
                          Kosongkan nama untuk tanda tangan pihak luar `(   )`
                        </label>
                      </div>

                      {!sig.isBlankLine && (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Nama Penandatangan
                          </label>
                          <input
                            type="text"
                            value={sig.name}
                            onChange={(e) => updateSignature(sig.id, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Jabatan Penandatangan
                        </label>
                        <input
                          type="text"
                          value={sig.roleLabel}
                          onChange={(e) => updateSignature(sig.id, { roleLabel: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>

                      {/* Signature Image / Pad Actions */}
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSignaturePadTargetId(sig.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#9E1B21] text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <PenTool className="w-3 h-3 text-[#9E1B21]" />
                          <span>Gambar TTD</span>
                        </button>

                        <label className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#9E1B21] text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3 text-[#9E1B21]" />
                          <span>Upload TTD</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadSignatureImg(sig.id, file);
                            }}
                          />
                        </label>

                        {sig.signatureDataUrl && (
                          <button
                            type="button"
                            onClick={() => updateSignature(sig.id, { signatureDataUrl: undefined })}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-semibold cursor-pointer"
                          >
                            Hapus TTD
                          </button>
                        )}
                      </div>

                      {sig.signatureDataUrl && (
                        <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <img
                            src={sig.signatureDataUrl}
                            alt="TTD Preview"
                            className="max-h-12 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Teks Footer Bawah (Setiap Halaman)
                  </label>
                  <input
                    type="text"
                    value={letter.footerTitle}
                    onChange={(e) => setLetter({ ...letter, footerTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: MULTI-PAGE A4 PREVIEW */}
        <div
          className={`xl:col-span-7 space-y-4 ${
            mobilePane === 'preview' ? 'block' : 'hidden xl:block'
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-white border border-red-100 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
              <span>
                Pratinjau Kertas A4 (210 × 297 mm) ·{' '}
                <strong className="text-[#9E1B21]">
                  {pagePreviews.length} Halaman
                </strong>
              </span>
            </div>
            {isRendering && (
              <span className="text-[11px] font-semibold text-slate-400">
                Menyusun tata letak A4...
              </span>
            )}
          </div>

          {/* Stacked A4 Pages */}
          <div className="space-y-6 bg-slate-200/70 p-3 sm:p-5 rounded-3xl border border-slate-300/60 max-h-[82vh] overflow-y-auto">
            {pagePreviews.map((dataUrl, idx) => (
              <div key={idx} className="space-y-2 max-w-[680px] mx-auto">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Halaman {idx + 1} dari {pagePreviews.length} (A4)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (canvases[idx]) {
                          exportLetterPageImage(
                            letter,
                            canvases[idx],
                            idx + 1,
                            canvases.length,
                            'png'
                          );
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-[#9E1B21] text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      Unduh PNG Hal {idx + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (canvases[idx]) {
                          exportLetterPageImage(
                            letter,
                            canvases[idx],
                            idx + 1,
                            canvases.length,
                            'jpeg'
                          );
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-[#9E1B21] text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      Unduh JPG Hal {idx + 1}
                    </button>
                  </div>
                </div>

                <div
                  className="bg-white shadow-xl border border-slate-300 rounded-sm overflow-hidden"
                  style={{ aspectRatio: `${A4_LOGICAL_WIDTH} / ${A4_LOGICAL_HEIGHT}` }}
                >
                  <img
                    src={dataUrl}
                    alt={`Surat Resmi A4 Halaman ${idx + 1}`}
                    className="w-full h-full object-contain block"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {signaturePadTargetId && activePadSigner && (
        <SignaturePadModal
          signerLabel={`${activePadSigner.topLabel} — ${activePadSigner.name || activePadSigner.roleLabel}`}
          onSave={(dataUrl) => updateSignature(signaturePadTargetId, { signatureDataUrl: dataUrl })}
          onClose={() => setSignaturePadTargetId(null)}
        />
      )}
    </div>
  );
};
