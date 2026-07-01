/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bentonite: {
          bg: 'var(--bentonite-bg)',
          card: 'var(--bentonite-card)',
          trainer: 'var(--bentonite-trainer)',
          learner: 'var(--bentonite-learner)',
          'text-primary': 'var(--bentonite-text-primary)',
          'text-secondary': 'var(--bentonite-text-secondary)',
          border: 'var(--bentonite-border)',
          'trainer-bg': 'var(--bentonite-trainer-bg)',
          'learner-bg': 'var(--bentonite-learner-bg)',
          'collapsed': 'var(--bentonite-collapsed)',
          'constructive': 'var(--bentonite-constructive)',
          'active': 'var(--bentonite-active)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'chip': '10px',
      },
    },
  },
  plugins: [],
};
