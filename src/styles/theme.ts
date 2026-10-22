export const colors = {
  // Paleta Soul (desde frontend-soul / globals.css)
  cream: '#F6F0E8',
  sage: '#DDE6DE',
  sand: '#C4A68E',
  mist: '#7A93A2',
  ink: '#354B5C',
  paper: '#FBF8F3',

  // Semánticos de UI
  primary: '#354B5C',
  primaryDark: '#2A3B47',
  primaryLight: '#F6F0E8',
  background: '#F6F0E8',
  surface: '#FBF8F3',
  text: '#354B5C',
  textSecondary: '#7A93A2',
  border: '#CDB89E',
  error: '#A34D38',
  success: '#46614C',
  warning: '#8A6A2F',
  disabled: '#DDE6DE',

  // Colores de estado extendidos
  header: '#DDE6DE',
  accent: '#C4A68E',
  accentForeground: '#354B5C',
  muted: '#F2EEF7',
  mutedForeground: '#5E7886',
  destructive: '#A34D38',
  destructiveForeground: '#F6F0E8',
  input: '#CDB89E',
  ring: '#7A93A2',
  successBg: '#DBE7DD',
  warningBg: '#F1E7CD',
  dangerBg: '#F2DED6',
  info: '#4E6A7A',
  infoBg: '#DDE7EC',

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodySmall: { fontSize: 13, color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  caption: { fontSize: 12, color: colors.textSecondary },
} as const;
