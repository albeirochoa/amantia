import type { APIRoute } from 'astro';

// Sitemap generado en build sin dependencias extra.
// Incluye cada página .astro de src/pages excepto 404 y rutas dinámicas.
// Al agregar URLs nuevas, seguir docs/seo/seo-governance.md antes de publicarlas.
const pages = import.meta.glob('./**/*.astro', { eager: true });

export const GET: APIRoute = ({ site }) => {
  const urls = Object.keys(pages)
    .filter((file) => !file.includes('404') && !file.includes('['))
    .map((file) => {
      const path = file.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/?index$/, '/');
      return new URL(path.endsWith('/') ? path : `${path}/`, site).href;
    })
    .sort();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
