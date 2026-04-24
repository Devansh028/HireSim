import api from './axios'

export const fetchTaskRisk = (taskId) => api.get(`/risk/task/${taskId}`)
