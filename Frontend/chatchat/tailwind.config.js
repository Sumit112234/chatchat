/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f5ff',
          100: '#e1ebff',
          200: '#c3d7fe',
          300: '#a4c0fd',
          400: '#7e9dfb',
          500: '#5b78f8',
          600: '#3f58ee',
          700: '#3046d5',
          800: '#2a3cac',
          900: '#293585',
        },
      },
    },
  },
  plugins: [],
}