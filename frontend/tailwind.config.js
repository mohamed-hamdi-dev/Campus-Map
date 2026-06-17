/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 60px rgba(14, 165, 233, 0.18)",
      },
    },
  },
  plugins: [],
};
