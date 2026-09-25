// Shared status pill (Education now, Certifications later). Built on the .tag
// chip and the .pill-* color variants, so every status reads as one system.
const STATUSES = {
  earned: { label: 'Earned', color: 'gold' },
  'in-progress': { label: 'In progress', color: 'purple' },
}

export default function StatusPill({ status }) {
  const { label, color } = STATUSES[status]
  return <span className={`tag pill-${color}`}>{label}</span>
}
