<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
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
      <form @submit.prevent="handleSubmit">
        <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <!-- Nama Produk -->
          <div>
            <label for="editNamaProduk" class="block text-sm font-medium text-gray-700 mb-2">
              NAMA PRODUK
            </label>
            <input
              id="editNamaProduk"
              v-model="formData.namaProduk"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
            />
          </div>

          <!-- Deskripsi -->
          <div>
            <label for="editDeskripsi" class="block text-sm font-medium text-gray-700 mb-2">
              DESKRIPSI
            </label>
            <textarea
              id="editDeskripsi"
              v-model="formData.deskripsi"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Stok -->
            <div>
              <label for="editStok" class="block text-sm font-medium text-gray-700 mb-2">
                STOK
              </label>
              <input
                id="editStok"
                v-model.number="formData.stok"
                type="number"
                required
                min="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
              />
            </div>
            
            <!-- Harga Unit (Rp) -->
            <div>
              <label for="editHargaUnit" class="block text-sm font-medium text-gray-700 mb-2">
                HARGA UNIT (Rp)
              </label>
              <input
                id="editHargaUnit"
                v-model.number="formData.hargaUnit"
                type="number"
                required
                min="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <!-- Gambar Produk -->
          <div>
            <label for="editImage" class="block text-sm font-medium text-gray-700 mb-2">
              GAMBAR PRODUK (Opsional)
            </label>
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <img
                  :src="imagePreview || currentImage || 'https://placehold.co/96x96/eee/ccc?text=No+Image'"
                  alt="Preview"
                  class="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  @error="handleImageError"
                />
              </div>
              <div class="flex-1">
                <input
                  id="editImage"
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleImageChange"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="triggerFileInput"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
                >
                  Ganti Gambar
                </button>
                <p class="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti gambar.</p>
                <p v-if="fotoFile" class="text-xs text-green-600 mt-1">
                  File baru: {{ fotoFile.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Varian Ukuran -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              VARIAN UKURAN
            </label>
            <div v-if="formData.ukurans.length === 0" class="text-center text-sm text-gray-500 py-4">
              Belum ada varian ukuran.
            </div>
            <div class="space-y-3">
              <div 
                v-for="(ukuran, index) in formData.ukurans" 
                :key="index"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <input
                  v-model="ukuran.namaUkuran"
                  type="text"
                  required
                  placeholder="Nama (Cth: Large)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
                />
                <input
                  v-model.number="ukuran.hargaTambahan"
                  type="number"
                  required
                  min="0"
                  placeholder="Harga Tambahan (Rp)"
                  class="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
                />
                <button
                  type="button"
                  @click="removeUkuran(index)"
                  class="text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
                  title="Hapus Ukuran"
                >
                  Hapus
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="addUkuran"
              class="mt-3 px-4 py-2 border border-dashed border-[#BAB772] text-[#BAB772] rounded-lg text-sm font-medium hover:bg-[#FAFAD2] transition-colors w-full"
            >
              + Tambah Varian Ukuran
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600 font-medium">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            @click="handleClose"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            BATALKAN
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-[#BAB772] text-white rounded-lg font-medium hover:bg-[#a8a668] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { updateProduct, type Produk as Product } from '@/services/productService'

// Tipe data lokal untuk form (hanya field yang dibutuhkan)
interface FormData {
  namaProduk: string
  deskripsi: string
  stok: number
  hargaUnit: number
  ukurans: {
    namaUkuran: string
    hargaTambahan: number
  }[]
}

// Props
const props = defineProps<{
  isVisible: boolean
  productData: Product | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  productUpdated: []
}>()

// State Form
const defaultFormData = (): FormData => ({
  namaProduk: '',
  deskripsi: '',
  stok: 0,
  hargaUnit: 0,
  ukurans: [],
})

const formData = reactive<FormData>(defaultFormData())
const fotoFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const currentImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// State Modal
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Watch: Isi form saat productData berubah
watch(
  () => props.productData,
  (newProduct) => {
    if (newProduct) {
      console.log('📦 Loading product data:', newProduct)
      
      formData.namaProduk = newProduct.namaProduk
      formData.deskripsi = newProduct.deskripsi || ''
      formData.stok = newProduct.stok
      formData.hargaUnit = newProduct.hargaUnit
      
      // 🔥 PERBAIKAN: Hanya ambil field yang dibutuhkan (tanpa ukuranId, produkId)
      formData.ukurans = (newProduct.ukurans || []).map(u => ({
        namaUkuran: u.namaUkuran,
        hargaTambahan: u.hargaTambahan
      }))
      
      currentImage.value = newProduct.foto || null
      
      console.log('✅ Form data loaded:', {
        ...formData,
        ukurans: formData.ukurans
      })
    } else {
      resetForm()
    }
  },
)

// --- Logika Varian Ukuran ---
const addUkuran = () => {
  formData.ukurans.push({ namaUkuran: '', hargaTambahan: 0 })
  console.log('➕ Ukuran added. Total:', formData.ukurans.length)
}

const removeUkuran = (index: number) => {
  formData.ukurans.splice(index, 1)
  console.log('➖ Ukuran removed. Total:', formData.ukurans.length)
}

// --- Logika Gambar ---
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://placehold.co/96x96/eee/ccc?text=No+Image'
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    console.log('📷 New image selected:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`)
    
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.'
      console.error('❌ Invalid file type:', file.type)
      return
    }
    
    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file terlalu besar. Maksimal 2MB.'
      console.error('❌ File too large:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      return
    }
    
    fotoFile.value = file
    
    // Buat preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
      console.log('✅ Image preview created')
    }
    reader.readAsDataURL(file)
    
    errorMessage.value = null
  }
}

// --- Logika Submit ---
const handleSubmit = async () => {
  console.log('\n=================================')
  console.log('🚀 SUBMIT UPDATE PRODUCT')
  console.log('=================================')
  
  if (!props.productData?.produkId) {
    errorMessage.value = "ID Produk tidak ditemukan."
    console.error('❌ Product ID not found')
    return
  }

  // Validasi Frontend
  if (!formData.namaProduk || formData.namaProduk.trim() === '') {
    errorMessage.value = 'Nama produk wajib diisi.'
    console.error('❌ Product name is empty')
    return
  }
  
  if (formData.hargaUnit <= 0) {
    errorMessage.value = 'Harga unit harus lebih dari 0.'
    console.error('❌ Invalid price:', formData.hargaUnit)
    return
  }
  
  if (formData.ukurans.length === 0) {
    errorMessage.value = 'Minimal harus ada 1 varian ukuran.'
    console.error('❌ No size variants')
    return
  }
  
  // Validasi setiap ukuran
  for (let i = 0; i < formData.ukurans.length; i++) {
    const ukuran = formData.ukurans[i]
    if (!ukuran.namaUkuran || ukuran.namaUkuran.trim() === '') {
      errorMessage.value = `Nama ukuran ke-${i + 1} tidak boleh kosong.`
      console.error('❌ Empty size name at index:', i)
      return
    }
  }
  
  isSubmitting.value = true
  errorMessage.value = null
  
  try {
    console.log('📋 Product ID:', props.productData.produkId)
    console.log('📋 Form Data:', {
      namaProduk: formData.namaProduk,
      deskripsi: formData.deskripsi,
      stok: formData.stok,
      hargaUnit: formData.hargaUnit,
      ukuransCount: formData.ukurans.length
    })
    console.log('📋 Has new photo:', !!fotoFile.value)
    
    // 1. Buat FormData
    const formDataToSend = new FormData()
    
    // 2. Tambahkan data teks
    formDataToSend.append('namaProduk', formData.namaProduk.trim())
    formDataToSend.append('deskripsi', formData.deskripsi.trim())
    formDataToSend.append('stok', formData.stok.toString())
    formDataToSend.append('hargaUnit', formData.hargaUnit.toString())
    
    // 3. Tambahkan file HANYA jika ada file baru
    if (fotoFile.value) {
      formDataToSend.append('foto', fotoFile.value)
      console.log('📷 Attaching new photo:', fotoFile.value.name)
    } else {
      console.log('📷 No new photo, keeping existing')
    }
    
    // 🔥 4. PERBAIKAN PENTING: Bersihkan ukurans dari property yang tidak perlu
    const cleanedUkurans = formData.ukurans.map(u => ({
      namaUkuran: u.namaUkuran.trim(),
      hargaTambahan: Number(u.hargaTambahan) || 0
    }))
    
    console.log('🏷️ Cleaned ukurans:', cleanedUkurans)
    
    // 5. Tambahkan ukuran sebagai JSON string
    const ukuranJSON = JSON.stringify(cleanedUkurans)
    formDataToSend.append('ukuran', ukuranJSON)
    console.log('📦 ukuran JSON:', ukuranJSON)
    
    // Debug: Log FormData content
    console.log('\n📤 FormData being sent:')
    for (const [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${(value.size / 1024).toFixed(2)} KB)`)
      } else {
        console.log(`  ${key}:`, value)
      }
    }

    // 6. Panggil API
    console.log('\n🌐 Calling API: PUT /api/products/' + props.productData.produkId)
    const response = await updateProduct(props.productData.produkId!, formDataToSend)
    console.log('✅ API Response:', response)

    // 7. Jika sukses
    console.log('✅ Product updated successfully!')
    console.log('=================================\n')
    
    emit('productUpdated')
    handleClose()

  } catch (error: any) {
    console.error('\n=================================')
    console.error('❌ ERROR UPDATING PRODUCT')
    console.error('=================================')
    console.error('Error object:', error)
    
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error message:', error.message)
    }
    console.error('=================================\n')
    
    // Tampilkan error message
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.error) {
      errorMessage.value = `Error: ${error.response.data.error}`
    } else if (typeof error.response?.data === 'string') {
      errorMessage.value = error.response.data
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// --- Logika Modal ---
const handleClose = () => {
  if (isSubmitting.value) {
    console.log('⏳ Cannot close while submitting')
    return
  }
  console.log('🚪 Closing modal')
  resetForm()
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

// --- Helper ---
const resetForm = () => {
  console.log('🔄 Resetting form')
  Object.assign(formData, defaultFormData())
  formData.ukurans = []
  fotoFile.value = null
  imagePreview.value = null
  currentImage.value = null
  errorMessage.value = null
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>