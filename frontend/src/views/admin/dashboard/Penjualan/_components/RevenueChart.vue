<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Pendapatan</h3>
    <div class="h-64 relative">
      <canvas ref="chartCanvas" width="400" height="256"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
// ✅ FIX 1: Import 'computed' dan 'watch' dari 'vue'
import { ref, onMounted, nextTick, watch, computed } from 'vue' 
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend)

// Interface mencocokkan output dari getSalesSummaryRevenue API
interface RevenueData {
  lokasi: string;
  totalPendapatan: number;
}

const props = defineProps<{
  revenueData: RevenueData[]; 
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const dataToWatch = computed(() => props.revenueData); // ✅ FIX 2: computed sekarang berada di scope yang benar

const createChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = dataToWatch.value;

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.lokasi), 
      datasets: [{
        label: 'Total Pendapatan',
        data: data.map(item => item.totalPendapatan),
        backgroundColor: '#BAB772',
        borderColor: '#a8a668',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            label: function(context) {
              const value = context.parsed.y as number; // ✅ Assertion sebagai number
              // ✅ FIX 4: Gunakan format NumberFormat langsung atau pastikan nilai bukan null/undefined
              return `Pendapatan: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6B7280' } },
        y: {
          type: 'linear',
          beginAtZero: true,
          grid: { color: '#E5E7EB' },
          ticks: {
            color: '#6B7280',
            // ✅ FIX 5: Terapkan formatCurrency pada callback ticks
            callback: function(value) {
                const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                // Pastikan value adalah number sebelum format
                if (typeof numericValue === 'number') {
                    return new Intl.NumberFormat('id-ID', { 
                        notation: 'compact', // Opsi untuk menampilkan 1K, 1M, dll.
                        maximumFractionDigits: 0 
                    }).format(numericValue);
                }
                return '';
            }
          }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  })
}

// Watcher untuk mengupdate chart ketika props.revenueData berubah
watch(dataToWatch, (newData) => {
    if (chartInstance) {
        chartInstance.data.labels = newData.map(item => item.lokasi);
        chartInstance.data.datasets[0].data = newData.map(item => item.totalPendapatan);
        chartInstance.update();
    } else if (newData.length > 0) {
        createChart();
    }
}, { deep: true, immediate: false });

onMounted(async () => {
  await nextTick();
  // Ini memastikan grafik dibuat saat data pertama kali dimuat
  if (dataToWatch.value.length > 0) {
      createChart();
  }
});

</script>