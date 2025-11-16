<template>
  <div class="space-y-6">
    <!-- Fieldset tidak lagi 'disabled' oleh 'isOrderCreated' -->
    <fieldset>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
        <input
          :value="fullName"
          @input="$emit('update:fullName', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          placeholder="Nama Anda"
          :disabled="isSubmitting"
        />
      </div>

      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
        <input
          :value="address"
          @input="$emit('update:address', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          placeholder="Alamat pengiriman"
          :disabled="isSubmitting"
        />
      </div>

      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Kontak</label>
        <input
          :value="contact"
          @input="handleContactInput"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          placeholder="Nomor telepon / WhatsApp"
          :disabled="isSubmitting"
        />
      </div>
    </fieldset>

    <!-- Metode Pembayaran QRIS (Tidak Berubah) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</label>
      <div class="border rounded-lg p-4 text-center bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-800">Pembayaran QRIS</h3>
        <p class="text-sm text-gray-600 mt-1 mb-4">
          Silakan scan kode di bawah ini menggunakan e-wallet atau m-banking Anda.
        </p>
        <img
          src="/QRIS.jpg"
          alt="Kode QRIS Pembayaran"
          class="w-full max-w-[250px] mx-auto rounded-md border"
        />
        <p class="text-xs text-gray-500 mt-3">Mendukung semua aplikasi pembayaran QRIS</p>
      </div>
    </div>

    <!-- [PERUBAHAN]: Form Upload Bukti Pembayaran sekarang jadi satu -->
    <div class="space-y-4 pt-4 border-t">
      <h3 class="text-lg font-semibold text-gray-800">Upload Bukti Pembayaran</h3>
      <p class="text-sm text-gray-600">Silakan upload bukti transfer Anda (JPG/PNG).</p>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">File Bukti</label>
        <input
          ref="fileInputRef"
          type="file"
          @change="handleFileChange"
          accept="image/png, image/jpeg"
          class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FAFAD2] file:text-[#8f8c4b] hover:file:bg-[#f0eec0]"
          :disabled="isSubmitting"
        />
        <p class="text-xs text-gray-500 mt-1">
          Maksimal ukuran file: {{ formatFileSize(maxFileSize) }}
        </p>
      </div>

      <!-- [BARU]: "Review" atau Preview Gambar yang di-upload -->
      <div v-if="filePreviewUrl" class="text-center space-y-3">
        <label class="block text-sm font-medium text-gray-700 mb-2">Preview Bukti:</label>
        <div class="relative inline-block">
          <img
            :src="filePreviewUrl"
            alt="Preview Bukti Pembayaran"
            class="w-full max-w-[250px] mx-auto rounded-md border object-cover"
          />
          <button
            type="button"
            @click="handleRemoveFile"
            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
            :disabled="isSubmitting"
            title="Hapus gambar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500">Klik tombol X untuk menghapus gambar</p>
      </div>
    </div>

    <!-- Slot Ringkasan (Tidak Berubah) -->
    <slot name="summary"></slot>

    <!-- [PERUBAHAN]: Hanya ada SATU tombol submit -->
    <button
      @click="$emit('submitOrderAndUpload')"
      :disabled="isSubmitting"
      class="w-full bg-[#BAB772] hover:bg-[#a8a668] text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan & Upload Bukti' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// [PERUBAHAN]: Props dan Emits disederhanakan
const props = defineProps<{
  fullName: string
  address: string
  contact: string
  isSubmitting: boolean
  filePreviewUrl: string | null // Prop baru untuk menampilkan preview
  maxFileSize?: number // Ukuran maksimal file dalam bytes (default: 5MB)
}>()

const emit = defineEmits<{
  (e: 'update:fullName', value: string): void
  (e: 'update:address', value: string): void
  (e: 'update:contact', value: string): void
  (e: 'fileSelected', event: Event): void
  (e: 'fileRemoved'): void // Emit baru untuk menghapus file
  (e: 'fileError', message: string): void // Emit untuk error
  (e: 'submitOrderAndUpload'): void // Emit baru untuk satu tombol
}>()

// Default max file size: 5MB (5 * 1024 * 1024 bytes)
const DEFAULT_MAX_FILE_SIZE = 3 * 1024 * 1024
const maxFileSize = computed(() => props.maxFileSize || DEFAULT_MAX_FILE_SIZE)

// Ref untuk input file
const fileInputRef = ref<HTMLInputElement | null>(null)

// Fungsi untuk format ukuran file
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Handler untuk validasi file sebelum emit
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (!target.files || target.files.length === 0) {
    emit('fileSelected', event)
    return
  }

  const file = target.files[0]

  // Validasi tipe file
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    const errorMessage = `Format file tidak didukung! Hanya file JPG/PNG yang diizinkan.`
    emit('fileError', errorMessage)

    // Reset input file
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  // Validasi ukuran file
  if (file.size > maxFileSize.value) {
    const maxSizeFormatted = formatFileSize(maxFileSize.value)
    const fileSizeFormatted = formatFileSize(file.size)
    const errorMessage = `Ukuran file melebihi batas maksimal! Ukuran file: ${fileSizeFormatted}, Batas maksimal: ${maxSizeFormatted}`

    emit('fileError', errorMessage)

    // Reset input file
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }

    return
  }

  // Jika valid, emit event ke parent
  emit('fileSelected', event)
}

// Handler untuk menghapus file
const handleRemoveFile = () => {
  // Reset input file
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  // Emit event untuk menghapus file di parent
  emit('fileRemoved')
}

// Handler untuk input kontak (hanya angka)
const handleContactInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Hanya izinkan angka
  const numericValue = value.replace(/\D/g, '')

  // Update nilai input
  target.value = numericValue

  // Emit ke parent
  emit('update:contact', numericValue)
}
</script>
