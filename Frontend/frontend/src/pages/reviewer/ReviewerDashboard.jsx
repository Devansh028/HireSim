import { useState, useEffect } from 'react'
import { fetchTasks } from '../../api/tasksApi'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'

const ReviewerDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchTasks({ limit: 100 })
        setTasks(data.items || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <Loader />

  const submitted = tasks.filter((t) => t.status === 'SUBMITTED').length
  const rework = tasks.filter((t) => t.status === 'REWORK').length
  const approved = tasks.filter((t) => t.status === 'APPROVED').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviewer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of tasks awaiting your review.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: submitted, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Rework Requested', value: rework, color: 'bg-orange-50 text-orange-600' },
          { label: 'Approved', value: approved, color: 'bg-green-50 text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color.split(' ')[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Tasks Needing Review</h2>
        {tasks.filter((t) => t.status === 'SUBMITTED').length === 0 ? (
          <p className="text-sm text-gray-400">No tasks pending review.</p>
        ) : (
          <div className="space-y-3">
            {tasks.filter((t) => t.status === 'SUBMITTED').slice(0, 5).map((t) => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.program?.name}</p>
                </div>
                <Badge label={t.difficulty} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewerDashboard
