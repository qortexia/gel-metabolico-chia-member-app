import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF6EE',
        foreground: '#2B2013',
        brand: {
          DEFAULT: '#C9A227',
          light: '#E4C158',
          dark: '#A8841C',
        },
        success: '#15803D',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
