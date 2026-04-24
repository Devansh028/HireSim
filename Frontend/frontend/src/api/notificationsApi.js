import api from './axios'

export const fetchMyNotifications = () => api.get('/notification/me')
export const fetchUnreadCount = () => api.get('/notification/me/unread-count')
export const markNotificationRead = (id) => api.patch(`/notification/${id}/read`)
export const markAllNotificationsRead = () => api.patch('/notification/me/read-all')
