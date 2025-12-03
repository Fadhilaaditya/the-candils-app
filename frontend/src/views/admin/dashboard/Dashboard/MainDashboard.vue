<template>
  <div class="bg-gray-50 min-h-screen p-6 md:p-8 font-sans">
    <!-- Header Section -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
                Dashboard
            </h1>
            <p class="text-sm text-gray-500 mt-1">Selamat datang kembali, Admin! Berikut ringkasan performa bisnis Anda.</p>
        </div>
        <div class="mt-4 md:mt-0">
            <button class="bg-[#BAB772] hover:bg-[#a8a668] text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh Laporan
            </button>
        </div>
    </div>

    <SkeletonDashboard v-if="state.loading" />

    <div v-else-if="state.error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm text-red-700">
                    {{ state.error }}
                </p>
            </div>
        </div>
    </div>

    <div v-else class="space-y-8">
        
        <!-- BAGIAN 1: STATS CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LocationCard
                v-for="location in state.summaryCards"
                :key="location.lokasiId"
                :location="location"
            />
        </div>

        <!-- BAGIAN 2: MAIN CHARTS ROW -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Grafik Penjualan Harian (Lebar) -->
            <div class="lg:col-span-2">
                <GrafikCard :graph-data="state.dailySalesGraph" />
            </div>

            <!-- Pie Chart Kontribusi (Sempit) -->
            <div class="lg:col-span-1">
                <ProductSoldChart :summary-data="state.productContributionChart" />
            </div>
        </div>
        
        <!-- BAGIAN 3: CHARTS & POPULAR PRODUCTS -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Charts (Stacked Vertically) -->
            <div class="lg:col-span-2 flex flex-col gap-6">
                <!-- Grafik Pendapatan per Lokasi -->
                <RevenueChart :revenue-data="state.revenuePerLocationChart" />
                
                <!-- Diagram Tipe Pesanan -->
                <OrderTypeChart :summary-data="state.orderTypeChart" />
            </div>

            <!-- Right Column: List Produk Populer -->
            <div class="lg:col-span-1">
                <UlasanCard :reviews="state.productReviews" />
            </div>
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { 
    getDashboardSummaryData, 
    getProductsSoldChartData, 
    getProductReviewSalesSummary, 
    getSalesSummaryRevenue,
    getSalesByOrderTypeSummary 
} from '@/services/productService'; 
import type { 
    DashboardSummary, 
    ProductContributionSummary, 
    ProductReviewSalesSummary,
    RevenuePerLocation,
    ProductsSoldPerLocation,
    RevenuePerDay,
    SaleRevenueSummary,
    OrderTypeSummary
} from '@/services/productService';

// Import Components
import LocationCard from './_components/LocationCard.vue';
import UlasanCard from './_components/UlasanCard.vue';
import GrafikCard from './_components/GrafikCard.vue';
import RevenueChart from './_components/RevenueChart.vue'; 
import ProductSoldChart from './_components/ChartProductSold.vue'; 
import SkeletonDashboard from './_components/SkeletonDashboard.vue'; 
import OrderTypeChart from './_components/OrderTypeChart.vue'; 

// --- Interfaces untuk State Lokal ---

interface ProcessedGraphData {
    labels: string[]; 
    data: number[]; 
}

interface LocationCardData extends RevenuePerLocation, ProductsSoldPerLocation {}

interface DashboardState {
    loading: boolean;
    error: string | null;
    summaryCards: LocationCardData[];
    dailySalesGraph: ProcessedGraphData | null;
    productContributionChart: ProductContributionSummary[];
    revenuePerLocationChart: SaleRevenueSummary[];
    productReviews: ProductReviewSalesSummary[];
    orderTypeChart: OrderTypeSummary[];
    startDate: string;
    endDate: string;
}

const state = reactive<DashboardState>({
    loading: false,
    error: null,
    summaryCards: [],
    dailySalesGraph: null,
    productContributionChart: [],
    revenuePerLocationChart: [],
    productReviews: [],
    orderTypeChart: [],
    startDate: '',
    endDate: '',
});


// --- LOGIKA PENGOLAHAN DATA ---

const combineLocationSummary = (
    revenue: RevenuePerLocation[], 
    sold: ProductsSoldPerLocation[]
): LocationCardData[] => {
    const map = new Map<number, Partial<LocationCardData>>();

    revenue.forEach(item => {
        map.set(item.lokasiId, { 
            lokasiId: item.lokasiId,
            lokasi_name: item.lokasi_name,
            total_revenue: item.total_revenue
        });
    });

    sold.forEach(item => {
        const existing = map.get(item.lokasiId);
        if (existing) {
            map.set(item.lokasiId, { ...existing, total_products_sold: item.total_products_sold } as LocationCardData);
        }
    });

    return Array.from(map.values()) as LocationCardData[];
};

const prepareDailySalesGraph = (rawRevenueData: RevenuePerDay[], startDate?: string, endDate?: string): ProcessedGraphData => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const labels: string[] = [];
    const data: number[] = [];
    
    const revenueMap = new Map<string, number>();
    rawRevenueData.forEach(item => {
        const dateKey = item.pemesanan_date.split('T')[0];
        revenueMap.set(dateKey, parseFloat(item.total_revenue) || 0);
    });

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
    } else {
        // Default: 7 hari terakhir sampai hari ini
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 6);
    }

    // Loop dari start date sampai end date
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const dayIndex = d.getDay();
        const revenue = revenueMap.get(dateKey) || 0;

        labels.push(dayNames[dayIndex]);
        data.push(revenue);
    }

    return { labels, data };
};

// --- FETCH DATA UTAMA ---

const fetchData = async () => {
    state.loading = true;
    state.error = null;

    try {
        const [
            dashboardSummaryRes, 
            productContributionRes, 
            productReviewRes,
            revenueChartRes,
            orderTypeRes 
        ] = await Promise.all([
            getDashboardSummaryData(state.startDate, state.endDate),
            getProductsSoldChartData(state.startDate, state.endDate),
            getProductReviewSalesSummary(state.startDate, state.endDate),
            getSalesSummaryRevenue(state.startDate, state.endDate),
            getSalesByOrderTypeSummary(state.startDate, state.endDate) 
        ]);

        const summaryData = dashboardSummaryRes.data.data as DashboardSummary;
        
        state.summaryCards = combineLocationSummary(
            summaryData.revenuePerLocation, 
            summaryData.productsSoldPerLocation
        );
        state.dailySalesGraph = prepareDailySalesGraph(summaryData.revenuePerDay, state.startDate, state.endDate);

        state.productContributionChart = productContributionRes.data.data;
        state.productReviews = productReviewRes.data.data;
        state.revenuePerLocationChart = revenueChartRes.data.data;
        state.orderTypeChart = orderTypeRes.data.data;


    } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        state.error = err.message || 'Gagal terhubung ke server backend.';
    } finally {
        state.loading = false;
    }
};

onMounted(fetchData);
</script>