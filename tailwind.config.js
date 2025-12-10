/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        border: "var(--color-border)", /* white with opacity */
        input: "var(--color-input)", /* gray-700 */
        ring: "var(--color-ring)", /* primary */
        background: "var(--color-background)", /* gray-900 */
        foreground: "var(--color-foreground)", /* gray-50 */
        surface: "var(--color-surface)", /* gray-700 */
        primary: {
          DEFAULT: "var(--color-primary)", /* brown-700 */
          foreground: "var(--color-primary-foreground)", /* gray-50 */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* gray-600 */
          foreground: "var(--color-secondary-foreground)", /* gray-50 */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* red-600 */
          foreground: "var(--color-destructive-foreground)", /* gray-50 */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* gray-600 */
          foreground: "var(--color-muted-foreground)", /* gray-400 */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* yellow-600 */
          foreground: "var(--color-accent-foreground)", /* gray-900 */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* gray-700 */
          foreground: "var(--color-popover-foreground)", /* gray-50 */
        },
        card: {
          DEFAULT: "var(--color-card)", /* gray-700 */
          foreground: "var(--color-card-foreground)", /* gray-50 */
        },
        success: {
          DEFAULT: "var(--color-success)", /* green-600 */
          foreground: "var(--color-success-foreground)", /* gray-50 */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* yellow-600 */
          foreground: "var(--color-warning-foreground)", /* gray-900 */
        },
        error: {
          DEFAULT: "var(--color-error)", /* red-600 */
          foreground: "var(--color-error-foreground)", /* gray-50 */
        },
        text: {
          primary: "var(--color-text-primary)", /* gray-50 */
          secondary: "var(--color-text-secondary)", /* gray-400 */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        'rhythm': '1.5rem',
      },
      boxShadow: {
        'resting': '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'active': '0 8px 12px -2px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        'smooth': '200ms',
        'micro': '100ms',
      },
      transitionTimingFunction: {
        'smooth': 'ease-out',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gentle": "pulse-gentle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}