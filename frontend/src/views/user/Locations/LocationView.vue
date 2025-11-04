<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-[#BAB772] mb-2">Temukan Kami</h1>
        <p class="text-gray-600">Temukan lokasi cabang The Candil's terdekat di sekitar Anda</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="order-2 lg:order-1">
          <GoogleMaps :locations="allLocations" :center="mapCenter" :zoom="13" />
        </div>

        <div class="order-1 lg:order-2">
          <LocationList
            :branches="branches"
            @focus-location="focusOnLocation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GoogleMaps from './_components/GoogleMaps.vue'
import LocationList from './_components/LocationList.vue' // <-- Impor komponen baru
import locationData from './_components/data/locationData.json'

// Type definitions tetap di sini karena dibutuhkan oleh parent
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

// Semua state dan logika tetap di parent
const branches = ref<Location[]>(locationData.branches as Location[])

const allLocations = computed(() => [...branches.value])

const mapCenter = computed(() => ({
  lat: -6.31,
  lng: 106.73,
}))

const focusOnLocation = (location: Location) => {
  console.log('Event dari child diterima! Fokus ke:', location)
  // Di sini Anda bisa mengubah mapCenter atau state lain untuk memfokuskan peta
  // mapCenter.value = { lat: location.lat, lng: location.lng }
}
</script>
