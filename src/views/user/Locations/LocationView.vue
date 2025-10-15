<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-green-600 mb-2">Temukan Kami</h1>
        <p class="text-gray-600">Temukan lokasi cabang The Candil's terdekat di sekitar Anda</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Map Section -->
        <div class="order-2 lg:order-1">
          <GoogleMaps :locations="allLocations" :center="mapCenter" :zoom="13" />
        </div>

        <!-- Location List Section -->
        <div class="order-1 lg:order-2">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-green-600 mb-6 flex items-center">
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
                @click="focusOnLocation(branch)"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GoogleMaps from './_components/GoogleMaps.vue'
import locationData from './_components/data/locationData.json'

// Type definitions
interface Location {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: 'branch' | 'competitor' | 'landmark'
  phone?: string
  hours?: string
}

// Reactive data
const branches = ref<Location[]>(locationData.branches as Location[])

// Computed properties
const allLocations = computed(() => [...branches.value])

const mapCenter = computed(() => ({
  lat: -6.31,
  lng: 106.73,
}))

// Methods
const focusOnLocation = (location: Location) => {
  // This would focus the map on the selected location
  // Implementation depends on how you want to handle this
  console.log('Focus on location:', location)
}
</script>
