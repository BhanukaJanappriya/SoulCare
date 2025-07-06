/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e3f2fd',
          200: '#d6eaf8',
          300: '#a7d8f0',
          400: '#5dadec',
          500: '#144a74',
          600: '#2c3e50',
        },
        secondary: {
          100: '#48c9b0',
          200: '#6c7a89',
          300: '#8f8f8f',
          400: '#dfdfdf',
          500: '#202125',
        },
        accent: {
          100: '#d6d0fd',
          200: '#a7d8f0',
        }
      },
      borderRadius: {
        '4xl': '30px',
      },
      boxShadow: {
        'custom': '40px 60px 72px 0 rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
