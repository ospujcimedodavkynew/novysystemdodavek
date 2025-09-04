/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E40AF',
        'primary-focus': '#1D4ED8',
        'secondary': '#9333EA',
        'background': '#111827',
        'surface': '#1F2937',
        'text-primary': '#F9FAFB',
        'text-secondary': '#D1D5DB',
        'accent': '#3B82F6',
      },
    },
  },
  plugins: [],
}
