/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        myTeal: "rgb(102, 200, 198)",
        myPeach: "rgb(209, 123, 115)",
      },
    },
  },
  plugins: [],
};