const colors = require("tailwindcss/colors");

const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  theme: {
    colors: {
      emerald: colors.emerald,
      dark: "#1e293b",
      "gray-dark": "#1e2126",
      gray: "#8492a6",
    },
  },
  plugins: [require("flowbite/plugin")],
  darkMode: "class",
};

module.exports = config;
