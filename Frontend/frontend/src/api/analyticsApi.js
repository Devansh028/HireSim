import api from './axios'

export const fetchTaskAnalytics = (taskId) =>
  api.get(`/analytics/task/${taskId}`)
