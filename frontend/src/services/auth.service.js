import api from './api'

export const authService = {
  async register(userData) {
    return await api.post('/register', userData)
  },
  async login(credentials) {
    return await api.post('/login', credentials)
  },
  async getProfile() {
    return await api.get('/user-profile') // Sesuai endpoint di AuthController
  },
  async logout() {
    return await api.post('/logout')
  }
}