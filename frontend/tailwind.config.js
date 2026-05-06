/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        card: "rgba(17, 24, 39, 0.7)",
        accent: {
          purple: "#8B5CF6",
          blue: "#3B82F6",
        },
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
