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
          @input="$emit('update:contact', ($event.target as HTMLInputElement).value)"
          type="text" 
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
        <p class="text-sm text-gray-600 mt-1 mb-4">Silakan scan kode di bawah ini menggunakan e-wallet atau m-banking Anda.</p>
        <img 
          src="/QRIS.jpg" 
          alt="Kode QRIS Pembayaran"
          class="w-full max-w-[250px] mx-auto rounded-md border"
        >
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
          type="file"
          @change="$emit('fileSelected', $event)"
          accept="image/png, image/jpeg"
          class="w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-[#FAFAD2] file:text-[#8f8c4b]
                 hover:file:bg-[#f0eec0]"
          :disabled="isSubmitting"
        />
      </div>
      
      <!-- [BARU]: "Review" atau Preview Gambar yang di-upload -->
      <div v-if="filePreviewUrl" class="text-center">
        <label class="block text-sm font-medium text-gray-700 mb-2">Preview Bukti:</label>
        <img 
          :src="filePreviewUrl" 
          alt="Preview Bukti Pembayaran" 
          class="w-full max-w-[250px] mx-auto rounded-md border object-cover"
        >
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
// [PERUBAHAN]: Props dan Emits disederhanakan
defineProps<{
  fullName: string
  address: string
  contact: string
  isSubmitting: boolean 
  filePreviewUrl: string | null // Prop baru untuk menampilkan preview
}>()

defineEmits<{
  (e: 'update:fullName', value: string): void
  (e: 'update:address', value: string): void
  (e: 'update:contact', value: string): void
  (e: 'fileSelected', event: Event): void
  (e: 'submitOrderAndUpload'): void // Emit baru untuk satu tombol
}>()
</script>

