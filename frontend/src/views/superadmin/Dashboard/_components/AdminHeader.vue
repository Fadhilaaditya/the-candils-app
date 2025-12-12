<template>
  <div class="bg-white border-b border-gray-200 px-8 py-4">
    <div class="flex items-center justify-between">
      <!-- Kiri: Judul Halaman & Subjudul -->
      <div>
        <h1 class="text-xl font-bold text-gray-800">{{ pageTitle }}</h1>
        <p class="text-sm text-gray-500">{{ pageSubtitle }}</p>
      </div>

      <!-- Kanan: Tanggal & Waktu -->
      <div class="text-right">
        <p class="text-sm font-medium text-gray-700">{{ formattedDateTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'AdminHeader' })

const route = useRoute()
const currentDateTime = ref(new Date())
let intervalId: number | undefined;

// Peta Judul Halaman (sesuaikan nama rute dengan router/index.ts Anda)
const titleMap: Record<string, { title: string; subtitle: string }> = {
  'superadmin-dashboard-main': { title: 'Dashboard', subtitle: 'Overview' },
  'superadmin-sales': { title: 'Penjualan', subtitle: 'Laporan Penjualan' },
  'superadmin-products-kelola': { title: 'Produk', subtitle: 'Kelola Produk & Varian' },
  'superadmin-products-detail-by-id': { title: 'Detail Produk', subtitle: 'Lihat Detail Produk' },
  'superadmin-review': { title: 'Review', subtitle: 'Kelola Ulasan Pelanggan' },
  'superadmin-orders': { title: 'Pemesanan', subtitle: 'Kelola Pemesanan Masuk' },
  'superadmin-accounts': { title: 'Kelola Akun', subtitle: 'Manajemen User & Password' },
}

const currentTitle = computed(() => {
  const name = route.name as string;
  let entry = titleMap[name];

  let matchingKey = '';
  if (!entry) {
    // Coba cari key yang "mirip" (startsWith), misalnya untuk child route
    matchingKey = Object.keys(titleMap).find(key => name.startsWith(key)) || '';
    entry = titleMap[matchingKey || 'superadmin-dashboard-main'];
  }
  
  if (!entry) {
     // Fallback terakhir: Cek path jika route name tidak sesuai
     if (route.path.includes('/sales')) entry = titleMap['superadmin-sales'];
     else if (route.path.includes('/products')) entry = titleMap['superadmin-products-kelola'];
     else if (route.path.includes('/orders')) entry = titleMap['superadmin-orders'];
     else entry = titleMap[matchingKey || 'superadmin-dashboard-main'];
  }

  return entry;
})

const pageTitle = computed(() => currentTitle.value.title)
const pageSubtitle = computed(() => currentTitle.value.subtitle)


// Format Tanggal
const formattedDateTime = computed(() => {
  const date = currentDateTime.value
  // Format: 01 Nov 2025, 15:35
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

onMounted(() => {
  // Update waktu setiap detik agar jam terus berjalan
  intervalId = setInterval(() => {
    currentDateTime.value = new Date()
  }, 1000);
})

onUnmounted(() => {
  // Hentikan interval saat komponen dihancurkan
  clearInterval(intervalId);
})
</script>