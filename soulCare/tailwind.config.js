/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html", "./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        divider: '#D6EAF8',
        error: '#E74C3C',
        warning: '#F39C12',
        success: '#48C9B0',
        labelText: '#6C7A89',
        bodyText: '#2C3E50',
        heading: '#144A74',
        cardBg: '#F0F9FF',
        pageBg: '#E3F2FD',
        secondaryBtn: '#A7D8F0',
        primaryBtn: '#5DADEC',
      },
      fontFamily: {
        sans:['Poppins','sans-serif']
      }
    },
  },
  plugins: [],
}

