import api from './axios'

export const fetchPrograms = () => api.get('/programs')
export const fetchProgramById = (id) => api.get(`/programs/${id}`)
export const createProgram = (data) => api.post('/programs', data)
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data)
export const deleteProgram = (id) => api.delete(`/programs/${id}`)
