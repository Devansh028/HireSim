const STATUS_COLORS = {
  CREATED: 'bg-gray-100 text-gray-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  REWORK: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  REWORK_REQUESTED: 'bg-orange-100 text-orange-700',
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
  LOW: 'bg-green-100 text-green-700',
  MEDIUM_RISK: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  REVIEWER: 'bg-blue-100 text-blue-700',
  CANDIDATE: 'bg-gray-100 text-gray-700',
}

const Badge = ({ label, variant }) => {
  const key = variant || label
  const color = STATUS_COLORS[key] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export default Badge
