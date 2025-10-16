<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Pendapatan</h3>
    <div class="h-64 relative">
      <Bar
        v-if="props.revenueData && props.revenueData.length"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
// 'Bar' sekarang akan terpakai di template
import { Bar } from 'vue-chartjs';
import type { TooltipItem } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RevenueData {
  location: string;
  total: number | null;
}

const props = defineProps<{
  revenueData: RevenueData[]
}>();

const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// 'chartData' sekarang akan terpakai di template
const chartData = computed(() => ({
  labels: props.revenueData.map(item => item.location),
  datasets: [{
    label: 'Pendapatan (Rp)',
    data: props.revenueData.map(item => item.total ?? 0),
    backgroundColor: '#BAB772',
    borderColor: '#a8a668',
    borderWidth: 2,
    borderRadius: 8,
    borderSkipped: false,
  }]
}));

// 'chartOptions' sekarang akan terpakai di template
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      callbacks: {
        label: function(context: TooltipItem<'bar'>) {
          const value = context.parsed.y ?? 0;
          return `Pendapatan: ${formatCurrency(value)}`;
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
      beginAtZero: true,
      grid: {
        color: '#E5E7EB'
      },
      ticks: {
        color: '#6B7280',
        callback: function(tickValue: string | number) {
          const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
          return !isNaN(value) ? formatCurrency(value) : '';
        }
      }
    }
  }
};
</script>
