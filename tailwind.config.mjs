/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'secondary': 'var(--secondary)',
        'secondary-light': 'var(--secondary-light)',
        'success': 'var(--success)',
        'success-light': 'var(--success-light)',
        'danger': 'var(--danger)',
        'danger-light': 'var(--danger-light)',
        'warning': 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        'text-dark': 'var(--text-dark)',
        'bg-light': 'var(--bg-light)',
        'white': 'var(--white)',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
