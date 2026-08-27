/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0d0f12',
          panel: 'rgba(26, 29, 36, 0.6)',
          header: 'rgba(13, 15, 18, 0.8)',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#5e6ad2',
          light: '#7a85e6',
          glow: 'rgba(94, 106, 210, 0.4)',
        },
        platform: {
          fb: '#1877f2',
          ig: '#e1306c',
          wa: '#25d366',
          tg: '#0088cc',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'msg-in': 'msgIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-dot': 'typingBounce 1.4s infinite ease-in-out both',
      },
      keyframes: {
        msgIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        typingBounce: {
          '0%, 80%, 100%': { transform: 'scale(0.6)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
