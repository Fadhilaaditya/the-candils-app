<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h3 class="text-lg font-bold text-gray-900">Pendapatan per Lokasi</h3>
            <p class="text-sm text-gray-500">Perbandingan performa antar cabang</p>
        </div>
        <button class="text-gray-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
        </button>
    </div>
    
    <div class="h-64 relative w-full">
      <Bar v-if="dataToWatch && dataToWatch.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="text-sm">Tidak ada data pendapatan lokasi</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs'; // Komponen Vue Wrapper
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; 
import type { SaleRevenueSummary } from '@/services/productService'; // 🛑 GANTI JALUR INI!

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  revenueData: SaleRevenueSummary[]; 
}>();

const dataToWatch = computed(() => props.revenueData);

// Warna Baru: Biru/Indigo
const BAR_COLOR = '#BAB772';

const formatRupiahCompact = (value: number) => {
    return new Intl.NumberFormat('id-ID', { 
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value);
};

const chartData = computed(() => ({
  labels: dataToWatch.value.map(item => item.lokasi), 
  datasets: [{
    label: 'Total Pendapatan',
    data: dataToWatch.value.map(item => item.totalPendapatan),
    backgroundColor: BAR_COLOR,
    borderColor: BAR_COLOR,
    borderWidth: 0,
    borderRadius: 6,
    borderSkipped: false,
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      callbacks: {
        label: function(context: any) {
          const value = context.parsed.y as number;
          return `Pendapatan: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}`;
        }
      }
    }
  },
  scales: {
    x: { 
      grid: { display: false }, 
      ticks: { color: '#6B7280' } 
    },
    y: {
      type: 'linear' as const, 
      beginAtZero: true,
      grid: { color: '#E5E7EB' },
      ticks: {
        color: '#6B7280',
        callback: function(value: any) {
            return formatRupiahCompact(parseFloat(value));
        }
      }
    }
  },
  interaction: { intersect: false, mode: 'index' as const },
  onClick: (event: any, elements: any) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const selectedLocation = dataToWatch.value[index];
      if (selectedLocation) {
        emit('location-click', selectedLocation.lokasiId);
      }
    }
  }
};

const emit = defineEmits<{
  (e: 'location-click', lokasiId: number): void
}>();
</script>