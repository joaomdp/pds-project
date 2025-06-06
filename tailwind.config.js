/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        slideDown: "slideDown 0.3s ease-out forwards",
      },
      spacing: {
        "sidebar-mobile": "4rem",
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ".mobile-sidebar-active main": {
          paddingTop: "4rem",
        },
      });
    },
  ],
};
