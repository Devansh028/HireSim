import { useState, useEffect, useCallback } from 'react'
import { fetchAuditLogs } from '../../api/auditApi'
import Loader from '../../components/common/Loader'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState({ action: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (filter.action) params.action = filter.action
      const { data } = await fetchAuditLogs(params)
      setLogs(data.items || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, filter])

  useEffect(() => { load() }, [load])

  const ACTIONS = [
    'PROGRAM_CREATED', 'PROGRAM_UPDATED', 'PROGRAM_DELETED',
    'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_ASSIGNED',
    'TASK_APPROVED', 'TASK_REWORK_REQUESTED', 'SUBMISSION_CREATED',
  ]

  const actionColor = (action) => {
    if (action.includes('DELETED')) return 'bg-red-100 text-red-700'
    if (action.includes('CREATED')) return 'bg-green-100 text-green-700'
    if (action.includes('APPROVED')) return 'bg-emerald-100 text-emerald-700'
    if (action.includes('REWORK')) return 'bg-orange-100 text-orange-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total events recorded.</p>
        </div>
        <select value={filter.action} onChange={(e) => { setFilter({ action: e.target.value }); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No audit logs found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{log.user?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{log.entityType || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AuditLogs
