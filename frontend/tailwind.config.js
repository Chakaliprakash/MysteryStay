/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: '#14251F',
          deep: '#0C1814',
          light: '#1F372E',
          surface: '#1A2F27'
        },
        ivory: {
          base: '#F8F6F0',
          card: '#FFFFFF',
          muted: '#EFECE4',
          border: '#E4DFD5'
        },
        gold: {
          champagne: '#C6A66B',
          hover: '#B5955A',
          light: '#DFCA9E',
          muted: '#F4EEDA'
        },
        sage: {
          muted: '#7D8D7B',
          light: '#E8EDE7'
        },
        charcoal: {
          text: '#1C1F24',
          muted: '#5A626A',
          light: '#8F97A0'
        },
        emerald: {
          trust: '#0D8A5E',
          light: '#E6F4EA'
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'luxury': '0 4px 20px -2px rgba(20, 37, 31, 0.05), 0 2px 6px -1px rgba(20, 37, 31, 0.02)',
        'luxury-lg': '0 12px 32px -4px rgba(20, 37, 31, 0.08), 0 4px 12px -2px rgba(20, 37, 31, 0.03)',
        'luxury-gold': '0 8px 24px -4px rgba(198, 166, 107, 0.25)'
      }
    },
  },
  plugins: [],
}
