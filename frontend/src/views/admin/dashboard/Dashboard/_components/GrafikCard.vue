<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Grafik Penjualan Produk</h3>
      <div class="flex space-x-2">
        <input type="text" placeholder="dd/mm/yyyy" class="text-sm border rounded px-2 py-1 w-28">
        <input type="text" placeholder="dd/mm/yyyy" class="text-sm border rounded px-2 py-1 w-28">
      </div>
    </div>

    <div style="height: 300px;">
      <Line v-if="graphData" :data="chartData" :options="chartOptions" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
// 1. Import komponen Line dan elemen-elemen yang dibutuhkan dari Chart.js
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

// 2. Daftarkan elemen-elemen Chart.js
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

// Terima props seperti sebelumnya
const props = defineProps<{
  graphData: {
    labels: string[];
    data: number[];
  }
}>();

// 3. Siapkan data dalam format yang dimengerti oleh Chart.js
const chartData = computed(() => ({
  labels: props.graphData.labels,
  datasets: [
    {
      label: 'Omset Harian',
      data: props.graphData.data,
      borderColor: '#BAB772',
      tension: 0.4,
      fill: true,
      backgroundColor: '#BAB772',
      pointBackgroundColor: '#BAB772',
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#BAB772',
    }
  ],
}));

// 4. Atur opsi tambahan untuk grafik (opsional)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Menyembunyikan label dataset di atas grafik
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

</script>
