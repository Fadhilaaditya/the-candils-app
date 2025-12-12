<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
    <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-900">Kontribusi Produk</h3>
        <p class="text-sm text-gray-500">Persentase penjualan per item</p>
    </div>

    <div class="flex-grow relative min-h-[250px] flex items-center justify-center">
      <Pie v-if="dataToWatch && dataToWatch.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <span class="text-sm">Belum ada data kontribusi</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'; 
import type { ProductContributionSummary } from '@/services/productService'; // 🛑 GANTI JALUR INI!

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  summaryData: ProductContributionSummary[]; 
}>();

const dataToWatch = computed(() => props.summaryData);

// Palet warna yang lebih modern
const backgroundColors = [
  '#BAB772', // Primary
  '#D4D196', // Light Primary
  '#95925B', // Dark Primary
  '#E5E7EB', // Gray
  '#F59E0B', // Amber
  '#10B981', // Emerald
];

const chartData = computed(() => ({
  labels: dataToWatch.value.map(item => item.namaProduk), 
  datasets: [{
    label: 'Jumlah Terjual',
    data: dataToWatch.value.map(item => parseInt(item.total_quantity_sold)),
    backgroundColor: backgroundColors,
    hoverOffset: 8,
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        font: { size: 12 },
        color: '#374151',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      callbacks: {
        label: function(context: any) {
          const total = dataToWatch.value.reduce((sum, item) => sum + parseInt(item.total_quantity_sold), 0);
          const currentValue = context.raw;
          const percentage = ((currentValue / total) * 100).toFixed(1) + '%';
          return `${context.label}: ${currentValue} unit (${percentage})`;
        }
      }
    }
  },
  onClick: (event: any, elements: any) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const selectedProduct = dataToWatch.value[index];
      if (selectedProduct) {
        emit('product-click', selectedProduct.produkId);
      }
    }
  }
};

const emit = defineEmits<{
  (e: 'product-click', produkId: number): void
}>();
</script>