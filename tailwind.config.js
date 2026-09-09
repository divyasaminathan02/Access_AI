/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./dashboard.html",
    "./onboarding.html",
    "./demo.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec3ff',
          400: '#599eff',
          500: '#3277f6',
          600: '#1d5ae9',
          700: '#1545d5',
          800: '#1739ac',
          900: '#183487',
          950: '#101f52',
        },
        warm: {
          50: '#fdfbf7',
          100: '#f9f4ea',
          200: '#f2e8d3',
          300: '#e7d6b3',
          400: '#d9bd8d',
          500: '#cba16b',
          600: '#bc8755',
          700: '#9d6c46',
          800: '#7e573c',
          900: '#674733',
        },
        dyslexic: {
          bg: '#faf8f5',
          text: '#1a1a1a',
          tint: '#fdf5e6',
        },
        slate: {
          850: '#172033',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        atkinson: ['"Atkinson Hyperlegible"', 'sans-serif'],
        opendyslexic: ['"OpenDyslexic"', 'sans-serif'],
        serif: ['"Merriweather"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-brand': '0 0 25px rgba(50, 119, 246, 0.35)',
        'glow-amber': '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
