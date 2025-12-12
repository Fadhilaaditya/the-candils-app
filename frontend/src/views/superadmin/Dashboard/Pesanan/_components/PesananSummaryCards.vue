<template>
  <div class="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div class="flex items-center mb-4">
      <svg 
        class="w-5 h-5 mr-2 text-gray-700" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span class="font-semibold text-gray-900">Ringkasan Status Pesanan</span>
    </div>
    
    <!-- GRID 5 STATUS -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      
      <!-- Card 1: Perlu Validasi (Yellow) -->
      <div 
        class="flex flex-col h-full bg-yellow-50 rounded-xl border border-yellow-100 p-3 hover:shadow-md transition-all duration-300 cursor-pointer group"
        @click="$emit('filter-status', 'perlu-validasi')"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">
              Perlu Validasi
            </p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ actionCards.perluValidasi }}
            </p>
          </div>
          <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div class="mt-auto flex items-center text-[10px] font-medium text-yellow-700 bg-yellow-100/50 px-2 py-1 rounded-md">
          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate">Menunggu validasi</span>
        </div>
      </div>
      
      <!-- Card 2: Perlu Dikirim (Blue) -->
      <div 
        class="flex flex-col h-full bg-blue-50 rounded-xl border border-blue-100 p-3 hover:shadow-md transition-all duration-300 cursor-pointer group"
        @click="$emit('filter-status', 'perlu-dikirim')"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Perlu Dikirim
            </p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ actionCards.perluDikirim }}
            </p>
          </div>
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        </div>
        <div class="mt-auto flex items-center text-[10px] font-medium text-blue-700 bg-blue-100/50 px-2 py-1 rounded-md">
          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="truncate">Menunggu pengemasan</span>
        </div>
      </div>
      
      <!-- Card 3: Dikirim (Purple) -->
      <div 
        class="flex flex-col h-full bg-purple-50 rounded-xl border border-purple-100 p-3 hover:shadow-md transition-all duration-300 cursor-pointer group"
        @click="$emit('filter-status', 'dikirim')"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
              Dikirim
            </p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ actionCards.dikirim }}
            </p>
          </div>
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="mt-auto flex items-center text-[10px] font-medium text-purple-700 bg-purple-100/50 px-2 py-1 rounded-md">
          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate">Sedang dikirim</span>
        </div>
      </div>
      
      <!-- Card 4: Selesai (Green) -->
      <div 
        class="flex flex-col h-full bg-green-50 rounded-xl border border-green-100 p-3 hover:shadow-md transition-all duration-300 cursor-pointer group"
        @click="$emit('filter-status', 'selesai')"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-[10px] font-bold text-green-600 uppercase tracking-wider">
              Selesai
            </p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ actionCards.selesai }}
            </p>
          </div>
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div class="mt-auto flex items-center text-[10px] font-medium text-green-700 bg-green-100/50 px-2 py-1 rounded-md">
          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate">Berhasil selesai</span>
        </div>
      </div>

      <!-- Card 5: Dibatalkan (Red) -->
      <div 
        class="flex flex-col h-full bg-red-50 rounded-xl border border-red-100 p-3 hover:shadow-md transition-all duration-300 cursor-pointer group"
        @click="$emit('filter-status', 'dibatalkan')"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-[10px] font-bold text-red-600 uppercase tracking-wider">
              Dibatalkan
            </p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ actionCards.dibatalkan }}
            </p>
          </div>
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <div class="mt-auto flex items-center text-[10px] font-medium text-red-700 bg-red-100/50 px-2 py-1 rounded-md">
          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate">Pesanan batal</span>
        </div>
      </div>
    </div>

    <!-- Summary Footer -->
    <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Total Pesanan: <strong class="text-gray-900">{{ totalPesanan }}</strong></span>
      </div>
      <button 
        class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center group"
        @click="$emit('refresh')"
      >
        <svg 
          class="w-4 h-4 mr-1 group-hover:rotate-180 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  actionCards: {
    perluValidasi: number // BARU
    perluDikirim: number
    dikirim: number // BARU
    selesai: number
    dibatalkan: number
  }
}

const props = defineProps<Props>()

defineEmits<{
  'filter-status': [status: string]
  'refresh': []
}>()

const totalPesanan = computed(() => {
  return props.actionCards.perluValidasi + props.actionCards.perluDikirim + props.actionCards.dikirim + props.actionCards.selesai + props.actionCards.dibatalkan
})
</script>