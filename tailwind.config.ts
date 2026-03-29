// Note: This project uses Tailwind CSS v4, which is configured primarily via CSS
// using the @theme directive in globals.css. This file exists for editor tooling
// and plugin configuration.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep': '#09071E',
        'navy-mid': '#0F0C28',
        'navy-light': '#1A1640',
        'navy-lighter': '#221E50',
        'blue-electric': '#2563EB',
        'cyan-accent': '#22D3EE',
        'violet-badge': '#7C6FFD',
        'bg-light': '#F4F5F8',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
