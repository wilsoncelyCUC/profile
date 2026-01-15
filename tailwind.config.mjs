/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': '#2BA8A3',
        'primary-light': '#B3E9E6',
        'text-dark': '#1F2937',
        'bg-light': '#F9FAFB',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
