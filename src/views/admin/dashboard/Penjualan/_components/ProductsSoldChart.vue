<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Produk Terjual</h3>
    <div class="h-64">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ProductSoldData {
  productCode: string
  productName: string
  quantity: number
}

interface Props {
  initialData?: ProductSoldData[]
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => [],
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Default data
const productsSoldData = ref<ProductSoldData[]>([
  { productCode: 'BMK', productName: 'Bubur Manis Komplit', quantity: 24 },
  { productCode: 'ST', productName: 'Singkong Thailand', quantity: 21 },
  { productCode: 'UDT', productName: 'Ubi Duo Twin', quantity: 16 },
  { productCode: 'HHL', productName: 'Hijau Hitam Legenda', quantity: 24 },
  { productCode: 'SPL', productName: 'Singkong Premium Legenda', quantity: 21 },
  { productCode: 'UDT2', productName: 'Ubi Duo Twin Special', quantity: 16 },
  { productCode: 'MSM', productName: 'Mie Sapi Mantap', quantity: 16 },
])

const initChart = async () => {
  if (!chartCanvas.value) return

  await nextTick()

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: productsSoldData.value.map((item) => item.productCode),
      datasets: [
        {
          label: 'Jumlah Terjual',
          data: productsSoldData.value.map((item) => item.quantity),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: '#059669',
          hoverBorderColor: '#10B981',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            title: function (context: { dataIndex: number }[]) {
              const index = context[0].dataIndex
              return productsSoldData.value[index].productName
            },
            label: function (context: { parsed: { y: number } }) {
              return `Jumlah: ${context.parsed.y} unit`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#6B7280',
          },
        },
        y: {
          type: 'linear' as const,
          beginAtZero: true,
          grid: {
            color: '#E5E7EB',
          },
          ticks: {
            color: '#6B7280',
            stepSize: 5,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    },
  })
}

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data.labels = productsSoldData.value.map((item) => item.productCode)
    chartInstance.data.datasets[0].data = productsSoldData.value.map((item) => item.quantity)
    chartInstance.update('active')
  }
}

onMounted(() => {
  setTimeout(() => {
    initChart()
  }, 100)
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.length > 0) {
      productsSoldData.value = newData
      if (chartInstance) {
        updateChart()
      }
    }
  },
  { immediate: true },
)

watch(
  productsSoldData,
  () => {
    if (chartInstance) {
      updateChart()
    }
  },
  { deep: true },
)

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// Expose methods for parent component
defineExpose({
  updateChartData: (data: ProductSoldData[]) => {
    productsSoldData.value = data
  },
  getChartData: () => [...productsSoldData.value],
})
</script>
