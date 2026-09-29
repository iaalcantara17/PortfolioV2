# CLAUDE.md — Portfolio V2 project rules

This file is read automatically at the start of every session. Follow 
it in full, every session, without being reminded.

## What this project is

A personal portfolio site for Israel Alcántara. React + Vite, deployed 
to Vercel at israelalcantara.vercel.app. Currently mid-way through a 
structured hardening pass before a full relaunch. Phases 0 through 4 
are done (read-only audit, architecture refactor, the restraint pass 
and content decisions, and accessibility/motion safety), with two 
limits: the restraint pass cut some effects but recorded no keep/cut 
decision for the ones that stayed until "Effects: keep/cut decisions" 
below, and accessibility still has open items, listed under 
"Accessibility status". Phase 5 
(performance and resilience) is complete and on main: the main work in 
PR #10, and the follow-up fixes in PR #11 (the contact email copies on 
click instead of opening a mail app, and the Education hover floaters 
work with trackpads). Phase 6 (SEO and search rankings) is complete and 
on main: canonical URLs and site.config.js's BASE_URL, robots.txt and 
sitemap.xml, heading structure and section anchor fixes, Person and 
WebSite structured data, permanent redirects for /index.html and 
/resume.pdf, resume PDF metadata, and the Live Demo hover tooltip 
(PR #13).

## Changes since Phase 6

One line per merged PR. #17 and #18 were closed without merging.

- #14: noted Phase 6 as complete in this file.
- #15: wheel scrolling eased by Lenis (utils/pageScroll.js). Touch stays 
  native, and Lenis is off under reduced motion.
- #16: LinkdUp's capstone certificate, opened in the Lightbox from a 
  Certificate button in Projects.
- #19: the Gallery's stage and strip replaced by the looping film reel 
  (components/FilmReel.jsx).
- #20: the speed blur, the page blurring slightly while it scrolls fast 
  (utils/scrollBlur.js).
- #21: locked the film reel in this file.
- #22: removed the Life section, moved the Spotify widget from Hero to 
  About, and restored the period in the nav logo ("I.A.").
- #23: Open Graph and Twitter card tags, "MBA Candidate" in the title, 
  the I.A. favicon set, and the share image.
- #24: a skip link and a <main> landmark, the About quote author on 
  --color-muted, the film reel's frames named by their photo 
  descriptions, and a closer description of the friends photo.
- #25: three security headers in vercel.json, and a static 404 page.
- #26: a Content-Security-Policy in report-only mode, and the 404 page's 
  styles moved into 404.css.
- #27: the film reel's photo size can no longer go negative on very 
  small windows.
- #28: dependencies updated within their version ranges, no major 
  version crossed.
- #29: brought this file current through #28, and replaced Vite's 
  starter README with one for this project.
- #30: the Content-Security-Policy enforced instead of report-only, 
  with data: dropped from img-src.
- #31: asset inlining turned off (build.assetsInlineLimit: 0), so no 
  asset can end up as a data: URI.
- #32: Vercel Web Analytics for pageviews, and a resume download 
  counter in Upstash Redis, one count per Vercel environment.
- #33: photo originals stripped of their metadata, automatically by 
  both photo scripts from now on, and stored in Git LFS.
- #34: .env files and audit/ ignored, and a quiet tile (MissingImage) 
  shown where an image fails to load: the film reel, the Lightbox, the 
  hover previews and the Education logos.
- #35: the page inert behind the Lightbox and the mobile menu, so a 
  screen reader's virtual cursor stays in them (utils/inertOutside.js).
- #36: the section counter under the Lightbox's backdrop, a visible 
  cursor dot on the LinkdUp card, a print stylesheet (src/print.css), 
  the Gallery's alt text made permanent, a meta description that starts 
  with the role, and an "Updated" month in the Contact footer, set at 
  build time (buildDate in vite.config.js) along with its year.

## Accessibility status

- In place: a skip link to <main> (App.jsx), focus trapped in the 
  Lightbox and the mobile menu with Escape to close, keyboard focus 
  rings, alt text on every photo, and reduced-motion gating for every 
  effect in the list below.
- In place: the page behind the Lightbox and the mobile menu is inert 
  while either is open (utils/inertOutside.js), so a screen reader's 
  virtual cursor can't reach it either.
- Open, by choice: gold text (stat suffixes, "Scroll", gold pills) 
  stays below AA contrast (the note on the accent tokens in index.css).

## Effects: keep/cut decisions

The restraint pass (PRs #5 and #6) cut the gold scroll progress bar and 
dead effect code. Every effect still in the code is kept as it is, with 
its reduced-motion gating unchanged:

- Custom cursor (Cursor.jsx): KEEP. Fine pointers only.
- 3D hover tilt (utils/tilt.js, on the Education and Projects cards): 
  KEEP. Off under reduced motion.
- Speed blur (utils/scrollBlur.js): KEEP. Fine pointers only, never 
  under reduced motion.
- Lenis smooth scrolling (utils/pageScroll.js): KEEP. Not created under 
  reduced motion.
- Section counter scramble (SectionCounter.jsx): KEEP. Skipped under 
  reduced motion.
- Pointer followers (utils/follower.js: the diploma and certificate 
  previews, the "In progress" label, the Live Demo note): KEEP. They 
  follow mouse pointers only; the Live Demo note also shows on keyboard 
  focus.
- Hero typewriter and scramble (Hero.jsx): KEEP. A plain fade under 
  reduced motion.
- Film reel glide (FilmReel.jsx): KEEP. Instant under reduced motion.

## How things are built

- Head tags: index.html holds the <title> and the meta description. 
  siteSeo() in vite.config.js reads both from index.html and builds the 
  Open Graph and Twitter card tags from them, with absolute URLs from 
  BASE_URL in site.config.js. The share image's size and alt text are 
  SHARE_IMAGE in site.config.js.
- Share image and icons: scripts/make-head-images.py writes 
  public/og-image.png, public/favicon.ico and public/apple-touch-icon.png 
  with Pillow, from the DM Serif Display file in src/assets/fonts/, 
  Arial, and photos-src/portrait.jpg. Regenerate them with 
  `python scripts/make-head-images.py` from the repo root. The script 
  does not make public/favicon.svg: that file is the same monogram as 
  vector outlines, drawn once from the font file.
- Photo originals: photos-src/ holds the originals the two photo 
  scripts read. Both first strip each original's metadata in place 
  with scripts/strip_metadata.py: EXIF, XMP, IPTC, C2PA and anything 
  appended after the image go; the image data, the ICC profile and a 
  lone orientation tag stay, and a clean file isn't rewritten. The 
  originals are in Git LFS (.gitattributes); the versions from before 
  that, metadata included, are still in normal history, which was 
  kept as is. Each machine needs `git lfs install` once. Re-running 
  optimize-photos.py re-encodes every AVIF, and this Windows machine's 
  encoder output differs from the committed files, so commit only a 
  new photo's own variants and its manifest entry.
- 404 page: public/404.html and public/404.css are static files that 
  Vercel serves with a 404 status for any path that matches nothing 
  else. Vite copies them untouched, so 404.css carries its own copy of 
  7 token values from index.css (two font stacks and five colors). A 
  change to any of those tokens needs the same edit in 404.css by hand.
- Headers: vercel.json sets X-Content-Type-Options, Referrer-Policy and 
  Permissions-Policy on /(.*), plus an enforced Content-Security-Policy 
  on the same route, so it covers the 404 page and the resume PDF too. 
  Everything is 'self' or 'none': no inline scripts or styles, no data: 
  URIs, nothing from another origin. Vercel does not apply header rules 
  to redirect responses, so the /resume.pdf and /index.html redirects 
  carry none of these headers.
- CSP rollback: if the enforced policy breaks something in production, 
  revert its PR, or set the header key in vercel.json back to 
  Content-Security-Policy-Report-Only, which keeps the policy but only 
  reports what it would block.
- Hero portrait: since Vite 8.3 (PR #28), the portrait's 400w AVIF 
  ships as its own file in dist/assets/ instead of being inlined as a 
  base64 data: URI in index.html and the main bundle. Inlining is now 
  off for every asset (build.assetsInlineLimit: 0 in vite.config.js), 
  so the build has no data: URIs whatever a file's size, and the 
  portrait's preload link is no longer what keeps it a file.
- Analytics: <Analytics /> from @vercel/analytics, at the end of 
  App.jsx. Pageviews only (custom events are a paid feature). In a 
  build it loads /_vercel/insights/script.js and posts to 
  /_vercel/insights/view, both same-origin, so the CSP needs nothing 
  for it. Vercel's script counts a pageview only when the pathname 
  changes, so section jumps (#projects) and Back between them don't 
  count. It skips headless and webdriver browsers.
- Resume download counter: api/track-resume-download.js keeps one 
  Upstash Redis key per Vercel environment, 
  resume_downloads_total:<VERCEL_ENV> (:production, :preview, or 
  :development when VERCEL_ENV is unset), through KV_REST_API_URL and 
  KV_REST_API_TOKEN (the Upstash integration, one database for 
  Production and Preview). Preview clicks never touch production's 
  count. POST adds one, GET only reads. Both resume links (Nav, 
  Contact) POST to it on click through utils/trackResumeDownload.js, 
  fire and forget. Only clicks count: not middle-clicks, "Open in new 
  tab", the noscript link, or direct visits to the PDF or /resume.pdf. 
  The endpoint is public, so anyone can read the count or add to it.

## Locked — do not change without explicit approval

- The design system: colors, DM Serif Display, the layout grid.
- The About bio, the pull quote, approved section headings, and the 
  quote rotation list in src/data/quotes.js.
- Section order and nav order.
- The Gallery film reel: one looping black 35mm band (cream sprocket 
  holes) that is both viewer and thumbnails, pinned to the full 1344px 
  content width so its edges line up under "Through the lens." and 
  "FULL GALLERY". Uniform square photos with no size hierarchy (340px at 
  full width): the current photo in the middle, one dimmed neighbor each 
  side, and a half-cut end sliver at each end. No matte around any photo, 
  square corners throughout. The current photo is marked mainly by full 
  brightness against its dimmed neighbors, with a 3px --color-purple-ink 
  ring as a secondary cue. The section counter handoff behavior.
- The "play once and persist" animation behavior — entrance animations 
  fire once per element on first view and then stay visible permanently. 
  No reverse-on-scroll-up, no re-triggering.

If you believe something locked has a real problem, say so and explain 
why, but do not change it unilaterally.

## Standing rules
- **No commit message attribution.** Never add "Generated with Claude 
  Code," a Co-Authored-By trailer, or any similar watermark to any 
  commit message, on any branch, ever.
- **No new dependencies** without explicit justification and approval 
  first. Ask before adding anything to package.json.
- **No secrets in chat or in any output.** If a task needs credentials, 
  say where they should be added (e.g. .env.local, Vercel dashboard) — 
  never print or request actual key/token values.
- **Work on a branch.** Never commit or push directly to main. Changes 
  get reviewed on a Vercel preview deployment before merging.
- **Existing site copy is fine as is.** Don't rewrite existing text. 
  Quotes stay verbatim, punctuation included.
- **Voice rule for any new or changed text:** it must sound like Israel, 
  never like AI-generated copy. No filler, no "not just X, but Y" 
  constructions, no buzzwords, no generic motivational language. Show 
  new copy for approval before it ships — don't assume.
- **Refactor-first protocol**, for every non-trivial change:
  1. Read every file the change touches, and every file sharing its 
     pattern. Summarize the conventions found before writing anything.
  2. Propose where the change belongs and what it extends, before 
     building. Wait for approval on anything non-trivial.
  3. If restructuring existing code, do that as its own commit first, 
     with zero visual or behavioral change. Take screenshots at 390px, 
     1024px, and 1440px before and after, and confirm they match.
  4. Then add the actual feature/fix as a separate commit.
  5. Clean up dead code, unused imports, and unused dependencies that 
     the change made obsolete.
  6. Verify: lint and build pass with zero errors/warnings, and check 
     all affected sections at mobile/tablet/desktop widths, scrolling 
     both directions, including fast scrolling.
  7. Report: files changed, what was refactored vs. added, anything 
     that couldn't be cleanly resolved, anything needing a decision.

## Every task, every session

- End by stating plainly what was and wasn't touched.
- Include a verification list of what was checked and how.
- Stop and report back. Do not proceed to unrelated work, even if it 
  seems like a logical next step, without being told to.
- **End every session with a push.** Israel works across two machines 
  and pulls the same branch on the other one. Before finishing a 
  session, push every local commit to origin on its branch, then state 
  explicitly which branch is push-ready and give its exact name. This 
  never overrides "Work on a branch": main is never pushed directly. 
  If local main is ahead of origin/main, say so instead of pushing it.

## Known risks

- Experience centers its content and already touches the nav line at 
  600px and below, same failure class as Hero. Not broken yet, but worth 
  a height sweep before it becomes the next surprise.
- The Gallery film reel has no room on a desktop-width window below 
  about 410px tall. Since PR #27 it shows no photo there instead of 
  logging errors. Fixing it would mean letting the Gallery grow past 
  one screen, which touches the locked reel.

## Reference material

- audit/before/ contains the Phase 0 baseline: Lighthouse reports 
  (mobile + desktop) and 25 screenshots at 390/1024/1440px, captured 
  against the live site after the hotfix/live-bugs merge. Use this as 
  the comparison baseline for any before/after verification. It was 
  never committed to git and isn't on the Windows machine, so it may 
  only exist on the other one. Where it's missing, take the "before" 
  screenshots from a fresh build of main.