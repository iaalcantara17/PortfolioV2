// Site-wide settings for search engines, read at build time by vite.config.js.
//
// BASE_URL is the site's one canonical address. The canonical tag, robots.txt,
// sitemap.xml and the structured data are all built from it, so moving to a custom
// domain is a change to this line only. No trailing slash.
export const BASE_URL = 'https://israelalcantara.vercel.app'

// Google Search Console, "HTML tag" verification: paste only the content="..." value
// Search Console gives you. Empty means no tag is added.
export const GOOGLE_SITE_VERIFICATION = ''

// schema.org structured data (JSON-LD) for the page: who the site is about, and the
// site itself. Facts only, as they appear on the site.
export const structuredData = (baseUrl) => {
  const person = `${baseUrl}/#person`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': person,
        name: 'Israel Alcántara',
        url: `${baseUrl}/`,
        jobTitle: 'Software Engineer',
        // NJIT: BS in Computer Science, earned
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'New Jersey Institute of Technology', url: 'https://www.njit.edu' },
        // Montclair State: MBA in progress, so affiliated rather than an alum yet
        affiliation: { '@type': 'CollegeOrUniversity', name: 'Montclair State University', url: 'https://www.montclair.edu' },
        knowsLanguage: ['en', 'es'],
        sameAs: ['https://www.linkedin.com/in/israel-alcantara', 'https://github.com/iaalcantara17'],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: `${baseUrl}/`,
        name: 'Israel Alcántara',
        inLanguage: 'en',
        about: { '@id': person },
        author: { '@id': person },
      },
    ],
  }
}
