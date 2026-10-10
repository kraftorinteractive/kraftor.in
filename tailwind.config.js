/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'sans-serif'] },
      colors: {
        brand: {
          yellow: '#FACC15', orange: '#F97316', lightBlue: '#E0F2FE',
          dark: '#0F172A', muted: '#475569',
        },
      },
      backgroundImage: { 'primary-gradient': 'linear-gradient(to right, #FACC15, #F97316)' },
      aspectRatio: { reel: '9 / 16', card: '2 / 1' },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
