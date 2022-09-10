/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      white: "#ffffff",
      black: "#000000",
      blue: "#3861fb",
      green: "#16c784",
      red: "#ea3943",
      dark: "#1e293b",
      "gray-dark": "#1e2126",
      gray: "#8492a6",
      "gray-light": "#d3dce6",
      "black-rgba": "rgba(0, 0, 0, 0.54)",
    },
    extend: {
      boxShadow: {
        'line': 'inset 0 0 0 1px rgb(255 255 255 / 10%)',
      }
    },
  },
  plugins: [],
};
