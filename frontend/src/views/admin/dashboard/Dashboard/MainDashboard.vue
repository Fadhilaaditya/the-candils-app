<template>
  <div class="bg-gray-50 min-h-screen p-6 md:p-8 font-sans">
    <!-- Header Section -->
    <div class="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">
                Dashboard
            </h1>
            <p class="text-sm text-gray-500 mt-1">Selamat datang kembali, Admin! Berikut ringkasan performa bisnis Anda.</p>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div class="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <input 
                    type="date" 
                    v-model="state.startDate"
                    :max="today"
                    class="border-none focus:ring-0 text-xs text-gray-600 bg-transparent p-1.5 w-28" 
                    placeholder="Mulai"
                />
                <span class="text-gray-400 text-xs px-1">-</span>
                <input 
                    type="date" 
                    v-model="state.endDate"
                    :min="state.startDate"
                    :max="today"
                    class="border-none focus:ring-0 text-xs text-gray-600 bg-transparent p-1.5 w-28"
                    placeholder="Selesai"
                />
            </div>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                <ProductSoldChart 
                    :summary-data="state.productContributionChart" 
                    @product-click="handleProductClick"
                />
            </div>
        </div>
        
        <!-- BAGIAN 3: CHARTS & POPULAR PRODUCTS -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Charts (Stacked Vertically) -->
            <div class="lg:col-span-2 flex flex-col gap-6">
                <!-- Grafik Pendapatan per Lokasi -->
                <RevenueChart 
                    :revenue-data="state.revenuePerLocationChart" 
                    @location-click="handleLocationClick"
                />
                
                <!-- Diagram Tipe Pesanan -->
                <!-- Diagram Tipe Pesanan -->
                <OrderTypeChart 
                    :summary-data="state.orderTypeChart" 
                    @order-type-click="handleOrderTypeClick"
                />
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
import { onMounted, reactive, watch } from 'vue';
// ... imports ...

// ... existing code ...

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
    selectedProductId: number | null;
    selectedLocationId: number | null;
    selectedOrderType: string | null;
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
    selectedProductId: null,
    selectedLocationId: null,
    selectedOrderType: null,
});

const today = new Date().toISOString().split('T')[0];


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
            getDashboardSummaryData(state.startDate, state.endDate, state.selectedProductId, state.selectedLocationId, state.selectedOrderType),
            getProductsSoldChartData(state.startDate, state.endDate, state.selectedLocationId, state.selectedProductId, state.selectedOrderType), 
            getProductReviewSalesSummary(state.startDate, state.endDate, state.selectedProductId, state.selectedLocationId, state.selectedOrderType),
            getSalesSummaryRevenue(state.startDate, state.endDate, state.selectedProductId, state.selectedLocationId, state.selectedOrderType),
            getSalesByOrderTypeSummary(state.startDate, state.endDate, state.selectedProductId, state.selectedLocationId, state.selectedOrderType) 
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

const handleProductClick = (produkId: number) => {
    if (state.selectedProductId === produkId) {
        state.selectedProductId = null; // Toggle off
    } else {
        state.selectedProductId = produkId; // Toggle on
    }
    fetchData();
};

const handleLocationClick = (lokasiId: number) => {
    if (state.selectedLocationId === lokasiId) {
        state.selectedLocationId = null; // Toggle off
    } else {
        state.selectedLocationId = lokasiId; // Toggle on
    }
    fetchData();
};

const handleOrderTypeClick = (orderType: string) => {
    if (state.selectedOrderType === orderType) {
        state.selectedOrderType = null; // Toggle off
    } else {
        state.selectedOrderType = orderType; // Toggle on
    }
    fetchData();
};

onMounted(fetchData);

watch(() => [state.startDate, state.endDate], () => {
    fetchData();
});
</script>