import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG source for standard icon
const svgStandard = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#4338ca" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.35" flood-color="#0f172a" />
    </filter>
  </defs>

  <!-- Background with rounded squircles -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle glow inner circle -->
  <circle cx="256" cy="240" r="170" fill="none" stroke="#6366f1" stroke-width="2" opacity="0.4" />

  <!-- Main Symbol: Graduation Cap + Grade Badge -->
  <g filter="url(#shadow)">
    <!-- Cap Diamond Top -->
    <polygon points="256,120 400,188 256,256 112,188" fill="url(#capGrad)" />

    <!-- Cap Skull Cap Underneath -->
    <path d="M168,215 L168,285 C168,335 344,335 344,285 L344,215 Z" fill="#c7d2fe" opacity="0.95" />

    <!-- Tassel ribbon & tassel -->
    <path d="M360,195 Q384,240 380,310" fill="none" stroke="url(#goldGrad)" stroke-width="10" stroke-linecap="round" />
    <circle cx="380" cy="318" r="14" fill="url(#goldGrad)" />

    <!-- Center Button -->
    <circle cx="256" cy="188" r="10" fill="url(#goldGrad)" />

    <!-- Grade / Checkmark Emblem Badge -->
    <g transform="translate(256, 360)">
      <circle cx="0" cy="0" r="70" fill="#10b981" />
      <circle cx="0" cy="0" r="62" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.5" />
      <!-- Checkmark -->
      <path d="M-28,-2 L-10,18 L30,-22" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>
</svg>
`;

// SVG source for Maskable icon (safe area inside 80% circle, edge-to-edge background)
const svgMaskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#4338ca" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="capGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <linearGradient id="goldGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadowM" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-opacity="0.35" flood-color="#0f172a" />
    </filter>
  </defs>

  <!-- Full bleed background for Android adaptive icon mask -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Scaled content inside safe zone (70% scale centered) -->
  <g transform="translate(76.8, 76.8) scale(0.7)" filter="url(#shadowM)">
    <polygon points="256,120 400,188 256,256 112,188" fill="url(#capGradM)" />
    <path d="M168,215 L168,285 C168,335 344,335 344,285 L344,215 Z" fill="#c7d2fe" opacity="0.95" />
    <path d="M360,195 Q384,240 380,310" fill="none" stroke="url(#goldGradM)" stroke-width="10" stroke-linecap="round" />
    <circle cx="380" cy="318" r="14" fill="url(#goldGradM)" />
    <circle cx="256" cy="188" r="10" fill="url(#goldGradM)" />
    <g transform="translate(256, 360)">
      <circle cx="0" cy="0" r="70" fill="#10b981" />
      <circle cx="0" cy="0" r="62" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.5" />
      <path d="M-28,-2 L-10,18 L30,-22" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>
</svg>
`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard);

  const standardBuf = Buffer.from(svgStandard);
  const maskableBuf = Buffer.from(svgMaskable);

  // 192x192
  await sharp(standardBuf)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(standardBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Maskable 512x512
  await sharp(maskableBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple touch icon 180x180
  await sharp(standardBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 48x48 PNG (saved as favicon.ico)
  await sharp(standardBuf)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated all PWA Android icons in public/');
}

generate().catch(console.error);
