<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-lg font-bold text-gray-900">Grafik Penjualan Harian</h3>
        <p class="text-sm text-gray-500">Tren pendapatan dalam 7 hari terakhir</p>
      </div>
      <div class="flex items-center space-x-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
        <!-- Buttons removed as per request -->
      </div>
    </div>

    <div v-if="graphData && graphData.data.length > 0" class="h-[350px] w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <span class="text-sm font-medium">Belum ada data penjualan</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GraphData {
    labels: string[]; 
    data: number[]; 
}

const props = defineProps<{
  graphData: GraphData | null;
}>();

// Warna Baru: Biru/Indigo (Lebih Modern)
const ACCENT_COLOR = '#BAB772'; // Primary Color
const FILL_COLOR = 'rgba(186, 183, 114, 0.3)'; // Primary with opacity

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const chartData = computed(() => ({
  labels: props.graphData?.labels || [],
  datasets: [
    {
      label: 'Omset Harian',
      data: props.graphData?.data || [],
      borderColor: ACCENT_COLOR, // Warna garis utama
      tension: 0.4,
      fill: true,
      backgroundColor: FILL_COLOR, // Warna area bawah garis
      pointBackgroundColor: ACCENT_COLOR,
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
      pointHoverBackgroundColor: ACCENT_COLOR,
    }
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (context.parsed.y !== null) {
                    label += `: ${formatRupiah(context.parsed.y)}`;
                }
                return label;
            }
        }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f3f4f6' }, // Garis grid yang sangat tipis
      ticks: {
          color: '#6b7280',
          callback: function(value: any) {
              const numericValue = parseFloat(value);
              return new Intl.NumberFormat('id-ID', {
                  notation: 'compact',
                  maximumFractionDigits: 0
              }).format(numericValue);
          }
      },
    },
    x: {
        grid: { display: false },
        ticks: { color: '#6b7280' }
    }
  },
};
</script>