/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcdaff', 300: '#8ec3ff',
          400: '#599fff', 500: '#3377ff', 600: '#1d57f5', 700: '#1643e1',
          800: '#1838b6', 900: '#1a338f', 950: '#142057',
        },
      },
    },
  },
  plugins: [],
}
