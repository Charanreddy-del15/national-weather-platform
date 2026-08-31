/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#003366',
          navy: '#0A192F',
          saffron: '#FF9933',
          green: '#138808',
          accent: '#1E40AF',
          card: '#111827',
          surface: '#1F2937',
          border: '#374151'
        }
      }
    },
  },
  plugins: [],
}
