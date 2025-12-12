<template>
  <div v-if="isAdminRoute" class="admin-layout">
    <RouterView />
  </div>

  <div v-else class="public-layout">
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>
    <Footer />
  </div>

  <ModalsContainer />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/views/user/_components/Navbar.vue' // Navbar publik Anda
import Footer from '@/views/user/_components/Footer.vue' // Footer publik Anda

// --- [PERBAIKAN]: Impor ModalsContainer ---
import { ModalsContainer } from 'vue-final-modal'

// Dapatkan informasi rute saat ini
const route = useRoute()

// Buat computed property untuk mengecek apakah rute saat ini
// adalah rute admin (diawali dengan '/admin')
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin') || route.path.startsWith('/superadmin')
})
</script>

<style scoped>
/* Style ini penting agar layout Anda (publik dan admin)
  selalu mengisi tinggi layar.
*/
.public-layout, .admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ini memastikan konten halaman publik Anda (main-content)
  akan mendorong footer ke bagian bawah halaman.
*/
.public-layout .main-content {
  flex: 1;
}
</style>