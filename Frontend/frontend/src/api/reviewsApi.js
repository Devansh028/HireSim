import api from './axios'

export const reviewSubmission = (submissionId, data) =>
  api.post(`/reviews/${submissionId}`, data)
