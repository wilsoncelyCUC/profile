import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import alpinejs from '@astrojs/alpinejs';

export default defineConfig({
  site: 'https://exore.net',
  integrations: [
    tailwind(),
    mdx(),
    alpinejs(),
  ],
  output: 'static',
});
