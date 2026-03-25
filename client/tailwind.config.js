/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf8f5', 100: '#f4f0ea', 200: '#e9e2d8',
          300: '#d6cabb', 400: '#bfae97', 500: '#a6917a',
          600: '#8a7563', 700: '#6e5c4f', 800: '#4a3d35',
          900: '#2d2520',
        },
        sage: {
          50: '#f4f7f4', 100: '#e6ede6', 200: '#cddccd',
          300: '#a8c2a8', 400: '#7da57d', 500: '#5c8a5c',
          600: '#476e47', 700: '#3a583a', 800: '#2f462f',
          900: '#233423',
        },
        clay: {
          50: '#fdf6f0', 100: '#faeadb', 200: '#f4d3b5',
          300: '#e8b58a', 400: '#d9935e', 500: '#cc7a42',
          600: '#b36335', 700: '#944e2d', 800: '#753e26',
          900: '#5a3020',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Newsreader"', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
