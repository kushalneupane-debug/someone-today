/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — values live in src/index.css :root
        bg:            'rgb(var(--bg) / <alpha-value>)',
        surface:       'rgb(var(--surface) / <alpha-value>)',
        ink: {
          DEFAULT:     'rgb(var(--ink) / <alpha-value>)',
          muted:       'rgb(var(--ink-muted) / <alpha-value>)',
          faint:       'rgb(var(--ink-faint) / <alpha-value>)',
        },
        line:          'rgb(var(--line) / <alpha-value>)',
        accent: {
          DEFAULT:     'rgb(var(--accent) / <alpha-value>)',
          soft:        'rgb(var(--accent-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Newsreader"', 'Georgia', 'serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
