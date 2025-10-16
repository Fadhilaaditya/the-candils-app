<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold text-[#BAB772] mb-6 flex items-center">
      <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clip-rule="evenodd"
        />
      </svg>
      Lokasi Cabang
    </h2>

    <div class="space-y-4">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="$emit('focusLocation', branch)"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-3 h-3 bg-amber-600 rounded-full mt-2"></div>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ branch.name }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ branch.address }}</p>
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                />
              </svg>
              {{ branch.phone }}
            </div>
            <div class="mt-1 flex items-center text-sm text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ branch.hours }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Definisikan ulang tipe data agar komponen ini tahu 'bentuk' datanya
interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'branch' | 'competitor' | 'landmark';
  phone?: string;
  hours?: string;
}

// 1. Terima data 'branches' dari parent melalui props
defineProps<{
  branches: Location[];
}>();

// 2. Definisikan event yang akan dikirim ke parent
defineEmits<{
  (e: 'focusLocation', location: Location): void;
}>();
</script>
