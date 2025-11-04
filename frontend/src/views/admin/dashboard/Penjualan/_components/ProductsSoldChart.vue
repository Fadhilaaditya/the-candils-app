<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Produk Terjual</h3>
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

interface ProductSoldData {
  productCode: string
  productName: string
  quantity: number
}

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Data sesuai gambar pertama
const productsSoldData = ref<ProductSoldData[]>([
  { productCode: 'BMK', productName: 'Bubur Manis Komplit', quantity: 25 },
  { productCode: 'ST', productName: 'Singkong Thailand', quantity: 22 },
  { productCode: 'UDT', productName: 'Ubi Duo Twin', quantity: 15 },
  { productCode: 'HHL', productName: 'Hijau Hitam Legenda', quantity: 25 },
  { productCode: 'SPL', productName: 'Singkong Premium Legenda', quantity: 22 },
  { productCode: 'UDT2', productName: 'Ubi Duo Twin Special', quantity: 15 },
  { productCode: 'MSM', productName: 'Mie Sapi Mantap', quantity: 15 },
])

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

  console.log('Creating ProductsSoldChart with data:', productsSoldData.value)

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: productsSoldData.value.map(item => item.productCode),
      datasets: [{
        label: 'Jumlah Terjual',
        data: productsSoldData.value.map(item => item.quantity),
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
              return productsSoldData.value[index].productName
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

onMounted(async () => {
  console.log('ProductsSoldChart mounted')
  await nextTick()
  
  // Try multiple times to ensure canvas is ready
  let attempts = 0
  const maxAttempts = 5
  
  const tryCreateChart = () => {
    attempts++
    console.log(`Attempt ${attempts} to create ProductsSoldChart`)
    
    if (chartCanvas.value) {
      createChart()
    } else if (attempts < maxAttempts) {
      setTimeout(tryCreateChart, 100)
    } else {
      console.error('Failed to create ProductsSoldChart after', maxAttempts, 'attempts')
    }
  }
  
  tryCreateChart()
})

// Expose methods
defineExpose({
  updateChartData: (data: ProductSoldData[]) => {
    productsSoldData.value = data
    if (chartInstance) {
      chartInstance.data.labels = data.map(item => item.productCode)
      chartInstance.data.datasets[0].data = data.map(item => item.quantity)
      chartInstance.update()
    }
  },
  getChartData: () => [...productsSoldData.value]
})
</script>