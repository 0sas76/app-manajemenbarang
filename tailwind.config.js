/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    teal: '#0D5C63',
                    sand: '#B8977E',
                    sage: '#4A827B',
                    orange: '#F2945D',
                    50: '#f0f8f8',
                    100: '#daefef',
                    200: '#b9dfdf',
                    300: '#88c6c6',
                    400: '#4fa1a1',
                    500: '#0D5C63',
                    600: '#0a4a50',
                    700: '#083c41',
                    800: '#073236',
                    900: '#06292d',
                },
                surface: {
                    50: '#fcfaf8', // Warm background
                    100: '#f7f2ed', // Muted sand underlay
                    200: '#ede4db', // Border muted
                    300: '#e1d2c2', // Border strong
                    pure: '#ffffff',
                },
                neutral: {
                    main: '#0f172a', // text-slate-900
                    muted: '#475569', // text-slate-600
                    soft: '#94a3b8', // text-slate-400
                },
                status: {
                    success: '#4A827B', // Sage Green
                    success_bg: '#f0f5f4',
                    warning: '#F2945D', // Soft Orange
                    warning_bg: '#fef5ef',
                    error: '#dc2626',
                    error_bg: '#fef2f2',
                    info: '#0D5C63',
                    info_bg: '#f0f8f8',
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            borderRadius: {
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },
            letterSpacing: {
                tightest: '-.02em',
                tighter: '-.01em',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(12px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
