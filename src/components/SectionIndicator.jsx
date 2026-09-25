import { sections } from '../data/sections'

export default function SectionIndicator({ current, onNavigate }) {
  return (
    <div id="section-indicator">
      {sections.map((s, i) => (
        <button
          key={s.key}
          title={s.label}
          onClick={() => onNavigate(i)}
          className={`section-dot ${current === i ? 'active' : ''}`}
          style={{ background: current === i ? 'var(--color-purple)' : 'transparent', cursor: 'none', border: 'none', padding: 0 }}
        />
      ))}
    </div>
  )
}
