<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
    <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-900">Tipe Pesanan</h3>
        <p class="text-sm text-gray-500">Online vs Offline</p>
    </div>

    <div class="flex-grow relative min-h-[300px] flex items-center justify-center">
      <Bar v-if="dataToWatch && dataToWatch.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="text-sm">Belum ada data tipe pesanan</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'; 
import type { OrderTypeSummary } from '@/services/productService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  summaryData: OrderTypeSummary[]; 
}>();

const emit = defineEmits<{
  (e: 'order-type-click', orderType: string): void
}>();

const dataToWatch = computed(() => props.summaryData);

const chartData = computed(() => ({
  labels: dataToWatch.value.map(item => item.tipePesanan || 'Lainnya'), 
  datasets: [{
    label: 'Total Pendapatan',
    data: dataToWatch.value.map(item => parseFloat(item.total_revenue)),
    backgroundColor: [
      '#BAB772', // Primary
      '#E5E7EB', // Gray
    ],
    borderRadius: 6,
    barThickness: 40,
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // Hide legend for simple bar chart
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      callbacks: {
        label: function(context: any) {
          const currentValue = context.raw;
          const formattedValue = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(currentValue);
          return `${context.dataset.label}: ${formattedValue}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        callback: function(value: any) {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + ' jt';
          if (value >= 1000) return (value / 1000).toFixed(0) + ' rb';
          return value;
        }
      }
    },
    x: {
      grid: {
        display: false
      }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const selectedItem = dataToWatch.value[index];
        if (selectedItem) {
          emit('order-type-click', selectedItem.tipePesanan);
        }
      }
    }
  }
</script>
