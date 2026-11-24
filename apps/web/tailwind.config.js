/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-background)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          hover: 'var(--bg-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border-border)',
          subtle: 'var(--border-subtle)',
          focus: '#70415e',
        },
        primary: {
          DEFAULT: '#70415e',
          hover: '#562d48',
          subtle: 'rgba(59, 130, 246, 0.1)',
        },
        accent: {
          indigo: '#81506e',
          blue: '#70415e',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        },
        foreground: {
          DEFAULT: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          subtle: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
