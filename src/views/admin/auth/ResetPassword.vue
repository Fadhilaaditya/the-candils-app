<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-5">
    <div class="flex bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full min-h-[500px]">
      <!-- Left side - Logo -->
      <div class="flex-1 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-10">
        <div class="text-center">
          <div class="text-6xl font-bold text-[#BAB772] mb-3 font-serif">TC</div>
          <div class="text-lg text-gray-600 font-medium tracking-widest">THE CANDIL'S</div>
        </div>
      </div>

      <!-- Right side - Reset Password Form -->
      <div class="flex-1 p-16 flex flex-col justify-center">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">The Candil's</h1>
          <h2 class="text-2xl font-bold text-[#BAB772]">CONTROL MANAGEMENT</h2>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-8 mb-8">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-800">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Email"
              required
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-colors duration-300 focus:outline-none focus:border-[#BAB772] placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-[#BAB772] text-white py-4 rounded-xl text-lg font-semibold transition-colors duration-300 hover:bg-[#a8a668] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Processing...' : 'Reset Password' }}
          </button>
        </form>

        <div class="text-center mb-5">
          <router-link to="/admin/login" class="text-blue-600 text-sm hover:text-blue-800 transition-colors duration-300">
            ← Kembali ke Login
          </router-link>
        </div>

        <div v-if="successMessage" class="bg-green-100 text-green-800 px-4 py-3 rounded-lg text-center text-sm">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="bg-red-100 text-red-800 px-4 py-3 rounded-lg text-center text-sm">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const formData = reactive({
  email: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleResetPassword = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate successful password reset
    successMessage.value = 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau spam folder.'

    // Clear form
    formData.email = ''

  } catch {
    errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>
