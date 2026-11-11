/**
 * Design tokens for the mobile app.
 *
 * Reference: `frontend-soul/src/app/globals.css` (Soul design system).
 * Tokens marked "parity" must match the web; `npm run tokens:check` enforces it.
 *
 * Note: the contract with the web includes tokens the app does not consume yet
 * (e.g. `warning`, `infoBg`, `overlay`). They are kept on purpose because they
 * are the shared source of truth and the parity script compares them; removing
 * them would mean trimming that contract and losing drift control.
 *
 * Intentional differences from the web (not drift):
 * - Shadows: React Native uses `shadowOffset` / `elevation`, not `box-shadow`,
 *   so the web `--elevation-*` values are not reusable as they are.
 * - Typography: the web caps the weight at 600; here `h1` uses 700 for
 *   legibility on small screens. Moving to 600 is a pending brand decision.
 * - No `hover`, `focus-visible` or breakpoints: they do not exist in RN.
 */

/**
 * Radius scale aligned with the web, which uses 6/8/12/16/20.
 * The current app values (8/12/16) already match the web `md`/`lg`/`xl`, which
 * is why they are NOT renumbered: renaming them would tighten the whole
 * interface with no visual gain.
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
  // ==================== Raw brand (identical to the web) ====================
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

  // ==================== Text ====================
  text: '#354B5C',
  /**
   * parity: --muted-foreground #4D6572 -> 5.42:1 over cream.
   * It used to be #7A93A2, which gave 3.06:1 and failed WCAG AA.
   */
  textSecondary: '#4D6572',
  /** Fixes the previous typo (#F2EEF7 was purplish). */
  muted: '#F2EEE7', // paridad: --muted

  // ==================== Brand / action ====================
  primary: '#354B5C',
  primaryLight: '#F6F0E8',
  accent: '#C4A68E',
  /** parity: --accent-foreground #2B3D4B -> 4.91:1 over sand (previously 3.98:1) */
  accentForeground: '#2B3D4B',

  // ==================== Bordes y foco ====================
  /** Hairline decorativo (1.69:1). NO usar en controles interactivos. */
  border: '#CDB89E',
  /** Borde de controles: 3.03:1, cumple WCAG 1.4.11. */
  borderStrong: '#9E8768',
  input: '#9E8768',
  /** Focus ring: 5.70:1 (previously #7A93A2 at 2.84:1). */
  ring: '#46617A',

  // ==================== State ====================
  error: '#94402D',
  destructive: '#94402D',
  destructiveForeground: '#F6F0E8',
  success: '#46614C',
  /** parity: --warning #7D5F26 -> 4.82:1 over warningBg (previously 4.08:1) */
  warning: '#7D5F26',
  info: '#4E6A7A',
  successBg: '#DBE7DD',
  warningBg: '#F1E7CD',
  dangerBg: '#F2DED6',
  infoBg: '#DDE7EC',

  /**
   * Modal layer. Its own token so it does not invert if `text` ever changes
   * (same rule as the web).
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
  /** Intentional difference from the web (600). See the note at the top of the file. */
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodySmall: { fontSize: 13, color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  caption: { fontSize: 12, color: colors.textSecondary },
} as const;
