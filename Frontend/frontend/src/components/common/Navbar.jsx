import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { fetchUnreadCount } from '../../api/notificationsApi'

const Navbar = () => {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (user?.role !== 'CANDIDATE') return
    const load = async () => {
      try {
        const { data } = await fetchUnreadCount()
        setUnread(data.count)
      } catch { /* ignore */ }
    }
    load()
    const id = setInterval(load, 30000)
    const onUpdate = () => load()
    window.addEventListener('notifications-updated', onUpdate)
    return () => { clearInterval(id); window.removeEventListener('notifications-updated', onUpdate) }
  }, [user?.role])

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700',
    REVIEWER: 'bg-blue-100 text-blue-700',
    CANDIDATE: 'bg-gray-100 text-gray-600',
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="font-bold text-gray-900 tracking-tight text-lg">HireSim</div>
      <div className="flex items-center gap-3">
        {user?.role === 'CANDIDATE' && (
          <Link
            to="/candidate/notifications"
            className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Link>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[user?.role] || 'bg-gray-100 text-gray-600'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
