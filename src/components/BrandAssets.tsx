import React from 'react';

/**
 * Logo RS Cendana (Paramedic Cendana) — matches the attached pink circular Paramedic Cendana emblem
 */
export const LogoRSCendana: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="#FFF5F8" stroke="#E83E8C" strokeWidth="5" />
    <circle cx="100" cy="100" r="87" fill="#FFFFFF" stroke="#F4A5C8" strokeWidth="2.5" />
    <circle cx="100" cy="100" r="65" fill="#FFF0F5" />

    {/* Hospital skyline silhouette in soft pink */}
    <rect x="52" y="84" width="16" height="46" rx="2" fill="#F9B4D2" />
    <rect x="68" y="66" width="20" height="64" rx="2" fill="#F59CC4" />
    <rect x="86" y="54" width="28" height="76" rx="3" fill="#F9B4D2" />
    <rect x="112" y="68" width="20" height="62" rx="2" fill="#F59CC4" />
    <rect x="132" y="88" width="16" height="42" rx="2" fill="#F9B4D2" />

    {/* Heart on top of central building */}
    <path
      d="M100 66C100 66 91 59.5 91 54.5C91 51.8 93.2 49.8 95.8 49.8C97.6 49.8 99.1 50.8 100 52.2C100.9 50.8 102.4 49.8 104.2 49.8C106.8 49.8 109 51.8 109 54.5C109 59.5 100 66 100 66Z"
      fill="#E83E8C"
    />

    {/* Medical Cross with ECG pulse */}
    <rect x="86" y="69" width="28" height="68" rx="7" fill="#E83E8C" stroke="#FFFFFF" strokeWidth="3.5" />
    <rect x="66" y="89" width="68" height="28" rx="7" fill="#E83E8C" stroke="#FFFFFF" strokeWidth="3.5" />
    <rect x="88" y="71" width="24" height="64" rx="5" fill="#E83E8C" />
    <rect x="68" y="91" width="64" height="24" rx="5" fill="#E83E8C" />

    {/* ECG Pulse Line */}
    <path
      d="M69 103H87L91 96L96 112L101 87L106 115L110 100L113 103H131"
      stroke="#FFFFFF"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Lotus leaves at bottom of cross */}
    <path d="M98 156C85 154 74 144 72 134C82 135 93 142 98 156Z" fill="#F06595" />
    <path d="M102 156C115 154 126 144 128 134C118 135 107 142 102 156Z" fill="#F06595" />

    {/* Side small crosses */}
    <path d="M26 96V104M22 100H30" stroke="#E83E8C" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M174 96V104M170 100H178" stroke="#E83E8C" strokeWidth="3.5" strokeLinecap="round" />

    {/* Top & Bottom Arcs Text */}
    <path id="topArc" d="M 38,100 A 62,62 0 1,1 162,100" fill="none" />
    <text fill="#E83E8C" fontSize="15.5" fontWeight="800" letterSpacing="3.5" fontFamily="Poppins, sans-serif">
      <textPath href="#topArc" startOffset="50%" textAnchor="middle">
        PARAMEDIC
      </textPath>
    </text>

    <path id="bottomArc" d="M 166,106 A 66,66 0 0,1 34,106" fill="none" />
    <text fill="#E83E8C" fontSize="14.5" fontWeight="800" letterSpacing="3" fontFamily="Poppins, sans-serif">
      <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
        CENDANA
      </textPath>
    </text>
  </svg>
);

/**
 * Logo Kota Cendana (Cendana Roleplay Monument & Pink Skyline)
 */
export const LogoKotaCendana: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="96" r="76" fill="#FFE8F0" />
    {/* Pink & Emerald City Buildings */}
    <rect x="36" y="78" width="22" height="62" rx="2" fill="#F06595" />
    <rect x="40" y="84" width="14" height="50" fill="#20C997" fillOpacity="0.45" />
    <rect x="64" y="54" width="24" height="86" rx="2" fill="#E83E8C" />
    <rect x="114" y="58" width="24" height="82" rx="2" fill="#E83E8C" />
    <rect x="118" y="66" width="16" height="66" fill="#20C997" fillOpacity="0.55" />
    <rect x="142" y="82" width="20" height="58" rx="2" fill="#F06595" />

    {/* Green Trees Base */}
    <circle cx="52" cy="132" r="16" fill="#2ED573" />
    <circle cx="76" cy="128" r="18" fill="#20C997" />
    <circle cx="124" cy="128" r="18" fill="#20C997" />
    <circle cx="148" cy="132" r="16" fill="#2ED573" />

    {/* Central Monument Tower */}
    <path d="M92 48H108L112 126H88L92 48Z" fill="#FFFFFF" stroke="#D63384" strokeWidth="2.5" />
    <rect x="80" y="126" width="40" height="10" rx="2" fill="#FFF5F8" stroke="#D63384" strokeWidth="2" />
    {/* Crown Leaf on Monument */}
    <path d="M100 22C94 30 94 38 100 44C106 38 106 30 100 22Z" fill="#2ED573" stroke="#15803D" strokeWidth="1.5" />
    <rect x="90" y="42" width="20" height="7" rx="2" fill="#F06595" />

    {/* Ribbon Banner */}
    <rect x="24" y="140" width="152" height="28" rx="8" fill="#E83E8C" stroke="#FFFFFF" strokeWidth="2.5" />
    <text
      x="100"
      y="159"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="19"
      fontWeight="900"
      letterSpacing="2"
      fontFamily="Poppins, sans-serif"
    >
      CENDANA
    </text>
    <rect x="46" y="166" width="108" height="18" rx="6" fill="#F06595" stroke="#FFFFFF" strokeWidth="1.5" />
    <text
      x="100"
      y="178"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="9.5"
      fontWeight="700"
      letterSpacing="2"
      fontFamily="Poppins, sans-serif"
    >
      ♥ ROLEPLAY ♥
    </text>
  </svg>
);

/**
 * Generates an official, full-resolution SVG data URL matching the exact uploaded
 * "RUMAH SAKIT CENDANA — REGULATION & MEDICAL SERVICES" poster so it renders at 100% crisp resolution
 * with natural aspect ratio (3:4 vertical poster) and can never break or crop.
 */
export const DEFAULT_REGULATION_POSTER_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1260" width="900" height="1260">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF7FA"/>
      <stop offset="50%" stop-color="#FCE4EE"/>
      <stop offset="100%" stop-color="#F9D5E5"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="pinkTitle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F06595"/>
      <stop offset="100%" stop-color="#C2255C"/>
    </linearGradient>
    <linearGradient id="crimGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>
    <filter id="softShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#881337" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="900" height="1260" fill="url(#bgGrad)"/>

  <!-- Subtle Monument Watermark Silhouette -->
  <g opacity="0.12" transform="translate(250, 280)">
    <rect x="60" y="180" width="60" height="280" fill="#E83E8C"/>
    <rect x="130" y="120" width="65" height="340" fill="#D63384"/>
    <rect x="215" y="130" width="65" height="330" fill="#D63384"/>
    <rect x="290" y="190" width="55" height="270" fill="#E83E8C"/>
    <polygon points="185,40 215,40 225,460 175,460" fill="#FFFFFF" stroke="#E83E8C" stroke-width="4"/>
  </g>

  <!-- Top Header Emblem Left (Paramedic Cendana) -->
  <g transform="translate(42, 42)">
    <circle cx="72" cy="72" r="70" fill="#FFF5F8" stroke="#E83E8C" stroke-width="4" filter="url(#softShadow)"/>
    <circle cx="72" cy="72" r="62" fill="#FFFFFF" stroke="#F4A5C8" stroke-width="2"/>
    <rect x="61" y="42" width="22" height="60" rx="5" fill="#E83E8C"/>
    <rect x="42" y="61" width="60" height="22" rx="5" fill="#E83E8C"/>
    <path d="M45 72 H62 L66 64 L72 82 L77 60 L82 78 L86 72 H99" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
    <text x="72" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#E83E8C" letter-spacing="2">PARAMEDIC</text>
    <text x="72" y="127" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#E83E8C" letter-spacing="2">CENDANA</text>
  </g>

  <!-- Top Header Emblem Right (Kota Cendana) -->
  <g transform="translate(715, 42)">
    <circle cx="72" cy="72" r="66" fill="#FFE3EE" stroke="#E83E8C" stroke-width="3" filter="url(#softShadow)"/>
    <rect x="35" y="48" width="18" height="48" fill="#F06595"/>
    <rect x="56" y="34" width="18" height="62" fill="#E83E8C"/>
    <rect x="92" y="38" width="18" height="58" fill="#20C997"/>
    <rect x="67" y="20" width="12" height="76" fill="#FFFFFF" stroke="#D63384" stroke-width="2"/>
    <rect x="18" y="94" width="108" height="24" rx="6" fill="#E83E8C"/>
    <text x="72" y="111" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" letter-spacing="1.5">CENDANA</text>
    <rect x="32" y="118" width="80" height="15" rx="4" fill="#F06595"/>
    <text x="72" y="129" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="#FFFFFF" letter-spacing="1">ROLEPLAY</text>
  </g>

  <!-- Main Header Titles -->
  <text x="450" y="96" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="56" fill="url(#goldGrad)" stroke="#78350F" stroke-width="2" filter="url(#softShadow)">RUMAH SAKIT</text>
  <text x="450" y="168" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="72" fill="url(#pinkTitle)" stroke="#78350F" stroke-width="2.5" filter="url(#softShadow)">CENDANA</text>
  <text x="450" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="25" fill="#1E293B" letter-spacing="1">REGULATION &amp; MEDICAL SERVICES</text>

  <!-- LEFT COLUMN -->
  <!-- Section 1: BIAYA TREATMENT & PERTOLONGAN PERTAMA -->
  <g transform="translate(38, 245)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16.5" fill="#1E293B">BIAYA TREATMENT &amp; PERTOLONGAN PERTAMA</text>

    <g transform="translate(12, 68)" font-family="Arial, sans-serif" font-weight="bold" font-size="18.5" fill="#1E293B">
      <rect x="0" y="-16" width="22" height="20" rx="4" fill="#9F1239"/>
      <text x="11" y="-1" text-anchor="middle" fill="#FFFFFF" font-size="15">+</text>
      <text x="32" y="0">Treatment ($100 CASH)</text>

      <circle cx="11" cy="28" r="11" fill="#9F1239"/>
      <text x="11" y="33" text-anchor="middle" fill="#FFFFFF" font-size="12">♥</text>
      <text x="32" y="34">Revive Areas :</text>

      <g font-size="17.5" font-weight="bold">
        <text x="32" y="64">Rumah Sakit $120</text>
        <text x="32" y="92">Sandy Shores $180</text>
        <text x="32" y="120">Paleto $140</text>
        <text x="32" y="148">Kota $160</text>

        <text x="200" y="64" fill="#9F1239">▲</text>
        <text x="218" y="64" font-size="16">Laut/Gunung/Perburuan $180</text>
        <text x="200" y="92" fill="#9F1239">📍</text>
        <text x="218" y="92" font-size="16">Cayo Perico/Pulau $200</text>
        <text x="200" y="124" fill="#9F1239">🧾</text>
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
      <text x="0" y="0" fill="#9F1239">⚔</text>
      <text x="30" y="0">Peperangan for conflict/crime</text>
      <text x="0" y="30" fill="#9F1239">👮</text>
      <text x="30" y="30">Perampokan, $150 /orang</text>
      <text x="0" y="60" fill="#9F1239">🔫</text>
      <text x="30" y="60">Perang Jalanan $150 /orang</text>
      <text x="0" y="90" fill="#9F1239">💥</text>
      <text x="30" y="90">Perang Besar, $150 /orang</text>
      <text x="0" y="120" fill="#9F1239">🛡</text>
      <text x="30" y="120">Penyanderaan, $150 /orang</text>
    </g>
  </g>

  <!-- Section 3: BIAYA OPERASI & KONSULTASI -->
  <g transform="translate(38, 705)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#1E293B">BIAYA OPERASI &amp; KONSULTASI</text>

    <g transform="translate(12, 74)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#9F1239">✂</text>
      <text x="30" y="0">Minor Op $800</text>
      <text x="0" y="28" fill="#9F1239">✂</text>
      <text x="30" y="28">Mayor Op $1.000</text>
      <text x="0" y="56" fill="#9F1239">✨</text>
      <text x="30" y="56">Plastik $2.500</text>
      <text x="215" y="56" font-size="16.5">(Biaya Per 1 Anak $300)</text>
      <text x="0" y="84" fill="#9F1239">🤱</text>
      <text x="30" y="84">Melahirkan Normal $800</text>
      <text x="30" y="112">Melahirkan Caesar $1,000</text>
      <text x="0" y="140" fill="#9F1239">🩺</text>
      <text x="30" y="140">Dr Umum $150 CASH</text>
      <text x="0" y="168" fill="#9F1239">👨‍⚕️</text>
      <text x="30" y="168">Dr Spesialis $300 CASH</text>
    </g>
  </g>

  <!-- RIGHT COLUMN -->
  <!-- Section 4: BIAYA RAWAT INAP & SURAT MEDIS -->
  <g transform="translate(468, 245)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#1E293B">BIAYA RAWAT INAP &amp; SURAT MEDIS</text>

    <g transform="translate(12, 74)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#9F1239">🛏</text>
      <text x="32" y="0">Kamar Reguler $60/hari</text>
      <text x="0" y="34" fill="#9F1239">🛏</text>
      <text x="32" y="34">VIP $80/hari</text>
      <text x="0" y="68" fill="#9F1239">🛏</text>
      <text x="32" y="68">VVIP $100/hari</text>

      <text x="225" y="0" fill="#9F1239">🧪</text>
      <text x="252" y="0">Uji Lab $3.000</text>
      <text x="225" y="34" fill="#9F1239">📋</text>
      <text x="252" y="34">SK Sehat $500</text>
      <text x="225" y="68" fill="#9F1239">🧠</text>
      <text x="252" y="68">SK Psikologi $750</text>
    </g>
  </g>

  <!-- Section 5: REGULASI LENGKAP LAINNYA & PEMAKAMAN -->
  <g transform="translate(468, 415)">
    <rect x="0" y="0" width="395" height="58" rx="29" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="17.5" fill="#1E293B">REGULASI LENGKAP LAINNYA</text>
    <text x="197" y="47" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="17.5" fill="#1E293B">&amp; PEMAKAMAN</text>

    <g transform="translate(12, 86)" font-family="Arial, sans-serif" font-weight="bold" font-size="17.5" fill="#1E293B">
      <text x="0" y="0" fill="#9F1239">🪪</text>
      <text x="30" y="0">Kartu Pasien $1,500</text>
      <text x="30" y="22" font-size="15">(Masa berlaku 1 bulan)</text>
      <text x="0" y="50" fill="#9F1239">🔄</text>
      <text x="30" y="50">Perpanjang $1,000</text>
      <text x="0" y="80" fill="#9F1239">🔍</text>
      <text x="30" y="80">Autopsi $2.500</text>
      <text x="0" y="110" fill="#9F1239">👁</text>
      <text x="30" y="110">Visum $1.500</text>

      <text x="215" y="0" fill="#9F1239">📄</text>
      <text x="242" y="0">Visum $1.500</text>
      <text x="215" y="34" fill="#9F1239">🪦</text>
      <text x="242" y="34">Pemakaman Umum</text>
      <text x="242" y="56">$2.000</text>
      <text x="215" y="86" fill="#9F1239">💉</text>
      <text x="242" y="86">Imunisasi anak $750</text>
    </g>
  </g>

  <!-- Section 6: REGULASI PERBAN & OBAT-OBATAN (CASH) -->
  <g transform="translate(468, 665)">
    <rect x="0" y="0" width="395" height="46" rx="23" fill="#FFFBEB" stroke="#D4AF37" stroke-width="3" filter="url(#softShadow)"/>
    <text x="197" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16.5" fill="#1E293B">REGULASI PERBAN &amp; OBAT-OBATAN (CASH)</text>

    <g transform="translate(12, 72)" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1E293B">
      <text x="0" y="0" fill="#9F1239">💊</text>
      <text x="30" y="0">Paket Kecil $150</text>
      <text x="0" y="30" fill="#9F1239">🧰</text>
      <text x="30" y="30">Paket Sedang $200</text>
      <text x="215" y="0" fill="#9F1239">🧰</text>
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
 * so we can demonstrate and verify that ALL regulation images (vertical AND landscape)
 * render 100% intact with object-contain and never get cropped.
 */
export const SECONDARY_REGULATION_POSTER_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF0F6"/>
      <stop offset="100%" stop-color="#FFE3EC"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg2)" stroke="#E83E8C" stroke-width="8"/>
  <rect x="24" y="24" width="1152" height="627" rx="20" fill="none" stroke="#F06595" stroke-width="2"/>

  <text x="600" y="90" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="38" fill="#D63384">STANDAR PROSEDUR &amp; ETIKA PASIEN RS CENDANA</text>
  <text x="600" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#475569">PANDUAN RESMI PELAYANAN INSTALASI GAWAT DARURAT &amp; POLIKLINIK SPESIALIS</text>

  <!-- 3 Columns -->
  <g transform="translate(60, 175)">
    <rect x="0" y="0" width="330" height="420" rx="18" fill="#FFFFFF" stroke="#F4A5C8" stroke-width="3"/>
    <rect x="0" y="0" width="330" height="56" rx="18" fill="#E83E8C"/>
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
    <rect x="0" y="0" width="330" height="420" rx="18" fill="#FFFFFF" stroke="#F4A5C8" stroke-width="3"/>
    <rect x="0" y="0" width="330" height="56" rx="18" fill="#D63384"/>
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
    <rect x="0" y="0" width="330" height="420" rx="18" fill="#FFFFFF" stroke="#20C997" stroke-width="3"/>
    <rect x="0" y="0" width="330" height="56" rx="18" fill="#20C997"/>
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
export function createStaffAvatarSvg(initials: string, bgHex: string = '#E83E8C'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgHex}"/>
        <stop offset="100%" stop-color="#9F1239"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g)"/>
    <circle cx="60" cy="44" r="20" fill="#FFFFFF" fill-opacity="0.22"/>
    <path d="M26 106 C26 82 94 82 94 106" fill="#FFFFFF" fill-opacity="0.22"/>
    <text x="60" y="68" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="34" fill="#FFFFFF">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
