import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { entranceStart, entranceEnd } from '../../utils/motion'
import { handleTilt, resetTilt } from '../../utils/tilt'

const featuredStack = ['React Native', 'TypeScript', 'Node.js', 'Supabase', 'Railway', 'Vercel', 'Gemini 2.5']

export default function Projects({ isVisible }) {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)

  // Fix 1 — set initial hidden state on mount
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.set(section.querySelectorAll('[data-animate]'), entranceStart({ y: 30, opacity: 0 }))
    gsap.set(section.querySelector('.featured-card'), { opacity: 0 })
    gsap.set(section.querySelectorAll('.grid-card'), entranceStart({ y: 30, opacity: 0, rotateX: 5 }))
  }, [])

  // Animate in once, on first entrance — never reverses or re-triggers
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isVisible && !tlRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(section.querySelectorAll('[data-animate]'), entranceEnd({ y: 0, opacity: 1, stagger: 0.07, duration: 0.7 }))
        .to(section.querySelector('.featured-card'), { opacity: 1, duration: 0.8 }, '-=0.4')
        .to(section.querySelectorAll('.grid-card'), entranceEnd({ y: 0, opacity: 1, rotateX: 0, stagger: 0.12, duration: 0.7 }), '-=0.3')
      tlRef.current = tl
    }
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="page-section fit-content"
      style={{ background: 'var(--color-paper)', borderBottom: '0.5px solid var(--color-line)' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          height: '100%',
          paddingTop: 56,
        }}
      >
        {/* Left column */}
        <div
          style={{
            padding: '48px 32px 40px',
            borderRight: '0.5px solid var(--color-line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 className="sr-only">Projects</h2>
            <div
              data-animate
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(26px, 2.8vw, 36px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--color-ink)',
                marginBottom: 16,
              }}
            >
              What I've
              <br />
              actually
              <br />
              built<span style={{ color: 'var(--color-purple)' }}>.</span>
            </div>
            <p data-animate style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.85 }}>
              Projects I can speak to in full, start to finish.
            </p>
          </div>
          <div data-animate>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 42,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                lineHeight: 1,
              }}
            >
              3
            </div>
            <div className="eyebrow" style={{ marginTop: 4 }}>Projects I own</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Featured card */}
          <div
            className="featured-card tilt-card"
            onMouseMove={(e) => handleTilt(e, e.currentTarget)}
            onMouseLeave={(e) => resetTilt(e.currentTarget)}
            style={{
              background: 'var(--color-ink)',
              borderRadius: 4,
              padding: '28px 32px',
              border: '0.5px solid #2a2a2a', /* one-off: review */
            }}
          >
            {/* Award badge */}
            <div style={{ marginBottom: 14 }}>
              <span className="pill pill-gold on-ink" style={{ fontSize: 9 }}>
                2nd Place, NJIT CS491 Capstone 2026
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                color: 'var(--color-paper)',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              LinkdUp
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-paper-a50)', marginBottom: 12 }}>
              Mobile-first web app for group meetup coordination
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-paper-a70)', lineHeight: 1.85, marginBottom: 16 }}>
              Lead developer on a{' '}
              <strong style={{ color: 'var(--color-paper)', fontWeight: 500 }}>production app deployed at linkdup.app</strong> — built a locked-step swipe-voting engine synchronized in real time across all party members via Supabase Realtime websockets. Integrated{' '}
              <strong style={{ color: 'var(--color-paper)', fontWeight: 500 }}>Google Places API</strong> for geographic midpoint venue discovery,{' '}
              <strong style={{ color: 'var(--color-paper)', fontWeight: 500 }}>Google Calendar API</strong> for one-click event export, and{' '}
              <strong style={{ color: 'var(--color-paper)', fontWeight: 500 }}>Gemini 2.5</strong> for AI-generated venue pitches. Includes a TikTok-style social feed, followers/block system, and 27+ schema migrations with row-level security.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {featuredStack.map((s) => (
                <span key={s} className="pill pill-dark" style={{ fontSize: 10 }}>{s}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href="https://linkdup.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: 'var(--color-purple-deep)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--color-white)',
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Live Demo ↗
              </a>
              <a
                href="https://github.com/iaalcantara17/LinkdUp"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  border: '0.5px solid var(--color-paper-a30)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--color-paper-a70)',
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                GitHub ↗
              </a>
            </div>
          </div>

          {/* Grid cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* SFort95 Compiler */}
            <div
              className="grid-card tilt-card"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 4,
                padding: '22px 24px',
                border: '0.5px solid var(--color-line)',
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <span className="eyebrow" style={{ color: 'var(--color-muted)' }}>Systems — Compiler</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                SFort95 Compiler
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.85, marginBottom: 12 }}>
                A full three-stage compiler in <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>C++</strong> — a state-based lexical analyzer that tokenizes source input, a recursive-descent parser with operator-precedence handling, and an interpreter that executes the parsed AST with Fortran95-compliant semantics. Runtime checks catch undefined variables, type mismatches, and division by zero before they become problems.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {['C++', 'Git', 'Lexer', 'Parser', 'AST'].map((s) => (
                  <span key={s} className="pill" style={{ fontSize: 9 }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { label: 'Lexer', url: 'https://github.com/iaalcantara17/Lexical-Analyzer-for-SFort95-Language' },
                  { label: 'Parser', url: 'https://github.com/iaalcantara17/Parser-for-SFort95-Language' },
                  { label: 'Interpreter', url: 'https://github.com/iaalcantara17/SFort95-Interpreter' },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      border: '0.5px solid var(--color-purple-a40)',
                      borderRadius: 4,
                      fontSize: 10,
                      color: 'var(--color-purple-deep)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>

            {/* Data Analysis App */}
            <div
              className="grid-card tilt-card"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 4,
                padding: '22px 24px',
                border: '0.5px solid var(--color-line)',
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <span className="eyebrow" style={{ color: 'var(--color-muted)' }}>Machine Learning — Python</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Data Analysis App
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--color-muted)', lineHeight: 1.85, marginBottom: 12 }}>
                Upload any CSV, pick your target, and watch it go. The app handles the messy part — missing values, scaling, encoding — automatically, so you can focus on what actually matters: understanding your data. Built a full regression pipeline using a{' '}
                <strong style={{ color: 'var(--color-ink)', fontWeight: 500 }}>Gradient Boosting Regressor</strong> with real-time prediction and dynamic visualizations that update as you explore.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {['Python', 'Streamlit', 'Scikit-learn', 'Pandas', 'NumPy'].map((s) => (
                  <span key={s} className="pill" style={{ fontSize: 9 }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { label: 'Live Demo', url: 'https://milestone-4-data-analysis.streamlit.app/' },
                  { label: 'GitHub', url: 'https://github.com/iaalcantara17/Data-Analysis-App' },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      border: '0.5px solid var(--color-purple-a40)',
                      borderRadius: 4,
                      fontSize: 10,
                      color: 'var(--color-purple-deep)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div style={{ borderTop: '0.5px solid var(--color-line)', paddingTop: 14 }}>
            <span className="eyebrow" style={{ color: 'var(--color-faint)' }}>Only projects I built and can fully speak to.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
