import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://amantia.com.co',
  // Todas las URLs del url-map terminan en "/" (docs/seo/url-map.md).
  trailingSlash: 'always',
  integrations: [tailwind()],
});
