import api from './axios'

// Fetch all users (used by admin to populate candidate/reviewer dropdowns)
export const fetchUsers = () => api.get('/auth/users')
