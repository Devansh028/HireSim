import api from './axios'

export const fetchTasks = (params) => api.get('/tasks', { params })
export const fetchTaskById = (id) => api.get(`/tasks/${id}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const assignCandidate = (id, candidateId) =>
  api.patch(`/tasks/${id}/assign-candidate`, { candidateId })
export const assignReviewer = (id, reviewerId) =>
  api.patch(`/tasks/${id}/assign-reviewer`, { reviewerId })
