/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#F5F3FF',
          100: '#EFF2FE',
          200: '#E1E7FD',
          300: '#C4B5FD',
          400: '#6252EF',
          500: '#4C3AED',
          600: '#402ECF',
          700: '#302C80',
          800: '#1E1B4B',
          900: '#10172A',
        },
        warm: {
          50: '#FEFBEC',
          100: '#FEF7ED',
          200: '#FDECD4',
          300: '#FBD9B0',
          400: '#F8C07A',
          500: '#F09E0F',
          600: '#D97219',
          700: '#B65C18',
          800: '#934D19',
          900: '#73381B',
        },
        sage: {
          50: '#EFFCF5',
          100: '#D8F9E6',
          200: '#C3DBC3',
          300: '#99C199',
          400: '#6FA36F',
          500: '#4F8A4F',
          600: '#3D6E3D',
          700: '#335933',
          800: '#2C472C',
          900: '#253B25',
        },
        rose: {
          50: '#FCF1F2',
          100: '#FFE3E3',
          200: '#FFC9C9',
          300: '#FFA3A3',
          400: '#F06E80',
          500: '#EB3D5B',
          600: '#E03131',
          700: '#C92A2A',
          800: '#A62626',
          900: '#8B2020',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
      },
      animation: {
        'walk': 'walk 0.6s ease-in-out',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        walk: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateX(var(--walk-distance))' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
