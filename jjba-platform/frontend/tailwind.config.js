/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // JJBA palette
        'jojo-gold': '#C9A84C',
        'jojo-gold-light': '#E8C96B',
        'jojo-purple': '#1A0A2E',
        'jojo-purple-mid': '#2D1B4E',
        'jojo-purple-glass': 'rgba(26, 10, 46, 0.75)',
        'jojo-pink': '#E040FB',
        'jojo-cyan': '#00BCD4',
        'jojo-red': '#C62828',
        'glass-border': 'rgba(201, 168, 76, 0.3)',
      },
      fontFamily: {
        // Display: dramatic, manga-esque
        'display': ['"Cinzel Decorative"', 'serif'],
        // Body: readable but stylized
        'body': ['"Josefin Sans"', 'sans-serif'],
        // Mono: for stand stats
        'mono': ['"Share Tech Mono"', 'monospace'],
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(201, 168, 76, 0.2)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(201, 168, 76, 0.4)',
        'stand-glow': '0 0 20px rgba(201, 168, 76, 0.4)',
        'narrator': '0 0 30px rgba(224, 64, 251, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201, 168, 76, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(201, 168, 76, 0.7)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
