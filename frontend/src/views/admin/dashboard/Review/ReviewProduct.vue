<template>
  <div class="p-8 space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-800">Review Produk</h1>
      <p class="text-gray-600 mt-2">Klik pada salah satu produk di tabel untuk melihat ulasannya.</p>
    </div>

    <!-- [PERUBAHAN]: Ganti spinner dengan Skeleton Table -->
    <div v-if="isLoadingList">
      <SkeletonProductTable />
    </div>

    <!-- Tampilan Error (Tidak Berubah) -->
    <div v-else-if="listError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c..."></path></svg>
      <h3 class="text-lg font-medium text-red-800 mb-2">Gagal Memuat Data Produk</h3>
      <p class="text-red-600 mb-4">{{ listError }}</p>
      <button
        @click="loadProductVariantList"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Konten Halaman (Setelah data dimuat) -->
    <div v-else class="space-y-8">
      <!-- Tabel Produk (Tidak Berubah) -->
      <ProductReviewTable
        :variants="productVariantList"
        :active-product-id="selectedProductId"
        @product-clicked="handleProductClicked"
      />

      <!-- Bagian Ulasan -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center gap-3 mb-6">
           <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
           <h2 class="text-xl font-bold text-gray-800">
            Ulasan Produk 
            <span v-if="selectedProductName" class="text-gray-600 font-medium">
              untuk "{{ selectedProductName }}"
            </span>
            ({{ productReviews.length }})
          </h2>
        </div>
        
        <!-- [PERUBAHAN]: Ganti spinner dengan Skeleton Card (di-loop) -->
        <div v-if="isLoadingReviews" class="space-y-4">
          <SkeletonReviewCard v-for="n in 3" :key="n" />
        </div>

        <!-- Daftar Ulasan (Tidak Berubah) -->
        <div
          v-else-if="productReviews.length > 0"
          class="flex flex-col gap-4"
        >
          <CardReview v-for="review in productReviews" :key="review.ulasanId" :review="review" />
        </div>
        
        <!-- Ulasan Kosong / Pilih Produk (Tidak Berubah) -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ selectedProductId ? 'Belum Ada Ulasan' : 'Pilih Produk' }}
          </h3>
          <p class="text-gray-500">
            {{ selectedProductId ? 'Tidak ada ulasan ditemukan untuk produk ini.' : 'Silakan klik salah satu produk di tabel atas untuk melihat ulasannya.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue' 
import ProductReviewTable from './_components/DetailCardReview.vue' 
import CardReview from './_components/CardReview.vue'       
// --- [BARU] Impor komponen Skeleton ---
import SkeletonProductTable from './_components/SkeletonTableProduct.vue'
import SkeletonReviewCard from './_components/SkeletonCardReview.vue'
// ------------------------------------

import { 
  getProducts,
  getReviewsByProductId,
  type Produk, 
  type Ulasan,
  type ProductVariantRow
} from '@/services/productService'

// --- State Halaman (Tidak Berubah) ---
const isLoadingList = ref(true)      
const isLoadingReviews = ref(false)    
const productVariantList = ref<ProductVariantRow[]>([]) 
const productReviews = ref<Ulasan[]>([]) 
const listError = ref<string | null>(null)

// --- State Pilihan (Tidak Berubah) ---
const selectedProductId = ref<number | null>(null)
const selectedProductName = ref<string | null>(null)

// --- Methods ---

// loadProductVariantList (Tidak Berubah)
const loadProductVariantList = async () => {
  isLoadingList.value = true;
  listError.value = null;
  try {
    const response = await getProducts();
    productVariantList.value = response.data;
    
    if (productVariantList.value.length === 0) {
      listError.value = "Tidak ada produk yang bisa ditampilkan.";
    }
  } catch (err) {
    console.error("Gagal memuat daftar produk:", err);
    listError.value = "Gagal memuat data. Coba segarkan halaman.";
  } finally {
    isLoadingList.value = false;
  }
}

// handleProductClicked (Tidak Berubah)
const handleProductClicked = async (product: any) => {
  if (selectedProductId.value === product.produkId) {
    return;
  }
  
  selectedProductId.value = product.produkId;
  selectedProductName.value = product.namaProduk;

  isLoadingReviews.value = true;
  productReviews.value = []; 

  try {
    const response = await getReviewsByProductId(product.produkId);
    productReviews.value = response.data;
  } catch (err) {
    console.error(`Gagal memuat ulasan untuk ID ${product.produkId}:`, err);
  } finally {
    isLoadingReviews.value = false;
  }
}

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  loadProductVariantList()
})
</script>

