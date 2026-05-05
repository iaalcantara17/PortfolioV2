export default function SectionCounter({ current }) {
  const num = String(current + 1).padStart(2, '0')
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 48,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <span className="eyebrow" style={{ color: '#bbbbbb' }}>{num} / 07</span>
    </div>
  )
}
