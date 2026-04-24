import api from './axios'

export const submitTask = (taskId, data) =>
  api.post(`/submissions/${taskId}/submit`, data)

export const fetchSubmissionsByTask = (taskId) =>
  api.get(`/submissions/${taskId}`)
