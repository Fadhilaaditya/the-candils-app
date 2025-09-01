<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Edit Produk</h2>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Product Type -->
        <div>
          <label for="productType" class="block text-sm font-medium text-gray-700 mb-2">
            JENIS PRODUK
          </label>
          <input
            id="productType"
            v-model="formData.productType"
            type="text"
            required
            placeholder="Masukkan jenis produk"
            :class="[
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors',
              productTypeError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
            ]"
          />
          <p v-if="productTypeError" class="mt-1 text-sm text-red-600">{{ productTypeError }}</p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            DESKRIPSI
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            required
            placeholder="Masukkan deskripsi produk"
            :class="[
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors resize-none',
              descriptionError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
            ]"
          ></textarea>
          <p v-if="descriptionError" class="mt-1 text-sm text-red-600">{{ descriptionError }}</p>
        </div>

        <!-- Image Upload -->
        <div>
          <label for="image" class="block text-sm font-medium text-gray-700 mb-2">
            GAMBAR PRODUK
          </label>
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div
                v-if="!imagePreview && !currentImage"
                class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
              >
                <svg
                  class="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </div>
              <img
                v-else
                :src="imagePreview || currentImage || ''"
                alt="Preview"
                class="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
            </div>
            <div class="flex-1">
              <input
                id="image"
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
              />
              <button
                type="button"
                @click="() => fileInput?.click()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
              >
                {{ currentImage ? 'Ganti Gambar' : 'Pilih Gambar' }}
              </button>
              <p class="text-xs text-gray-500 mt-1">Format: JPG, PNG, GIF. Maksimal 2MB</p>
              <p v-if="formData.image" class="text-xs text-green-600 mt-1">
                File baru: {{ formData.image.name }} ({{ formatFileSize(formData.image.size) }})
              </p>
              <p v-else-if="currentImage" class="text-xs text-blue-600 mt-1">
                Gambar saat ini: {{ currentImage.split('/').pop() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
          >
            BATALKAN
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-[#BAB772] text-white rounded-lg font-medium hover:bg-[#a8a668] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'UPDATE' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

interface Product {
  id: number
  productType: string
  description: string
  image: string
  createdAt: string
  updatedAt: string
}

interface FormData {
  productType: string
  description: string
  image: File | null
}

interface Props {
  isVisible: boolean
  productData: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: FormData & { id: number }]
}>()

// Form data
const formData = reactive<FormData>({
  productType: '',
  description: '',
  image: null,
})

// Form state
const isSubmitting = ref(false)
const imagePreview = ref<string | null>(null)
const currentImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()

// Computed properties for validation
const isFormValid = computed(() => {
  return formData.productType.trim().length >= 3 && formData.description.trim().length >= 10
})

const productTypeError = computed(() => {
  if (!formData.productType.trim()) return 'Nama produk wajib diisi'
  if (formData.productType.trim().length < 3) return 'Nama produk minimal 3 karakter'
  return null
})

const descriptionError = computed(() => {
  if (!formData.description.trim()) return 'Deskripsi produk wajib diisi'
  if (formData.description.trim().length < 10) return 'Deskripsi produk minimal 10 karakter'
  return null
})

// Populate form when productData changes
watch(
  () => props.productData,
  (newProductData) => {
    if (newProductData) {
      formData.productType = newProductData.productType
      formData.description = newProductData.description
      currentImage.value = newProductData.image
      imagePreview.value = null
      console.log('EditProductModal: Form populated with product data:', newProductData)
    }
  },
  { immediate: true },
)

// Reset form when modal opens/closes
watch(
  () => props.isVisible,
  (newValue) => {
    if (!newValue) {
      // Reset form when modal closes
      resetForm()
    }
  },
)

// Methods
const handleClose = () => {
  resetForm()
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.')
      return
    }

    formData.image = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    console.log('Image selected for edit:', file.name, 'Size:', file.size, 'Type:', file.type)
  }
}

const handleSubmit = async () => {
  if (!props.productData) {
    alert('Data produk tidak ditemukan')
    return
  }

  // Validate form
  if (!isFormValid.value) {
    const errors = [productTypeError.value, descriptionError.value]
      .filter((error) => error)
      .join('\n')
    alert(errors)
    return
  }

  isSubmitting.value = true

  try {
    // Emit the form data with ID to parent component
    emit('submit', {
      id: props.productData.id,
      ...formData,
    })

    // Reset form and close modal
    resetForm()
    emit('close')

    console.log('EditProductModal: Form submitted successfully, modal closed')
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Terjadi kesalahan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.productType = ''
  formData.description = ''
  formData.image = null
  imagePreview.value = null
  currentImage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Expose methods for parent component
defineExpose({
  resetForm,
  setFormData: (data: Partial<FormData>) => {
    Object.assign(formData, data)
  },
})
</script>
