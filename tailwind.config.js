/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0612',
        ink: '#1a0f2e',
        smoke: '#2a1f3e',
        aurora1: '#00ffa3',
        aurora2: '#ff006e',
        aurora3: '#00d4ff',
        gold: '#d4af37',
        cream: '#f5e6d3',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'aurora-1': 'aurora1 22s ease-in-out infinite',
        'aurora-2': 'aurora2 18s ease-in-out infinite',
        'aurora-3': 'aurora3 25s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        aurora1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30%, -20%) scale(1.2)' },
          '66%': { transform: 'translate(-20%, 30%) scale(0.9)' },
        },
        aurora2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-40%, 20%) scale(1.3)' },
        },
        aurora3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20%, 30%) scale(1.1)' },
          '75%': { transform: 'translate(-30%, -20%) scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
