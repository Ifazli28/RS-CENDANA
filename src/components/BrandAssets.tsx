import React from 'react';

/**
 * Official Logo RS Kota Baru / Paramedic Kota Baru (KBR - Kota Baru Roleplay)
 * Exact vector badge matching the uploaded embroidered patch:
 * - Circular crimson-red textured patch with twin white stitched borders
 * - Top arch: "PARAMEDIC" in bold athletic white uppercase
 * - Center: Deep crimson Star of Life with white border
 * - Monogram "KB" / "KBR" in white double outline with textured fill inside the Star
 * - Open supporting hands gently cupping the Star of Life from below
 * - Bottom ribbon banner: "KBR" and arched "KOTA BARU ROLEPLAY"
 */
export const LogoRSKotaBaru: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="patchBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#A82329" />
        <stop offset="65%" stopColor="#8B1E22" />
        <stop offset="100%" stopColor="#671014" />
      </radialGradient>
      <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#B91C1C" />
        <stop offset="50%" stopColor="#991B1B" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9E1B21" />
        <stop offset="100%" stopColor="#671014" />
      </linearGradient>

      {/* Fabric Twill Pattern */}
      <pattern id="twill" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 6L6 0M3 9L9 3M-3 3L3 -3" stroke="#450A0A" strokeWidth="0.8" opacity="0.35" />
      </pattern>

      {/* Arc text paths */}
      <path id="topParamedicPath" d="M 62,200 A 138,138 0 1,1 338,200" fill="none" />
      <path id="bottomKotbarPath" d="M 88,292 A 140,140 0 0,0 312,292" fill="none" />
    </defs>

    {/* Outer Embroidered Stitch Ring */}
    <circle cx="200" cy="200" r="192" fill="#8B1E22" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="200" cy="200" r="192" fill="url(#twill)" />
    <circle cx="200" cy="200" r="188" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="4,3" />

    {/* Outer Red Ring Band */}
    <circle cx="200" cy="200" r="182" fill="none" stroke="#FFFFFF" strokeWidth="3" />
    <circle cx="200" cy="200" r="148" fill="none" stroke="#FFFFFF" strokeWidth="3" />

    {/* Left & Right Divider Stripes */}
    <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round">
      <line x1="12" y1="174" x2="52" y2="182" />
      <line x1="12" y1="204" x2="50" y2="206" />
      <line x1="388" y1="174" x2="348" y2="182" />
      <line x1="388" y1="204" x2="350" y2="206" />
    </g>

    {/* Inner Medallion Background */}
    <circle cx="200" cy="200" r="146" fill="url(#patchBg)" />
    <circle cx="200" cy="200" r="146" fill="url(#twill)" />
    <circle cx="200" cy="200" r="146" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

    {/* TOP TEXT: PARAMEDIC */}
    <text fill="#FFFFFF" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="34" letterSpacing="4.5">
      <textPath href="#topParamedicPath" startOffset="50%" textAnchor="middle">
        PARAMEDIC
      </textPath>
    </text>

    {/* CENTER STAR OF LIFE (6-pointed medical star) */}
    <g transform="translate(200, 182)">
      <path
        d="M -24,-92 L 24,-92 L 24,-32 L 68,-57 L 92,-15 L 48,10 L 92,35 L 68,77 L 24,52 L 24,92 L -24,92 L -24,52 L -68,77 L -92,35 L -48,10 L -92,-15 L -68,-57 L -24,-32 Z"
        fill="url(#starGrad)"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M -24,-92 L 24,-92 L 24,-32 L 68,-57 L 92,-15 L 48,10 L 92,35 L 68,77 L 24,52 L 24,92 L -24,92 L -24,52 L -68,77 L -92,35 L -48,10 L -92,-15 L -68,-57 L -24,-32 Z"
        fill="url(#twill)"
        opacity="0.4"
      />

      {/* Monogram KB / KBR inside Star of Life */}
      <g transform="translate(0, -3)">
        <rect x="-36" y="-44" width="72" height="84" rx="8" fill="#50070A" opacity="0.6" />
        <path d="M -30,-38 L -14,-38 L -14,38 L -30,38 Z" fill="#9E1B21" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
        <path d="M -14,-4 L 14,-38 L 32,-38 L 4,-4 Z" fill="#9E1B21" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
        <path d="M 0,-4 L 32,38 L 14,38 L -14,4 Z" fill="#9E1B21" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
        <path
          d="M -14,-38 L 14,-38 C 28,-38 34,-28 34,-18 C 34,-9 28,-3 16,-3 L -14,-3 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M -14,-3 L 16,-3 C 30,-3 36,5 36,18 C 36,29 28,38 14,38 L -14,38 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="-24" y1="-32" x2="-20" y2="32" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="3,3" />
      </g>
    </g>

    {/* CARING / SUPPORTING HANDS AT BOTTOM */}
    <g transform="translate(200, 260)">
      <path
        d="M -76,-50 C -68,-25 -82,-10 -90,12 C -96,28 -85,42 -68,44 C -50,46 -42,32 -38,15 C -34,0 -42,-22 -52,-42 C -56,-50 -70,-56 -76,-50 Z"
        fill="#8B1E22"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M -86,0 C -78,16 -70,28 -56,30" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M -70,-26 C -62,-8 -54,8 -44,14" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

      <path
        d="M 76,-50 C 68,-25 82,-10 90,12 C 96,28 85,42 68,44 C 50,46 42,32 38,15 C 34,0 42,-22 52,-42 C 56,-50 70,-56 76,-50 Z"
        fill="#8B1E22"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M 86,0 C 78,16 70,28 56,30" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 70,-26 C 62,-8 54,8 44,14" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* BOTTOM RIBBON BANNER */}
    <path
      d="M 60,320 Q 200,305 340,320 L 326,382 Q 200,366 74,382 Z"
      fill="url(#ribbonGrad)"
      stroke="#FFFFFF"
      strokeWidth="3.5"
    />
    <path
      d="M 60,320 Q 200,305 340,320 L 326,382 Q 200,366 74,382 Z"
      fill="url(#twill)"
      opacity="0.35"
    />
    <path d="M 66,324 Q 200,309 334,324" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M 78,378 Q 200,362 322,378" fill="none" stroke="#FFFFFF" strokeWidth="2" />

    {/* Ribbon Text Line 1: KBR */}
    <text x="200" y="345" textAnchor="middle" fill="#FFFFFF" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="25" letterSpacing="2">
      KBR
    </text>

    {/* Ribbon Text Line 2: KOTA BARU ROLEPLAY */}
    <text fill="#FFFFFF" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="16" letterSpacing="2.8">
      <textPath href="#bottomKotbarPath" startOffset="50%" textAnchor="middle">
        KOTA BARU ROLEPLAY
      </textPath>
    </text>
  </svg>
);

/**
 * Official Logo Kota Baru Roleplay (KBR)
 * Exact vector badge matching the uploaded KB.png:
 * - Stylized 3D monogram combining letters K, B, and R
 * - Glossy red top half with bevel highlights
 * - Crisp white bottom half with red contours
 * - Center angled 3D chevron
 * - Typography: "KOTA BARU" (bold solid red) & "ROLEPLAY" (clean outlined style)
 */
export const LogoKotaBaruRoleplay: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 320 320" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kbRedGloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="40%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>

      <linearGradient id="kbWhiteGloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>

      <clipPath id="kbClipTopHalf">
        <rect x="0" y="0" width="320" height="134" />
      </clipPath>

      <clipPath id="kbClipBottomHalf">
        <rect x="0" y="134" width="320" height="186" />
      </clipPath>

      <filter id="kb3dShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#450A0A" floodOpacity="0.25" />
      </filter>
    </defs>

    <g filter="url(#kb3dShadow)">
      {/* RED TOP HALF */}
      <g clipPath="url(#kbClipTopHalf)">
        <path
          d="M 64,36 L 206,36 C 242,36 256,58 256,86 C 256,116 238,138 206,146 L 254,198 C 258,204 250,214 238,214 L 188,214 L 140,158 L 102,194 L 102,214 L 64,214 Z"
          fill="url(#kbRedGloss)"
          stroke="#7F1D1D"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Top Inner Cutout (Upper loop of B) */}
        <path
          d="M 102,64 L 194,64 C 212,64 220,74 220,88 C 220,102 210,112 192,112 L 102,112 Z"
          fill="#FFFFFF"
          stroke="#7F1D1D"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Specular Bevel Line */}
        <path
          d="M 70,42 L 202,42 C 234,42 248,60 248,86 C 248,110 234,130 204,138"
          fill="none"
          stroke="#FECACA"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* WHITE BOTTOM HALF */}
      <g clipPath="url(#kbClipBottomHalf)">
        <path
          d="M 64,36 L 206,36 C 242,36 256,58 256,86 C 256,116 238,138 206,146 L 254,198 C 258,204 250,214 238,214 L 188,214 L 140,158 L 102,194 L 102,214 L 64,214 Z"
          fill="url(#kbWhiteGloss)"
          stroke="#9E1B21"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Lower Inner Cutout */}
        <path
          d="M 102,130 L 158,130 L 204,188 L 168,188 L 132,146 L 102,174 Z"
          fill="#FFFFFF"
          stroke="#9E1B21"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 70,136 L 70,208 L 96,208 L 96,178 L 134,142 L 180,198 L 230,198"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
      </g>

      {/* CENTER K-CHEVRON 3D PRISM */}
      <polygon
        points="102,134 196,48 226,48 132,134"
        fill="url(#kbRedGloss)"
        stroke="#9E1B21"
        strokeWidth="3"
      />
      <line x1="102" y1="134" x2="226" y2="48" stroke="#FEE2E2" strokeWidth="2.5" strokeLinecap="round" />

      <polygon
        points="114,134 198,214 168,214 102,148"
        fill="url(#kbWhiteGloss)"
        stroke="#9E1B21"
        strokeWidth="3"
      />
      <line x1="114" y1="134" x2="198" y2="214" stroke="#9E1B21" strokeWidth="2.5" strokeLinecap="round" />

      {/* Red / White Mid-line separator */}
      <line x1="62" y1="134" x2="252" y2="134" stroke="#7F1D1D" strokeWidth="2.5" opacity="0.6" />

      {/* Outer contour stroke */}
      <path
        d="M 64,36 L 206,36 C 242,36 256,58 256,86 C 256,116 238,138 206,146 L 254,198 C 258,204 250,214 238,214 L 188,214 L 140,158 L 102,194 L 102,214 L 64,214 Z"
        fill="none"
        stroke="#9E1B21"
        strokeWidth="4.5"
      />
    </g>

    {/* TYPOGRAPHY: KOTA BARU */}
    <text
      x="160"
      y="252"
      textAnchor="middle"
      fill="#9E1B21"
      fontFamily="'Arial Black', 'Impact', 'Montserrat', sans-serif"
      fontWeight="900"
      fontSize="24"
      letterSpacing="4.5"
    >
      KOTA BARU
    </text>

    {/* TYPOGRAPHY: ROLEPLAY */}
    <text
      x="160"
      y="280"
      textAnchor="middle"
      fill="#FFFFFF"
      stroke="#9E1B21"
      strokeWidth="1.8"
      fontFamily="'Arial Black', 'Impact', 'Montserrat', sans-serif"
      fontWeight="900"
      fontSize="20"
      letterSpacing="5.5"
    >
      ROLEPLAY
    </text>
  </svg>
);

// Aliases for clean compatibility across existing imports
export const LogoParamedicKotaBaru = LogoRSKotaBaru;

/**
 * Generates an official, full-resolution SVG data URL for
 * "RUMAH SAKIT KOTA BARU — REGULATION & MEDICAL SERVICES" poster
 */
export const DEFAULT_REGULATION_POSTER_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1260" width="900" height="1260">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF5F5"/>
      <stop offset="50%" stop-color="#FEE2E2"/>
      <stop offset="100%" stop-color="#FECDD3"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="redTitle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#991B1B"/>
    </linearGradient>
    <linearGradient id="crimGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>
    <filter id="softShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#450A0A" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="900" height="1260" fill="url(#bgGrad)"/>

  <!-- Subtle Watermark Silhouette -->
  <g opacity="0.10" transform="translate(250, 280)">
    <rect x="60" y="180" width="60" height="280" fill="#9E1B21"/>
    <rect x="130" y="120" width="65" height="340" fill="#8B1E22"/>
    <rect x="215" y="130" width="65" height="330" fill="#8B1E22"/>
    <rect x="290" y="190" width="55" height="270" fill="#9E1B21"/>
    <polygon points="185,40 215,40 225,460 175,460" fill="#FFFFFF" stroke="#9E1B21" stroke-width="4"/>
  </g>

  <!-- Top Header Emblem Left (Paramedic Kota Baru) -->
  <g transform="translate(42, 42)">
    <circle cx="72" cy="72" r="70" fill="#8B1E22" stroke="#FFFFFF" stroke-width="3" filter="url(#softShadow)"/>
    <circle cx="72" cy="72" r="62" fill="#671014" stroke="#DC2626" stroke-width="2"/>
    <rect x="61" y="42" width="22" height="60" rx="5" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
    <rect x="42" y="61" width="60" height="22" rx="5" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M45 72 H62 L66 64 L72 82 L77 60 L82 78 L86 72 H99" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
    <text x="72" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" letter-spacing="1.5">PARAMEDIC</text>
    <text x="72" y="127" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" letter-spacing="1.5">KOTA BARU</text>
  </g>

  <!-- Top Header Emblem Right (Kota Baru Roleplay Official KB) -->
  <g transform="translate(715, 42)">
    <circle cx="72" cy="72" r="66" fill="#8B1E22" stroke="#FFFFFF" stroke-width="3" filter="url(#softShadow)"/>
    <circle cx="72" cy="72" r="58" fill="#671014" stroke="#DC2626" stroke-width="1.5"/>
    <!-- Stylized KB Monogram (Merah Putih 3D) -->
    <path d="M 46,38 L 86,38 C 96,38 102,44 102,52 C 102,60 96,66 88,68 L 102,86 C 104,89 101,92 97,92 L 82,92 L 68,74 L 56,86 L 56,92 L 46,92 Z" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M 46,65 L 102,65 L 102,92 L 46,92 Z" fill="#FFFFFF" clip-path="polygon(46,65 102,65 102,92 46,92)"/>
    <path d="M 56,46 L 82,46 C 88,46 92,49 92,54 C 92,59 88,62 82,62 L 56,62 Z" fill="#671014"/>
    <text x="72" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="12.5" fill="#FFFFFF" letter-spacing="1.5">KOTA BARU</text>
    <rect x="28" y="118" width="88" height="15" rx="4" fill="#7F1D1D" stroke="#FFFFFF" stroke-width="1"/>
    <text x="72" y="129" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="8.5" fill="#FFFFFF" letter-spacing="1">ROLEPLAY</text>
  </g>

  <!-- Main Header Titles -->
  <text x="450" y="96" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="56" fill="url(#goldGrad)" stroke="#78350F" stroke-width="2" filter="url(#softShadow)">RUMAH SAKIT</text>
  <text x="450" y="168" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="70" fill="url(#redTitle)" stroke="#78350F" stroke-width="2.5" filter="url(#softShadow)">KOTA BARU</text>
  <text x="450" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="25" fill="#1E293B" letter-spacing="1">REGULATION &amp; MEDICAL SERVICES</text>

  <!-- LEFT COLUMN -->
  <!-- Section 1: BIAYA TREATMENT & PERTOLONGAN PERTAMA -->
  <g transform="translate(38, 245)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16.5" fill="#1E293B">BIAYA TREATMENT &amp; PERTOLONGAN PERTAMA</text>

    <g transform="translate(12, 68)" font-family="Arial, sans-serif" font-weight="bold" font-size="18.5" fill="#1E293B">
      <rect x="0" y="-16" width="22" height="20" rx="4" fill="#991B1B"/>
      <text x="11" y="-1" text-anchor="middle" fill="#FFFFFF" font-size="15">+</text>
      <text x="32" y="0">Treatment ($100 CASH)</text>

      <circle cx="11" cy="28" r="11" fill="#991B1B"/>
      <text x="11" y="33" text-anchor="middle" fill="#FFFFFF" font-size="12">♥</text>
      <text x="32" y="34">Revive Areas :</text>

      <g font-size="17.5" font-weight="bold">
        <text x="32" y="64">Rumah Sakit $120</text>
        <text x="32" y="92">Sandy Shores $180</text>
        <text x="32" y="120">Paleto $140</text>
        <text x="32" y="148">Kota $160</text>

        <text x="200" y="64" fill="#991B1B">▲</text>
        <text x="218" y="64" font-size="16">Laut/Gunung/Perburuan $180</text>
        <text x="200" y="92" fill="#991B1B">📍</text>
        <text x="218" y="92" font-size="16">Cayo Perico/Pulau $200</text>
        <text x="200" y="124" fill="#991B1B">🧾</text>
        <text x="218" y="124" font-size="16.5">INVOICE</text>
      </g>
    </g>
  </g>

  <!-- Section 2: REGULASI KRIMINAL -->
  <g transform="translate(38, 480)">
    <rect x="0" y="0" width="395" height="58" rx="29" fill="url(#crimGrad)" stroke="#FDE68A" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF">REGULASI KRIMINAL</text>
    <text x="197" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13.5" fill="#FDE68A">(ZONA KHUSUS PULAU CAYO &amp; MAGIC LAND)</text>

    <g transform="translate(12, 84)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#991B1B">⚔</text>
      <text x="30" y="0">Peperangan for conflict/crime</text>
      <text x="0" y="30" fill="#991B1B">👮</text>
      <text x="30" y="30">Perampokan, $150 /orang</text>
      <text x="0" y="60" fill="#991B1B">🔫</text>
      <text x="30" y="60">Perang Jalanan $150 /orang</text>
      <text x="0" y="90" fill="#991B1B">💥</text>
      <text x="30" y="90">Perang Besar, $150 /orang</text>
      <text x="0" y="120" fill="#991B1B">🛡</text>
      <text x="30" y="120">Penyanderaan, $150 /orang</text>
    </g>
  </g>

  <!-- Section 3: BIAYA OPERASI & KONSULTASI -->
  <g transform="translate(38, 705)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#1E293B">BIAYA OPERASI &amp; KONSULTASI</text>

    <g transform="translate(12, 74)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#991B1B">✂</text>
      <text x="30" y="0">Minor Op $800</text>
      <text x="0" y="28" fill="#991B1B">✂</text>
      <text x="30" y="28">Mayor Op $1.000</text>
      <text x="0" y="56" fill="#991B1B">✨</text>
      <text x="30" y="56">Plastik $2.500</text>
      <text x="215" y="56" font-size="16.5">(Biaya Per 1 Anak $300)</text>
      <text x="0" y="84" fill="#991B1B">🤱</text>
      <text x="30" y="84">Melahirkan Normal $800</text>
      <text x="30" y="112">Melahirkan Caesar $1,000</text>
      <text x="0" y="140" fill="#991B1B">🩺</text>
      <text x="30" y="140">Dr Umum $150 CASH</text>
      <text x="0" y="168" fill="#991B1B">👨‍⚕️</text>
      <text x="30" y="168">Dr Spesialis $300 CASH</text>
    </g>
  </g>

  <!-- RIGHT COLUMN -->
  <!-- Section 4: BIAYA RAWAT INAP & SURAT MEDIS -->
  <g transform="translate(468, 245)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#1E293B">BIAYA RAWAT INAP &amp; SURAT MEDIS</text>

    <g transform="translate(12, 74)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#991B1B">🛏</text>
      <text x="32" y="0">Kamar Reguler $60/hari</text>
      <text x="0" y="34" fill="#991B1B">🛏</text>
      <text x="32" y="34">VIP $80/hari</text>
      <text x="0" y="68" fill="#991B1B">🛏</text>
      <text x="32" y="68">VVIP $100/hari</text>

      <text x="225" y="0" fill="#991B1B">🧪</text>
      <text x="252" y="0">Uji Lab $3.000</text>
      <text x="225" y="34" fill="#991B1B">📋</text>
      <text x="252" y="34">SK Sehat $500</text>
      <text x="225" y="68" fill="#991B1B">🧠</text>
      <text x="252" y="68">SK Psikologi $750</text>
    </g>
  </g>

  <!-- Section 5: REGULASI LENGKAP LAINNYA & PEMAKAMAN -->
  <g transform="translate(468, 415)">
    <rect x="0" y="0" width="395" height="58" rx="29" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="17.5" fill="#1E293B">REGULASI LENGKAP LAINNYA</text>
    <text x="197" y="47" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="17.5" fill="#1E293B">&amp; PEMAKAMAN</text>

    <g transform="translate(12, 86)" font-family="Arial, sans-serif" font-weight="bold" font-size="17.5" fill="#1E293B">
      <text x="0" y="0" fill="#991B1B">🪪</text>
      <text x="30" y="0">Kartu Pasien $1,500</text>
      <text x="30" y="22" font-size="15">(Masa berlaku 1 bulan)</text>
      <text x="0" y="50" fill="#991B1B">🔄</text>
      <text x="30" y="50">Perpanjang $1,000</text>
      <text x="0" y="80" fill="#991B1B">🔍</text>
      <text x="30" y="80">Autopsi $2.500</text>
      <text x="0" y="110" fill="#991B1B">👁</text>
      <text x="30" y="110">Visum $1.500</text>

      <text x="215" y="0" fill="#991B1B">📄</text>
      <text x="242" y="0">Visum $1.500</text>
      <text x="215" y="34" fill="#991B1B">🪦</text>
      <text x="242" y="34">Pemakaman Umum</text>
      <text x="242" y="56">$2.000</text>
      <text x="215" y="86" fill="#991B1B">💉</text>
      <text x="242" y="86">Imunisasi anak $750</text>
    </g>
  </g>

  <!-- Section 6: REGULASI PERBAN & OBAT-OBATAN (CASH) -->
  <g transform="translate(468, 665)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16.5" fill="#1E293B">REGULASI PERBAN &amp; OBAT-OBATAN (CASH)</text>

    <g transform="translate(12, 72)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#991B1B">💊</text>
      <text x="30" y="0">Paket Kecil $150</text>
      <text x="0" y="30" fill="#991B1B">🧰</text>
      <text x="30" y="30">Paket Sedang $200</text>
      <text x="215" y="0" fill="#991B1B">🧰</text>
      <text x="245" y="0">Paket Besar $250</text>
    </g>

    <!-- PERATURAN PEMBELIAN OBAT Box -->
    <g transform="translate(0, 122)">
      <rect x="0" y="14" width="395" height="118" rx="14" fill="#FFFBEB" stroke="#D4AF37" stroke-width="2.5" filter="url(#softShadow)"/>
      <rect x="46" y="0" width="303" height="32" rx="10" fill="#FEF3C7" stroke="#D4AF37" stroke-width="2"/>
      <text x="197" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="15.5" fill="#1E293B">PERATURAN PEMBELIAN OBAT</text>
      <circle cx="372" cy="18" r="22" fill="url(#goldGrad)" stroke="#FEF3C7" stroke-width="2"/>

      <g font-family="Arial, sans-serif" font-weight="bold" font-size="14.5" fill="#1E293B" text-anchor="middle">
        <text x="197" y="54">Wajib Menunjukan KARTU PASIEN dan MAKSIMAL</text>
        <text x="197" y="74">Pembelian 1/Paketnya. Apabila dirasa</text>
        <text x="197" y="94">diperlukan dosis yang lebih, maka silahkan</text>
        <text x="197" y="114">dikonsultasikan lebih lanjut dengan Dokter.</text>
      </g>
    </g>
  </g>

  <!-- BOTTOM BANNER: BENEFIT SKWB -->
  <g transform="translate(65, 965)">
    <rect x="0" y="0" width="770" height="225" rx="18" fill="#FFFBEB" stroke="#D4AF37" stroke-width="4" filter="url(#softShadow)"/>
    <rect x="10" y="10" width="750" height="205" rx="12" fill="none" stroke="#D4AF37" stroke-width="1.5"/>

    <text x="385" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="#1E293B">BENEFIT SKWB</text>
    <text x="385" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="21" fill="#1E293B">(Surat Keterangan Warga Baru)</text>

    <g font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#1E293B" text-anchor="middle">
      <text x="385" y="118">- Mendapatkan Paket Claim, Perban &amp; Obat-obatan (Bisa di Claim/Hari)</text>
      <text x="385" y="152">- Mendapatkan Potongan Pembuatan Kartu Pasien 50%</text>
      <text x="385" y="186">- Gratis Oplas 1 Kali (Selama SKWB Masih Berlaku)</text>
    </g>

    <!-- Gold Ribbon Seal -->
    <g transform="translate(665, 115)">
      <polygon points="25,65 10,125 35,110 50,128 55,65" fill="#D97706"/>
      <polygon points="55,65 65,125 85,108 105,122 85,65" fill="#B45309"/>
      <circle cx="55" cy="48" r="44" fill="url(#goldGrad)" stroke="#FEF3C7" stroke-width="3"/>
      <circle cx="55" cy="48" r="35" fill="none" stroke="#FEF3C7" stroke-width="1.5" stroke-dasharray="4,3"/>
    </g>
  </g>
</svg>
`)}`;

/**
 * Generates a Secondary Regulation Image (Wide Landscape 16:9 Infographic)
 */
export const SECONDARY_REGULATION_POSTER_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF5F5"/>
      <stop offset="100%" stop-color="#FEE2E2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg2)" stroke="#9E1B21" stroke-width="8"/>
  <rect x="24" y="24" width="1152" height="627" rx="20" fill="none" stroke="#DC2626" stroke-width="2"/>

  <text x="600" y="90" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="38" fill="#9E1B21">STANDAR PROSEDUR &amp; ETIKA PASIEN RS KOTA BARU</text>
  <text x="600" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#475569">PANDUAN RESMI PELAYANAN INSTALASI GAWAT DARURAT &amp; POLIKLINIK SPESIALIS</text>

  <!-- 3 Columns -->
  <g transform="translate(60, 175)">
    <rect x="0" y="0" width="330" height="420" rx="18" fill="#FFFFFF" stroke="#FECDD3" stroke-width="3"/>
    <rect x="0" y="0" width="330" height="56" rx="18" fill="#9E1B21"/>
    <text x="165" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF">01. ZONA AMAN MEDIS</text>
    <g font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155" transform="translate(24, 95)">
      <text x="0" y="0">• Area Rumah Sakit adalah Zona Netral</text>
      <text x="0" y="42">• Dilarang membawa senjata tajam/api</text>
      <text x="0" y="84">• Utamakan pasien kondisi kritis (UGD)</text>
      <text x="0" y="126">• Hormati privasi pasien &amp; tenaga medis</text>
      <text x="0" y="168">• Parkir kendaraan pada area resmi</text>
      <text x="0" y="210">• Patuhi arahan Paramedic bertugas</text>
    </g>
  </g>

  <g transform="translate(435, 175)">
    <rect x="0" y="0" width="330" height="420" rx="18" fill="#FFFFFF" stroke="#FECDD3" stroke-width="3"/>
    <rect x="0" y="0" width="330" height="56" rx="18" fill="#7F1D1D"/>
    <text x="165" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF">02. ADMINISTRASI &amp; KLAIM</text>
    <g font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155" transform="translate(24, 95)">
      <text x="0" y="0">• Tunjukkan Kartu Pasien / SKWB aktif</text>
      <text x="0" y="42">• Pembayaran Treatment dilakukan Cash</text>
      <text x="0" y="84">• Surat Sehat &amp; Psikologi melalui Portal</text>
      <text x="0" y="126">• Maksimal pembelian 1 Paket Obat/hari</text>
      <text x="0" y="168">• Konsultasi dosis wajib melalui Dokter</text>
      <text x="0" y="210">• Simpan bukti registrasi janji temu</text>
    </g>
  </g>

  <g transform="translate(810, 175)">
    <rect x="0" y="0" width="330" height="420" rx="18" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
    <rect x="0" y="0" width="330" height="56" rx="18" fill="#0D9488"/>
    <text x="165" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF">03. JAM LAYANAN KHUSUS</text>
    <g font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155" transform="translate(24, 95)">
      <text x="0" y="0">• IGD &amp; Farmasi: Siaga 24 Jam Penuh</text>
      <text x="0" y="42">• Operasi Plastik: Shift 1 &amp; Shift 2</text>
      <text x="0" y="84">• Surat Medis: Shift 1 &amp; Shift 2</text>
      <text x="0" y="126">• Pemeriksaan Buta Warna: Online 24/7</text>
      <text x="0" y="168">• Emergency Dispatch: Respon Cepat</text>
      <text x="0" y="210">• Pengaduan Warga: Terbuka Anonim</text>
    </g>
  </g>
</svg>
`)}`;

/**
 * Generates clean SVG Avatar Data URL for Staff & Doctors (Zero external URL dependency)
 */
export function createStaffAvatarSvg(initials: string, bgHex: string = '#9E1B21'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgHex}"/>
        <stop offset="100%" stop-color="#671014"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g)"/>
    <circle cx="60" cy="44" r="20" fill="#FFFFFF" fill-opacity="0.22"/>
    <path d="M26 106 C26 82 94 82 94 106" fill="#FFFFFF" fill-opacity="0.22"/>
    <text x="60" y="68" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="34" fill="#FFFFFF">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
