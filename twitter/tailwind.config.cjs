/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  mode: 'jit',
  theme: {
    extend: {
      screens: {
        'xs': '400px'
      }
    },
  },
  plugins: [],
};
