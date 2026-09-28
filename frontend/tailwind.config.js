/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1F33', // Primary Navy
          800: '#102A43', // Primary Text
          700: '#123B5D', // Infrastructure Blue
        },
        infra: {
          blue: '#123B5D',
          sky: '#1976A5', // Transport Blue
          light: '#E6F0F8',
        },
        charcoal: {
          900: '#1E262C',
          800: '#263238', // Road Charcoal
          700: '#37474F',
          500: '#627D98', // Secondary Text
          200: '#D9E2EC', // Border
          100: '#F0F4F8',
          50: '#F4F7F9',  // Background
        },
        safety: {
          amber: '#D89B24',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        govSuccess: {
          DEFAULT: '#16803C',
          light: '#DCFCE7',
          dark: '#14532D',
        },
        govDanger: {
          DEFAULT: '#C53030',
          light: '#FEE2E2',
          dark: '#7F1D1D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(11, 31, 51, 0.05), 0 1px 2px 0 rgba(11, 31, 51, 0.03)',
        card: '0 4px 6px -1px rgba(11, 31, 51, 0.07), 0 2px 4px -1px rgba(11, 31, 51, 0.04)',
        elevation: '0 10px 15px -3px rgba(11, 31, 51, 0.1), 0 4px 6px -2px rgba(11, 31, 51, 0.05)',
      }
    },
  },
  plugins: [],
}
