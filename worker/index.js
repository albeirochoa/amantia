// Worker delante de los assets estáticos de Astro.
// 1. Redirige www.amantia.com.co → amantia.com.co con 301 (evita contenido duplicado).
// 2. Atiende la API del motor de reservas y del panel en /api/* (ADR-004).
// Todo lo demás se sirve tal cual desde ./dist (incluida la 404).
import { handleApi } from './booking/api.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'www.amantia.com.co') {
      url.hostname = 'amantia.com.co';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, url, ctx);
    }
    return env.ASSETS.fetch(request);
  },
};
