<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
  >

    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
        >
          <div
            class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
          >
            {{ getInitial(review.namaReviewer) }}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-800">{{ review.namaReviewer || 'User Anonim' }}</span>
          </div>
          <div class="text-sm text-gray-500">{{ formatRelativeTime(review.tanggalUlasan) }}</div>
        </div>
      </div>

      <div class="flex items-center">
        <svg
          v-for="star in 5"
          :key="star"
          class="w-4 h-4"
          :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l..."
          />
        </svg>
      </div>
    </div>

    <p class="text-gray-700 leading-relaxed mb-3">
      {{ review.komentar || 'User tidak memberikan komentar.' }}
    </p>

    <!-- Review Image -->
    <div v-if="review.foto" class="mt-2 mb-3">
      <img 
        :src="getImageUrl(review.foto)" 
        alt="Foto Ulasan" 
        class="h-32 w-auto object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
        @click="openImageModal(review.foto)"
      />
    </div>

    <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
      <div class="text-xs text-gray-500">
        {{ formatDateTime(review.tanggalUlasan) }}
      </div>
      <button 
        @click="$emit('delete-review', review)"
        class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
        title="Hapus Ulasan"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        Hapus
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ulasan } from '@/services/productService'

interface Props {
  review: Ulasan
}
defineProps<Props>()

defineEmits(['delete-review'])

// --- Helper Functions (Tidak Berubah) ---

const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Tanggal tidak valid';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Tanggal tidak valid';
  return date.toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const formatRelativeTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Tanggal tidak valid';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Tanggal tidak valid';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Baru saja";
  let interval = seconds / 60;
  if (interval < 60) return Math.floor(interval) + " menit lalu";
  interval = seconds / 3600;
  if (interval < 24) return Math.floor(interval) + " jam lalu";
  interval = seconds / 86400;
  if (interval < 30) return Math.floor(interval) + " hari lalu";
  interval = seconds / 2592000;
  if (interval < 12) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 31536000;
  return Math.floor(interval) + " tahun lalu";
}

const getInitial = (name: string | undefined | null): string => {
  if (!name || name.trim() === '') return '?';
  const parts = name.trim().split(' ');
  
  const firstInitial = parts[0][0]?.toUpperCase() || '';
  
  if (parts.length > 1) {
    const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || '';
    return firstInitial + lastInitial;
  }
  
  return name.substring(0, 2).toUpperCase();
}

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // Sesuaikan dengan base URL backend Anda
  const BASE_URL = import.meta.env.PROD 
    ? 'https://backend-the-candils.vercel.app' 
    : 'http://localhost:3000';
  return `${BASE_URL}${path}`
}

const openImageModal = (url: string) => {
  window.open(getImageUrl(url), '_blank')
}
</script>