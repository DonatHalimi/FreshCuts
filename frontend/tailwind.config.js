export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          2: 'rgb(var(--color-surface-2) / <alpha-value>)',
        },
        border: 'rgb(var(--color-line) / <alpha-value>)',
        sage: {
          DEFAULT: 'rgb(var(--color-sage) / <alpha-value>)',
          dark: 'rgb(var(--color-sage-dark) / <alpha-value>)',
          bright: 'rgb(var(--color-sage-bright) / <alpha-value>)',
        },
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
      },
      boxShadow: {
        panel: '0 18px 50px rgba(0,0,0,0.24)',
      },
    },
  },
  plugins: [],
};
