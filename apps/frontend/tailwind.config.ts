/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // HITU Brand Palette
        hitu: {
          dark: '#081225',
          navy: '#102544',
          royal: '#1B3C73',
          gold: '#C8A95B',
          'gold-soft': '#E4C98A',
          bg: '#020817',
          card: 'rgba(15, 23, 42, 0.75)',
          'border-glow': 'rgba(200, 169, 91, 0.25)',
          'text-primary': '#F8FAFC',
          'text-secondary': '#94A3B8',
        },
        // Shadcn compatible tokens
        border: 'rgba(200, 169, 91, 0.2)',
        input: 'rgba(200, 169, 91, 0.15)',
        ring: '#C8A95B',
        background: '#020817',
        foreground: '#F8FAFC',
        primary: {
          DEFAULT: '#C8A95B',
          foreground: '#020817',
        },
        secondary: {
          DEFAULT: '#102544',
          foreground: '#F8FAFC',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F8FAFC',
        },
        muted: {
          DEFAULT: 'rgba(15, 23, 42, 0.75)',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#1B3C73',
          foreground: '#F8FAFC',
        },
        popover: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
        },
        card: {
          DEFAULT: 'rgba(15, 23, 42, 0.75)',
          foreground: '#F8FAFC',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
        'ibm-arabic': ['"IBM Plex Sans Arabic"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        display: ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        hero: ['6rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      backgroundImage: {
        'hitu-gradient': 'linear-gradient(135deg, #081225 0%, #102544 50%, #1B3C73 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C8A95B 0%, #E4C98A 50%, #C8A95B 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(27,60,115,0.3) 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(27,60,115,0.4) 0%, rgba(2,8,23,0) 70%)',
        'glow-radial': 'radial-gradient(circle, rgba(200,169,91,0.15) 0%, transparent 70%)',
        'mesh-gradient': 'linear-gradient(135deg, #020817 0%, #081225 40%, #102544 70%, #020817 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(200, 169, 91, 0.4), 0 0 40px rgba(200, 169, 91, 0.2)',
        'glow-gold-sm': '0 0 10px rgba(200, 169, 91, 0.3)',
        'glow-blue': '0 0 20px rgba(27, 60, 115, 0.5), 0 0 40px rgba(27, 60, 115, 0.3)',
        'card-glow': '0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,169,91,0.15), inset 0 0 32px rgba(27,60,115,0.05)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,169,91,0.3), 0 0 32px rgba(200,169,91,0.1)',
        'inner-glow': 'inset 0 0 30px rgba(200,169,91,0.05)',
        'float': '0 20px 60px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(1deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,169,91,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(200,169,91,0.6), 0 0 80px rgba(200,169,91,0.2)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(200,169,91,0.2)' },
          '50%': { borderColor: 'rgba(200,169,91,0.5)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'particle': {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(50px) scale(0)', opacity: '0' },
        },
        'count-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
