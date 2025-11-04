<template>
  <div v-if="isAuthenticated">
    <slot />
  </div>
  <div v-else>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div
        class="w-10 h-10 border-4 border-gray-200 border-t-[#BAB772] rounded-full animate-spin mb-5"
      ></div>
      <p class="text-gray-600 text-base">Memverifikasi autentikasi...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)

onMounted(() => {
  checkAuth()
})

const checkAuth = () => {
  const authStatus = localStorage.getItem('adminAuthenticated')

  if (authStatus === 'true') {
    isAuthenticated.value = true
  } else {
    // Redirect to login if not authenticated
    router.push('/admin/login')
  }
}
</script>
