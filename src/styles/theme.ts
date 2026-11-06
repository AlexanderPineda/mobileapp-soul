/**
 * Design tokens de la app móvil.
 *
 * Referencia: `frontend-soul/src/app/globals.css` (design system Soul).
 * Los tokens marcados "paridad" deben coincidir con el web; lo comprueba
 * `npm run tokens:check`.
 *
 * Nota: el contrato con el web incluye tokens que la app todavía no consume
 * (p. ej. `warning`, `infoBg`, `overlay`). Se mantienen a propósito porque son
 * la fuente de verdad compartida y el script de paridad los compara; borrarlos
 * obligaría a recortar ese contrato y perderíamos el control de deriva.
 *
 * Diferencias intencionales con el web (no son deriva):
 * - Sombras: React Native usa `shadowOffset` / `elevation`, no `box-shadow`,
 *   así que los `--elevation-*` del web no son reutilizables tal cual.
 * - Tipografía: el web limita el peso a 600; aquí `h1` usa 700 por legibilidad
 *   en pantalla pequeña. Cambiar a 600 es una decisión de marca pendiente.
 * - Sin `hover`, `focus-visible` ni breakpoints: no existen en RN.
 */

/**
 * Escala de radios alineada con el web, que usa 6/8/12/16/20.
 * Los valores actuales de la app (8/12/16) ya coinciden con `md`/`lg`/`xl`
 * del web, por eso NO se renumeran: renombrarlos apretaría toda la interfaz
 * sin ninguna ganancia visual.
 */
export const borderRadius = {
  xs: 6, // web: --radius-sm
  sm: 8, // web: --radius-md (controles)
  md: 12, // web: --radius-lg (superficies)
  lg: 16, // web: --radius-xl (tarjetas y modales)
  xl: 20, // web: --radius-2xl
  full: 9999,
} as const;

export const colors = {
  // ==================== Marca cruda (idéntica al web) ====================
  cream: '#F6F0E8',
  sage: '#DDE6DE',
  sand: '#C4A68E',
  mist: '#7A93A2',
  ink: '#354B5C',
  paper: '#FBF8F3',

  // ==================== Superficies ====================
  background: '#F6F0E8', // paridad: --surface-base
  surface: '#FBF8F3', // paridad: --surface-1
  surfaceRaised: '#FFFCF8', // paridad: --surface-2
  surfaceInset: '#F2EEE7', // paridad: --surface-inset
  header: '#DDE6DE', // paridad: --header

  // ==================== Texto ====================
  text: '#354B5C',
  /**
   * paridad: --muted-foreground #4D6572 -> 5.42:1 sobre crema.
   * Antes #7A93A2, que daba 3.06:1 y no cumplía WCAG AA.
   */
  textSecondary: '#4D6572',
  /** Corrige el typo anterior (#F2EEF7 era violáceo). */
  muted: '#F2EEE7', // paridad: --muted

  // ==================== Marca / acción ====================
  primary: '#354B5C',
  primaryLight: '#F6F0E8',
  accent: '#C4A68E',
  /** paridad: --accent-foreground #2B3D4B -> 4.91:1 sobre arena (antes 3.98:1) */
  accentForeground: '#2B3D4B',

  // ==================== Bordes y foco ====================
  /** Hairline decorativo (1.69:1). NO usar en controles interactivos. */
  border: '#CDB89E',
  /** Borde de controles: 3.03:1, cumple WCAG 1.4.11. */
  borderStrong: '#9E8768',
  input: '#9E8768',
  /** Anillo de foco: 5.70:1 (antes #7A93A2 con 2.84:1). */
  ring: '#46617A',

  // ==================== Estado ====================
  error: '#94402D',
  destructive: '#94402D',
  destructiveForeground: '#F6F0E8',
  success: '#46614C',
  /** paridad: --warning #7D5F26 -> 4.82:1 sobre warningBg (antes 4.08:1) */
  warning: '#7D5F26',
  info: '#4E6A7A',
  successBg: '#DBE7DD',
  warningBg: '#F1E7CD',
  dangerBg: '#F2DED6',
  infoBg: '#DDE7EC',

  /**
   * Capa de modales. Token propio para que no se invierta si algún día cambia
   * `text` (mismo criterio que el web).
   */
  overlay: 'rgba(30, 44, 54, 0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  /** Diferencia intencional con el web (600). Ver nota al inicio del archivo. */
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodySmall: { fontSize: 13, color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  caption: { fontSize: 12, color: colors.textSecondary },
} as const;
