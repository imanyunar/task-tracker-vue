import axios from 'axios';

// Membuat instance axios
const apiClient = axios.create({
  // Sesuaikan dengan URL base backend Laravel Anda
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Tugas: Mengambil 'api_token' dari localStorage dan 
 * menyisipkannya ke header 'Authorization' sebelum request dikirim.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Nama key harus sesuai dengan yang Anda simpan saat login
    const token = localStorage.getItem('api_token'); 
    
    if (token) {
      // Menggunakan format Bearer Token sesuai standar API
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor (Opsional tapi sangat disarankan)
 * Tugas: Menangani error global, seperti token kadaluarsa (401).
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika backend mengirim 401 (Unauthorized), arahkan user ke login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('api_token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;