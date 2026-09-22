import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          void: '#080B11',
          surface: '#0D131F',
          elevated: '#141C2E',
          input: '#1C263D',
          hover: '#24314E',
        },
        cyan: {
          accent: '#00F0FF',
          muted: '#009BB5',
          glow: 'rgba(0, 240, 255, 0.15)',
        },
        semantic: {
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Syne"', '"Space Grotesk"', 'sans-serif'],
        tech: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'laser-sweep': 'laserSweep 4.5s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        laserSweep: {
          '0%': { top: '2%', opacity: '0.3' },
          '20%': { opacity: '0.95' },
          '80%': { opacity: '0.95' },
          '100%': { top: '96%', opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
