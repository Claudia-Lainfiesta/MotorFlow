module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1677d2", foreground: "#fff" },
        motorflow: { blue: "#1677d2", dark: "#0b3f75", pale: "#eaf4ff" },
        background: "#f8fbff",
        foreground: "#172033",
        muted: "#e9f1f8",
      },
      fontFamily: { sans: ["Montserrat", "sans-serif"] },
    },
  },
  plugins: [],
};
