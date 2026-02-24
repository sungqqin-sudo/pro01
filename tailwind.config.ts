import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          600: '#1d4ed8',
          700: '#1e40af',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
