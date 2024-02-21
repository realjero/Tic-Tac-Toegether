/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                text: 'rgb(var(--text))',
                background: 'rgb(var(--background))',
                primary: 'rgb(var(--primary))',
                secondary: 'rgb(var(--secondary))',
                accent: 'rgb(var(--accent))'
            }
        }
    },
    plugins: []
};
