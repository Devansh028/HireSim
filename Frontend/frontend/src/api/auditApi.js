import api from './axios'

export const fetchAuditLogs = (params) => api.get('/audit', { params })
