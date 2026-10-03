// Status pill on Education's cards. Built on the .tag chip and the .pill-* color
// variants: purple for a degree that's earned, gold for one still ahead.
const STATUSES = {
  earned: { label: 'Earned', color: 'purple' },
  'in-progress': { label: 'In progress', color: 'gold' },
}

export default function StatusPill({ status }) {
  const { label, color } = STATUSES[status]
  return <span className={`tag pill-${color}`}>{label}</span>
}
