/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a3a52',
        'primary-light': '#2d5a7b',
        'primary-lighter': '#3d7fa5',
        success: '#27ae60',
        warning: '#f39c12',
        danger: '#e74c3c',
      },
    },
  },
  plugins: [],
}
