/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102a43",
        mist: "#f3f7fa",
        ocean: "#087f8c",
        coral: "#ed6a5a",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 42, 67, 0.10)",
      },
    },
  },
  plugins: [],
};