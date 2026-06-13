/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'panel-bg': '#0D111A',
        'panel-elevated': '#111827',
        'panel-soft': '#0F172A',
        'track-bg': '#151A24',
        'accent-purple': '#635BFF',
        'optimized-green': '#22C55E',
        'baseline-red': '#EF4444',
        'warning-amber': '#F59E0B',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
