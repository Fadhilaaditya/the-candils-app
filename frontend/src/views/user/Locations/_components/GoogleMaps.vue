<template>
  <div class="w-full h-96 lg:h-full min-h-[400px] relative">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full rounded-lg shadow-lg"></div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Memuat peta...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Google Maps is loaded dynamically
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: Record<string, unknown>,
        ) => {
          setCenter: (center: { lat: number; lng: number }) => void
          setZoom: (zoom: number) => void
        }
        Marker: new (options: Record<string, unknown>) => {
          setMap: (map: unknown) => void
          addListener: (event: string, callback: () => void) => void
        }
        InfoWindow: new (options: Record<string, unknown>) => {
          open: (map: unknown, marker: unknown) => void
        }
        Point: new (x: number, y: number) => { x: number; y: number }
      }
    }
  }
}

// Props
interface Props {
  locations?: Array<{
    id: string
    name: string
    address: string
    lat: number
    lng: number
    type?: 'branch' | 'competitor' | 'landmark'
  }>
  center?: {
    lat: number
    lng: number
  }
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  locations: () => [
    // 3 Branch locations only (brown markers)
    {
      id: 'ciputat',
      name: 'Ciputat',
      address: 'Bukit Nusa Indah No. 1859, Ciputat, Tangerang Selatan',
      lat: -6.3018,
      lng: 106.7344,
      type: 'branch',
    },
    {
      id: 'bukit-indah',
      name: 'Bukit Indah',
      address: 'Jl. Bukit Indah Raya (Depan Store Haus), Tangerang Selatan',
      lat: -6.2856,
      lng: 106.7308,
      type: 'branch',
    },
    {
      id: 'pamulang',
      name: 'Pamulang',
      address: 'Alun Alun Pamulang (Depan Masjid Raya Pamulang), Tangerang Selatan',
      lat: -6.3428,
      lng: 106.7383,
      type: 'branch',
    },
  ],
  center: () => ({
    lat: -6.31,
    lng: 106.73,
  }),
  zoom: 12,
})

// Reactive data
const mapContainer = ref<HTMLElement>()
const isLoading = ref(true)
let map: InstanceType<typeof window.google.maps.Map> | null = null
let markers: InstanceType<typeof window.google.maps.Marker>[] = []

// Initialize Google Maps
const initMap = () => {
  console.log('Initializing Google Maps...')
  if (!mapContainer.value) {
    console.error('Map container not found')
    return
  }

  console.log('Creating Google Maps instance...')
  // Create map
  map = new window.google.maps.Map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    styles: [
      {
        featureType: 'all',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#f5f5f5',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#e0f2fe',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#666666',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#666666',
          },
        ],
      },
    ],
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  })

  // Add markers
  addMarkers()

  isLoading.value = false
}

// Watch for changes in locations prop
watch(
  () => props.locations,
  () => {
    if (map) {
      addMarkers()
    }
  },
  { deep: true }
)

// Add markers to map
const addMarkers = () => {
  if (!map) return

  // Clear existing markers
  markers.forEach((marker) => marker.setMap(null))
  markers = []

  props.locations.forEach((location) => {
    let markerIcon = ''
    let markerColor = '#22c55e' // Default green

    // Set icon and color based on type
    switch (location.type) {
      case 'branch':
        markerIcon =
          'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
        markerColor = '#8B4513' // Brown for branches
        break
      case 'competitor':
        markerIcon =
          'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
        markerColor = '#f97316' // Orange for competitors
        break
      case 'landmark':
        markerIcon =
          'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
        markerColor = '#8b5cf6' // Purple for landmarks
        break
    }

    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.name,
      icon: {
        path: markerIcon,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24),
      },
    })

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-gray-800 text-sm">${location.name}</h3>
          <p class="text-xs text-gray-600 mt-1">${location.address}</p>
        </div>
      `,
    })

    // Add click listener
    marker.addListener('click', () => {
      infoWindow.open(map, marker)
    })

    markers.push(marker)
  })
}

// Load Google Maps script
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    // Check if API key exists
    // const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    // Ganti ini:
// const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Menjadi seperti ini (untuk sementara):
    const apiKey = "AIzaSyCuo89YsWYELNjNkv04h1QS7PMzVC_Wcso";
    console.log('API Key loaded:', apiKey ? 'Yes' : 'No')
    if (!apiKey) {
      console.error(
        'Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file',
      )
      reject(new Error('API key not found'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log('Google Maps script loaded successfully')
      console.log('Google Maps API available:', !!window.google?.maps)
      resolve()
    }
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error)
      reject(new Error('Failed to load Google Maps'))
    }

    document.head.appendChild(script)
  })
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Component mounted, starting Google Maps load...')
  try {
    await loadGoogleMapsScript()
    console.log('Google Maps script loaded, initializing map...')
    initMap()
  } catch (error) {
    console.error('Error loading Google Maps:', error)
    showErrorMessage()
  }
})

// Show error message
const showErrorMessage = () => {
  if (!mapContainer.value) return

  mapContainer.value.innerHTML = `
    <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div class="text-center p-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Ups! Ada sesuatu yang salah.</h3>
        <p class="text-gray-600 mb-4">Halaman ini tidak memuat Google Maps dengan benar.</p>
        <p class="text-sm text-gray-500">Lihat konsol JavaScript untuk mengetahui detail teknisnya.</p>
        <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p class="text-sm text-yellow-800">
            <strong>Solusi:</strong> Pastikan Anda telah menambahkan Google Maps API key ke file .env
          </p>
        </div>
      </div>
    </div>
  `

  isLoading.value = false
}

onUnmounted(() => {
  // Clean up markers
  markers.forEach((marker) => marker.setMap(null))
})
</script>

<style scoped>
/* Custom styles for the map container */
iframe {
  border-radius: 0.5rem;
}
</style>
