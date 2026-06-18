// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
//         mono: ['JetBrains Mono', 'monospace'],
//       },
//       colors: {
//         slate: {
//           850: '#172033',
//         },
//       },
//       animation: {
//         'fade-in':   'fadeIn 0.3s ease-out',
//         'slide-in':  'slideIn 0.3s ease-out',
//         'page-enter':'pageEnter 0.35s ease-out',
//       },
//       keyframes: {
//         fadeIn:    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
//         slideIn:   { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
//         pageEnter: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
//       },
//       boxShadow: {
//         'card': '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
//         'card-hover': '0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.05)',
//         'modal': '0 25px 50px rgba(15,23,42,0.15)',
//       },
//     },
//   },
//   plugins: [],
// }










/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        slate: {
          850: '#172033',
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'page-enter':'pageEnter 0.35s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pageEnter: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
        'card-hover': '0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.05)',
        'modal': '0 25px 50px rgba(15,23,42,0.15)',
      },
    },
  },
  plugins: [],
}

