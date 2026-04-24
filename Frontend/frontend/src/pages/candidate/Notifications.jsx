import { useState, useEffect } from 'react'
import {
  fetchMyNotifications, markNotificationRead, markAllNotificationsRead,
} from '../../api/notificationsApi'
import Loader from '../../components/common/Loader'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true); setError('')
      const { data } = await fetchMyNotifications()
      setNotifications(data)
      window.dispatchEvent(new Event('notifications-updated'))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n))
      window.dispatchEvent(new Event('notifications-updated'))
    } catch { /* ignore */ }
  }

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      window.dispatchEvent(new Event('notifications-updated'))
    } catch { /* ignore */ }
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Updates about your tasks and reviews.</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? <Loader /> : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {notifications.map((n) => (
            <div key={n._id}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition ${!n.read ? 'bg-indigo-50/30' : ''}`}>
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-gray-300' : 'bg-indigo-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && (
                <button onClick={() => handleMarkRead(n._id)}
                  className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
