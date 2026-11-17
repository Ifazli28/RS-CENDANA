import { jsPDF } from 'jspdf';
import { LetterSection, LetterSignatureItem, OfficialLetter } from '../types';

export const A4_LOGICAL_WIDTH = 794;
export const A4_LOGICAL_HEIGHT = 1123;
export const A4_RENDER_SCALE = 2; // 1588 x 2246 px for crisp PDF & Image export

const MARGIN_X = 64;
const CONTENT_W = A4_LOGICAL_WIDTH - MARGIN_X * 2; // 666
const TOP_MARGIN_NEXT = 74;
const MAX_CONTENT_Y = 1044;
const FOOTER_LINE_Y = 1066;
const FOOTER_TEXT_Y = 1084;

const CRIMSON_PRIMARY = '#8B1E22';
const CRIMSON_ACCENT = '#9E1B21';
const TEXT_DARK = '#0F172A';
const TEXT_BODY = '#1E293B';
const TEXT_MUTED = '#475569';
const BORDER_LIGHT = '#CBD5E1';

const LOGO_SVG_MARKUP = `<svg viewBox="0 0 400 400" width="400" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="patchBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#A82329" />
      <stop offset="65%" stop-color="#8B1E22" />
      <stop offset="100%" stop-color="#671014" />
    </radialGradient>
    <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#B91C1C" />
      <stop offset="50%" stop-color="#991B1B" />
      <stop offset="100%" stop-color="#7F1D1D" />
    </linearGradient>
    <path id="topParamedicPath" d="M 62,200 A 138,138 0 1,1 338,200" fill="none" />
    <path id="bottomKotbarPath" d="M 88,292 A 140,140 0 0,0 312,292" fill="none" />
  </defs>
  <circle cx="200" cy="200" r="192" fill="#8B1E22" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="200" cy="200" r="188" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,3" />
  <circle cx="200" cy="200" r="182" fill="none" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="200" cy="200" r="148" fill="none" stroke="#FFFFFF" stroke-width="3" />
  <g stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round">
    <line x1="12" y1="174" x2="52" y2="182" />
    <line x1="12" y1="204" x2="50" y2="206" />
    <line x1="388" y1="174" x2="348" y2="182" />
    <line x1="388" y1="204" x2="350" y2="206" />
  </g>
  <circle cx="200" cy="200" r="146" fill="url(#patchBg)" />
  <circle cx="200" cy="200" r="146" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  <text fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="4.5">
    <textPath href="#topParamedicPath" startOffset="50%" text-anchor="middle">PARAMEDIC</textPath>
  </text>
  <g transform="translate(200, 182)">
    <path d="M -24,-92 L 24,-92 L 24,-32 L 68,-57 L 92,-15 L 48,10 L 92,35 L 68,77 L 24,52 L 24,92 L -24,92 L -24,52 L -68,77 L -92,35 L -48,10 L -92,-15 L -68,-57 L -24,-32 Z" fill="url(#starGrad)" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
    <g transform="translate(0, -3)">
      <rect x="-36" y="-44" width="72" height="84" rx="8" fill="#50070A" opacity="0.6" />
      <path d="M -30,-38 L -14,-38 L -14,38 L -30,38 Z" fill="#9E1B21" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
      <path d="M -14,-4 L 14,-38 L 32,-38 L 4,-4 Z" fill="#9E1B21" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
      <path d="M 0,-4 L 32,38 L 14,38 L -14,4 Z" fill="#9E1B21" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
      <path d="M -14,-38 L 14,-38 C 28,-38 34,-28 34,-18 C 34,-9 28,-3 16,-3 L -14,-3 Z" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M -14,-3 L 16,-3 C 30,-3 36,5 36,18 C 36,29 28,38 14,38 L -14,38 Z" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>
  <g transform="translate(200, 260)">
    <path d="M -76,-50 C -68,-25 -82,-10 -90,12 C -96,28 -85,42 -68,44 C -50,46 -42,32 -38,15 C -34,0 -42,-22 -52,-42 C -56,-50 -70,-56 -76,-50 Z" fill="#8B1E22" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <path d="M 76,-50 C 68,-25 82,-10 90,12 C 96,28 85,42 68,44 C 50,46 42,32 38,15 C 34,0 42,-22 52,-42 C 56,-50 70,-56 76,-50 Z" fill="#8B1E22" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  </g>
  <text fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="800" font-size="16" letter-spacing="1.5">
    <textPath href="#bottomKotbarPath" startOffset="50%" text-anchor="middle">KOTA BARU ROLEPLAY</textPath>
  </text>
  <rect x="138" y="314" width="124" height="32" rx="8" fill="#8B1E22" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="200" y="337" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="4">KBR</text>
</svg>`;

let cachedLogoPromise: Promise<HTMLImageElement | null> | null = null;

function loadImageSrc(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function getOfficialLogoImage(): Promise<HTMLImageElement | null> {
  if (!cachedLogoPromise) {
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG_MARKUP)}`;
    cachedLogoPromise = loadImageSrc(encoded);
  }
  return cachedLogoPromise;
}

interface TextSegment {
  text: string;
  bold: boolean;
}

interface WrappedRichLine {
  segments: TextSegment[];
  isParagraphEnd: boolean;
}

function parseRichSegments(input: string): TextSegment[] {
  const parts = input.split(/(\*\*[^*]+\*\*)/g);
  const segments: TextSegment[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      segments.push({ text: part.slice(2, -2), bold: true });
    } else {
      segments.push({ text: part, bold: false });
    }
  }
  return segments;
}

function getFontString(fontStyle: 'serif' | 'sans', size: number, bold = false): string {
  const family =
    fontStyle === 'serif'
      ? 'Georgia, "Times New Roman", Times, serif'
      : '"Plus Jakarta Sans", "Inter", Arial, sans-serif';
  return `${bold ? 'bold ' : ''}${size}px ${family}`;
}

function wrapRichText(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  maxWidth: number,
  fontSize: number,
  fontStyle: 'serif' | 'sans',
  forceAllBold = false
): WrappedRichLine[] {
  const paragraphs = (rawText || '').split('\n');
  const allLines: WrappedRichLine[] = [];

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    if (!para.trim()) {
      allLines.push({ segments: [], isParagraphEnd: true });
      continue;
    }

    const segments = parseRichSegments(para);
    // Tokenize into words preserving leading/trailing spaces cleanly
    const words: { word: string; bold: boolean }[] = [];
    for (const seg of segments) {
      const splitWords = seg.text.split(/\s+/).filter(Boolean);
      for (const w of splitWords) {
        words.push({ word: w, bold: forceAllBold || seg.bold });
      }
    }

    if (words.length === 0) {
      allLines.push({ segments: [], isParagraphEnd: true });
      continue;
    }

    let currentLineWords: { word: string; bold: boolean }[] = [];
    let currentLineWidth = 0;

    const measureWord = (w: string, bold: boolean) => {
      ctx.font = getFontString(fontStyle, fontSize, bold);
      return ctx.measureText(w).width;
    };

    const spaceWidth = (() => {
      ctx.font = getFontString(fontStyle, fontSize, forceAllBold);
      return ctx.measureText(' ').width;
    })();

    for (let i = 0; i < words.length; i++) {
      const token = words[i];
      const wWidth = measureWord(token.word, token.bold);
      const nextWidth =
        currentLineWords.length === 0 ? wWidth : currentLineWidth + spaceWidth + wWidth;

      if (nextWidth > maxWidth && currentLineWords.length > 0) {
        allLines.push({
          segments: collapseWordsToSegments(currentLineWords),
          isParagraphEnd: false,
        });
        currentLineWords = [token];
        currentLineWidth = wWidth;
      } else {
        currentLineWords.push(token);
        currentLineWidth = nextWidth;
      }
    }

    if (currentLineWords.length > 0) {
      allLines.push({
        segments: collapseWordsToSegments(currentLineWords),
        isParagraphEnd: true,
      });
    }
  }

  return allLines;
}

function collapseWordsToSegments(words: { word: string; bold: boolean }[]): TextSegment[] {
  const result: TextSegment[] = [];
  for (let i = 0; i < words.length; i++) {
    const { word, bold } = words[i];
    const prefix = i === 0 ? '' : ' ';
    const last = result[result.length - 1];
    if (last && last.bold === bold) {
      last.text += prefix + word;
    } else {
      result.push({ text: prefix + word, bold });
    }
  }
  return result;
}

function drawRichLine(
  ctx: CanvasRenderingContext2D,
  line: WrappedRichLine,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  fontStyle: 'serif' | 'sans',
  color: string,
  align: 'left' | 'justify' = 'left'
) {
  if (line.segments.length === 0) return;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;

  // Calculate total words for optional justification
  const fullText = line.segments.map((s) => s.text).join('');
  const spaceCount = (fullText.match(/ /g) || []).length;

  let totalTextWidth = 0;
  for (const seg of line.segments) {
    ctx.font = getFontString(fontStyle, fontSize, seg.bold);
    totalTextWidth += ctx.measureText(seg.text).width;
  }

  const shouldJustify =
    align === 'justify' &&
    !line.isParagraphEnd &&
    spaceCount >= 3 &&
    totalTextWidth > maxWidth * 0.68 &&
    totalTextWidth < maxWidth;

  const extraSpacePerGap = shouldJustify ? (maxWidth - totalTextWidth) / spaceCount : 0;

  let cursorX = x;
  for (const seg of line.segments) {
    ctx.font = getFontString(fontStyle, fontSize, seg.bold);
    if (!shouldJustify || extraSpacePerGap <= 0) {
      ctx.fillText(seg.text, cursorX, y);
      cursorX += ctx.measureText(seg.text).width;
    } else {
      const charsAndSpaces = seg.text.split(/( )/);
      for (const piece of charsAndSpaces) {
        if (piece === '') continue;
        if (piece === ' ') {
          cursorX += ctx.measureText(' ').width + extraSpacePerGap;
        } else {
          ctx.fillText(piece, cursorX, y);
          cursorX += ctx.measureText(piece).width;
        }
      }
    }
  }
}

function getColumnWidths(headers: string[]): number[] {
  const count = Math.max(1, headers.length);
  if (count === 4) {
    // No | Item | Kesepakatan | Keterangan
    return [44, 198, 162, CONTENT_W - 44 - 198 - 162];
  }
  if (count === 3) {
    return [44, 240, CONTENT_W - 44 - 240];
  }
  if (count === 2) {
    return [220, CONTENT_W - 220];
  }
  const each = Math.floor(CONTENT_W / count);
  return headers.map((_, idx) => (idx === count - 1 ? CONTENT_W - each * (count - 1) : each));
}

function createA4CanvasPage(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = A4_LOGICAL_WIDTH * A4_RENDER_SCALE;
  canvas.height = A4_LOGICAL_HEIGHT * A4_RENDER_SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(A4_RENDER_SCALE, A4_RENDER_SCALE);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, A4_LOGICAL_WIDTH, A4_LOGICAL_HEIGHT);
  return { canvas, ctx };
}

function drawContinuationHeader(
  ctx: CanvasRenderingContext2D,
  letter: OfficialLetter,
  logoImg: HTMLImageElement | null
) {
  if (logoImg) {
    ctx.drawImage(logoImg, MARGIN_X, 26, 24, 24);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = CRIMSON_PRIMARY;
  ctx.font = getFontString(letter.fontStyle, 10.5, true);
  ctx.fillText(letter.kopTitle.toUpperCase(), MARGIN_X + (logoImg ? 32 : 0), 40);

  ctx.textAlign = 'right';
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = getFontString(letter.fontStyle, 9.5, false);
  ctx.fillText(`Nomor: ${letter.nomorSurat}`, A4_LOGICAL_WIDTH - MARGIN_X, 40);

  ctx.strokeStyle = BORDER_LIGHT;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, 55);
  ctx.lineTo(A4_LOGICAL_WIDTH - MARGIN_X, 55);
  ctx.stroke();
}

function drawKopSuratPage1(
  ctx: CanvasRenderingContext2D,
  letter: OfficialLetter,
  logoImg: HTMLImageElement | null
): number {
  const logoSize = 68;
  const logoX = MARGIN_X + 10;
  const logoY = 44;

  if (logoImg) {
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  } else {
    ctx.fillStyle = CRIMSON_PRIMARY;
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const textCenterX = A4_LOGICAL_WIDTH / 2 + 16;
  ctx.textAlign = 'center';

  ctx.fillStyle = CRIMSON_PRIMARY;
  ctx.font = getFontString(letter.fontStyle, 19.5, true);
  ctx.fillText((letter.kopTitle || 'RUMAH SAKIT KOTABARU ROLEPLAY').toUpperCase(), textCenterX, 66);

  ctx.fillStyle = TEXT_DARK;
  ctx.font = getFontString(letter.fontStyle, 13.5, true);
  ctx.fillText((letter.kopSubtitle || 'RUMAH SAKIT PILLBOX MEDICAL CENTER').toUpperCase(), textCenterX, 86);

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = getFontString(letter.fontStyle, 11, false);
  ctx.fillText(letter.kopAddress || 'Alamat: Pillbox Medical Center, Koordinat 201 — KotaBaru Roleplay', textCenterX, 104);

  // Double crimson Kop border
  const ruleY = 124;
  ctx.strokeStyle = CRIMSON_PRIMARY;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, ruleY);
  ctx.lineTo(A4_LOGICAL_WIDTH - MARGIN_X, ruleY);
  ctx.stroke();

  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, ruleY + 3.5);
  ctx.lineTo(A4_LOGICAL_WIDTH - MARGIN_X, ruleY + 3.5);
  ctx.stroke();

  return ruleY + 26;
}

export async function renderLetterToA4Canvases(
  letter: OfficialLetter
): Promise<HTMLCanvasElement[]> {
  const logoImg = await getOfficialLogoImage();

  // Preload any signature images
  const sigImageMap = new Map<string, HTMLImageElement | null>();
  await Promise.all(
    letter.signatures.map(async (sig) => {
      if (sig.signatureDataUrl) {
        const img = await loadImageSrc(sig.signatureDataUrl);
        sigImageMap.set(sig.id, img);
      }
    })
  );

  const pages: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }[] = [];
  let page = createA4CanvasPage();
  pages.push(page);

  let y = drawKopSuratPage1(page.ctx, letter, logoImg);

  const nextPage = () => {
    page = createA4CanvasPage();
    pages.push(page);
    drawContinuationHeader(page.ctx, letter, logoImg);
    y = TOP_MARGIN_NEXT;
  };

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > MAX_CONTENT_Y && y > TOP_MARGIN_NEXT + 10) {
      nextPage();
    }
  };

  const bodyFontSize = 11.5;
  const bodyLineHeight = 17;

  // 1. Metadata Block (Nomor, Lampiran, Perihal + Kota/Tanggal)
  {
    const ctx = page.ctx;
    const labelX = MARGIN_X;
    const colonX = MARGIN_X + 76;
    const valueX = MARGIN_X + 90;
    const metaMaxWidth = 270;

    ctx.textAlign = 'right';
    ctx.fillStyle = TEXT_BODY;
    ctx.font = getFontString(letter.fontStyle, 11.5, false);
    ctx.fillText(letter.kotaTanggal || '', A4_LOGICAL_WIDTH - MARGIN_X, y);

    const drawMetaRow = (label: string, val: string, boldVal = false) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = TEXT_BODY;
      ctx.font = getFontString(letter.fontStyle, 11.5, false);
      ctx.fillText(label, labelX, y);
      ctx.fillText(':', colonX, y);

      const wrapped = wrapRichText(ctx, val, metaMaxWidth, 11.5, letter.fontStyle, boldVal);
      if (wrapped.length === 0) {
        y += 16.5;
      } else {
        for (const wLine of wrapped) {
          drawRichLine(ctx, wLine, valueX, y, metaMaxWidth, 11.5, letter.fontStyle, TEXT_DARK, 'left');
          y += 16.5;
        }
      }
    };

    drawMetaRow('Nomor', letter.nomorSurat);
    drawMetaRow('Lampiran', letter.lampiran);
    drawMetaRow('Perihal', letter.perihal, true);
    y += 8;
  }

  // 2. Recipient Block (Kepada Yth.)
  {
    const ctx = page.ctx;
    ctx.textAlign = 'left';
    ctx.fillStyle = TEXT_BODY;
    ctx.font = getFontString(letter.fontStyle, 11.5, false);
    if (letter.kepadaYthLine1) {
      ctx.fillText(letter.kepadaYthLine1, MARGIN_X, y);
      y += 16;
    }
    if (letter.kepadaYthLine2) {
      ctx.font = getFontString(letter.fontStyle, 11.5, true);
      ctx.fillStyle = TEXT_DARK;
      ctx.fillText(letter.kepadaYthLine2, MARGIN_X, y);
      y += 16;
    }
    if (letter.kepadaYthLine3) {
      ctx.font = getFontString(letter.fontStyle, 11.5, false);
      ctx.fillStyle = TEXT_BODY;
      ctx.fillText(letter.kepadaYthLine3, MARGIN_X, y);
      y += 16;
    }
    y += 10;
  }

  // 3. Salam Pembuka & Paragraf Pembuka
  if (letter.salamPembuka) {
    ensureSpace(22);
    page.ctx.textAlign = 'left';
    page.ctx.fillStyle = TEXT_BODY;
    page.ctx.font = getFontString(letter.fontStyle, bodyFontSize, false);
    page.ctx.fillText(letter.salamPembuka, MARGIN_X, y);
    y += 22;
  }

  const drawParagraphPaginated = (
    text: string,
    fontSize = bodyFontSize,
    lineHeight = bodyLineHeight,
    color = TEXT_BODY,
    align: 'left' | 'justify' = 'justify'
  ) => {
    const lines = wrapRichText(page.ctx, text, CONTENT_W, fontSize, letter.fontStyle);
    for (const line of lines) {
      if (line.segments.length === 0) {
        y += lineHeight * 0.65;
        continue;
      }
      if (y + lineHeight > MAX_CONTENT_Y) {
        nextPage();
      }
      drawRichLine(page.ctx, line, MARGIN_X, y, CONTENT_W, fontSize, letter.fontStyle, color, align);
      y += lineHeight;
    }
  };

  if (letter.paragrafPembuka) {
    drawParagraphPaginated(letter.paragrafPembuka);
    y += 10;
  }

  // Helper to draw a table header row
  const drawTableHeaderRow = (
    ctx: CanvasRenderingContext2D,
    headers: string[],
    colWidths: number[],
    startY: number
  ): number => {
    const headerFontSize = 10.5;
    const headerLineH = 14;
    const padX = 9;
    const padY = 8;

    const wrappedCells = headers.map((h, i) =>
      wrapRichText(ctx, h, Math.max(20, colWidths[i] - padX * 2), headerFontSize, letter.fontStyle, true)
    );
    const maxLines = Math.max(1, ...wrappedCells.map((c) => c.length));
    const rowH = maxLines * headerLineH + padY * 2;

    let colX = MARGIN_X;
    for (let i = 0; i < headers.length; i++) {
      const w = colWidths[i];
      ctx.fillStyle = CRIMSON_PRIMARY;
      ctx.fillRect(colX, startY, w, rowH);
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(colX, startY, w, rowH);

      const cellLines = wrappedCells[i];
      let textY = startY + padY + 10.5;
      for (const ln of cellLines) {
        drawRichLine(
          ctx,
          ln,
          colX + padX,
          textY,
          w - padX * 2,
          headerFontSize,
          letter.fontStyle,
          '#FFFFFF',
          'left'
        );
        textY += headerLineH;
      }
      colX += w;
    }

    return startY + rowH;
  };

  // 4. Sections Loop
  for (const section of letter.sections) {
    const headingLines = section.heading
      ? wrapRichText(page.ctx, section.heading, CONTENT_W, 12, letter.fontStyle, true)
      : [];
    const introLines = section.intro
      ? wrapRichText(page.ctx, section.intro, CONTENT_W, bodyFontSize, letter.fontStyle)
      : [];

    const headingHeight = headingLines.length > 0 ? headingLines.length * 18 + 6 : 0;
    const introHeight = introLines.length > 0 ? introLines.length * bodyLineHeight + 8 : 0;

    // Estimate minimum first-content height so headings aren't orphaned
    let minFirstChildHeight = 24;
    if (section.type === 'table' && (section.tableHeaders?.length || 0) > 0) {
      minFirstChildHeight = 62;
    } else if (section.type === 'notice') {
      const nTitle = section.noticeTitle
        ? wrapRichText(page.ctx, section.noticeTitle, CONTENT_W - 28, 10.5, letter.fontStyle, true)
        : [];
      const nBody = section.noticeBody
        ? wrapRichText(page.ctx, section.noticeBody, CONTENT_W - 28, 10.5, letter.fontStyle)
        : [];
      minFirstChildHeight = nTitle.length * 15 + nBody.length * 15 + 24;
    }

    ensureSpace(headingHeight + introHeight + Math.min(minFirstChildHeight, 120));

    // Draw heading
    if (headingLines.length > 0) {
      for (const hLine of headingLines) {
        if (y + 18 > MAX_CONTENT_Y) nextPage();
        drawRichLine(
          page.ctx,
          hLine,
          MARGIN_X,
          y,
          CONTENT_W,
          12,
          letter.fontStyle,
          CRIMSON_PRIMARY,
          'left'
        );
        y += 18;
      }
      y += 4;
    }

    // Draw intro
    if (introLines.length > 0) {
      for (const iLine of introLines) {
        if (iLine.segments.length === 0) {
          y += bodyLineHeight * 0.6;
          continue;
        }
        if (y + bodyLineHeight > MAX_CONTENT_Y) nextPage();
        drawRichLine(
          page.ctx,
          iLine,
          MARGIN_X,
          y,
          CONTENT_W,
          bodyFontSize,
          letter.fontStyle,
          TEXT_BODY,
          'justify'
        );
        y += bodyLineHeight;
      }
      y += 6;
    }

    // Draw section body by type
    if (section.type === 'table') {
      const headers = section.tableHeaders || ['No', 'Uraian', 'Kesepakatan', 'Keterangan'];
      const rows = section.tableRows || [];
      const colWidths = getColumnWidths(headers);
      const cellFontSize = 10.5;
      const cellLineH = 14.5;
      const padX = 9;
      const padY = 8;

      const measureRow = (cells: string[]) => {
        const wrappedPerCol = headers.map((_, colIdx) => {
          const val = cells[colIdx] ?? '';
          const availW = Math.max(20, colWidths[colIdx] - padX * 2);
          return wrapRichText(page.ctx, val, availW, cellFontSize, letter.fontStyle);
        });
        const maxLineCount = Math.max(1, ...wrappedPerCol.map((lines) => lines.length));
        return {
          wrappedPerCol,
          height: maxLineCount * cellLineH + padY * 2,
        };
      };

      const firstRowMeasured = rows.length > 0 ? measureRow(rows[0]) : { wrappedPerCol: [], height: 28 };
      ensureSpace(34 + firstRowMeasured.height);

      y = drawTableHeaderRow(page.ctx, headers, colWidths, y - 4);

      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const { wrappedPerCol, height: rowH } = measureRow(rows[rIdx]);
        if (y + rowH > MAX_CONTENT_Y) {
          nextPage();
          y = drawTableHeaderRow(page.ctx, headers, colWidths, y);
        }

        const ctx = page.ctx;
        const rowBg = rIdx % 2 === 1 ? '#F8FAFC' : '#FFFFFF';
        let colX = MARGIN_X;
        for (let cIdx = 0; cIdx < headers.length; cIdx++) {
          const w = colWidths[cIdx];
          ctx.fillStyle = rowBg;
          ctx.fillRect(colX, y, w, rowH);
          ctx.strokeStyle = BORDER_LIGHT;
          ctx.lineWidth = 0.7;
          ctx.strokeRect(colX, y, w, rowH);

          const cellLines = wrappedPerCol[cIdx];
          let textY = y + padY + 10.5;
          for (const ln of cellLines) {
            if (ln.segments.length > 0) {
              drawRichLine(
                ctx,
                ln,
                colX + padX,
                textY,
                w - padX * 2,
                cellFontSize,
                letter.fontStyle,
                TEXT_BODY,
                'left'
              );
            }
            textY += cellLineH;
          }
          colX += w;
        }
        y += rowH;
      }
      y += 18;
    } else if (section.type === 'paragraph') {
      if (section.body) {
        drawParagraphPaginated(section.body);
        y += 12;
      }
    } else if (section.type === 'list') {
      const items = section.listItems || [];
      for (let idx = 0; idx < items.length; idx++) {
        const prefix = section.listStyle === 'numbered' ? `${idx + 1}.` : '•';
        const indent = 22;
        const lines = wrapRichText(
          page.ctx,
          items[idx],
          CONTENT_W - indent,
          bodyFontSize,
          letter.fontStyle
        );
        const itemH = Math.max(1, lines.length) * bodyLineHeight;
        ensureSpace(Math.min(itemH, bodyLineHeight * 2));

        page.ctx.textAlign = 'left';
        page.ctx.fillStyle = TEXT_DARK;
        page.ctx.font = getFontString(letter.fontStyle, bodyFontSize, true);
        page.ctx.fillText(prefix, MARGIN_X + 4, y);

        for (const ln of lines) {
          if (y + bodyLineHeight > MAX_CONTENT_Y) nextPage();
          drawRichLine(
            page.ctx,
            ln,
            MARGIN_X + indent,
            y,
            CONTENT_W - indent,
            bodyFontSize,
            letter.fontStyle,
            TEXT_BODY,
            'justify'
          );
          y += bodyLineHeight;
        }
        y += 3;
      }
      y += 10;
    } else if (section.type === 'notice') {
      const innerW = CONTENT_W - 28;
      const titleLines = section.noticeTitle
        ? wrapRichText(page.ctx, section.noticeTitle, innerW, 10.5, letter.fontStyle, true)
        : [];
      const bodyLines = section.noticeBody
        ? wrapRichText(page.ctx, section.noticeBody, innerW, 10.5, letter.fontStyle)
        : [];

      const boxPadY = 11;
      const boxLineH = 15;
      const boxH =
        boxPadY * 2 +
        titleLines.length * boxLineH +
        (titleLines.length > 0 && bodyLines.length > 0 ? 3 : 0) +
        bodyLines.length * boxLineH;

      ensureSpace(boxH);

      const boxY = y - 4;
      const ctx = page.ctx;
      ctx.fillStyle = '#FDF2F2';
      ctx.fillRect(MARGIN_X, boxY, CONTENT_W, boxH);

      ctx.fillStyle = CRIMSON_PRIMARY;
      ctx.fillRect(MARGIN_X, boxY, 4, boxH);

      let cursorY = boxY + boxPadY + 10;
      for (const tl of titleLines) {
        drawRichLine(ctx, tl, MARGIN_X + 14, cursorY, innerW, 10.5, letter.fontStyle, CRIMSON_PRIMARY, 'left');
        cursorY += boxLineH;
      }
      if (titleLines.length > 0 && bodyLines.length > 0) {
        cursorY += 3;
      }
      for (const bl of bodyLines) {
        drawRichLine(ctx, bl, MARGIN_X + 14, cursorY, innerW, 10.5, letter.fontStyle, TEXT_BODY, 'left');
        cursorY += boxLineH;
      }
      y = boxY + boxH + 18;
    }
  }

  // 5. Closing Paragraph + Signature Grid
  const sigCount = letter.signatures.length;
  const sigBlockHeight = sigCount > 0 ? 132 : 0;

  if (letter.paragrafPenutup) {
    const closingLines = wrapRichText(
      page.ctx,
      letter.paragrafPenutup,
      CONTENT_W,
      bodyFontSize,
      letter.fontStyle
    );
    const closingH = closingLines.length * bodyLineHeight + 14;
    // Keep closing paragraph and signature block together if they fit cleanly on a fresh page
    if (y + closingH + sigBlockHeight > MAX_CONTENT_Y && closingH + sigBlockHeight < MAX_CONTENT_Y - TOP_MARGIN_NEXT) {
      nextPage();
    }
    drawParagraphPaginated(letter.paragrafPenutup);
    y += 18;
  }

  if (sigCount > 0) {
    ensureSpace(sigBlockHeight);
    const ctx = page.ctx;
    const colW = CONTENT_W / sigCount;
    const startSigY = y + 4;

    letter.signatures.forEach((sig: LetterSignatureItem, idx: number) => {
      const centerX = MARGIN_X + colW * idx + colW / 2;

      // Top Label
      ctx.textAlign = 'center';
      ctx.fillStyle = TEXT_DARK;
      ctx.font = getFontString(letter.fontStyle, 11, true);
      ctx.fillText(sig.topLabel || '', centerX, startSigY);

      // Signature Image (if provided)
      const sigImg = sigImageMap.get(sig.id);
      if (sigImg) {
        const maxSigW = Math.min(140, colW - 24);
        const maxSigH = 48;
        const ratio = Math.min(maxSigW / sigImg.width, maxSigH / sigImg.height);
        const drawW = sigImg.width * ratio;
        const drawH = sigImg.height * ratio;
        ctx.drawImage(sigImg, centerX - drawW / 2, startSigY + 8 + (maxSigH - drawH) / 2, drawW, drawH);
      }

      const nameY = startSigY + 72;
      if (sig.isBlankLine || !sig.name.trim()) {
        ctx.fillStyle = TEXT_DARK;
        ctx.font = getFontString(letter.fontStyle, 11, false);
        ctx.fillText('(                              )', centerX, nameY);
      } else {
        ctx.fillStyle = TEXT_DARK;
        ctx.font = getFontString(letter.fontStyle, 11, true);
        ctx.fillText(sig.name, centerX, nameY);

        const nameW = ctx.measureText(sig.name).width;
        ctx.strokeStyle = TEXT_DARK;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX - nameW / 2, nameY + 2.5);
        ctx.lineTo(centerX + nameW / 2, nameY + 2.5);
        ctx.stroke();
      }

      ctx.fillStyle = TEXT_MUTED;
      ctx.font = getFontString(letter.fontStyle, 10.5, false);
      ctx.fillText(sig.roleLabel || '', centerX, nameY + 17);
    });
  }

  // 6. Second pass: Draw consistent Footers on every page with accurate "Halaman X dari Y"
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    const ctx = p.ctx;
    ctx.strokeStyle = BORDER_LIGHT;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, FOOTER_LINE_Y);
    ctx.lineTo(A4_LOGICAL_WIDTH - MARGIN_X, FOOTER_LINE_Y);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = getFontString(letter.fontStyle, 9.5, false);
    ctx.fillText(
      letter.footerTitle || 'Paramedic KotaBaru Roleplay — Surat Resmi Rumah Sakit',
      MARGIN_X,
      FOOTER_TEXT_Y
    );

    ctx.textAlign = 'right';
    ctx.fillText(`Halaman ${idx + 1} dari ${totalPages}`, A4_LOGICAL_WIDTH - MARGIN_X, FOOTER_TEXT_Y);
  });

  return pages.map((p) => p.canvas);
}

function buildSafeFileBase(letter: OfficialLetter): string {
  const raw = `${letter.perihal || 'Surat_RSKB'}_${letter.nomorSurat || 'Draft'}`;
  return raw
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 72);
}

export function exportLetterToPdf(letter: OfficialLetter, canvases: HTMLCanvasElement[]): void {
  if (canvases.length === 0) return;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  canvases.forEach((canvas, idx) => {
    if (idx > 0) pdf.addPage('a4', 'portrait');
    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  });

  pdf.save(`${buildSafeFileBase(letter)}.pdf`);
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLetterPageImage(
  letter: OfficialLetter,
  canvas: HTMLCanvasElement,
  pageNumber: number,
  totalPages: number,
  format: 'png' | 'jpeg'
): void {
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  const base = buildSafeFileBase(letter);
  const suffix = totalPages > 1 ? `_Halaman_${pageNumber}` : '';
  triggerDownload(canvas.toDataURL(mime, 0.96), `${base}${suffix}.${ext}`);
}

export function exportLetterCombinedImage(
  letter: OfficialLetter,
  canvases: HTMLCanvasElement[],
  format: 'png' | 'jpeg'
): void {
  if (canvases.length === 0) return;
  if (canvases.length === 1) {
    exportLetterPageImage(letter, canvases[0], 1, 1, format);
    return;
  }

  const gap = 28;
  const w = canvases[0].width;
  const totalH = canvases.reduce((sum, c) => sum + c.height, 0) + gap * (canvases.length - 1);

  const merged = document.createElement('canvas');
  merged.width = w;
  merged.height = totalH;
  const ctx = merged.getContext('2d')!;
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, w, totalH);

  let yOffset = 0;
  canvases.forEach((c) => {
    ctx.drawImage(c, 0, yOffset);
    yOffset += c.height + gap;
  });

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  triggerDownload(merged.toDataURL(mime, 0.94), `${buildSafeFileBase(letter)}_Semua_Halaman.${ext}`);
}
