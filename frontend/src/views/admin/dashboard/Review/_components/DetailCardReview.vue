<template>
  <!-- Kotak Putih Card (Container) -->
  <div class="bg-white rounded-xl shadow-lg p-6">
    
    <!-- 1. Slot untuk Header (Diisi oleh View Induk) -->
    <slot name="header"></slot>

    <!-- 2. Area Tabel -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No.
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gambar
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Produk
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Varian
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Harga
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stok
            </th>
          </tr>
        </thead>
        
        <!-- Tabel Data Nyata -->
        <tbody 
          v-for="(product, index) in paginatedProducts" 
          :key="product.produkId"
          class="bg-white divide-y divide-gray-200"
        >
          <tr 
            @click="handleRowClick(product)"
            class="transition-colors cursor-pointer"
            :class="[
              'hover:bg-gray-100',
              { 
                '!bg-gray-100 !hover:bg-gray-200': 
                  props.activeProductId === product.produkId 
              }
            ]"
          >
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <img :src="product.foto" :alt="product.namaProduk" class="w-10 h-10 object-cover rounded" @error="handleImageError"/>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ product.namaProduk }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
              {{ product.variants.length }} varian
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              <span v-if="product.minPrice === product.maxPrice">
                {{ formatCurrency(product.minPrice) }}
              </span>
              <span v-else>
                {{ formatCurrency(product.minPrice) }} - {{ formatCurrency(product.maxPrice) }}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ product.stok }}
            </td>
          </tr>
        </tbody>
        
        <!-- Empty State Tabel -->
        <tbody v-if="!groupedProducts || groupedProducts.length === 0">
          <tr>
            <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">
              Tidak ada data produk.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer Tabel & Pagination -->
    <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-600">
        Total: {{ groupedProducts ? groupedProducts.length : 0 }} produk
        <span v-if="totalPages > 1" class="ml-1">
          (Halaman {{ currentPage }} dari {{ totalPages }})
        </span>
      </div>

      <!-- Pagination Controls -->
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
</template>

<script setup lang="ts">
import { computed } from 'vue' 
import type { ProductVariantRow } from '@/services/productService'

interface GroupedProduct {
  produkId: number,
  namaProduk: string,
  deskripsi: string,
  foto?: string,
  stok: number,
  minPrice: number | null,
  maxPrice: number | null,
  variants: ProductVariantRow[]
}

interface Props {
  variants: ProductVariantRow[]
  activeProductId: number | null
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'product-clicked', product: GroupedProduct): void
}>()

const calculateFinalPrice = (basePrice: any, additionalPrice: any): number | null => {
  const base = parseFloat(basePrice);
  const additional = parseFloat(additionalPrice);
  const isBaseValid = !isNaN(base);
  const isAdditionalValidOrZero = !isNaN(additional) || additionalPrice === null || additionalPrice === undefined;
  
  if (isBaseValid) {
      const addValue = isAdditionalValidOrZero ? (isNaN(additional) ? 0 : additional) : 0;
      return base + addValue;
  }
  return null;
}

const groupedProducts = computed<GroupedProduct[]>(() => {
  if (!props.variants) return [];
  
  const productMap = new Map<number, GroupedProduct>();

  for (const variant of props.variants) {
    const finalPrice = calculateFinalPrice(variant.hargaUnit, variant.hargaTambahan);

    if (!productMap.has(variant.produkId)) {
      productMap.set(variant.produkId, {
        produkId: variant.produkId,
        namaProduk: variant.namaProduk,
        deskripsi: variant.deskripsi,
        foto: variant.foto,
        stok: variant.stok,
        minPrice: finalPrice,
        maxPrice: finalPrice,
        variants: [variant]
      });
    } else {
      const product = productMap.get(variant.produkId)!;
      product.variants.push(variant);
      
      if (finalPrice !== null) {
        if (product.minPrice === null || finalPrice < product.minPrice) {
          product.minPrice = finalPrice;
        }
        if (product.maxPrice === null || finalPrice > product.maxPrice) {
          product.maxPrice = finalPrice;
        }
      }
    }
  }
  
  return Array.from(productMap.values());
});

const handleRowClick = (product: GroupedProduct) => {
  emit('product-clicked', product)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = `https://placehold.co/40x40/eee/ccc?text=Img`
}

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return 'Rp -';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// --- Pagination Logic ---
import { ref, watch } from 'vue'

const currentPage = ref(1)
const itemsPerPage = 5

const totalPages = computed(() => Math.ceil(groupedProducts.value.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return groupedProducts.value.slice(start, end)
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

// Reset page when data changes
watch(() => props.variants, () => {
  currentPage.value = 1
})
</script>
