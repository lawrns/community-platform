/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Add JS/JSX files for completeness
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
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
      colors: {
        // Surface colors (backgrounds)
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
          accent: "hsl(var(--surface-accent))",
        },
        // Text/content colors
        content: {
          primary: "hsl(var(--content-primary))",
          secondary: "hsl(var(--content-secondary))",
          tertiary: "hsl(var(--content-tertiary))",
          inverse: "hsl(var(--content-inverse))",
          onPrimary: "hsl(var(--content-on-primary))",
          onAccent: "hsl(var(--content-on-accent))",
          onDestructive: "hsl(var(--content-on-destructive))",
        },
        // Brand colors
        brand: {
          primary: "hsl(var(--brand-primary))",
          secondary: "hsl(var(--brand-secondary))",
          tertiary: "hsl(var(--brand-tertiary))",
        },
        // Accent colors for UI emphasis
        accent: {
          blue: "hsl(var(--accent-blue))",
          purple: "hsl(var(--accent-purple))",
          green: "hsl(var(--accent-green))",
          yellow: "hsl(var(--accent-yellow))",
          red: "hsl(var(--accent-red))",
        },
        // Semantic colors
        semantic: {
          success: "hsl(var(--semantic-success))",
          warning: "hsl(var(--semantic-warning))",
          error: "hsl(var(--semantic-error))",
          info: "hsl(var(--semantic-info))",
        },
        // Legacy colors - maintain compatibility with existing code
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
        accentLegacy: {
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
      // Spacing system
      spacing: {
        '4xs': 'var(--spacing-4xs)', // 0.125rem (2px)
        '3xs': 'var(--spacing-3xs)', // 0.25rem (4px)
        '2xs': 'var(--spacing-2xs)', // 0.5rem (8px)
        'xs': 'var(--spacing-xs)',   // 0.75rem (12px)
        'sm': 'var(--spacing-sm)',   // 1rem (16px)
        'md': 'var(--spacing-md)',   // 1.5rem (24px)
        'lg': 'var(--spacing-lg)',   // 2rem (32px)
        'xl': 'var(--spacing-xl)',   // 3rem (48px)
        '2xl': 'var(--spacing-2xl)', // 4rem (64px)
        '3xl': 'var(--spacing-3xl)', // 6rem (96px)
        '4xl': 'var(--spacing-4xl)', // 8rem (128px)
      },
      // Typography
      fontSize: {
        'caption': 'var(--font-size-caption)', // 0.75rem (12px)
        'body-sm': 'var(--font-size-body-sm)', // 0.875rem (14px)
        'body': 'var(--font-size-body)',      // 1rem (16px)
        'body-lg': 'var(--font-size-body-lg)', // 1.125rem (18px)
        'display-sm': 'var(--font-size-display-sm)', // 1.25rem (20px)
        'display': 'var(--font-size-display)',    // 1.5rem (24px)
        'display-lg': 'var(--font-size-display-lg)', // 2rem (32px)
        'display-xl': 'var(--font-size-display-xl)', // 2.5rem (40px)
        'display-2xl': 'var(--font-size-display-2xl)', // 3rem (48px)
      },
      // Font weights
      fontWeight: {
        'regular': 'var(--font-weight-regular)', // 400
        'medium': 'var(--font-weight-medium)',   // 500
        'semibold': 'var(--font-weight-semibold)', // 600
        'bold': 'var(--font-weight-bold)',      // 700
      },
      // Line heights
      lineHeight: {
        'tight': 'var(--line-height-tight)',  // 1.2
        'snug': 'var(--line-height-snug)',   // 1.33
        'normal': 'var(--line-height-normal)', // 1.5
        'relaxed': 'var(--line-height-relaxed)', // 1.66
        'loose': 'var(--line-height-loose)',  // 2
      },
      // Border radius
      borderRadius: {
        'none': '0',
        'xs': 'var(--radius-xs)',  // 0.125rem (2px)
        'sm': 'var(--radius-sm)',  // 0.25rem (4px)
        'md': 'var(--radius-md)',  // 0.375rem (6px)
        'lg': 'var(--radius-lg)',  // 0.5rem (8px)
        'xl': 'var(--radius-xl)',  // 0.75rem (12px)
        '2xl': 'var(--radius-2xl)', // 1rem (16px)
        'full': '9999px',
      },
      // Shadow tokens
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },
      // Animation
      transitionDuration: {
        'fast': 'var(--duration-fast)',     // 150ms
        'normal': 'var(--duration-normal)', // 250ms
        'slow': 'var(--duration-slow)',     // 350ms
      },
      // Animation easing
      transitionTimingFunction: {
        'ease-in-out': 'var(--ease-in-out)',
        'ease-out': 'var(--ease-out)',
        'ease-in': 'var(--ease-in)',
        'bounce': 'var(--ease-bounce)',
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
        "pulse": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        "slide-up": {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        "slide-down": {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        "fade-in": {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  // Ensure CSS is generated during build
  safelist: [
    // Include common classes that might be dynamically generated
    'bg-brand-primary',
    'text-content-onPrimary',
    'bg-surface-1',
    'text-content-primary',
    'bg-semantic-success',
    'bg-semantic-error',
    'bg-semantic-warning',
    'bg-semantic-info',
  ],
}