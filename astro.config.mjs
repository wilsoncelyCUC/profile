import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import alpinejs from '@astrojs/alpinejs';

export default defineConfig({
  site: 'https://wilsoncelycuc.github.io',
  base: '/profile',
  integrations: [
    tailwind(),
    mdx(),
    alpinejs(),
  ],
  output: 'static',
});
