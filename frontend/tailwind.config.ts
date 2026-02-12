import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        colors: {
            base: "#000000", // Absolute Black
            surface: "#0A0A0A", // Deep Charcoal
            card: "#0A0A0A", // Surface for cards
            "card-hover": "#171717", // Slightly lighter for hover
            "border-subtle": "rgba(255, 255, 255, 0.08)", // ultra-subtle
            "border-hover": "rgba(124, 58, 237, 0.3)", // Purple hint
            "text-primary": "#FFFFFF", // Monochrome White
            "text-secondary": "#94A3B8", // Slate-400
            "text-dim": "#52525b", // Zinc-600
            accent: "#7C3AED", // Electric Purple
            "accent-dim": "#6D28D9",
            danger: "#EF4444", // Danger Red
            success: "#10B981", // Success Green
        },
        fontFamily: {
            sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            mono: ['var(--font-jetbrains-mono)', 'monospace'],
        },
        boxShadow: {
            'glass': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            'glow': '0 0 20px -5px rgba(124, 58, 237, 0.3)',
        },
        backgroundImage: {
            'scanline': 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1))',
        }
    },
    plugins: [],
};
export default config;
