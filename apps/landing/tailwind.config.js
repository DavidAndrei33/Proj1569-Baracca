/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  safelist: [
    'bg-[#0a0a0e]',
    'text-[#fbbf24]',
    'text-[#06b6d4]',
    'text-[#10b981]',
    'text-[#f97316]',
    'bg-[#f59e0b]/10',
    'bg-[#06b6d4]/10',
    'bg-[#10b981]/10',
    'bg-[#f97316]/10',
    'border-[#f59e0b]/20',
    'border-[#06b6d4]/20',
    'border-[#10b981]/20',
    'border-[#f97316]/20',
  ],
  theme: {
    extend: {
      colors: {
        // Cinematic Dark Theme
        void: '#020204',
        depth: '#0a0a0e',
        surface: '#12121a',
        elevated: '#1a1a22',
        // Honey Accents
        honey: '#f59e0b',
        'honey-bright': '#fbbf24',
        'honey-dim': 'rgba(245, 158, 11, 0.3)',
        amber: '#f97316',
        'amber-dim': 'rgba(249, 115, 22, 0.3)',
        // Legacy colors (kept for compatibility)
        primary: '#f59e0b',
        secondary: '#2A9D8F',
        accent: '#F4A261',
        dark: '#0a0a0e',
        light: '#f5f5f0',
        cream: '#FFF8F0',
        wine: '#f59e0b',
        'wine-dark': '#fbbf24',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
        playfair: ['Cinzel', 'serif'], // Alias for compatibility
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slow-pan': 'slow-pan 60s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slow-pan': {
          '0%': { transform: 'translate(-2%, -2%) scale(1.1)' },
          '100%': { transform: 'translate(2%, 2%) scale(1.15)' },
        }
      }
    },
  },
  plugins: [],
}
