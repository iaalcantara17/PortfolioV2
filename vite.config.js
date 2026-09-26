import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Libraries go in their own chunks, apart from the site's code, so a deploy
        // that only changes the site leaves them cached in visitors' browsers.
        // vendor (React, GSAP) loads with the page. motion (framer-motion) loads only
        // with the Lightbox (components/LazyLightbox.jsx). vendor's higher priority
        // keeps React in it: framer-motion's group would otherwise take React along as
        // a dependency.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules[\\/](react|react-dom|scheduler|gsap)[\\/]/, priority: 2 },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
