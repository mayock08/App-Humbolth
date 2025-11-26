/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB', // Blue-600
                    light: '#3B82F6', // Blue-500
                    dark: '#1D4ED8', // Blue-700
                },
                secondary: '#64748B', // Slate-500
            }
        },
    },
    plugins: [],
}
