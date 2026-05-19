/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A2A44',
          soft: '#2C3E5A',
        },
        gold: {
          DEFAULT: '#B8944B',
          soft: '#D4B872',
        },
        cream: '#F5F1E8',
        bone: '#E8E4DA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-2': '0.25em',
        'widest-3': '0.35em',
      },
    },
  },
  plugins: [],
};
