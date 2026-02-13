/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0a0f1e',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06B6D4',
          900: '#164e63',
        },
        amber: {
          500: '#F59E0B',
          900: '#78350f',
        },
        slate: {
          200: '#e2e8f0',
          400: '#94a3b8',
          500: '#64748b',
        },
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        secondary: 'var(--secondary)',
        'secondary-light': 'var(--secondary-light)',
        success: 'var(--success)',
        'success-light': 'var(--success-light)',
        danger: 'var(--danger)',
        'danger-light': 'var(--danger-light)',
        warning: 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        'text-dark': 'var(--text-dark)',
        'bg-light': 'var(--bg-light)',
        white: 'var(--white)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(6, 182, 212, 0.15)',
      },
    },
  },
  plugins: [],
};
