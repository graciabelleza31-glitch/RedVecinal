/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aquí definimos el color verde de RedVecinal que usa tu CSS
        brand: {
          600: '#059669', // Verde esmeralda
          700: '#047857', // Verde más oscuro para el hover
        }
      }
    },
  },
  plugins: [],
}