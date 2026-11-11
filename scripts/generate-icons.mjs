#!/usr/bin/env node
/**
 * Generates the app icons (Android + iOS) from a single vector definition, with
 * no external dependencies.
 *
 * Usage:
 *   npm run icons:generate
 *
 * The mark is a person silhouette over the brand `ink` colour, which reads well
 * both at 1024 px and at 48 px. The script is reproducible; if an official
 * design shows up one day, replacing the generated PNGs is enough.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

// ================================
// Paleta (frontend-soul / globals.css)
// ================================
const INK = [0x35, 0x4b, 0x5c]; // colors.primary
const CREAM = [0xf6, 0xf0, 0xe8]; // colors.cream
const WHITE = [0xff, 0xff, 0xff];

// ================================
// Mark geometry (its own space, 0..1)
// ================================
const HEAD = { cx: 0.5, cy: 0.385, r: 0.135 };
const BODY = { cx: 0.5, cy: 0.8, r: 0.265 };
/** Vertical centre of the glyph, so it can be centred on the canvas. */
const GLYPH_CY = 0.525;
/** Glyph height in its own space (top of the head → shoulder base). */
const GLYPH_HEIGHT = 0.55;

/** Samples per axis for anti-aliasing (4x4 = 16 sub-samples per pixel). */
const SAMPLES = 4;

const circle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

/**
 * Does the canvas point (px, py) fall inside the glyph?
 * `fill` is the fraction of the canvas height the glyph occupies.
 */
function inGlyph(px, py, fill) {
  const scale = fill / GLYPH_HEIGHT;
  const gx = (px - 0.5) / scale + 0.5;
  const gy = (py - 0.5) / scale + GLYPH_CY;

  if (circle(gx, gy, HEAD.cx, HEAD.cy, HEAD.r)) return true;
  // Shoulders: semicircle with the flat base at the centre height.
  return gy <= BODY.cy && circle(gx, gy, BODY.cx, BODY.cy, BODY.r);
}

/**
 * Renders the icon with anti-aliasing.
 *
 * @param {number} size Side in pixels.
 * @param {{mode?: 'square'|'round'|'foreground', fill?: number, glyph?: number[]}} options
 * @returns {Buffer} RGBA of `size * size * 4` bytes.
 */
function render(size, { mode = 'square', fill = 0.58, glyph = CREAM } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const step = 1 / SAMPLES;
  const total = SAMPLES * SAMPLES;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let opaque = 0;
      let r = 0;
      let g = 0;
      let b = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = (x + (sx + 0.5) * step) / size;
          const py = (y + (sy + 0.5) * step) / size;

          // Outer mask: circle for `round`, nothing for the foreground.
          if (mode === 'round' && !circle(px, py, 0.5, 0.5, 0.5)) continue;

          const onGlyph = inGlyph(px, py, fill);
          if (mode === 'foreground' && !onGlyph) continue;

          opaque += 1;
          const color = onGlyph ? glyph : INK;
          r += color[0];
          g += color[1];
          b += color[2];
        }
      }

      if (opaque === 0) continue; // left transparent

      const offset = (y * size + x) * 4;
      rgba[offset] = Math.round(r / opaque);
      rgba[offset + 1] = Math.round(g / opaque);
      rgba[offset + 2] = Math.round(b / opaque);
      rgba[offset + 3] = Math.round((opaque / total) * 255);
    }
  }

  return rgba;
}

// ================================
// Minimal PNG encoder (no dependencies)
// ================================
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

/**
 * @param {number} size
 * @param {Buffer} rgba
 * @param {boolean} withAlpha `false` emits RGB: iOS rejects icons with alpha.
 */
function encodePng(size, rgba, withAlpha) {
  const channels = withAlpha ? 4 : 3;
  const raw = Buffer.alloc((size * channels + 1) * size);
  let out = 0;

  for (let y = 0; y < size; y++) {
    raw[out++] = 0; // filtro: None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      raw[out++] = rgba[i];
      raw[out++] = rgba[i + 1];
      raw[out++] = rgba[i + 2];
      if (withAlpha) raw[out++] = rgba[i + 3];
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bits per channel
  header[9] = withAlpha ? 6 : 2; // 6 = RGBA, 2 = RGB

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function write(file, size, options, withAlpha = true) {
  const target = join(root, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, encodePng(size, render(size, options), withAlpha));
  console.log(`  ${file} (${size}x${size})`);
}

// ================================
// Android
// ================================
console.log('Android · iconos legacy');
const LEGACY = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [density, size] of Object.entries(LEGACY)) {
  const dir = `android/app/src/main/res/mipmap-${density}`;
  write(`${dir}/ic_launcher.png`, size, { mode: 'square', fill: 0.58 });
  write(`${dir}/ic_launcher_round.png`, size, { mode: 'round', fill: 0.54 });
}

console.log('Android · capas del icono adaptativo (108dp)');
const ADAPTIVE = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
for (const [density, size] of Object.entries(ADAPTIVE)) {
  const dir = `android/app/src/main/res/mipmap-${density}`;
  write(`${dir}/ic_launcher_foreground.png`, size, {
    mode: 'foreground',
    fill: 0.46,
  });
  write(`${dir}/ic_launcher_monochrome.png`, size, {
    mode: 'foreground',
    fill: 0.46,
    glyph: WHITE,
  });
}

// ================================
// iOS
// ================================
console.log('iOS · AppIcon');
const IOS_ICONS = [
  ['icon-20@2x.png', 40],
  ['icon-20@3x.png', 60],
  ['icon-29@2x.png', 58],
  ['icon-29@3x.png', 87],
  ['icon-40@2x.png', 80],
  ['icon-40@3x.png', 120],
  ['icon-60@2x.png', 120],
  ['icon-60@3x.png', 180],
  ['icon-1024.png', 1024],
];
for (const [file, size] of IOS_ICONS) {
  write(
    `ios/AppSoul/Images.xcassets/AppIcon.appiconset/${file}`,
    size,
    { mode: 'square', fill: 0.58 },
    // The App Store rejects icons with an alpha channel.
    false,
  );
}

console.log('\nListo. Revisa los iconos antes de publicar.');
