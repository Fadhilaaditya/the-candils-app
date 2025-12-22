<template>
  <div class="p-8 space-y-8">

    <!-- Konten Kondisional (Table, Error, atau Skeleton) -->
    <div class="space-y-8">

      <!-- Tampilan Loading (Skeleton Table) -->
      <!-- Menggunakan v-if untuk mengganti komponen Card utama saat loading -->
      <div v-if="isLoadingList" class="bg-white rounded-xl shadow-lg p-6">
        
        <!-- Header di sini, selalu terlihat di dalam card (Static) -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Review Produk</h2>
            <p class="text-gray-600 mt-1">Klik pada salah satu produk di tabel untuk melihat ulasannya.</p>
          </div>
        </div>
        
        <!-- Area Skeleton (Menggantikan Tabel) -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <!-- Header Kolom Tabel (Placeholder) -->
              <tr>
                <th v-for="i in 6" :key="i" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <!-- Baris Skeleton (Komponen) -->
            <SkeletonProductTable />
          </table>
        </div>
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

      <!-- Konten Halaman (Data Real) -->
      <div v-else class="space-y-8">
        
        <!-- Tabel Produk (Diisi melalui slot) -->
        <ProductReviewTable
          :variants="productVariantList"
          :active-product-id="selectedProductId"
          @product-clicked="handleProductClicked"
        >
          <!-- Mengirim Header ke SLOT di ProductReviewTable -->
          <template v-slot:header>
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">Review Produk</h2>
                <p class="text-gray-600 mt-1">Klik pada salah satu produk di tabel untuk melihat ulasannya.</p>
              </div>
            </div>
          </template>
        </ProductReviewTable>

        <!-- Bagian Ulasan (Review Cards) -->
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
          
          <div v-if="isLoadingReviews" class="space-y-4">
            <SkeletonReviewCard v-for="n in 3" :key="n" />
          </div>

          <div
            v-else-if="productReviews.length > 0"
            class="flex flex-col gap-4"
          >
            <!-- Rating Summary Component -->
            <ReviewSummary 
              :reviews="productReviews" 
              :selected-rating="selectedFilterRating"
              @filter-rating="handleFilterRating"
            />

            <CardReview 
              v-for="review in paginatedReviews" 
              :key="review.ulasanId" 
              :review="review" 
              @delete-review="handleDeleteReview"
            />
            
            <!-- Pagination Controls -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="text-sm text-gray-600">
                Halaman <span class="font-medium">{{ currentPage }}</span> dari <span class="font-medium">{{ totalPages }}</span>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages || totalPages === 0"
                  class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue' 
import { useRoute } from 'vue-router' 
import ProductReviewTable from './_components/DetailCardReview.vue' 
import CardReview from './_components/CardReview.vue'       
import SkeletonProductTable from './_components/SkeletonTableProduct.vue'
import SkeletonReviewCard from './_components/SkeletonCardReview.vue'
import ReviewSummary from './_components/ReviewSummary.vue'

import { 
  getProducts,
  getReviewsByProductId,
  deleteReview,
  type Produk, 
  type Ulasan,
  type ProductVariantRow
} from '@/services/productService'

// --- State Halaman ---
const isLoadingList = ref(true)      
const isLoadingReviews = ref(false)    
const productVariantList = ref<ProductVariantRow[]>([]) 
const productReviews = ref<Ulasan[]>([]) 
const listError = ref<string | null>(null)

// --- State Pilihan ---
const selectedProductId = ref<number | null>(null)
const selectedProductName = ref<string | null>(null)
const selectedFilterRating = ref<number | null>(null)

// --- State Pagination ---
const currentPage = ref(1)
const itemsPerPage = 10

// --- Computed Pagination ---
import { computed } from 'vue'

const totalPages = computed(() => {
  const count = selectedFilterRating.value 
    ? productReviews.value.filter(r => r.rating === selectedFilterRating.value).length
    : productReviews.value.length
  return Math.ceil(count / itemsPerPage)
})

const filteredReviews = computed(() => {
  if (selectedFilterRating.value === null) {
    return productReviews.value
  }
  return productReviews.value.filter(review => review.rating === selectedFilterRating.value)
})

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredReviews.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// --- Methods ---

const loadProductVariantList = async () => {
  isLoadingList.value = true;
  listError.value = null;
  try {
    // 1. Ambil data produk (semua varian)
    // Fetch a large number of items to ensure we get all variants for client-side grouping
    const productResponse = await getProducts(1, 1000);
    const allVariants = productResponse.data.data; // Akses .data lagi

    // 2. Filter unik berdasarkan produkId (karena 1 produk bisa banyak varian ukuran)
    const uniqueProductsMap = new Map();
    allVariants.forEach((variant: any) => {
      if (!uniqueProductsMap.has(variant.produkId)) {
        uniqueProductsMap.set(variant.produkId, variant);
      }
    });
    productVariantList.value = Array.from(uniqueProductsMap.values());
    
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

const handleProductClicked = async (product: any) => {
  if (selectedProductId.value === product.produkId) {
    return;
  }
  
  selectedProductId.value = product.produkId;
  selectedProductName.value = product.namaProduk;

  isLoadingReviews.value = true;
  productReviews.value = []; 
  selectedFilterRating.value = null; // Reset filter saat ganti produk
  currentPage.value = 1; // Reset pagination 

  try {
    const response = await getReviewsByProductId(product.produkId);
    productReviews.value = response.data;
  } catch (err) {
    console.error(`Gagal memuat ulasan untuk ID ${product.produkId}:`, err);
  } finally {
    isLoadingReviews.value = false;
  }
}

const handleDeleteReview = async (review: Ulasan) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus ulasan dari ${review.namaReviewer}?`)) {
    return;
  }

  try {
    if (review.ulasanId) {
      await deleteReview(review.produkId, review.ulasanId);
       // Refresh list ulasan
      const response = await getReviewsByProductId(review.produkId);
      productReviews.value = response.data;
      alert('Ulasan berhasil dihapus.');
    }
  } catch (error) {
    console.error('Gagal menghapus ulasan:', error);
    alert('Gagal menghapus ulasan.');
  }
}

const handleFilterRating = (rating: number) => {
  if (selectedFilterRating.value === rating) {
    selectedFilterRating.value = null // Toggle off
  } else {
    selectedFilterRating.value = rating
  }
  currentPage.value = 1 // Reset ke halaman 1 saat filter berubah
}

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  await loadProductVariantList()
  
  // Check for query param 'productId'
  const route = useRoute();
  const queryProductId = route.query.productId;
  
  if (queryProductId) {
    const id = Number(queryProductId);
    const product = productVariantList.value.find(p => p.produkId === id);
    if (product) {
      handleProductClicked(product);
    }
  }
})
</script>
