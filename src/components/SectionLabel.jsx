import { SECTION_TOTAL, LABEL_TOP } from '../data/sections'

export default function SectionLabel({ index }) {
  const num = String(index).padStart(2, '0')
  return (
    <div
      data-fixed-counter={index}
      style={{
        position: 'absolute',
        top: LABEL_TOP,
        left: 32,
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity 100ms ease',
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-faint)',
          display: 'block',
        }}
      >
        {num} / {SECTION_TOTAL}
      </span>
    </div>
  )
}
