# Portfolio V2

The source for my personal site, israelalcantara.vercel.app.

Live at https://israelalcantara.vercel.app

## Stack

- React 19 and Vite 8
- GSAP for animation, Lenis for smooth wheel scrolling, and framer-motion
  for the Lightbox, whose code is fetched separately once the page has
  loaded and the browser is idle
- Two Vercel functions: `api/spotify.js` for the now-playing widget, and
  `api/track-resume-download.js`, which counts resume downloads in Upstash
  Redis
- Vercel Web Analytics, for pageviews
- ESLint, and Playwright for smoke tests

## Running it

```sh
npm install
npm run dev
```

`npm run dev` serves the site without the functions, so the widget stays
hidden and resume clicks aren't counted. To run the functions too, use
`npm run dev:vercel`. It runs the Vercel CLI through npx, which downloads
it the first time. The CLI needs to be logged in and linked to the
project, and you need the environment variables below.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run dev:vercel` | `vercel dev` through npx, the site plus the `/api` functions |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run lint` | ESLint |
| `npm test` | Playwright smoke tests (below) |

## Smoke tests

`e2e/` holds fast checks of the critical paths:
- the page loads with no console errors or failed requests;
- the nav and mobile menu links reach their sections;
- the mobile menu opens and closes from its toggle and with Escape;
- the Lightbox closes three ways and hands focus back;
- the Lightbox is ready as soon as it appears, even when its code loads late
  (focus on Close, the page behind it inert);
- the resume links are served, and the Hero's Email me copies the address
  (Chromium only, where the clipboard can be granted);
- LinkdUp's screens: the hover preview shows and cycles, over Certificate only its
  preview shows, on touch a tap shows no preview and Screenshots opens them in the
  Lightbox, and the Gallery leaves them out;
- new-tab links carry `rel="noopener noreferrer"`;
- the skip link reaches `<main>`;
- a failed image shows its fallback tile;
- the theme follows the system setting until the toggle sets one, which lasts
  across reloads and applies before the first paint, and the toggle's icon morphs
  (or, under reduced motion, just switches).

`npm test` builds the site, serves it with `vite preview` on port 4173, and runs
every test in Chromium, Firefox and WebKit, each with the system set to light and
then to dark (`--project=chromium-dark` and so on). Each machine needs the browsers
once:

```sh
npx playwright install chromium firefox webkit
```

Other runs:

```sh
npx playwright test --project=chromium   # one browser
npx playwright test -g "lightbox"        # tests whose name matches
npx playwright show-report               # the last run's HTML report
```

`vite preview` has no Vercel functions or Web Analytics, so the tests answer
`/api/*` and `/_vercel/insights/*` themselves (`e2e/fixtures.js`). Port 4173 has
to be free: the tests always start their own server, so they never test an old
build.

## Structure

```
api/            Vercel functions: the Spotify widget and the resume download counter
e2e/            Playwright smoke tests (npm test)
logos-src/      School logo originals (the WebP copies in src/assets/logos/ are made by hand)
photos-src/     Photo originals, never served, stored in Git LFS
public/         Copied into the build as is: resume PDF, icons, share image, 404 page, theme.js
scripts/        Photo and share-image generators (Python, Pillow)
src/
  assets/       Fonts, logos, and the generated photo variants
  components/   Shared components, and sections/ with one file per page section
  data/         Section registry, photo list and descriptions, quotes, contact details
  hooks/        Active section, keyboard scrolling, scroll lock, Spotify polling,
                failed image loads, copying to the clipboard
  utils/        Motion, scrolling, speed blur, tilt, pointer followers, focus trap,
                inert page behind modals, theme, resume download counting
index.html      Page shell: title, description, icons
site.config.js  Canonical URL, structured data, share image settings
vite.config.js  Build config, and the plugin that adds the SEO and share tags
vercel.json     Redirects, the /api rewrite, and response headers
```

## Photos

Originals go in `photos-src/`. Then, from the repo root:

```sh
python scripts/optimize-photos.py
```

It writes AVIF and WebP variants at 400, 1200 and 2400px on the long edge
into `src/assets/photos/`, plus `manifest.json` with each variant's size,
and drops EXIF, XMP and ICC metadata. It needs Pillow 11.2 or later.

Before any of that, it strips each original's own metadata in place
(`scripts/strip_metadata.py`): EXIF (camera, serial number, lens, dates,
GPS), XMP, IPTC, C2PA credentials and anything appended after the image.
The pixels and the ICC color profile stay exactly as they were, and a file
with nothing to strip is left alone. There's no extra step: drop the photo
in and run the script. `make-head-images.py` does the same to the portrait.

To add one photo without touching the rest (the script re-encodes every AVIF, and
this machine's encoder doesn't reproduce the committed files byte for byte), run
it on a folder holding only the new original, from the repo root, then copy its
six variants into `src/assets/photos/` and add its entry to `manifest.json`:

```sh
python scripts/optimize-photos.py --src path/to/folder-with-the-new-photo
```

Every photo not named in `NOT_IN_GALLERY` (`src/data/photos.js`) or starting with
`linkdup-` goes into the Gallery reel, which grows to hold it; give it a
description in `photoAlt`, the photo's alt text. LinkdUp's screens are
`linkdup-screen-1` to `-3`, shown in Projects: replace them under the same names.

The originals are stored in Git LFS (`.gitattributes`), so a new or
changed photo doesn't grow the repo's history. Each machine needs Git LFS
set up once, from inside the repo:

```sh
git lfs install
```

Git for Windows includes Git LFS; on macOS, run `brew install git-lfs`
first. Without it, a clone or pull puts small text pointer files in
`photos-src/` instead of the photos, and a push can't upload new ones. If
that already happened, run `git lfs install` and then `git lfs pull`.

The share image and the raster icons come from a second script:

```sh
python scripts/make-head-images.py
```

It writes `public/og-image.png`, `public/favicon.ico` and
`public/apple-touch-icon.png`. `public/favicon.svg` is not generated by it.

## Deploys

The site is on Vercel, connected to this GitHub repo. A merge to `main`
deploys to production. Every other branch gets its own preview deployment,
behind Vercel's login. `vercel.json` sets the build command, the
redirects, the `/api` rewrite and the response headers.

## Environment variables

`/api/spotify` needs these, set in the Vercel project settings:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

`/api/track-resume-download` needs these two, which the Upstash Redis
integration (Vercel Marketplace) adds to the project for Production and
Preview:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Each environment keeps its own count, in the Redis key
`resume_downloads_total:<VERCEL_ENV>`: `resume_downloads_total:production`,
`resume_downloads_total:preview`, or `resume_downloads_total:development`
outside Vercel. Clicks on a preview deployment never touch production's
count. Opening `/api/track-resume-download` in a browser shows that
deployment's count as `{ "count": N }` without changing it; each click on
a resume link sends a POST that adds one.
