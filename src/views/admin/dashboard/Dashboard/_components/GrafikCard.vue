<template>
  <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">Grafik Penjualan Produk</h2>
      <div class="flex gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Dari</label>
          <input
            type="date"
            v-model="dateRange.from"
            @change="handleDateChange"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#BAB772]"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Sampai</label>
          <input
            type="date"
            v-model="dateRange.to"
            @change="handleDateChange"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#BAB772]"
          />
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="h-80 bg-gray-50 rounded-lg p-4">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface SalesData {
  day: string
  sales: number
}

interface DateRange {
  from: string
  to: string
}

interface Props {
  initialData?: SalesData[]
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => [],
})

// Emit events for parent component
const emit = defineEmits<{
  dateChange: [dateRange: DateRange]
}>()

// Chart reference
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Date range for chart
const dateRange = reactive<DateRange>({
  from: '',
  to: '',
})

// Sales chart data - ready for API integration
const salesChartData = ref<SalesData[]>([
  { day: 'Senin', sales: 120000 },
  { day: 'Selasa', sales: 180000 },
  { day: 'Rabu', sales: 220000 },
  { day: 'Kamis', sales: 280000 },
  { day: 'Jumat', sales: 350000 },
  { day: 'Sabtu', sales: 520000 },
  { day: 'Minggu', sales: 480000 },
])

// Initialize chart
const initChart = async () => {
  if (!chartCanvas.value) return

  await nextTick()

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Create new chart with proper configuration
  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: salesChartData.value.map((day) => day.day),
      datasets: [
        {
          label: 'Penjualan (Rp)',
          data: salesChartData.value.map((day) => day.sales),
          backgroundColor: '#BAB772',
          borderColor: '#a8a668',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: '#a8a668',
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
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#BAB772',
          borderWidth: 1,
          callbacks: {
            label: function (context: { parsed: { y: number } }) {
              return `Penjualan: ${formatCurrency(context.parsed.y)}`
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
            color: '#6b7280',
            font: {
              size: 12,
            },
          },
        },
        y: {
          type: 'linear',
          beginAtZero: true,
          grid: {
            color: '#e5e7eb',
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 12,
            },
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

// Update chart data
const updateChart = () => {
  if (chartInstance) {
    chartInstance.data.labels = salesChartData.value.map((day) => day.day)
    chartInstance.data.datasets[0].data = salesChartData.value.map((day) => day.sales)
    chartInstance.update('active')
  }
}

// Handle date change and emit to parent
const handleDateChange = () => {
  emit('dateChange', { ...dateRange })
}

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Set default date range (last 7 days)
onMounted(() => {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  dateRange.to = today.toISOString().split('T')[0]
  dateRange.from = weekAgo.toISOString().split('T')[0]

  // Initialize chart after component is mounted
  setTimeout(() => {
    initChart()
  }, 100)
})

// Watch for prop changes to update chart data
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.length > 0) {
      salesChartData.value = newData
      if (chartInstance) {
        updateChart()
      }
    }
  },
  { immediate: true },
)

// Watch for sales data changes to update chart
watch(
  salesChartData,
  () => {
    if (chartInstance) {
      updateChart()
    }
  },
  { deep: true },
)

// Cleanup chart on component unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// Expose methods for parent component
defineExpose({
  updateChartData: (data: SalesData[]) => {
    salesChartData.value = data
  },
  getDateRange: () => ({ ...dateRange }),
  refreshChart: () => {
    updateChart()
  },
})
</script>
