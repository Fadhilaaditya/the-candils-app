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
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      
      <!-- Card 1: Perlu Validasi (Yellow) -->
      <div 
        class="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-yellow-200"
        @click="$emit('filter-status', 'perlu-validasi')"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">
              Perlu Validasi
            </p>
            <p class="text-3xl font-bold text-yellow-900">
              {{ actionCards.perluValidasi }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Icon: Alert/Exclamation -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-yellow-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">Menunggu validasi</span>
        </div>
      </div>
      
      <!-- Card 2: Perlu Dikirim (Blue - Pengemasan) -->
      <div 
        class="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-blue-200"
        @click="$emit('filter-status', 'perlu-dikirim')"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
              Perlu Dikirim
            </p>
            <p class="text-3xl font-bold text-blue-900">
              {{ actionCards.perluDikirim }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Icon: Packing/Package -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-blue-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="font-medium">Menunggu pengemasan</span>
        </div>
      </div>
      
      <!-- Card 3: Dikirim (Purple - Delivery) -->
      <div 
        class="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-purple-200"
        @click="$emit('filter-status', 'dikirim')"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
              Dikirim
            </p>
            <p class="text-3xl font-bold text-purple-900">
              {{ actionCards.dikirim }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Icon: Truck/Shipping -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2v5.707a1 1 0 00.293.707l3 3a1 1 0 001.414 0l3-3a1 1 0 00.293-.707V10c0-1.105-1.343-2-3-2z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-purple-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="font-medium">Dalam proses pengiriman</span>
        </div>
      </div>
      
      <!-- Card 4: Selesai (Green - Success) -->
      <div 
        class="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-green-200"
        @click="$emit('filter-status', 'selesai')"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
              Selesai
            </p>
            <p class="text-3xl font-bold text-green-900">
              {{ actionCards.selesai }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Icon: Checkmark Circle -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-green-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="font-medium">Pesanan berhasil diselesaikan</span>
        </div>
      </div>

      <!-- Card 5: Dibatalkan (Red - Cancel) -->
      <div 
        class="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-red-200"
        @click="$emit('filter-status', 'dibatalkan')"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
              Dibatalkan
            </p>
            <p class="text-3xl font-bold text-red-900">
              {{ actionCards.dibatalkan }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Icon: Stop/Cancel -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-red-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">Pesanan dibatalkan</span>
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