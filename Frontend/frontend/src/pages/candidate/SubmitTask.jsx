import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { submitTask } from '../../api/submissionsApi'

const SubmitTask = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const taskId = params.get('taskId')
  const title = params.get('title') || 'Task'
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!taskId) { setError('No task selected.'); return }
    setLoading(true); setError('')
    try {
      await submitTask(taskId, { content })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Submission Successful!</h2>
        <p className="text-sm text-gray-500">Your submission for <strong>{title}</strong> has been received.</p>
        <button onClick={() => navigate('/candidate/tasks')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm">
          Back to My Tasks
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Submit Task</h1>
        <p className="text-sm text-gray-500 mt-1">Submitting for: <strong>{title}</strong></p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}
        {!taskId && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
            No task selected. Please go to My Tasks and click Submit.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Submission Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              placeholder="Write your solution, paste a link, or describe your work here…"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
          </div>
          <button
            type="submit"
            disabled={loading || !taskId || !content.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SubmitTask
