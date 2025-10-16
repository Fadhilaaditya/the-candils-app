<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-gray-500 text-sm font-medium">{{ location.name }}</h3>
    <p class="text-2xl font-bold text-gray-800 mt-2">
      Rp {{ formatCurrency(location.dailyRevenue) }}
    </p>
    <p class="text-gray-500 text-sm mt-1">
      Produk Terjual: <span class="font-semibold text-gray-600">{{ location.productsSold }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// Define props to accept location data
defineProps({
  location: {
    type: Object,
    required: true
  }
});

// Helper function to format number into currency string
const formatCurrency = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
</script>
