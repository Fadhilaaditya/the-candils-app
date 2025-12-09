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
        <div class="h-full">
          <GoogleMaps :locations="allLocations" :center="mapCenter" :zoom="13" />
        </div>

        <div>
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
import { ref, computed, onMounted } from 'vue'
import GoogleMaps from './_components/GoogleMaps.vue'
import LocationList from './_components/LocationList.vue'
import { getHomeContent } from '@/services/homeService';
import type { LocationItem, LocationsData } from '@/services/homeService';

// Re-export Location type for compatibility if necessary, or use LocationItem everywhere
// Adapting local interface to match service interface if they differ, or just using service interface
type Location = LocationItem;

const branches = ref<Location[]>([])
const competitors = ref<Location[]>([]) 
const landmarks = ref<Location[]>([])

const allLocations = computed(() => {
    return [
        ...branches.value,
        ...competitors.value,
        ...landmarks.value
    ];
});

const mapCenter = computed(() => ({
  lat: -6.31,
  lng: 106.73,
}))

const focusOnLocation = (location: Location) => {
  console.log('Event dari child diterima! Fokus ke:', location)
  // Di sini Anda bisa mengubah mapCenter atau state lain untuk memfokuskan peta
  // mapCenter.value = { lat: location.lat, lng: location.lng }
}

onMounted(async () => {
    try {
        const response = await getHomeContent();
        if (response.data.success && response.data.data.locations) {
            const locations = response.data.data.locations;
            branches.value = locations.branches;
            competitors.value = locations.competitors;
            landmarks.value = locations.landmarks;
        }
    } catch (error) {
        console.error('Failed to fetch locations:', error);
    }
});
</script>
