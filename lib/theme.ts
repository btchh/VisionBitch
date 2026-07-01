export const colors = {
  bg: '#0A0C10',
  surface: '#14181F',
  surfaceElevated: '#1C212B',
  border: '#262C38',
  accent: '#C6FF3E',
  accentDim: '#8FCB1F',
  textPrimary: '#F4F6F8',
  textSecondary: '#8A93A3',
  textMuted: '#5B6472',
  danger: '#FF6B5E',
  overlay: 'rgba(10,12,16,0.55)',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 22, full: 999 };

export const type = {
  eyebrow: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
};