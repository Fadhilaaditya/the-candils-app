import axios from 'axios'
import router from '@/router' // Impor router Vue Anda

// -----------------------------------------------------------------
// PERBAIKAN: Deteksi Lingkungan untuk Base URL
// -----------------------------------------------------------------
// Base URL akan otomatis beralih:
// - Development (npm run dev): http://localhost:3000/api
// - Production (Deployment): https://backend-the-candils.vercel.app/api
const BASE_URL = import.meta.env.PROD
  ? 'https://backend-the-candils.vercel.app/api' 
  : 'http://localhost:3000/api'; 
// -----------------------------------------------------------------


// Buat instansi Axios kustom
const api = axios.create({
  // Gunakan BASE_URL yang dinamis
  baseURL: BASE_URL,
})

// Interceptor (Penjaga) Request
// Ini akan berjalan SEBELUM setiap request dikirim
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken')

    if (token) {
      // Jika token ada, tambahkan ke header Authorization
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada persiapan request
    return Promise.reject(error)
  },
)

// Interceptor (Penjaga) Response
// Ini akan berjalan SETELAH setiap response diterima
api.interceptors.response.use(
  (response) => response, // Langsung teruskan jika response sukses (status 2xx)
  (error) => {
    // Tangani error secara global
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 401/403 berarti token tidak valid atau kedaluwarsa
      console.error('Akses ditolak. Token tidak valid atau kedaluwarsa.')
      // Hapus token yang tidak valid
      localStorage.removeItem('authToken')
      // Redirect ke halaman login
      // (Pastikan path '/admin/login' sesuai dengan router Anda)
      router.push('/admin/login')
    }
    return Promise.reject(error)
  },
)

export default api