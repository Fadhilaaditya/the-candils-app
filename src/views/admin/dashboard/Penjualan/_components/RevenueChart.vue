<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Pendapatan</h3>
    <div class="h-64">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RevenueData {
  location: string
  revenue: number
}

interface Props {
  initialData?: RevenueData[]
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => [],
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Default data
const revenueData = ref<RevenueData[]>([
  { location: 'Ciputat', revenue: 640000 },
  { location: 'Pamulang', revenue: 520000 },
  { location: 'Bukit Indah', revenue: 380000 },
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
      labels: revenueData.value.map((item) => item.location),
      datasets: [
        {
          label: 'Pendapatan (Rp)',
          data: revenueData.value.map((item) => item.revenue),
          backgroundColor: '#BAB772',
          borderColor: '#a8a668',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: '#959253',
          hoverBorderColor: '#BAB772',
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
            label: function (context: { parsed: { y: number } }) {
              return `Pendapatan: ${formatCurrency(context.parsed.y)}`
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
            callback: function (tickValue: string | number) {
              const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
              return formatCurrency(value)
            },
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
    chartInstance.data.labels = revenueData.value.map((item) => item.location)
    chartInstance.data.datasets[0].data = revenueData.value.map((item) => item.revenue)
    chartInstance.update('active')
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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
      revenueData.value = newData
      if (chartInstance) {
        updateChart()
      }
    }
  },
  { immediate: true },
)

watch(
  revenueData,
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
  updateChartData: (data: RevenueData[]) => {
    revenueData.value = data
  },
  getChartData: () => [...revenueData.value],
})
</script>
