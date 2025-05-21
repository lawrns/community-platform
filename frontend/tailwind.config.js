/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: { 
        sans: ['InterVariable', 'sans-serif'] 
      },
      colors: {
        // New design system
        bg: { 
          0: 'var(--bg-0)', 
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          surface: 'var(--bg-surface)',
        },
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
          fade: 'var(--brand-fade)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
        },
        // Legacy colors for compatibility
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
          accent: "hsl(var(--surface-accent))",
        },
        content: {
          primary: "hsl(var(--content-primary))",
          secondary: "hsl(var(--content-secondary))",
          tertiary: "hsl(var(--content-tertiary))",
          inverse: "hsl(var(--content-inverse))",
          onPrimary: "hsl(var(--content-on-primary))",
          onAccent: "hsl(var(--content-on-accent))",
          onDestructive: "hsl(var(--content-on-destructive))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // 8-pt spacing system
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '32': 'var(--space-32)',
      },
      // Border radius
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        l: 'var(--radius-l)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      // Shadow system
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glass: 'var(--shadow-glass)',
      },
      // Motion system
      transitionTimingFunction: {
        'ease-out-expo': 'var(--motion-ease-out-expo)',
        'ease-in-out': 'var(--motion-ease-in-out)',
        'ease-out': 'var(--motion-ease-out)',
        'ease-in': 'var(--motion-ease-in)',
      },
      transitionDuration: {
        'ultra-fast': 'var(--motion-duration-ultra-fast)',
        'fast': 'var(--motion-duration-fast)',
        'normal': 'var(--motion-duration-normal)',
        'slow': 'var(--motion-duration-slow)',
      },
      // Gradient backgrounds
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple-blue': 'linear-gradient(to right, var(--brand-600), var(--brand-500))',
        'grain': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.2\'/%3E%3C/svg%3E")',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-up": {
          '0%': { transform: 'translateY(32px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        "slide-down": {
          '0%': { transform: 'translateY(-32px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        "fade-in": {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        "grain": { 
          '0%, 100%': { transform: 'translate(0)' }, 
          '50%': { transform: 'translate(-3%,3%)' } 
        },
        "scale-lift": {
          '0%': { transform: 'scale(1) translateY(0)', boxShadow: 'var(--shadow-md)' },
          '100%': { transform: 'scale(1.02) translateY(-4px)', boxShadow: 'var(--shadow-xl)' },
        },
        "scale-press": {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.96)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.24s var(--motion-ease-out-expo)",
        "slide-down": "slide-down 0.24s var(--motion-ease-out-expo)",
        "fade-in": "fade-in 0.24s var(--motion-ease-out-expo)",
        "float": "float 3s ease-in-out infinite",
        "grain": "grain 8s steps(12) infinite",
        "scale-lift": "scale-lift 0.2s var(--motion-ease-out-expo) forwards",
        "scale-press": "scale-press 0.1s var(--motion-ease-out-expo) forwards"
      },
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
  // Ensure CSS is generated during build
  safelist: [
    'bg-brand-500',
    'text-brand-50',
    'bg-brand-fade',
    'bg-gradient-purple-blue',
    'backdrop-blur-md',
    'backdrop-blur-lg',
    'ring-1',
    'ring-brand-fade',
    'ring-white/10',
    'data-[state=active]:border-brand-500',
    'animate-slide-up',
    'animate-grain',
    'text-balance',
  ],
}