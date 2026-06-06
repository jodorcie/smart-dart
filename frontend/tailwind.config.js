/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dart: {
          red:   '#E53935',
          blue:  '#1E88E5',
          green: '#43A047',
          gray:  '#F5F5F5',
          dark:  '#212121',
        },
      },
    },
  },
  plugins: [],
};
