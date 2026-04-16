import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jarvis: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        record: '#ef4444',
      },
      animation: {
        'pulse-record': 'pulse-record 1.5s ease-in-out infinite',
        'waveform': 'waveform 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-record': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'waveform': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '24px' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
