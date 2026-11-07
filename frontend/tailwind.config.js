/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystery: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#6366f1',
          gold: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
