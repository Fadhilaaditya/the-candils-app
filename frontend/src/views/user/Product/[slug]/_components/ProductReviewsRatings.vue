<template>
  <div class="bg-white rounded-lg shadow-sm p-8">
    <!-- Section Title -->
    <h2 class="text-2xl font-bold text-gray-900 mb-8">
      Ulasan Pelanggan
    </h2>

    <!-- Rating Summary -->
    <div class="mb-8">
      <!-- Average Rating -->
      <div class="flex items-center gap-4 mb-4">
        <!-- Star Icons -->
        <div class="flex gap-1">
          <svg 
            v-for="star in 5" 
            :key="star"
            :class="[
              'w-8 h-8 fill-current',
              reviews.length > 0 ? 'text-yellow-400' : 'text-gray-300'
            ]"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        
        <!-- Rating Number -->
        <div>
          <span class="text-3xl font-bold text-gray-900">{{ averageRating }}</span>
          <span class="text-gray-600 ml-2">dari 5 bintang</span>
        </div>
      </div>

      <!-- Total Reviews -->
      <p class="text-gray-600 mb-6">{{ totalReviews }} ulasan pelanggan</p>

      <!-- Rating Bars -->
      <div class="space-y-2">
        <div 
          v-for="rating in [5, 4, 3, 2, 1]" 
          :key="rating"
          class="flex items-center gap-4"
        >
          <!-- Rating Number -->
          <span class="text-sm text-gray-600 w-3">{{ rating }}</span>
          
          <!-- Star Icon -->
          <svg class="w-5 h-5 text-gray-300 fill-current flex-shrink-0" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          <!-- Progress Bar -->
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-[#BAB772] rounded-full transition-all duration-300"
              :style="{ width: `${getRatingPercentage(rating)}%` }"
            ></div>
          </div>

          <!-- Count -->
          <span class="text-sm text-gray-600 w-12 text-right">{{ getRatingCount(rating) }}</span>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div v-if="reviews && reviews.length > 0" class="space-y-6 mb-8">
      <div 
        v-for="review in displayedReviews" 
        :key="review.ulasanId"
        class="border-b border-gray-200 pb-6 last:border-b-0"
      >
        <!-- Review Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <!-- Avatar -->
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              :style="{ backgroundColor: getAvatarColor(review.namaReviewer) }"
            >
              {{ getInitials(review.namaReviewer) }}
            </div>
            
            <!-- Name and Date -->
            <div>
              <p class="font-semibold text-gray-900">{{ review.namaReviewer || 'User Anonim' }}</p>
              <p class="text-sm text-gray-500">{{ formatRelativeTime(review.tanggalUlasan) }}</p>
            </div>
          </div>

          <!-- Star Rating -->
          <div class="flex gap-1">
            <svg 
              v-for="star in 5" 
              :key="star"
              :class="[
                'w-4 h-4',
                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
              ]"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <!-- Review Content -->
        <p class="text-gray-700 leading-relaxed mb-2">
          {{ review.komentar || 'User tidak memberikan komentar.' }}
        </p>

        <!-- Review Image -->
        <div v-if="review.foto" class="mt-3 mb-3">
          <img 
            :src="getImageUrl(review.foto)" 
            alt="Foto Ulasan" 
            class="h-32 w-auto object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
            @click="openImageModal(review.foto)"
          />
        </div>

        <!-- Date Footer -->
        <div class="flex items-center justify-end">
          <span class="text-xs text-gray-500">{{ formatDateTime(review.tanggalUlasan) }}</span>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center mt-6">
        <button 
          @click="$emit('loadMore')"
          class="text-[#BAB772] hover:text-[#A3A065] font-medium transition-colors"
        >
          Lihat Ulasan Lainnya
        </button>
      </div>
    </div>

    <!-- No Reviews State -->
    <div v-else class="text-center py-12 mb-8">
      <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Belum Ada Ulasan</h3>
      <p class="text-gray-500">Jadilah yang pertama memberikan ulasan untuk produk ini!</p>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-8"></div>

    <!-- Write Review Section -->
    <div>
      <h3 class="text-xl font-bold text-gray-900 mb-6">Tulis Ulasan</h3>

      <!-- Rating Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Rating Anda
        </label>
        <div class="flex gap-2">
          <button
            v-for="star in 5"
            :key="star"
            @click="newReview.rating = star"
            type="button"
            class="transition-transform hover:scale-110"
          >
            <svg 
              :class="[
                'w-8 h-8',
                star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
              ]"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Name Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Nama Anda
        </label>
        <input
          v-model="newReview.namaReviewer"
          type="text"
          placeholder="Masukkan nama Anda"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-[#BAB772] outline-none transition-all"
        />
      </div>

      <!-- Review Text Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ulasan Anda
        </label>
        <textarea
          v-model="newReview.komentar"
          rows="5"
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-[#BAB772] outline-none transition-all resize-none"
        ></textarea>
      </div>

      <!-- Photo Upload (Optional) -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Foto Produk (Opsional)
        </label>
        
        <!-- File Input (Hidden) -->
        <input 
          type="file" 
          ref="fileInput" 
          accept="image/*" 
          class="hidden" 
          @change="handleFileSelect"
        />

        <div class="flex items-start gap-4">
          <!-- Upload Button -->
          <button
            type="button"
            @click="triggerFileInput"
            class="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#BAB772] transition-all text-gray-600 hover:text-[#BAB772]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ selectedFile ? 'Ganti Gambar' : 'Pilih Gambar' }}</span>
          </button>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="relative group">
            <img 
              :src="imagePreview" 
              alt="Preview" 
              class="h-16 w-16 object-cover rounded-lg border border-gray-200"
            />
            <button 
              @click="removeFile"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              title="Hapus Gambar"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <p v-if="selectedFile" class="text-xs text-gray-500 mt-2">
          File terpilih: {{ selectedFile.name }}
        </p>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitReview"
        :disabled="!isReviewValid || isSubmitting"
        class="w-full bg-[#BAB772] hover:bg-[#A3A065] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mengirim...
        </span>
        <span v-else>Kirim Ulasan</span>
      </button>

      <!-- Error Message -->
      <div v-if="submitError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ submitError }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="submitSuccess" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-600">✅ Ulasan berhasil dikirim! Terima kasih atas ulasan Anda.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Produk, Ulasan } from '@/services/productService'
// IMPORT FUNGSI API YANG BENAR
import { createReview } from '@/services/productService'

const props = defineProps<{
  product: Produk
  reviews: Ulasan[]
  hasMore: boolean
}>()

const emit = defineEmits<{
  reviewAdded: []
  loadMore: []
}>()

// State
const newReview = ref({
  rating: 0,
  namaReviewer: '',
  komentar: ''
})
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)

// File Upload State
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

// Computed
const totalReviews = computed(() => props.reviews.length)

const averageRating = computed(() => {
  if (props.reviews.length === 0) return '0.0'
  const sum = props.reviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / props.reviews.length).toFixed(1)
})

const displayedReviews = computed(() => {
  return props.reviews // Display all (parent handles accumulation)
})

const isReviewValid = computed(() => {
  return newReview.value.rating > 0 && 
         newReview.value.namaReviewer.trim() !== '' && 
         newReview.value.komentar.trim() !== ''
})

// Methods
const getRatingCount = (rating: number) => {
  return props.reviews.filter(review => review.rating === rating).length
}

const getRatingPercentage = (rating: number) => {
  if (totalReviews.value === 0) return 0
  return (getRatingCount(rating) / totalReviews.value) * 100
}

const getInitials = (name: string | undefined | null): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  
  if (parts.length > 1 && parts[0] && parts[1]) {
    const firstInitial = parts[0].length > 0 ? parts[0][0] : ''
    const secondInitial = parts[1].length > 0 ? parts[1][0] : ''
    const initials = (firstInitial + secondInitial).trim().toUpperCase()
    return initials.length > 0 ? initials : '?'
  } else if (parts[0] && parts[0].length > 0) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return '?'
}

const getAvatarColor = (name: string | undefined | null) => {
  const colors = [
    '#BAB772', '#8B9467', '#7A8450', '#9BA882', '#6B7B5E',
    '#A8B68F', '#8FA67D', '#7D9B6B', '#6B8559', '#597047'
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Tanggal tidak valid'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Tanggal tidak valid'
  return date.toLocaleDateString('id-ID', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  })
}

const formatRelativeTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Tanggal tidak valid'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Tanggal tidak valid'
  
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 0) return "Baru saja"

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " tahun lalu"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " bulan lalu"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " hari lalu"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " jam lalu"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " menit lalu"
  
  return Math.floor(seconds) + " detik lalu"
}

// Image Helper
const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // Sesuaikan dengan base URL backend Anda
  const BASE_URL = import.meta.env.PROD 
    ? 'https://backend-the-candils.vercel.app' 
    : 'http://localhost:3000';
  return `${BASE_URL}${path}`
}

const openImageModal = (url: string) => {
  window.open(getImageUrl(url), '_blank')
}

// File Handlers
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Validasi ukuran (misal max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (maksimal 2MB)')
      target.value = ''
      return
    }

    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// IMPLEMENTASI SUBMIT REVIEW SESUAI API ANDA
const submitReview = async () => {
  if (!isReviewValid.value) return

  isSubmitting.value = true
  submitError.value = null
  submitSuccess.value = false

  try {
    // Pastikan product.produkId ada
    const produkId = props.product.produkId
    if (!produkId) {
      throw new Error('ID Produk tidak valid')
    }

    // Gunakan FormData untuk mengirim file
    const formData = new FormData()
    formData.append('namaReviewer', newReview.value.namaReviewer.trim())
    formData.append('rating', String(newReview.value.rating))
    formData.append('komentar', newReview.value.komentar.trim())
    
    if (selectedFile.value) {
      formData.append('foto', selectedFile.value)
    }

    console.log('📤 Submitting review to API:', {
      produkId,
      hasFile: !!selectedFile.value
    })

    // Panggil API dengan signature: createReview(produkId, formData)
    const response = await createReview(produkId, formData)

    console.log('✅ Review submitted successfully:', response)

    // Reset form setelah berhasil
    newReview.value = {
      rating: 0,
      namaReviewer: '',
      komentar: ''
    }
    removeFile() // Reset file input

    // Tampilkan success message
    submitSuccess.value = true

    // Emit event untuk refresh data di parent component
    emit('reviewAdded')

    // Auto-hide success message setelah 5 detik
    setTimeout(() => {
      submitSuccess.value = false
    }, 5000)

  } catch (error: any) {
    console.error('❌ Error submitting review:', error)
    
    // Handle error dan tampilkan pesan yang user-friendly
    if (error.response) {
      // Error dari server (4xx, 5xx)
      const status = error.response.status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Gagal mengirim ulasan.'
      
      if (status === 400) {
        submitError.value = `Input tidak valid: ${errorMessage}`
      } else if (status === 404) {
        submitError.value = 'Produk tidak ditemukan.'
      } else if (status === 500) {
        submitError.value = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
      } else {
        submitError.value = errorMessage
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      submitError.value = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    } else {
      // Error lainnya
      submitError.value = error.message || 'Terjadi kesalahan. Silakan coba lagi.'
    }
  } finally {
    isSubmitting.value = false
  }
}

console.log('✅ ProductReviewsRatings component mounted!')
</script>