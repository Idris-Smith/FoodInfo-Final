/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        peach: '#FFDAB9',
        'pastel-orange': '#FFB347',
        'deep-orange': '#FF8C42',
        'warm-orange': '#FF6F3C',
        'burnt-orange': '#FF4500',
      },
    },
  },
  plugins: [],
};
