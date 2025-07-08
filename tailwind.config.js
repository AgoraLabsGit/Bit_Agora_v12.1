/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(215 28% 17%)",
        input: "hsl(222 84% 5%)",
        ring: "hsl(217 91% 60%)",
        background: "hsl(222 84% 5%)",
        foreground: "hsl(213 31% 91%)",
        primary: {
          DEFAULT: "hsl(217 91% 60%)",
          foreground: "hsl(222 84% 5%)",
        },
        secondary: {
          DEFAULT: "hsl(215 28% 17%)",
          foreground: "hsl(213 31% 91%)",
        },
        destructive: {
          DEFAULT: "hsl(0 63% 31%)",
          foreground: "hsl(213 31% 91%)",
        },
        muted: {
          DEFAULT: "hsl(215 28% 17%)",
          foreground: "hsl(217 10% 64%)",
        },
        accent: {
          DEFAULT: "hsl(215 28% 17%)",
          foreground: "hsl(213 31% 91%)",
        },
        popover: {
          DEFAULT: "hsl(222 84% 5%)",
          foreground: "hsl(213 31% 91%)",
        },
        card: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(213 31% 91%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} 