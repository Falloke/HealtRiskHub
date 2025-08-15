/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // สำหรับ app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // เผื่อคุณใช้ pages directory ด้วย
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
