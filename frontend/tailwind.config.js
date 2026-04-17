/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif Armenian"', 'Merriweather', 'Georgia', 'serif'],
      },
      fontSize: {
        'base': ['17px', '1.75'],
        'lg': ['19px', '1.7'],
        'xl': ['21px', '1.6'],
        '2xl': ['25px', '1.4'],
        '3xl': ['31px', '1.3'],
        '4xl': ['39px', '1.2'],
        '5xl': ['49px', '1.15'],
        '6xl': ['62px', '1.1'],
      },
      colors: {
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
        stone: {
          50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4',
          300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c',
          600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-right": { from: { opacity: "0", transform: "translateX(-32px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "count-up": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.8s ease forwards",
        "fade-in": "fade-in 1s ease forwards",
        "scale-in": "scale-in 0.6s ease forwards",
        "slide-right": "slide-right 0.8s ease forwards",
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(165deg, #2d1b2e 0%, #4a1942 40%, #1a0f1e 100%)',
        'warm-gradient': 'linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
