<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Produk Terjual</h3>
    <div class="h-64 relative">
      <canvas ref="chartCanvas" width="400" height="256"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue' // ✅ FIX 1: Tambah 'computed'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend)

// Interface mencocokkan output dari getSalesSummary API
interface ProductSoldData {
  lokasi: string;
  totalPendapatan: number;
  totalProdukTerjual: number; 
}

const props = defineProps<{
  summaryData: ProductSoldData[]; 
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Data diubah menjadi computed agar bereaksi terhadap props
const productsSoldData = computed(() => props.summaryData); // ✅ FIX 1: 'computed' sekarang dikenali

const createChart = () => {
  if (!chartCanvas.value) {
    console.error('Chart canvas not found')
    return
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) {
    console.error('Cannot get 2D context')
    return
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const data = productsSoldData.value;

  console.log('Creating ProductsSoldChart with dynamic data:', data);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      // ✅ FIX 2: Terapkan tipe ProductSoldData pada item
      labels: data.map((item: ProductSoldData) => item.lokasi), 
      datasets: [{
        label: 'Jumlah Terjual',
        // ✅ FIX 2: Terapkan tipe ProductSoldData pada item
        data: data.map((item: ProductSoldData) => item.totalProdukTerjual),
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
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            title: function(context) {
              const index = context[0].dataIndex
              return data[index].lokasi
            },
            label: function(context) {
              return `Jumlah: ${context.parsed.y} unit`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6B7280'
          }
        },
        y: {
          type: 'linear',
          beginAtZero: true,
          grid: {
            color: '#E5E7EB'
          },
          ticks: {
            color: '#6B7280',
            stepSize: 5 
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

// Watcher untuk mengupdate chart ketika props.summaryData berubah
watch(productsSoldData, (newData) => {
    if (chartInstance) {
        // ✅ FIX 2: Terapkan tipe ProductSoldData pada item
        chartInstance.data.labels = newData.map((item: ProductSoldData) => item.lokasi);
        // ✅ FIX 2: Terapkan tipe ProductSoldData pada item
        chartInstance.data.datasets[0].data = newData.map((item: ProductSoldData) => item.totalProdukTerjual);
        chartInstance.update();
    } else {
        createChart();
    }
}, { deep: true, immediate: false }); 

onMounted(async () => {
  console.log('ProductsSoldChart mounted')
  await nextTick()
  
  if (productsSoldData.value.length > 0) {
      createChart();
  }
})

// Expose methods 
defineExpose({
  updateChartData: (data: ProductSoldData[]) => {
    // Digantikan oleh watcher, tapi dipertahankan untuk kompatibilitas
    if (chartInstance) {
      chartInstance.data.labels = data.map(item => item.lokasi)
      chartInstance.data.datasets[0].data = data.map(item => item.totalProdukTerjual)
      chartInstance.update()
    }
  },
  getChartData: () => [...productsSoldData.value]
})
</script>