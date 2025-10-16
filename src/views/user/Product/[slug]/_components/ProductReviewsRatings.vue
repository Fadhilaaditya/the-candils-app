<template>
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <h3 class="text-xl font-semibold text-gray-900 mb-6">Ulasan Pelanggan</h3>

    <!-- Overall Rating Summary -->
    <div class="flex items-center mb-6">
      <div class="flex text-yellow-400 mr-3">
        <svg v-for="i in 5" :key="i" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            v-if="i <= Math.floor(product.rating)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
          <path
            v-else
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </div>
      <div>
        <p class="text-gray-900 font-semibold text-lg">
          <span class="text-2xl">{{ product.rating }}</span> dari 5 bintang
        </p>
        <p class="text-gray-600">{{ product.reviewCount }} ulasan pelanggan</p>
      </div>
    </div>

    <!-- Rating Distribution -->
    <div class="mb-6">
      <div v-for="rating in 5" :key="rating" class="flex items-center mb-2">
        <span class="text-sm text-gray-600 w-8">{{ 6 - rating }}</span>
        <svg class="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
          <div
            class="bg-[#BAB772] h-2 rounded-full"
            :style="{ width: getRatingPercentage(6 - rating) + '%' }"
          ></div>
        </div>
        <span class="text-sm text-gray-600 w-8">{{ getRatingCount(6 - rating) }}</span>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-4">
      <div v-if="reviews.length === 0" class="text-center py-8">
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p class="text-gray-500">Belum ada ulasan untuk produk ini</p>
        <p class="text-gray-400 text-sm">Jadilah yang pertama memberikan ulasan!</p>
      </div>

      <div v-for="review in reviews" :key="review.id" class="border-b border-gray-200 pb-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <div
              class="w-8 h-8 bg-[#BAB772] rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3"
            >
              {{ review.userName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ review.userName }}</p>
              <div class="flex text-yellow-400">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    v-if="i <= review.rating"
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                  <path
                    v-else
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <span class="text-sm text-gray-500">{{ formatDate(review.date) }}</span>
        </div>
        <p class="text-gray-700">{{ review.comment }}</p>

        <!-- Review Images -->
        <div v-if="review.images && review.images.length > 0" class="mt-3">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <img
              v-for="(image, imgIndex) in review.images"
              :key="imgIndex"
              :src="image"
              :alt="`Foto ulasan ${imgIndex + 1}`"
              class="w-full h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity duration-200"
              @click="openImageModal(image)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Reviews Button -->
    <div v-if="hasMoreReviews" class="text-center mt-6">
      <button class="text-[#BAB772] hover:text-[#a8a668] font-medium">Lihat Ulasan Lainnya</button>
    </div>

    <!-- Add Review Section -->
    <div class="mt-8 pt-8 border-t border-gray-200">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">Tulis Ulasan</h4>

      <form @submit.prevent="submitReview" class="space-y-4">
        <!-- Rating Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rating Anda</label>
          <div class="flex items-center space-x-1">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              @click="newReview.rating = i"
              class="focus:outline-none"
            >
              <svg
                class="w-8 h-8 transition-colors duration-200"
                :class="
                  i <= newReview.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                "
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Name Input -->
        <div>
          <label for="reviewerName" class="block text-sm font-medium text-gray-700 mb-2"
            >Nama Anda</label
          >
          <input
            id="reviewerName"
            v-model="newReview.userName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            placeholder="Masukkan nama Anda"
          />
        </div>

        <!-- Comment Input -->
        <div>
          <label for="reviewComment" class="block text-sm font-medium text-gray-700 mb-2"
            >Ulasan Anda</label
          >
          <textarea
            id="reviewComment"
            v-model="newReview.comment"
            required
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            placeholder="Bagikan pengalaman Anda dengan produk ini..."
          ></textarea>
        </div>

        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Foto Produk (Opsional)</label>
          <div class="flex items-center space-x-4">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileUpload"
              class="hidden"
            />
            <button
              type="button"
              @click="triggerFileInput"
              class="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Pilih Gambar
            </button>
            <span v-if="newReview.images.length > 0" class="text-sm text-gray-600">
              {{ newReview.images.length }} gambar dipilih
            </span>
          </div>

          <!-- Preview Images -->
          <div
            v-if="newReview.images.length > 0"
            class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <div v-for="(image, index) in newReview.images" :key="index" class="relative group">
              <img
                :src="image.preview"
                :alt="`Preview ${index + 1}`"
                class="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-[#BAB772] hover:bg-[#a8a668] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
          >
            <span v-if="isSubmitting">Mengirim...</span>
            <span v-else>Kirim Ulasan</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Product {
  id: string
  rating: number
  reviewCount: number
}

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
  images?: string[]
}

interface ReviewImage {
  file: File
  preview: string
}

interface NewReview {
  userName: string
  rating: number
  comment: string
  images: ReviewImage[]
}

interface Props {
  product: Product
}

const props = defineProps<Props>()

// New review form data
const newReview = ref<NewReview>({
  userName: '',
  rating: 0,
  comment: '',
  images: [],
})

const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement>()

// Mock reviews data - in real app, this would come from API
const reviews = ref<Review[]>([
  {
    id: '1',
    userName: 'Sari Indah',
    rating: 5,
    comment: 'Sangat lezat dan autentik! Bubur sumsumnya lembut dan rasanya pas. Akan pesan lagi.',
    date: '2025-01-15',
  },
  {
    id: '2',
    userName: 'Budi Santoso',
    rating: 4,
    comment: 'Enak banget, tapi sedikit manis untuk selera saya. Overall puas dengan kualitasnya.',
    date: '2025-01-14',
  },
  {
    id: '3',
    userName: 'Maya Putri',
    rating: 5,
    comment: 'Kombinasi rasanya sempurna! Cocok untuk dessert setelah makan berat. Recommended!',
    date: '2025-01-13',
  },
])

const hasMoreReviews = computed(() => {
  return reviews.value.length < props.product.reviewCount
})

const getRatingPercentage = (rating: number): number => {
  // Mock data - in real app, calculate from actual reviews
  const mockDistribution = { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 }
  return mockDistribution[rating as keyof typeof mockDistribution] || 0
}

const getRatingCount = (rating: number): number => {
  const percentage = getRatingPercentage(rating)
  return Math.round((props.product.reviewCount * percentage) / 100)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// File upload handlers
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview = e.target?.result as string
          newReview.value.images.push({
            file,
            preview,
          })
        }
        reader.readAsDataURL(file)
      }
    })
  }
}

const removeImage = (index: number) => {
  newReview.value.images.splice(index, 1)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const openImageModal = (imageSrc: string) => {
  // Simple image modal - in a real app, you might want to use a proper modal component
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="relative max-w-4xl max-h-full p-4">
      <button class="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-300">×</button>
      <img src="${imageSrc}" alt="Review image" class="max-w-full max-h-full object-contain">
    </div>
  `

  modal.addEventListener('click', (e) => {
    if (e.target === modal || (e.target as HTMLElement).tagName === 'BUTTON') {
      document.body.removeChild(modal)
    }
  })

  document.body.appendChild(modal)
}

// Submit review
const submitReview = async () => {
  if (!newReview.value.rating || !newReview.value.userName || !newReview.value.comment) {
    alert('Mohon lengkapi semua field yang wajib diisi')
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create new review object
    const newReviewData: Review = {
      id: (reviews.value.length + 1).toString(),
      userName: newReview.value.userName,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      date: new Date().toISOString().split('T')[0],
      images: newReview.value.images.map((img) => img.preview),
    }

    // Add to reviews list
    reviews.value.unshift(newReviewData)

    // Reset form
    newReview.value = {
      userName: '',
      rating: 0,
      comment: '',
      images: [],
    }

    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }

    alert('Ulasan berhasil dikirim!')
  } catch (error) {
    console.error('Error submitting review:', error)
    alert('Terjadi kesalahan saat mengirim ulasan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
