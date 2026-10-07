import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#040915',
          900: '#07102a',
          800: '#0b1740',
          700: '#122257',
          600: '#1b327a',
        },
        neon: { DEFAULT: '#2F7BFF', soft: '#5B9BFF', cyan: '#3CC8FF' },
        fire: { DEFAULT: '#FF9A1F', deep: '#FF6A00' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(47,123,255,.35)',
        fire: '0 0 24px rgba(255,154,31,.35)',
      },
      keyframes: {
        pop: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(.98)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(32deg)' },
          '50%': { transform: 'translateY(-14px) rotate(32deg)' },
        },
        flicker: {
          '0%,100%': { transform: 'scaleY(1)', opacity: '1' },
          '50%': { transform: 'scaleY(1.12)', opacity: '.85' },
        },
      },
      animation: {
        pop: 'pop .18s ease-out',
        float: 'float 5s ease-in-out infinite',
        flicker: 'flicker .35s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
