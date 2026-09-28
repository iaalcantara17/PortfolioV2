import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BASE_URL, GOOGLE_SITE_VERIFICATION, SHARE_IMAGE, structuredData } from './site.config.js'

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }

// The page's own <title> and meta description, read from index.html so the share tags
// always say exactly what the page does. Vite escapes the values it writes, so any
// entities are decoded first.
function headText(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
  if (!title || !description) throw new Error('site-seo: index.html needs a <title> and a meta description')
  const decode = (text) => text.replace(/&(amp|lt|gt|quot|#39);/g, (_, name) => ENTITIES[name])
  return { title: decode(title), description: decode(description) }
}

// Search-engine and link-preview tags and files, all from site.config.js (BASE_URL):
// the canonical link, the Open Graph and Twitter card tags, the schema.org JSON-LD and
// the Search Console tag go into index.html's head; robots.txt and sitemap.xml are
// written into the build.
function siteSeo() {
  // "<" escaped so the JSON can never close its own <script> tag
  const jsonLd = JSON.stringify(structuredData(BASE_URL)).replace(/</g, '\\u003c')
  const image = `${BASE_URL}${SHARE_IMAGE.path}`
  const meta = (key, name, content) => ({ tag: 'meta', attrs: { [key]: name, content }, injectTo: 'head' })
  return {
    name: 'site-seo',
    transformIndexHtml(html) {
      const { title, description } = headText(html)
      const tags = [
        { tag: 'link', attrs: { rel: 'canonical', href: `${BASE_URL}/` }, injectTo: 'head' },
        // Link previews (LinkedIn, iMessage, Slack, Facebook...): Open Graph, by property
        meta('property', 'og:type', 'website'),
        meta('property', 'og:url', `${BASE_URL}/`),
        meta('property', 'og:title', title),
        meta('property', 'og:description', description),
        meta('property', 'og:locale', 'en_US'),
        meta('property', 'og:image', image),
        meta('property', 'og:image:width', String(SHARE_IMAGE.width)),
        meta('property', 'og:image:height', String(SHARE_IMAGE.height)),
        meta('property', 'og:image:alt', SHARE_IMAGE.alt),
        // and X/Twitter's own card tags, by name
        meta('name', 'twitter:card', 'summary_large_image'),
        meta('name', 'twitter:title', title),
        meta('name', 'twitter:description', description),
        meta('name', 'twitter:image', image),
        meta('name', 'twitter:image:alt', SHARE_IMAGE.alt),
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
    // Every asset ships as its own file, never as a data: URI, so the
    // Content-Security-Policy never needs data: (vercel.json)
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // Libraries go in their own chunks, apart from the site's code, so a deploy
        // that only changes the site leaves them cached in visitors' browsers.
        // vendor (React, GSAP, Lenis) loads with the page. motion (framer-motion) loads
        // only with the Lightbox (components/LazyLightbox.jsx). vendor's higher
        // priority keeps React in it: framer-motion's group would otherwise take React
        // along as a dependency.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules[\\/](react|react-dom|scheduler|gsap|lenis)[\\/]/, priority: 2 },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
