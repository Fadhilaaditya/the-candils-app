<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Produk Terjual</h3>
    <div class="h-64 relative">
      <canvas ref="chartCanvas" width="400" height="256"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend)

// Interface mencocokkan output dari getSalesSummaryQuantity API
interface ProductSoldData {
  namaProduk: string;
  totalProdukTerjual: number;
}

const props = defineProps<{
  // Menerima data kuantitas per produk
  summaryData: ProductSoldData[]; 
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const dataToWatch = computed(() => props.summaryData);

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
      // ✅ Sumbu X (Label): Menggunakan singkatan produk (asumsi 3 huruf)
      labels: data.map(item => item.namaProduk.substring(0, 3).toUpperCase()), 
      datasets: [{
        label: 'Jumlah Terjual',
        // ✅ Sumbu Y (Data): Menggunakan totalProdukTerjual
        data: data.map(item => item.totalProdukTerjual),
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
            // Menampilkan nama produk lengkap di tooltip
            title: function(context) {
              const index = context[0].dataIndex
              return data[index].namaProduk
            },
            label: function(context) {
              return `Jumlah: ${context.parsed.y} unit`
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
          type: 'linear',
          beginAtZero: true,
          grid: { color: '#E5E7EB' },
          ticks: {
            color: '#6B7280',
            stepSize: 5 
          }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  })
}

// Watcher untuk mengupdate chart ketika props.summaryData berubah
watch(dataToWatch, (newData) => {
    if (chartInstance) {
        chartInstance.data.labels = newData.map(item => item.namaProduk.substring(0, 3).toUpperCase());
        chartInstance.data.datasets[0].data = newData.map(item => item.totalProdukTerjual);
        chartInstance.update();
    } else if (newData.length > 0) {
        createChart();
    }
}, { deep: true, immediate: false }); 

onMounted(async () => {
  await nextTick();
  if (dataToWatch.value.length > 0) {
      createChart();
  }
})
</script>