import { useState, useEffect } from 'react'
import { fetchTasks } from '../../api/tasksApi'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'

const MyTasks = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  const canSubmit = (status) => ['ASSIGNED', 'REWORK'].includes(status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">All tasks assigned to you.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 font-medium">No tasks assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">When an admin assigns you a task, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                    <Badge label={t.difficulty} />
                    <Badge label={t.status} />
                  </div>
                  {t.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Program: {t.program?.name || '—'}</span>
                    {t.deadline && (
                      <span>Deadline: {new Date(t.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                {canSubmit(t.status) && (
                  <button
                    onClick={() => navigate(`/candidate/submit?taskId=${t._id}&title=${encodeURIComponent(t.title)}`)}
                    className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
                  >
                    {t.status === 'REWORK' ? 'Resubmit' : 'Submit'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTasks
