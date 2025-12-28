<template>
  <div class="space-y-6">
    <fieldset>
      <div>
        <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
        <input
          id="fullName"
          :value="fullName"
          @input="$emit('update:fullName', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          placeholder="Nama Anda"
          required
          :disabled="isSubmitting"
        />
      </div>

      <div class="mt-6">
        <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap *</label>
        <input
          id="address"
          :value="address"
          @input="$emit('update:address', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          placeholder="Alamat pengiriman"
          required
          :disabled="isSubmitting"
        />
      </div>

      <div class="mt-6">
        <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">Kontak *</label>
        <input
          id="contact"
          :value="contact"
          @input="handleContactInput"
          type="tel" 
          inputmode="numeric" 
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          placeholder="Nomor telepon / WhatsApp (hanya angka)"
          required
          :disabled="isSubmitting"
        />
      </div>

      <div class="mt-6">
        <label for="shipping" class="block text-sm font-medium text-gray-700 mb-2">Opsi Pengiriman *</label>
        <select
          id="shipping"
          :value="selectedOngkirId || ''"
          @change="$emit('update:selectedOngkirId', Number(($event.target as HTMLSelectElement).value))"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#BAB772] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 bg-white"
          required
          :disabled="isSubmitting"
        >
          <option value="" disabled>-- Pilih Pengiriman --</option>
          <option 
            v-for="ongkir in ongkirList" 
            :key="ongkir.ongkirId" 
            :value="ongkir.ongkirId"
            :disabled="ongkir.isDisabled"
          >
            {{ ongkir.displayLabel || `${ongkir.nama} - Rp ${formatPrice(ongkir.biaya)}` }}
          </option>
        </select>
      </div>
    </fieldset>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</label>
      <div class="border rounded-lg p-4 text-center bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-800">Pembayaran QRIS</h3>
        <p class="text-sm text-gray-600 mt-1 mb-4">
          Silakan scan kode di bawah ini menggunakan e-wallet atau m-banking Anda.
        </p>
        
        <img 
          src="https://res.cloudinary.com/dosfggbxu/image/upload/v1766898291/WhatsApp_Image_2025-12-28_at_11.23.15_aystuu.jpg" 
          alt="Kode QRIS Pembayaran"
          class="w-full max-w-[250px] mx-auto rounded-md border"
        />
        
        <p class="text-xs text-gray-500 mt-3">Mendukung semua aplikasi pembayaran QRIS</p>
      </div>
    </div>

    <div class="space-y-4 pt-4 border-t">
      <h3 class="text-lg font-semibold text-gray-800">Upload Bukti Pembayaran *</h3>

      <div v-if="!filePreviewUrl">
        <p class="text-sm text-gray-600">Silakan upload bukti transfer Anda (JPG/PNG).</p>
        <label for="fileInput" class="block text-sm font-medium text-gray-700 mb-2 mt-2">File Bukti</label>
        <input
          id="fileInput"
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
      
      <div v-if="filePreviewUrl" class="text-center space-y-3 p-4 border border-green-200 rounded-lg bg-green-50">
        <label class="block text-sm font-medium text-gray-700 mb-2">Preview Bukti Berhasil Di-upload:</label>
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
        <p class="text-xs text-gray-500">Bukti siap dikirim. Klik tombol 'X' untuk mengganti.</p>
      </div>
    </div>

    <slot name="summary"></slot>

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

const props = defineProps<{
  fullName: string
  address: string
  contact: string
  isSubmitting: boolean
  filePreviewUrl: string | null
  maxFileSize?: number // Ukuran maksimal file dalam bytes (default: 3MB)
  ongkirList: any[]
  selectedOngkirId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:fullName', value: string): void
  (e: 'update:address', value: string): void
  (e: 'update:contact', value: string): void
  (e: 'update:selectedOngkirId', value: number): void
  (e: 'fileSelected', event: Event): void
  (e: 'fileRemoved'): void 
  (e: 'fileError', message: string): void 
  (e: 'submitOrderAndUpload'): void 
}>()

// Helper format price
const formatPrice = (n: number | string): string => {
  const num = Number(n);
  return new Intl.NumberFormat('id-ID').format(isNaN(num) ? 0 : num);
}

// Default max file size: 10MB
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024
const maxFileSize = computed(() => props.maxFileSize || DEFAULT_MAX_FILE_SIZE)

// Ref untuk input file
const fileInputRef = ref<HTMLInputElement | null>(null)

// Fungsi untuk format ukuran file
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  // Menggunakan Math.round agar pembulatan rapi
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
    const errorMessage = `Format file tidak didukung! Hanya file JPG dan PNG yang diizinkan.`
    emit('fileError', errorMessage)

    // Reset input file
    target.value = ''
    return
  }

  // Validasi ukuran file
  if (file.size > maxFileSize.value) {
    const maxSizeFormatted = formatFileSize(maxFileSize.value)
    const fileSizeFormatted = formatFileSize(file.size)
    const errorMessage = `Ukuran file melebihi batas maksimal! Ukuran file: ${fileSizeFormatted}, Batas maksimal: ${maxSizeFormatted}`

    emit('fileError', errorMessage)

    // Reset input file
    target.value = ''

    return
  }

  // Jika valid, emit event ke parent
  emit('fileSelected', event)
}

// Handler untuk menghapus file
const handleRemoveFile = () => {
  // Reset input file agar user bisa upload ulang
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

  // Hanya izinkan angka (menggunakan \D untuk non-digit)
  const numericValue = value.replace(/\D/g, '')

  // Update nilai input (penting untuk UX agar input terlihat difilter)
  target.value = numericValue

  // Emit ke parent
  emit('update:contact', numericValue)
}
</script>
