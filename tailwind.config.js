/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)'],
      },
      keyframes: {
        // A animação foi ajustada aqui: removi o 'transform'
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Animações para a celebração (permanecem as mesmas)
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fall: {
          '0%': { opacity: '1', transform: 'translateY(-10vh) rotateZ(0deg)' },
          '100%': { opacity: '1', transform: 'translateY(110vh) rotateZ(720deg)' },
        },
        rotate: {
          '0%': { transform: 'rotateX(0) rotateY(0)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        }
      },
      animation: {
        // A duração da animação foi ajustada para um fade suave
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-fast': 'fade-in-fast 0.3s ease-out forwards',
        'pop-in': 'pop-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};