import type { Config } from "tailwindcss";

export default {
  darkMode: 'media',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          light: 'rgb(var(--color-primary-light))',
          dark: 'rgb(var(--color-primary-dark))',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
          light: 'rgb(var(--color-accent-light))',
          dark: 'rgb(var(--color-accent-dark))',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger))',
          light: 'rgb(var(--color-danger-light))',
          dark: 'rgb(var(--color-danger-dark))',
        },
        neutral: {
          DEFAULT: 'rgb(var(--color-neutral))',
          dark: 'rgb(var(--color-neutral-dark))',
          darker: 'rgb(var(--color-neutral-darker))',
        },
        text: {
          DEFAULT: 'rgb(var(--color-text))',
          light: 'rgb(var(--color-text-light))',
          dark: 'rgb(var(--color-text-dark))',
        },
        surface: {
          light: 'rgb(var(--color-surface-light))',
          dark: 'rgb(var(--color-surface-dark))',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.05)',
        'hover': '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)', // Blue shadow
      }
    },
  },
  plugins: [],
} satisfies Config;
