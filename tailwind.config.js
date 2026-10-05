/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Hover styles only where hover exists, so taps on phones don't leave rows
  // stuck in their hover state.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      // Palette sampled from the showreel frames so the site and the reel read
      // as one piece: near-black ground, single amber signal, cream + wine
      // used as whole-section grounds the way the reel cuts to them.
      colors: {
        bg: '#08070e',
        raise: '#0e0d15',
        'raise-2': '#15141d',
        fg: '#f4f3ef',
        muted: '#a1a0a5',
        dim: '#7d7c83',
        amber: { DEFAULT: '#f59e0b', soft: '#fbbf24' },
        cream: '#ebe9e3',
        ink: { DEFAULT: '#0a0a0f', muted: '#5c5b61' },
        wine: { DEFAULT: '#ad001e', deep: '#6f0010', bright: '#d4002a' },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
