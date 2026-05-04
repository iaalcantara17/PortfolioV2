const SECTIONS = ['Hero', 'About', 'Skills', 'Experience', 'Projects', 'Life', 'Contact']

export default function SectionIndicator({ current, onNavigate }) {
  return (
    <div id="section-indicator">
      {SECTIONS.map((s, i) => (
        <button
          key={s}
          title={s}
          onClick={() => onNavigate(i)}
          className={`section-dot ${current === i ? 'active' : ''}`}
          style={{ background: current === i ? '#7F77DD' : 'transparent', cursor: 'none', border: 'none', padding: 0 }}
        />
      ))}
    </div>
  )
}
