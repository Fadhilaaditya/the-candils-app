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
  'admin-dashboard-main': { title: 'Dashboard', subtitle: 'Overview' },
  'admin-sales': { title: 'Penjualan', subtitle: 'Laporan Penjualan' },
  'admin-products-kelola': { title: 'Produk', subtitle: 'Kelola Produk & Varian' },
  'admin-products-detail-by-id': { title: 'Detail Produk', subtitle: 'Lihat Detail Produk' },
  'admin-review': { title: 'Review', subtitle: 'Kelola Ulasan Pelanggan' },
  'admin-orders': { title: 'Pemesanan', subtitle: 'Kelola Pemesanan Masuk' },
}

const pageTitle = computed(() => {
  const routeName = route.name?.toString() || '';
  // Cari di map
  let entry = titleMap[routeName];
  if (!entry) {
    // Jika tidak ada, cari yang diawali (misal /products/kelola cocok dengan /products)
    const matchingKey = Object.keys(titleMap).find(key => routeName.startsWith(key));
    // Default ke dashboard jika tidak ada yang cocok
    entry = titleMap[matchingKey || 'admin-dashboard-main'];
  }
  return entry.title;
})

const pageSubtitle = computed(() => {
  const routeName = route.name?.toString() || '';
  let entry = titleMap[routeName];
  if (!entry) {
    const matchingKey = Object.keys(titleMap).find(key => routeName.startsWith(key));
    entry = titleMap[matchingKey || 'admin-dashboard-main'];
  }
  return entry.subtitle;
})


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