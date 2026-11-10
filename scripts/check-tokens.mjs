#!/usr/bin/env node
/**
 * Comprueba que los tokens de la app móvil coincidan con el design system web
 * (frontend-soul). No escribe nada: solo lee el CSS del web y el theme local.
 *
 * Uso:
 *   npm run tokens:check
 *   SOUL_WEB_CSS=/ruta/a/globals.css npm run tokens:check
 *
 * Sale con código 1 si hay diferencias, para poder usarlo en un hook o en CI.
 * Si el repo web no está clonado al lado, avisa y termina con 0 (no rompe).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const WEB_CSS =
  process.env.SOUL_WEB_CSS ??
  resolve(repoRoot, '../frontend-soul/src/app/globals.css');
const MOBILE_THEME = resolve(repoRoot, 'src/styles/theme.ts');

/** token móvil -> variable CSS del web */
const CONTRACT = {
  // superficies
  background: '--background',
  surface: '--card',
  surfaceRaised: '--surface-2',
  surfaceInset: '--surface-inset',
  header: '--header',
  // texto
  text: '--foreground',
  textSecondary: '--muted-foreground',
  muted: '--muted',
  // marca
  accent: '--accent',
  accentForeground: '--accent-foreground',
  cream: '--color-cream',
  sage: '--color-sage',
  sand: '--color-sand',
  mist: '--color-mist',
  ink: '--color-ink',
  paper: '--color-paper',
  // bordes y foco
  border: '--border',
  borderStrong: '--border-strong',
  input: '--input',
  ring: '--ring',
  // estado
  error: '--destructive',
  destructive: '--destructive',
  success: '--color-success',
  warning: '--color-warning',
  info: '--color-info',
  successBg: '--color-success-bg',
  warningBg: '--color-warning-bg',
  dangerBg: '--color-danger-bg',
  infoBg: '--color-info-bg',
  // capas
  overlay: '--overlay',
};

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, '');

function parseCssVars(css) {
  const vars = new Map();
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  // Se guarda la PRIMERA aparición: `:root` (tema claro) va antes que `.dark`.
  while ((match = re.exec(css)) !== null) {
    const key = `--${match[1].toLowerCase()}`;
    if (!vars.has(key)) vars.set(key, match[2].trim());
  }
  return vars;
}

function parseMobileTheme(source) {
  const values = new Map();
  const re = /^\s*([a-zA-Z]+):\s*'([^']+)',/gm;
  let match;
  while ((match = re.exec(source)) !== null) {
    values.set(match[1], match[2]);
  }
  return values;
}

let webCss;
try {
  webCss = readFileSync(WEB_CSS, 'utf8');
} catch {
  console.warn('⚠  No se encontró el CSS del web en:');
  console.warn(`   ${WEB_CSS}`);
  console.warn('   Clona frontend-soul al lado o define SOUL_WEB_CSS. Se omite la comprobación.');
  process.exit(0);
}

const webVars = parseCssVars(webCss);
const mobile = parseMobileTheme(readFileSync(MOBILE_THEME, 'utf8'));

const mismatches = [];
const missing = [];

/**
 * Resuelve una indirección `var(--x)` contra el mapa de variables.
 *
 * El web declara algunos tokens de estado como `--color-success: var(--success)`
 * para que el tema oscuro pueda sustituirlos. Sin esto, la comprobación
 * compararía el literal `var(--success)` con el hex de la app.
 */
function resolveVar(value, vars, depth = 0) {
  if (!value) return value;
  const match = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(value.trim());
  if (!match || depth > 2) return value;

  const target = vars.get(match[1].toLowerCase());
  return target ? resolveVar(target, vars, depth + 1) : value;
}

for (const [token, cssVar] of Object.entries(CONTRACT)) {
  const mobileValue = mobile.get(token);
  const webValue = resolveVar(webVars.get(cssVar), webVars);

  if (!mobileValue) {
    missing.push(`  ${token} no existe en theme.ts`);
    continue;
  }
  if (!webValue) {
    missing.push(`  ${cssVar} no existe en globals.css (token: ${token})`);
    continue;
  }
  if (normalize(mobileValue) !== normalize(webValue)) {
    mismatches.push(
      `  ${token}\n    móvil: ${mobileValue}\n    web  : ${webValue}  (${cssVar})`,
    );
  }
}

const checked = Object.keys(CONTRACT).length;

if (missing.length > 0) {
  console.error('✗ Tokens no encontrados:');
  console.error(missing.join('\n'));
}

if (mismatches.length > 0) {
  console.error('✗ Tokens desalineados respecto al web:');
  console.error(mismatches.join('\n'));
}

if (missing.length > 0 || mismatches.length > 0) {
  console.error(`\n${checked - mismatches.length - missing.length}/${checked} tokens en paridad.`);
  process.exit(1);
}

console.log(`✓ ${checked}/${checked} tokens en paridad con el web (${WEB_CSS.split('/').slice(-3).join('/')})`);
