import { useState, useEffect } from 'react'
import { fetchTasks } from '../../api/tasksApi'
import { fetchTaskAnalytics } from '../../api/analyticsApi'
import { fetchTaskRisk } from '../../api/riskApi'
import Loader from '../../components/common/Loader'

const ScoreBar = ({ label, value, max = 10 }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value} / {max}</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-500 rounded-full transition-all"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
)

const riskColors = {
  LOW: 'bg-green-100 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HIGH: 'bg-red-100 text-red-700 border-red-200',
}

const Analytics = () => {
  const [tasks, setTasks] = useState([])
  const [taskId, setTaskId] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [risk, setRisk] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchTasks({ limit: 100 })
        setTasks(data.items || [])
      } catch { /* ignore */ }
      finally { setTasksLoading(false) }
    }
    load()
  }, [])

  const handleLoad = async () => {
    if (!taskId) return
    setLoading(true); setError(''); setAnalytics(null); setRisk(null)
    try {
      const [a, r] = await Promise.all([
        fetchTaskAnalytics(taskId),
        fetchTaskRisk(taskId),
      ])
      setAnalytics(a.data)
      setRisk(r.data)
    } catch (err) {
      setError(err.response?.data?.message || 'No data available for this task')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">View performance analytics and risk signals for any task.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex gap-3 flex-wrap">
          {tasksLoading ? <Loader /> : (
            <>
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)}
                className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select a task…</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>{t.title} ({t.status})</option>
                ))}
              </select>
              <button onClick={handleLoad} disabled={!taskId || loading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition">
                {loading ? 'Loading…' : 'Load Analytics'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {loading && <Loader />}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-900">Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Iterations', value: analytics.iterationCount },
                { label: 'Rework Count', value: analytics.reworkCount },
                { label: 'Avg Quality', value: analytics.qualityAvg },
                { label: 'Turnaround (hrs)', value: analytics.turnaroundHours },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-2">
              <ScoreBar label="Quality Score" value={analytics.qualityAvg} />
              <ScoreBar label="Speed Score" value={analytics.speedScore} />
              <ScoreBar label="Iteration Score" value={analytics.iterationScore} />
              <ScoreBar label="Consistency" value={analytics.consistency} />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Work Readiness Score</span>
                <span className="text-2xl font-bold text-indigo-600">{analytics.workReadinessScore} / 10</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(analytics.workReadinessScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {risk && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Risk Analysis</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${riskColors[risk.riskLevel] || riskColors.LOW}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {risk.riskLevel} RISK
              </div>

              {risk.reasons.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Risk Signals</p>
                  <ul className="space-y-2">
                    {risk.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No risk signals detected.</p>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Signal Breakdown</p>
                <div className="space-y-2">
                  {Object.entries(risk.signals || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${val ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {val ? 'Detected' : 'Clear'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
