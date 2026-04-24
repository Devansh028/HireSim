import { useState, useEffect, useCallback } from 'react'
import {
  fetchTasks, createTask, updateTask, deleteTask,
  assignCandidate, assignReviewer,
} from '../../api/tasksApi'
import { fetchPrograms } from '../../api/programsApi'
import api from '../../api/axios'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'

const emptyTask = { title: '', description: '', program: '', difficulty: 'EASY', deadline: '' }

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [programs, setPrograms] = useState([])
  const [candidates, setCandidates] = useState([])
  const [reviewers, setReviewers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyTask)
  const [assignId, setAssignId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', difficulty: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    try {
      const params = { page, limit: 10 }
      if (filters.status) params.status = filters.status
      if (filters.difficulty) params.difficulty = filters.difficulty
      const { data } = await fetchTasks(params)
      setTasks(data.items || [])
      setTotalPages(data.pages || 1)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [p, users] = await Promise.all([
          fetchPrograms(),
          api.get('/auth/users'),
        ])
        setPrograms(p.data || [])
        const all = users.data || []
        setCandidates(all.filter((u) => u.role === 'CANDIDATE'))
        setReviewers(all.filter((u) => u.role === 'REVIEWER'))
      } catch { /* ignore */ }
    }
    loadMeta()
  }, [])

  const openCreate = () => { setForm(emptyTask); setError(''); setModal('create') }
  const openEdit = (t) => {
    setSelected(t)
    setForm({
      title: t.title,
      description: t.description || '',
      program: t.program?._id || t.program || '',
      difficulty: t.difficulty,
      deadline: t.deadline ? t.deadline.slice(0, 10) : '',
    })
    setError('')
    setModal('edit')
  }
  const openDelete = (t) => { setSelected(t); setModal('delete') }
  const openAssignCandidate = (t) => { setSelected(t); setAssignId(''); setError(''); setModal('assign-candidate') }
  const openAssignReviewer = (t) => { setSelected(t); setAssignId(''); setError(''); setModal('assign-reviewer') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (modal === 'create') await createTask(form)
      else await updateTask(selected._id, form)
      await load(); closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteTask(selected._id); await load(); closeModal() }
    catch { /* ignore */ } finally { setSaving(false) }
  }

  const handleAssignCandidate = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await assignCandidate(selected._id, assignId); await load(); closeModal() }
    catch (err) { setError(err.response?.data?.message || 'Failed to assign') }
    finally { setSaving(false) }
  }

  const handleAssignReviewer = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await assignReviewer(selected._id, assignId); await load(); closeModal() }
    catch (err) { setError(err.response?.data?.message || 'Failed to assign') }
    finally { setSaving(false) }
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage tasks across programs.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['CREATED', 'ASSIGNED', 'SUBMITTED', 'REWORK', 'APPROVED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.difficulty} onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Difficulties</option>
          {['EASY', 'MEDIUM', 'HARD'].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No tasks found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Program</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Difficulty</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned To</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{t.title}</td>
                  <td className="px-5 py-3.5 text-gray-500">{t.program?.name || '—'}</td>
                  <td className="px-5 py-3.5"><Badge label={t.difficulty} /></td>
                  <td className="px-5 py-3.5"><Badge label={t.status} /></td>
                  <td className="px-5 py-3.5 text-gray-500">{t.assignedTo?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button onClick={() => openAssignCandidate(t)}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                        Assign Candidate
                      </button>
                      <button onClick={() => openAssignReviewer(t)}
                        className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                        Assign Reviewer
                      </button>
                      <button onClick={() => openEdit(t)}
                        className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                        Edit
                      </button>
                      <button onClick={() => openDelete(t)}
                        className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                        Delete
                      </button>
                    </div>
                  </td>
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

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'New Task' : 'Edit Task'} onClose={closeModal}>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                <select value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select…</option>
                  {programs.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {['EASY', 'MEDIUM', 'HARD'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Candidate Modal */}
      {modal === 'assign-candidate' && (
        <Modal title={`Assign Candidate — ${selected?.title}`} onClose={closeModal}>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleAssignCandidate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate *</label>
              <select value={assignId} onChange={(e) => setAssignId(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select candidate…</option>
                {candidates.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {saving ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Reviewer Modal */}
      {modal === 'assign-reviewer' && (
        <Modal title={`Assign Reviewer — ${selected?.title}`} onClose={closeModal}>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleAssignReviewer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer *</label>
              <select value={assignId} onChange={(e) => setAssignId(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select reviewer…</option>
                {reviewers.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.email})</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {saving ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <Modal title="Delete Task" onClose={closeModal} size="sm">
          <p className="text-sm text-gray-600 mb-6">
            Delete <strong>{selected?.title}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={closeModal}
              className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Tasks
