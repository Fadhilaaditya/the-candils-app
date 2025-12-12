<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-5 relative">
    <!-- Back Button -->
    <router-link
      to="/"
      class="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-[#BAB772] transition-colors duration-300 group"
    >
      <svg
        class="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span class="font-medium text-sm">Kembali ke Beranda</span>
    </router-link>

    <div
      class="flex bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full min-h-[500px]"
    >
      <!-- Left side - Logo -->
      <div
        class="flex-1 bg-gradient-to-br from-gray-50 to-gray-200 sm:flex items-center justify-center p-10 hidden"
      >
        <div class="text-center">
          <div class="text-6xl font-bold text-[#BAB772] mb-3 font-serif">TC</div>
          <div class="text-lg text-gray-600 font-medium tracking-widest">THE CANDIL'S</div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="flex-1 p-12 sm:p-16 flex flex-col justify-center">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">The Candil's</h1>
          <h2 class="text-2xl font-bold text-[#BAB772]">Admin Panel</h2>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label for="adminId" class="block text-sm font-semibold text-gray-800">ID</label>
            <input
              id="adminId"
              v-model="adminId"
              type="text"
              placeholder="ID Admin"
              required
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-colors duration-300 focus:outline-none focus:border-[#BAB772] placeholder-gray-400"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-gray-800">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Password"
              required
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-colors duration-300 focus:outline-none focus:border-[#BAB772] placeholder-gray-400"
            />
          </div>

          <!-- Pesan Error -->
          <div
            v-if="errorMessage"
            class="text-red-500 text-sm text-center bg-red-50 py-3 rounded-lg"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-[#BAB772] text-white py-4 rounded-xl text-lg font-semibold transition-colors duration-300 hover:bg-[#a8a668] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

defineOptions({
  name: 'AdminLogin',
})

const router = useRouter()
const adminId = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!adminId.value || !password.value) {
    errorMessage.value = 'Silakan isi ID dan Password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const API_BASE_URL = import.meta.env.PROD
      ? 'https://backend-the-candils.vercel.app/api'
      : 'http://localhost:3000/api';
      
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: adminId.value,
      password: password.value,
    })

    const token = response.data.token
    const userRole = response.data.user?.role
    const userName = response.data.user?.namaLengkap
    
    localStorage.setItem('authToken', token)
    if (userName) localStorage.setItem('adminName', userName)
    if (userRole) localStorage.setItem('adminRole', userRole)

    if (userRole === 'Super Admin') {
      router.push('/superadmin/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Login gagal. Server mungkin sedang bermasalah.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
