import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // React and the animation libraries change far less often than the
        // site itself; separate chunks stay cached across content deploys.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](gsap|framer-motion|motion-dom|motion-utils|lenis)[\\/]/ },
          ],
        },
      },
    },
  },
})
