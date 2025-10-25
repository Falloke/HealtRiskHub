/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // สำหรับ app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // เผื่อคุณใช้ pages directory ด้วย
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-pink": "#F523AC", // ใช้ในปุ่มและหัวข้อ
        "primary-yellow-main": "#E89623", // สีที่คุณใช้ใน picker
      },
    },
  },
  plugins: [],
};
