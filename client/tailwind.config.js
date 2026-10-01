/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#F7F9FA',
        card: '#FFFFFF',
        'border-default': '#D9E0E6',
        primary: {
          DEFAULT: '#1565C0', // Primary blue (actions)
          dark: '#0D47A1',    // Dark blue
        },
        agri: {
          DEFAULT: '#2E7D32', // Agriculture green (support/success)
          light: '#E8F5E9',   // Light green
        },
        priority: {
          warning: '#F9A825', // Warning
          medium: '#EF6C00',  // Medium priority
          high: '#C62828',    // High priority
        },
        content: {
          main: '#263238',    // Primary text
          secondary: '#607D8B',// Secondary text
        }
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      }
    },
  },
  plugins: [],
};
