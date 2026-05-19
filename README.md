# Amantia · Coming Soon

Landing de pre-registro para el programa Orígenes de Amantia. Construido con Astro + Tailwind + MailerLite.

## Stack

- **Astro 4** — static site generator, ultra rápido y SEO-friendly
- **TailwindCSS** — estilos con la paleta Amantia ya configurada
- **MailerLite** — captura de leads vía form embebido (sin backend)

## Estructura

```
amantia-coming-soon/
├── src/
│   ├── pages/
│   │   └── index.astro          # Página principal
│   ├── layouts/
│   │   └── Base.astro           # Layout con SEO + fuentes
│   └── components/
│       └── PreRegisterForm.astro # Formulario MailerLite
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/                  # Aquí va el OG image y fotos del lugar
├── tailwind.config.mjs          # Paleta Amantia: navy, gold, cream
├── astro.config.mjs
└── package.json
```

## Setup inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar MailerLite

1. Entrar a [MailerLite dashboard](https://dashboard.mailerlite.com/)
2. Crear un grupo nuevo: **"Amantia · Pre-registro Orígenes"**
3. Ir a **Forms → Embedded forms → Create form**
4. Elegir "Default subscribe form", seleccionar el grupo creado
5. En la pantalla de embed code de MailerLite, vas a ver una URL como:
   ```
   https://assets.mailerlite.com/jsonp/{ACCOUNT_ID}/forms/{FORM_ID}/subscribe
   ```
6. Copiar el `ACCOUNT_ID` y `FORM_ID`
7. Crear archivo `.env` en la raíz del proyecto:

```env
PUBLIC_MAILERLITE_ACCOUNT_ID=123456
PUBLIC_MAILERLITE_FORM_ID=789012
```

### 3. Correr en local

```bash
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321)

### 4. Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` con HTML/CSS/JS estáticos listos para subir a cualquier hosting.

## Deploy

### Opción A: Netlify (recomendado, gratis)

1. Subir el repo a GitHub
2. Conectar repo en [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Agregar las variables de entorno en Site Settings → Environment Variables
6. Conectar el dominio amantia.com.co

### Opción B: Vercel (también gratis)

Mismos pasos pero en [vercel.com](https://vercel.com). Detecta Astro automáticamente.

### Opción C: Cloudflare Pages (gratis, mejor CDN en LATAM)

Mismos pasos en [pages.cloudflare.com](https://pages.cloudflare.com).

## Placeholders a reemplazar antes de publicar

1. **Imagen de fondo del hero** (`src/pages/index.astro`):
   Actualmente uso una imagen de Unsplash. Reemplazar con foto real del paisaje de Quebradanegra (niebla, valle al atardecer). Subir a `public/images/hero.jpg` y cambiar la URL.

2. **OG image** (`public/images/og-image.jpg`):
   Crear imagen 1200x630px con paisaje + logo + tagline "Menos ruido. Más presencia."

3. **Credenciales MailerLite** en `.env`

4. **Instagram handle**: confirmar que `@amantiacundinamarca` es correcto

## Cosas que NO incluí (a propósito)

- **Tracking analytics**: agregar Plausible o GA4 cuando decidan
- **Política de privacidad**: necesaria por ley de habeas data colombiana — agregar antes de lanzar al público
- **Multi-idioma**: solo español por ahora
- **Animaciones**: deliberadamente simple, la elegancia está en la quietud

## Paleta y tipografía (referencia)

| Color | Hex | Uso |
|-------|-----|-----|
| Navy principal | `#1A2A44` | Fondos, contenedor principal |
| Navy soft | `#2C3E5A` | Caja del formulario |
| Dorado | `#B8944B` | CTAs, acentos, divider |
| Dorado suave | `#D4B872` | Tagline italic, hover |
| Crema | `#F5F1E8` | (no usado aquí, para landing completa) |
| Bone | `#E8E4DA` | Texto sobre fondo oscuro |

- **Headers**: Playfair Display (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Letter-spacing**: amplio en mayúsculas (0.25em–0.35em)

## Próximos pasos sugeridos

1. Lanzar este coming soon con dominio + MailerLite
2. Anunciar en Instagram con post + stories
3. Cuando lleguen las 5 parejas seleccionadas, cambiar el form por mensaje "Orígenes está cerrado, próxima ronda en X"
4. En paralelo, construir la landing completa v1.1 con las 5 secciones del documento original
