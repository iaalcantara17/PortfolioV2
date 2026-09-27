import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BASE_URL, GOOGLE_SITE_VERIFICATION, structuredData } from './site.config.js'

// Search-engine tags and files, all from site.config.js (BASE_URL): the canonical
// link, the schema.org JSON-LD and the Search Console tag go into index.html's head;
// robots.txt and sitemap.xml are written into the build.
function siteSeo() {
  // "<" escaped so the JSON can never close its own <script> tag
  const jsonLd = JSON.stringify(structuredData(BASE_URL)).replace(/</g, '\\u003c')
  return {
    name: 'site-seo',
    transformIndexHtml() {
      const tags = [
        { tag: 'link', attrs: { rel: 'canonical', href: `${BASE_URL}/` }, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: jsonLd, injectTo: 'head' },
      ]
      if (GOOGLE_SITE_VERIFICATION) {
        tags.push({ tag: 'meta', attrs: { name: 'google-site-verification', content: GOOGLE_SITE_VERIFICATION }, injectTo: 'head' })
      }
      return tags
    },
    generateBundle() {
      // /api/ is the Spotify function: nothing there for search engines
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${BASE_URL}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${BASE_URL}/</loc>\n  </url>\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), siteSeo()],
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
