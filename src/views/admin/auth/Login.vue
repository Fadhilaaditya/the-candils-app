<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-5">
    <div
      class="flex bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full min-h-[500px]"
    >
      <!-- Left side - Logo -->
      <div
        class="flex-1 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-10"
      >
        <div class="text-center">
          <div class="text-6xl font-bold text-[#BAB772] mb-3 font-serif">TC</div>
          <div class="text-lg text-gray-600 font-medium tracking-widest">THE CANDIL'S</div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="flex-1 p-16 flex flex-col justify-center">
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

          <div class="text-right">
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-blue-600 text-sm hover:text-blue-800 transition-colors duration-300"
            >
              Lupa Password?
            </button>
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

// Component name for linter
defineOptions({
  name: 'AdminLogin',
})

const router = useRouter()
const adminId = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!adminId.value || !password.value) {
    alert('Please fill in all fields')
    return
  }

  isLoading.value = true

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Dummy login logic
    if (adminId.value === 'admin' && password.value === 'admin123') {
      // Store authentication
      localStorage.setItem('adminId', adminId.value)
      localStorage.setItem('adminAuthenticated', 'true')

      // Redirect to dashboard
      router.push('/admin/dashboard')
    } else {
      alert('Invalid credentials. Use admin/admin123')
    }
  } catch {
    alert('Login failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  router.push('/admin/reset-password')
}
</script>
