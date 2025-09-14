/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-',
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  plugins: [require('tailwindcss-animate')],
  theme: {
    extend: {
      colors: {
        border: 'var(--presentation-border)',
        input: 'var(--presentation-input)',
        ring: 'var(--presentation-ring)',
        background: 'var(--presentation-background)',
        foreground: 'var(--presentation-foreground)',
        primary: {
          DEFAULT: 'var(--presentation-primary)',
          foreground: 'var(--presentation-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--presentation-secondary)',
          foreground: 'var(--presentation-secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--presentation-destructive)',
          foreground: 'var(--presentation-destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--presentation-muted)',
          foreground: 'var(--presentation-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--presentation-accent)',
          foreground: 'var(--presentation-accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--presentation-popover)',
          foreground: 'var(--presentation-popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--presentation-card)',
          foreground: 'var(--presentation-card-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--presentation-sidebar)',
          foreground: 'var(--presentation-sidebar-foreground)',
          primary: 'var(--presentation-sidebar-primary)',
          'primary-foreground': 'var(--presentation-sidebar-primary-foreground)',
          accent: 'var(--presentation-sidebar-accent)',
          'accent-foreground': 'var(--presentation-sidebar-accent-foreground)',
          border: 'var(--presentation-sidebar-border)',
          ring: 'var(--presentation-sidebar-ring)',
        },
        chart: {
          1: 'var(--presentation-chart-1)',
          2: 'var(--presentation-chart-2)',
          3: 'var(--presentation-chart-3)',
          4: 'var(--presentation-chart-4)',
          5: 'var(--presentation-chart-5)',
        },
      },
      borderRadius: {
        lg: 'var(--presentation-radius)',
        md: 'calc(var(--presentation-radius) - 2px)',
        sm: 'calc(var(--presentation-radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--presentation-font-sans)'],
        serif: ['var(--presentation-font-serif)'],
        mono: ['var(--presentation-font-mono)'],
      },
    },
  },
};
