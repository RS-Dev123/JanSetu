/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b9e0ff',
          300: '#89ceff',
          400: '#52b5ff',
          500: '#2a99ff',
          600: '#147bff',
          700: '#0e65eb',
          800: '#1251be',
          900: '#154596',
          950: '#122b5c',
        },
        darkbg: '#060a13',
        darkpanel: 'rgba(11, 18, 33, 0.7)',
        darkborder: 'rgba(255, 255, 255, 0.08)'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
