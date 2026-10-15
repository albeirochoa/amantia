/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial (CLAUDE.md). Versión clara: fondos paper/cream, texto navy.
        navy: {
          DEFAULT: '#1A2A44',
          soft: '#2C3E5A',
        },
        gold: {
          DEFAULT: '#B8944B', // solo botón principal
          soft: '#D4B872', // acentos sobre fondo oscuro
          dark: '#7A5C24', // etiquetas y acentos sobre fondo claro (contraste AA)
        },
        cream: '#F5F1E8',
        bone: '#E8E4DA',
        paper: '#FAF8F3', // fondo principal
        sand: '#F1EDE4', // secciones destacadas
        linen: '#E6E0D4', // líneas y fondos de imagen
        ink: {
          muted: '#4F5B70', // texto secundario sobre claro (AA)
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-2': '0.25em',
        'widest-3': '0.35em',
      },
      maxWidth: {
        shell: '1240px',
      },
    },
  },
  plugins: [],
};
