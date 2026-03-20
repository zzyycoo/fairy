/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        stripe: {
          purple: '#635bff',
          purpleDark: '#4b45c6',
          bg: '#f6f9fc',
          text: '#0a2540',
          blue: '#00d4ff',
          gray: '#425466',
          lightGray: '#e3e8ee',
        },
      },
      boxShadow: {
        'stripe': '0 15px 35px -12px rgba(61, 87, 167, 0.15)',
        'stripe-hover': '0 20px 40px -12px rgba(61, 87, 167, 0.25)',
      },
    },
  },
  plugins: [],
}
