<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4" @click.stop>
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">Tambah Produk Baru</h2>
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

      <form @submit.prevent="handleSubmit">
        <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label for="namaProduk" class="block text-sm font-medium text-gray-700 mb-2">
              NAMA PRODUK
            </label>
            <input
              id="namaProduk"
              v-model="formData.namaProduk"
              type="text"
              required
              placeholder="Cth: Kopi Susu Gula Aren"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label for="deskripsi" class="block text-sm font-medium text-gray-700 mb-2">
              DESKRIPSI
            </label>
            <textarea
              id="deskripsi"
              v-model="formData.deskripsi"
              rows="3"
              placeholder="Deskripsi singkat produk..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="stok" class="block text-sm font-medium text-gray-700 mb-2">
                STOK
              </label>
              <input
                id="stok"
                v-model.number="formData.stok"
                type="number"
                required
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label for="hargaUnit" class="block text-sm font-medium text-gray-700 mb-2">
                HARGA UNIT (Rp)
              </label>
              <input
                id="hargaUnit"
                v-model.number="formData.hargaUnit"
                type="number"
                required
                min="0"
                placeholder="20000"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label for="image" class="block text-sm font-medium text-gray-700 mb-2">
              GAMBAR PRODUK
            </label>
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Preview"
                  class="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <div
                  v-else
                  class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                >
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <input
                  id="image"
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleImageChange"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="() => fileInput?.click()"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
                >
                  Pilih Gambar
                </button>
                <p class="text-xs text-gray-500 mt-1">Format: JPG, PNG, WEBP. Maksimal 2MB</p>
                <p v-if="fotoFile" class="text-xs text-green-600 mt-1">
                  File dipilih: {{ fotoFile.name }} ({{ formatFileSize(fotoFile.size) }})
                </p>
              </div>
            </div>
          </div>

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
                <select
                  v-model="ukuran.namaUkuran"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#BAB772] focus:border-transparent bg-white"
                >
                  <option value="" disabled>Pilih Ukuran</option>
                  <option value="300ml">300ml</option>
                  <option value="500ml">500ml</option>
                </select>
                <input
                  v-model.number="ukuran.hargaTambahan"
                  type="number"
                  required
                  placeholder="Harga Tambahan (Rp)"
                  class="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
                />
                <button
                  type="button"
                  @click="removeUkuran(index)"
                  class="text-red-500 hover:text-red-700 font-medium"
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

          <div v-if="errorMessage" class="text-center text-sm text-red-600">
            {{ errorMessage }}
          </div>
        </div>

        <div class="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            BATALKAN
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-[#BAB772] text-white rounded-lg font-medium hover:bg-[#a8a668] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'SIMPAN' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
// Pastikan impor service dan tipe sudah benar
import { createProduct, type Ukuran } from '@/services/productService'

// Tipe data lokal untuk form
interface FormData {
  namaProduk: string
  deskripsi: string
  stok: number
  hargaUnit: number
  ukurans: Omit<Ukuran, 'ukuranId' | 'produkId'>[] // Gunakan Omit untuk array
}

// Props
const props = defineProps<{
  isVisible: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
  productAdded: [] // Event sukses
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
const fileInput = ref<HTMLInputElement | null>(null)

// State Modal
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Setel ulang form saat modal dibuka
watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  },
)

// --- Logika Varian Ukuran ---
const addUkuran = () => {
  formData.ukurans.push({ namaUkuran: '', hargaTambahan: 0 })
}

const removeUkuran = (index: number) => {
  formData.ukurans.splice(index, 1)
}

// --- Logika Gambar ---
const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    // Validasi Tipe
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.'
      return
    }

    // Validasi Ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file terlalu besar. Maksimal 2MB.'
      return
    }

    fotoFile.value = file

    // Buat preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    errorMessage.value = null // Hapus error jika sukses
  }
}

// --- Logika Submit ---
const handleSubmit = async () => {
  // Reset error
  errorMessage.value = null

  // Validasi Frontend
  if (!formData.namaProduk || formData.hargaUnit <= 0 || !fotoFile.value) {
    errorMessage.value = 'Nama produk, harga unit, dan gambar wajib diisi.'
    return
  }
  if (formData.ukurans.length === 0) {
    errorMessage.value = 'Minimal harus ada 1 varian ukuran.'
    return
  }

  isSubmitting.value = true

  try {
    // 1. Buat FormData
    const formDataToSend = new FormData()

    // 2. Tambahkan semua data teks
    formDataToSend.append('namaProduk', formData.namaProduk)
    formDataToSend.append('deskripsi', formData.deskripsi)
    formDataToSend.append('stok', formData.stok.toString())
    formDataToSend.append('hargaUnit', formData.hargaUnit.toString())

    // 3. Tambahkan file gambar
    if (fotoFile.value) {
      formDataToSend.append('foto', fotoFile.value)
    }

    // 4. Tambahkan array ukuran sebagai JSON string dengan key 'ukuran' (singular)
    formDataToSend.append('ukuran', JSON.stringify(formData.ukurans))

    // 5. Panggil API
    await createProduct(formDataToSend)

    // 6. Jika sukses
    emit('productAdded') // Beri tahu parent (KelolaProduct)
    handleClose() // Tutup modal

  } catch (error: any) {
    console.error('Error submitting form:', error)
    if (error.response && error.response.data && error.response.data.message) {
      // Tampilkan error dari backend
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// --- Logika Modal ---
const handleClose = () => {
  if (isSubmitting.value) return // Jangan tutup saat sedang loading
  resetForm()
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

// --- Helper ---
const resetForm = () => {
  Object.assign(formData, defaultFormData())
  formData.ukurans = [] // Pastikan array juga direset
  fotoFile.value = null
  imagePreview.value = null
  errorMessage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>