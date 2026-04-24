import { useState, useEffect } from 'react'
import { fetchTasks } from '../../api/tasksApi'
import { useAuth } from '../../auth/AuthContext'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import { Link } from 'react-router-dom'

const CandidateDashboard = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchTasks({ limit: 100 })
        const mine = (data.items || []).filter(
          (t) => t.assignedTo?._id === user?._id || t.assignedTo === user?._id
        )
        setTasks(mine)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [user])

  if (loading) return <Loader />

  const statusCount = (s) => tasks.filter((t) => t.status === s).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Here's a summary of your assigned tasks.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned', value: tasks.length, color: 'text-indigo-600' },
          { label: 'Pending', value: statusCount('ASSIGNED'), color: 'text-blue-600' },
          { label: 'Submitted', value: statusCount('SUBMITTED'), color: 'text-yellow-600' },
          { label: 'Approved', value: statusCount('APPROVED'), color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Your Tasks</h2>
          <Link to="/candidate/tasks" className="text-sm text-indigo-600 hover:underline font-medium">View all</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((t) => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.program?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={t.difficulty} />
                  <Badge label={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateDashboard
