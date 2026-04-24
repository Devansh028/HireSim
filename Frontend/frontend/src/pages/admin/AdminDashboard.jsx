import { useState, useEffect } from 'react'
import { fetchTasks } from '../../api/tasksApi'
import { fetchPrograms } from '../../api/programsApi'
import { fetchAuditLogs } from '../../api/auditApi'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [programs, setPrograms] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p, l] = await Promise.all([
          fetchTasks({ limit: 100 }),
          fetchPrograms(),
          fetchAuditLogs({ limit: 5 }),
        ])
        setTasks(t.data.items || [])
        setPrograms(p.data || [])
        setLogs(l.data.items || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <Loader />

  const statusCount = (s) => tasks.filter((t) => t.status === s).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all programs, tasks and activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Programs" value={programs.length}
          color="bg-indigo-50 text-indigo-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard label="Total Tasks" value={tasks.length}
          color="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />
        <StatCard label="Approved" value={statusCount('APPROVED')}
          color="bg-green-50 text-green-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Pending Review" value={statusCount('SUBMITTED')}
          color="bg-yellow-50 text-yellow-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Task Status Breakdown</h2>
          <div className="space-y-3">
            {['CREATED', 'ASSIGNED', 'SUBMITTED', 'REWORK', 'APPROVED'].map((s) => (
              <div key={s} className="flex items-center justify-between">
                <Badge label={s} />
                <span className="text-sm font-semibold text-gray-700">{statusCount(s)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log._id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800 font-medium">{log.action}</p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
