# Amantia · Contexto del Proyecto

Este es el sitio web de **Amantia**, un refugio para parejas en Quebradanegra, Cundinamarca, Colombia. Esta primera fase es el coming soon para capturar pre-registros del programa Orígenes.

## Stack

- **Astro 4** (static site generator)
- **TailwindCSS** con paleta Amantia custom
- **MailerLite** para captura de emails (form embebido vía fetch)
- **Hosting:** Netlify / Cloudflare Pages / Vercel (decisión final pendiente)
- **Dominio:** amantia.com.co

## Estructura

```
src/
├── pages/index.astro          # Coming soon (única página por ahora)
├── layouts/Base.astro         # SEO meta tags, fuentes Google
└── components/
    └── PreRegisterForm.astro  # Form MailerLite

public/
├── favicon.svg
├── robots.txt
└── images/                    # Hero, OG image, fotos del lugar
```

## Comandos

```bash
npm install           # Primera vez
npm run dev           # Local en http://localhost:4321
npm run build         # Build a dist/
npm run preview       # Preview del build
```

## Variables de entorno (.env)

```
PUBLIC_MAILERLITE_ACCOUNT_ID=xxx
PUBLIC_MAILERLITE_FORM_ID=xxx
```

Nunca commitear `.env`. Usar `.env.example` como plantilla.

## Identidad de marca · NO INVENTAR

### Paleta (exacta, no modificar)

| Color | Hex | Uso |
|-------|-----|-----|
| Navy principal | `#1A2A44` | Fondos, contenedor principal |
| Navy soft | `#2C3E5A` | Caja del formulario |
| Dorado | `#B8944B` | CTAs, acentos, divider |
| Dorado suave | `#D4B872` | Tagline italic, hover |
| Crema | `#F5F1E8` | Backgrounds claros (landing completa) |
| Bone | `#E8E4DA` | Texto sobre fondo oscuro |

### Tipografía

- **Headers:** Playfair Display (Google Fonts)
- **Body:** Inter (Google Fonts)
- **Mayúsculas:** letter-spacing amplio (0.25em–0.35em)
- **Italic:** reservado para taglines y mensajes emotivos

### Tono editorial

- Sereno, contenido, sin grandilocuencia
- Habla a parejas adultas (30-55), no a millennials genéricos
- "Menos ruido. Más presencia." es la consigna
- NUNCA usar: emojis, exclamaciones múltiples, lenguaje de booking comercial
- SÍ usar: pausas, frases cortas, silencios narrativos

### Reglas no negociables

1. **No agregar accent lines bajo titulos** — son hallmark de sitios AI-generados
2. **No usar gradientes vistosos** — fondos sólidos o overlays muy sutiles
3. **No animaciones llamativas** — todo lo más, fade-in muy lento (>800ms)
4. **No bullet points en copy editorial** — prosa, no listas
5. **No CTAs gritones** — el botón dorado es suficiente, sin glow ni pulse
6. **Frase "Antes de abrir, cinco parejas..."** es central a la propuesta de Orígenes, no parafrasear

## Próximos hitos del proyecto

1. ✅ Coming soon armado (este repo)
2. 🔄 Configurar MailerLite y deploy
3. ⏳ Conseguir foto/video real del lugar para el hero
4. ⏳ Crear OG image (1200x630)
5. ⏳ Lanzar al público + anunciar en Instagram
6. ⏳ Construir landing completa v1.1 (5 secciones del documento original)

## Cosas importantes que evitar

- **No instalar dependencias innecesarias.** Cada `npm install` extra es código que mantener. Si una librería no aporta valor visible al usuario, no entra.
- **No agregar JavaScript del lado cliente.** Astro es estático por diseño. El único JS aceptable es el del formulario MailerLite. Si algo se puede resolver con CSS, va con CSS.
- **No tocar imágenes reales sin permiso.** Los placeholders de Unsplash son temporales. Las fotos reales del lugar son finitas y costosas; no se cambian sin discutir.
- **No deployar sin probar el form.** Antes de cualquier push a producción, verificar que el form de MailerLite efectivamente recibe el envío.

## Agentes disponibles

- `@amantia-deploy` — Deploy a Netlify/Cloudflare/Vercel, verificación de build, DNS
- `@amantia-content` — Editar copy, agregar secciones manteniendo identidad de marca

Ver `.claude/agents/` para configuración detallada.
