<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Overview</h1>
    </div>

    <!-- Location Performance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <LocationCard v-for="location in locationData" :key="location.id" :location="location" />
    </div>

    <!-- Charts and Reviews Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sales Graph -->
      <GrafikCard
        ref="grafikCardRef"
        :initial-data="salesChartData"
        @date-change="handleDateChange"
      />

      <!-- Product Reviews -->
      <UlasanCard
        ref="ulasanCardRef"
        :initial-data="productReviews"
        @details-click="handleDetailsClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LocationCard from './_components/LocationCard.vue'
import GrafikCard from './_components/GrafikCard.vue'
import UlasanCard from './_components/UlasanCard.vue'
import {
  DashboardDataService,
  type LocationData,
  type SalesData,
  type ProductReview,
  type DateRange,
} from './data/dashboardData'

// Component name for linter
defineOptions({
  name: 'AdminDashboard',
})

// Component refs for direct access
const grafikCardRef = ref<InstanceType<typeof GrafikCard> | null>(null)
const ulasanCardRef = ref<InstanceType<typeof UlasanCard> | null>(null)

// Reactive data
const locationData = ref<LocationData[]>([])
const salesChartData = ref<SalesData[]>([])
const productReviews = ref<ProductReview[]>([])

// Handle date change from GrafikCard
const handleDateChange = async (dateRange: DateRange) => {
  try {
    const newChartData = await DashboardDataService.fetchSalesChartData(dateRange)
    salesChartData.value = newChartData

    // Update the chart component directly
    if (grafikCardRef.value) {
      grafikCardRef.value.updateChartData(newChartData)
    }
  } catch (error) {
    console.error('Error updating chart data:', error)
  }
}

// Handle details click from UlasanCard
const handleDetailsClick = (review: ProductReview) => {
  console.log('Product review details clicked:', review)
  // TODO: Implement navigation to product details page
  // router.push(`/admin/dashboard/products/${review.id}`)
}

// Load initial data
const loadDashboardData = async () => {
  try {
    // Load all data in parallel for better performance
    const [locationDataResult, salesDataResult, reviewsResult] = await Promise.all([
      DashboardDataService.fetchLocationData(),
      DashboardDataService.fetchSalesChartData({ from: '', to: '' }),
      DashboardDataService.fetchProductReviews(),
    ])

    locationData.value = locationDataResult
    salesChartData.value = salesDataResult
    productReviews.value = reviewsResult
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

// Refresh specific data sections
const refreshLocationData = async () => {
  try {
    const newData = await DashboardDataService.fetchLocationData()
    locationData.value = newData
  } catch (error) {
    console.error('Error refreshing location data:', error)
  }
}

const refreshSalesData = async () => {
  try {
    if (grafikCardRef.value) {
      const dateRange = grafikCardRef.value.getDateRange()
      const newData = await DashboardDataService.fetchSalesChartData(dateRange)
      salesChartData.value = newData
      grafikCardRef.value.updateChartData(newData)
    }
  } catch (error) {
    console.error('Error refreshing sales data:', error)
  }
}

const refreshReviewsData = async () => {
  try {
    const newData = await DashboardDataService.fetchProductReviews()
    productReviews.value = newData

    if (ulasanCardRef.value) {
      ulasanCardRef.value.updateReviews(newData)
    }
  } catch (error) {
    console.error('Error refreshing reviews data:', error)
  }
}

// Initialize dashboard
onMounted(() => {
  loadDashboardData()
})

// Expose refresh methods for parent component
defineExpose({
  refreshAll: loadDashboardData,
  refreshLocations: refreshLocationData,
  refreshSales: refreshSalesData,
  refreshReviews: refreshReviewsData,
})
</script>
