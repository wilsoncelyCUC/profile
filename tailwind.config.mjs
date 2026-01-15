/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'brand-gray': '#575F7D',
        'brand-green': '#0abf53',
        'brand-bg': '#F7F9FC',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
