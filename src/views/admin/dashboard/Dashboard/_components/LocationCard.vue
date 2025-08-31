<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="bg-[#BAB772] text-white px-6 py-4">
      <h3 class="text-lg font-semibold">{{ location.name }}</h3>
    </div>
    <div class="p-6 bg-gray-50">
      <div class="space-y-3">
        <div>
          <p class="text-sm text-gray-600">Omset Harian</p>
          <p class="text-2xl font-bold text-gray-800">
            {{ formatCurrency(location.dailyRevenue) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Produk Terjual</p>
          <p class="text-xl font-semibold text-gray-800">{{ location.productsSold }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LocationData {
  id: number
  name: string
  dailyRevenue: number
  productsSold: number
}

interface Props {
  location: LocationData
}

const props = defineProps<Props>()

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
