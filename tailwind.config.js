export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4B3F72',
        secondary: '#9B59B6',
        accent: '#E74C3C',
        neutral: {
          100: '#FFFFFF',
          200: '#F5F6FA',
          300: '#E0E0E0',
          400: '#B0B3B8',
          500: '#7A7D85',
          600: '#4A4E57',
          700: '#2C2F33',
        },
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F1C40F',
        info: '#3498DB',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};