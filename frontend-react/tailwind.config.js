/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1a1a1a',
          200: '#262626',
          300: '#363636',
          400: '#404040',
          500: '#8e8e8e',
          900: '#000000',
        }
      }
    },
  },
  plugins: [],
}