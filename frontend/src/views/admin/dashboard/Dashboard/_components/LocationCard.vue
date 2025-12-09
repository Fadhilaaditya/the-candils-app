<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 group">
    <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
            <div class="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate max-w-[150px]">
                {{ location.lokasi_name }}
            </h3>
        </div>
    </div>
    
    <div class="flex flex-col">
        <span class="text-xs text-gray-400 font-medium mb-1">Total Pendapatan</span>
        <p class="text-3xl font-bold text-gray-900 tracking-tight">
            {{ formatCurrency(location.total_revenue) }}
        </p>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <span class="text-sm text-gray-500">Produk Terjual</span>
        <span class="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
            {{ location.total_products_sold }} Unit
        </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import type { RevenuePerLocation, ProductsSoldPerLocation } from '@/services/productService';

interface LocationCardData extends RevenuePerLocation, ProductsSoldPerLocation {}

defineProps({
  location: {
    type: Object as () => LocationCardData,
    required: true
  }
});

const formatCurrency = (value: string) => {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return "Rp 0";
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numericValue);
};
</script>