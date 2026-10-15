// Worker mínimo delante de los assets estáticos de Astro.
// Única tarea: redirigir www.amantia.com.co → amantia.com.co con 301 (evita contenido duplicado).
// Todo lo demás se sirve tal cual desde ./dist (incluida la 404).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.amantia.com.co') {
      url.hostname = 'amantia.com.co';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
