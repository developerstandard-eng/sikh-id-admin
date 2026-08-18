/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0d1b3d', light: '#152650' },
        saffron: { DEFAULT: '#f5821f', dark: '#d96e12' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
