# CLAUDE.md — Portfolio V2 project rules

This file is read automatically at the start of every session. Follow 
it in full, every session, without being reminded.

## What this project is

A personal portfolio site for Israel Alcántara. React + Vite, deployed 
to Vercel at israelalcantara.vercel.app. Currently mid-way through a 
structured hardening pass before a full relaunch. Phases 0 through 4 
are complete (read-only audit, architecture refactor, restraint-audit 
and content decisions, and accessibility/motion safety). Phase 5 
(performance and resilience) is complete and on main: the main work in 
PR #10, and the follow-up fixes in PR #11 (the contact email copies on 
click instead of opening a mail app, and the Education hover floaters 
work with trackpads).

## Locked — do not change without explicit approval

- The design system: colors, DM Serif Display, the layout grid.
- The About bio, the pull quote, approved section headings, and the 
  quote rotation list in src/data/quotes.js.
- Section order and nav order.
- The Gallery Option B layout (fixed-height hero + filmstrip), the 
  filmstrip's visual treatment, and the section counter handoff behavior.
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

## Reference material

- audit/before/ contains the Phase 0 baseline: Lighthouse reports 
  (mobile + desktop) and 25 screenshots at 390/1024/1440px, captured 
  against the live site after the hotfix/live-bugs merge. Use this as 
  the comparison baseline for any before/after verification.