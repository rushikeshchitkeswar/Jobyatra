/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366f1', // Indigo
          DEFAULT: '#4f46e5', // Indigo-600
          dark: '#4338ca', // Indigo-700
        },
        secondary: {
          light: '#a855f7', // Purple
          DEFAULT: '#9333ea', // Purple-600
          dark: '#7e22ce', // Purple-700
        }
      },
      backgroundImage: {
        'gradient-jobyatra': 'linear-gradient(to right, #2563eb, #9333ea)', // Blue to Purple
      }
    },
  },
  plugins: [],
}
