import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Slate neutrals
        slate: {
          50: 'hsl(var(--slate-50))',
          100: 'hsl(var(--slate-100))',
          200: 'hsl(var(--slate-200))',
          300: 'hsl(var(--slate-300))',
          400: 'hsl(var(--slate-400))',
          500: 'hsl(var(--slate-500))',
          600: 'hsl(var(--slate-600))',
          700: 'hsl(var(--slate-700))',
          800: 'hsl(var(--slate-800))',
          900: 'hsl(var(--slate-900))',
          950: 'hsl(var(--slate-950))',
        },
        // Primary (cyan-teal brand accent)
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Accent (amber for highlights)
        accent: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          200: 'hsl(var(--accent-200))',
          300: 'hsl(var(--accent-300))',
          400: 'hsl(var(--accent-400))',
          500: 'hsl(var(--accent-500))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          800: 'hsl(var(--accent-800))',
          900: 'hsl(var(--accent-900))',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Core semantic tokens
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--fg))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-contrast))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        // Surfaces
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        // Semantic colors
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        info: 'hsl(var(--info))',
      },
      boxShadow: {
        'focus': '0 0 0 2px hsl(var(--ring) / 0.2)',
        'focus-danger': '0 0 0 2px hsl(var(--danger) / 0.2)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config
