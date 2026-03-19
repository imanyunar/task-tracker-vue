import axios, { AxiosInstance } from 'axios'

// Membuat instance axios
const apiClient: AxiosInstance = axios.create({
  // URL Hardcoded untuk memastikan koneksi ke Alwaysdata
  baseURL: 'https://tasktracker.alwaysdata.net/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

/**
 * Request Interceptor
 * Tugas: Mengambil 'api_token' dari sessionStorage dan
 * menyisipkannya ke header 'Authorization' sebelum request dikirim.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('api_token')

    if (token && !['/register', '/login'].includes(config.url || '')) {
      // Menggunakan format Bearer Token secara manual
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor dihapus agar pengecekan dilakukan secara manual di komponen

export default apiClient