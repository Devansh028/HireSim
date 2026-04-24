import { useState, useEffect, useCallback } from 'react'
import { fetchTasks } from '../../api/tasksApi'
import { fetchSubmissionsByTask } from '../../api/submissionsApi'
import { reviewSubmission } from '../../api/reviewsApi'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'

const ReviewTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [submissions, setSubmissions] = useState({})
  const [subLoading, setSubLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [form, setForm] = useState({ feedback: '', qualityScore: '', decision: 'APPROVE' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('SUBMITTED')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 50 }
      if (statusFilter) params.status = statusFilter
      const { data } = await fetchTasks(params)
      setTasks(data.items || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (taskId) => {
    if (expanded === taskId) { setExpanded(null); return }
    setExpanded(taskId)
    if (submissions[taskId]) return
    setSubLoading(true)
    try {
      const { data } = await fetchSubmissionsByTask(taskId)
      setSubmissions((prev) => ({ ...prev, [taskId]: data.items || [] }))
    } catch { /* ignore */ }
    finally { setSubLoading(false) }
  }

  const openReview = (sub) => {
    setSelectedSub(sub)
    setForm({ feedback: '', qualityScore: '', decision: 'APPROVE' })
    setError('')
    setModal('review')
  }

  const handleReview = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await reviewSubmission(selectedSub._id, {
        feedback: form.feedback,
        qualityScore: form.qualityScore ? Number(form.qualityScore) : undefined,
        decision: form.decision,
      })
      setModal(null)
      setExpanded(null)
      setSubmissions({})
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Review submitted tasks and provide feedback.</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="SUBMITTED">Submitted</option>
          <option value="REWORK">Rework</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? <Loader /> : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No tasks found for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleExpand(task._id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.program?.name} · {task.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={task.difficulty} />
                  <Badge label={task.status} />
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded === task._id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expanded === task._id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  {subLoading ? <Loader /> : (
                    (submissions[task._id] || []).length === 0 ? (
                      <p className="text-sm text-gray-400">No submissions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {(submissions[task._id] || []).map((sub) => (
                          <div key={sub._id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-500">v{sub.version}</span>
                                <Badge label={sub.status} />
                              </div>
                              <p className="text-sm text-gray-800 break-words">{sub.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                By {sub.candidate?.name} · {new Date(sub.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {sub.status === 'SUBMITTED' && (
                              <button onClick={() => openReview(sub)}
                                className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition">
                                Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === 'review' && (
        <Modal title="Submit Review" onClose={() => setModal(null)}>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
              <div className="flex gap-3">
                {['APPROVE', 'REWORK'].map((d) => (
                  <button key={d} type="button"
                    onClick={() => setForm({ ...form, decision: d })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                      form.decision === d
                        ? d === 'APPROVE' ? 'border-green-500 bg-green-50 text-green-700' : 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score (1–10)</label>
              <input type="number" min={1} max={10} value={form.qualityScore}
                onChange={(e) => setForm({ ...form, qualityScore: e.target.value })}
                placeholder="e.g. 8"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
              <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                rows={4} placeholder="Write your feedback here…"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {saving ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ReviewTasks
