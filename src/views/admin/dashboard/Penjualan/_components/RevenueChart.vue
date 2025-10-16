<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Pendapatan</h3>
    <div class="h-64 relative">
      <canvas ref="chartCanvas" width="400" height="256"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend)

interface RevenueData {
  location: string
  revenue: number
}

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Data sesuai gambar pertama
const revenueData = ref<RevenueData[]>([
  { location: 'Ciputat', revenue: 640000 },
  { location: 'Pamulang', revenue: 560000 },
  { location: 'Bukit Indah', revenue: 400000 },
])

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

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

  console.log('Creating RevenueChart with data:', revenueData.value)

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: revenueData.value.map(item => item.location),
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: revenueData.value.map(item => item.revenue),
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
            label: function(context) {
              return `Pendapatan: ${formatCurrency(context.parsed.y)}`
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
            callback: function(tickValue) {
              const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
              return formatCurrency(value)
            }
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

onMounted(async () => {
  console.log('RevenueChart mounted')
  await nextTick()
  
  // Try multiple times to ensure canvas is ready
  let attempts = 0
  const maxAttempts = 5
  
  const tryCreateChart = () => {
    attempts++
    console.log(`Attempt ${attempts} to create chart`)
    
    if (chartCanvas.value) {
      createChart()
    } else if (attempts < maxAttempts) {
      setTimeout(tryCreateChart, 100)
    } else {
      console.error('Failed to create chart after', maxAttempts, 'attempts')
    }
  }
  
  tryCreateChart()
})

// Expose methods
defineExpose({
  updateChartData: (data: RevenueData[]) => {
    revenueData.value = data
    if (chartInstance) {
      chartInstance.data.labels = data.map(item => item.location)
      chartInstance.data.datasets[0].data = data.map(item => item.revenue)
      chartInstance.update()
    }
  },
  getChartData: () => [...revenueData.value]
})
</script>