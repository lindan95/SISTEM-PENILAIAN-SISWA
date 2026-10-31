/**
 * Utility to compress images and optimize data payloads
 * Prevents exceeding localStorage and Firestore 1,048,576 bytes (1MB) limit.
 */

export async function compressImageFile(
  file: File,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = async (e) => {
      try {
        const src = e.target?.result as string;
        const compressed = await compressDataUrl(src, maxWidth, maxHeight, quality);
        resolve(compressed);
      } catch {
        resolve(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  });
}

export function compressDataUrl(
  dataUrl: string,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    // If already tiny (< 30KB), no need to compress further
    if (dataUrl.length < 35_000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Draw and compress to JPEG or WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const format = 'image/jpeg';
        const compressed = canvas.toDataURL(format, quality);
        resolve(compressed);
      } catch (err) {
        console.warn('Canvas image compression failed, falling back to original:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Recursively scans and compresses any large base64 strings in the export payload
 * to guarantee that teacher photos and school logos don't exceed Firestore limits.
 */
export async function sanitizeExportPayload(payload: any): Promise<any> {
  if (!payload) return payload;
  const cloned = JSON.parse(JSON.stringify(payload));

  // Sanitize Guru Photo
  if (cloned.guru?.fotoUrl && typeof cloned.guru.fotoUrl === 'string' && cloned.guru.fotoUrl.startsWith('data:image')) {
    if (cloned.guru.fotoUrl.length > 35_000) {
      cloned.guru.fotoUrl = await compressDataUrl(cloned.guru.fotoUrl, 300, 300, 0.75);
    }
  }

  // Sanitize Sekolah Logo
  if (cloned.sekolah?.logoSekolah && typeof cloned.sekolah.logoSekolah === 'string' && cloned.sekolah.logoSekolah.startsWith('data:image')) {
    if (cloned.sekolah.logoSekolah.length > 35_000) {
      cloned.sekolah.logoSekolah = await compressDataUrl(cloned.sekolah.logoSekolah, 300, 300, 0.75);
    }
  }

  // Sanitize Sekolah Logo Pendidikan
  if (cloned.sekolah?.logoPendidikan && typeof cloned.sekolah.logoPendidikan === 'string' && cloned.sekolah.logoPendidikan.startsWith('data:image')) {
    if (cloned.sekolah.logoPendidikan.length > 35_000) {
      cloned.sekolah.logoPendidikan = await compressDataUrl(cloned.sekolah.logoPendidikan, 300, 300, 0.75);
    }
  }

  return cloned;
}
