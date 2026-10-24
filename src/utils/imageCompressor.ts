/**
 * Image compression and optimization utility for Portal Layanan Paramedic Kota Baru.
 * 
 * Ensures uploaded images (especially Regulation posters, photo proofs, and avatars)
 * are cleanly downscaled and compressed to JPEG/WebP before persisting to Google Cloud Firestore,
 * ensuring they remain well under Firestore's strict 1 MiB (1,048,576 bytes) document limit
 * while maintaining maximum visual clarity for high-resolution posters and small text.
 */

export interface CompressImageOptions {
  /** Maximum width in pixels (defaults to 1400px for sharp poster readability) */
  maxWidth?: number;
  /** Maximum height in pixels (defaults to 1800px) */
  maxHeight?: number;
  /** Initial compression quality from 0.1 to 1.0 (defaults to 0.82) */
  quality?: number;
  /** Target max byte size (defaults to 450 KB, well under Firestore's 1MB limit) */
  targetMaxBytes?: number;
}

export interface CompressImageResult {
  dataUrl: string;
  byteSize: number;
  width: number;
  height: number;
  originalSize?: number;
  compressionRatio?: string;
}

/**
 * Loads a File or Data URL string into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Gagal memproses gambar yang dipilih: ' + String(e)));
    img.src = src;
  });
}

/**
 * Reads a File object as Data URL
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Format file tidak didukung.'));
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file or data URL for seamless Cloud Firestore persistence.
 */
export async function compressImageForFirestore(
  fileOrDataUrl: File | string,
  options: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1800,
    quality = 0.82,
    targetMaxBytes = 450 * 1024, // 450 KB limit
  } = options;

  let originalDataUrl = '';
  let originalSize: number | undefined;

  if (typeof fileOrDataUrl === 'string') {
    originalDataUrl = fileOrDataUrl;
    // Estimate size from Base64 string length
    originalSize = Math.round((originalDataUrl.length * 3) / 4);
  } else {
    originalSize = fileOrDataUrl.size;
    originalDataUrl = await readFileAsDataUrl(fileOrDataUrl);
  }

  // If it's an SVG or already a direct web URL (http/https), return as-is
  if (originalDataUrl.startsWith('data:image/svg+xml') || originalDataUrl.startsWith('http')) {
    const byteSize = Math.round((originalDataUrl.length * 3) / 4);
    return {
      dataUrl: originalDataUrl,
      byteSize,
      width: 800,
      height: 600,
      originalSize,
    };
  }

  const img = await loadImage(originalDataUrl);
  let { width, height } = img;

  // Calculate new aspect-ratio-preserving dimensions
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia pada browser ini.');
  }

  // Use high-quality bicubic interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // First pass compression
  let currentQuality = quality;
  let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
  let byteSize = Math.round((dataUrl.length * 3) / 4);

  // If size is still above target, reduce quality iteratively
  if (byteSize > targetMaxBytes && currentQuality > 0.6) {
    currentQuality = 0.7;
    dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
    byteSize = Math.round((dataUrl.length * 3) / 4);
  }

  if (byteSize > targetMaxBytes && currentQuality > 0.5) {
    currentQuality = 0.58;
    dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
    byteSize = Math.round((dataUrl.length * 3) / 4);
  }

  const ratio = originalSize && originalSize > 0
    ? `${Math.round((1 - byteSize / originalSize) * 100)}% lebih hemat`
    : undefined;

  return {
    dataUrl,
    byteSize,
    width,
    height,
    originalSize,
    compressionRatio: ratio,
  };
}
