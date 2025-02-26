/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        'apple-blue': '#3b82f6',  // blue-500
        'apple-gray': '#f9fafb',  // gray-50
        'apple-dark': '#1e3a8a',  // blue-900
        'apple-light': '#dbeafe', // blue-100
        'apple-green': '#10b981', // emerald-500
        'apple-red': '#ef4444',   // red-500
      },
      fontFamily: {
        'apple': ['SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'apple': '1rem',
      },
    },
  },
  plugins: [],
} 