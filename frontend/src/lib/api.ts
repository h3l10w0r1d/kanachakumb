import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const resp = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
          const { access_token, refresh_token } = resp.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          original.headers.Authorization = `Bearer ${access_token}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/auth'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { email: string; full_name: string; phone?: string; password: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post(`/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`),
  googleAuth: (credential: string) =>
    api.post('/auth/google', { credential }),
  appleAuth: (data: { code: string; id_token: string; full_name?: string }) =>
    api.post('/auth/apple', data),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
}

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { full_name?: string; phone?: string; avatar_url?: string }) =>
    api.put('/users/me', data),
}

export const eventApi = {
  list: (params?: { skip?: number; limit?: number; upcoming?: boolean }) =>
    api.get('/events', { params }),
  get: (id: string) => api.get(`/events/${id}`),
  register: (id: string) => api.post(`/events/${id}/register`),
  cancelRegistration: (id: string) => api.delete(`/events/${id}/register`),
}

export const subscriptionApi = {
  getMy: () => api.get('/subscriptions/my'),
  subscribe: (plan_type: 'basic' | 'premium') => api.post('/subscriptions/subscribe', { plan_type }),
  upgrade: (plan_type: 'basic' | 'premium') => api.put('/subscriptions/upgrade', { plan_type }),
  cancel: () => api.post('/subscriptions/cancel'),
  redeemGiftCard: (code: string) => api.post('/subscriptions/redeem-gift-card', { code }),
}

export const giftCardApi = {
  create: (data: {
    plan_type: string; duration_months: number;
    recipient_email?: string; recipient_name?: string; message?: string
  }) => api.post('/gift-cards', data),
  myPurchases: () => api.get('/gift-cards/my-purchases'),
  check: (code: string) => api.get(`/gift-cards/check/${code}`),
}

export const adminApi = {
  overview: () => api.get('/admin/analytics/overview'),
  subscriptionsOverTime: (days?: number) => api.get('/admin/analytics/subscriptions-over-time', { params: { days } }),
  listUsers: (params?: { skip?: number; limit?: number; search?: string }) =>
    api.get('/admin/users', { params }),
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role?role=${role}`),
  createEvent: (data: object) => api.post('/admin/events', data),
  updateEvent: (id: string, data: object) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/admin/events/${id}`),
  getEventRegistrations: (id: string) => api.get(`/admin/events/${id}/registrations`),
  markAttendance: (eventId: string, regId: string, attended: boolean) =>
    api.put(`/admin/events/${eventId}/registrations/${regId}/attendance?attended=${attended}`),
  listGiftCards: () => api.get('/admin/gift-cards'),
  generateGiftCards: (plan_type: string, count: number, duration_months: number) =>
    api.post(`/admin/gift-cards/generate?plan_type=${plan_type}&count=${count}&duration_months=${duration_months}`),
}
