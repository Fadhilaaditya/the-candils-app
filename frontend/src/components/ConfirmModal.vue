<template>
  <VueFinalModal
    v-model="showModal"
    class="flex justify-center items-center"
    content-class="relative flex flex-col max-w-md mx-4 bg-white rounded-2xl shadow-2xl"
    @before-open="onBeforeOpen"
  >
    <template #default>
      <div class="flex justify-center pt-8 pb-4">
        <div :class="[
          'w-16 h-16 rounded-full flex items-center justify-center',
          currentConfig.variant === 'danger' ? 'bg-red-100' : 'bg-amber-100' // Menggunakan currentConfig
        ]">
          <svg 
            v-if="currentConfig.variant === 'danger'" 
            class="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          
          <svg 
            v-else 
            class="w-8 h-8 text-amber-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <div class="px-8 pb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">
          {{ currentConfig.title }} </h2>
        <p class="text-gray-600 leading-relaxed mb-4">
          {{ currentConfig.message }} </p>
          
          <!-- [NEW] Input Field -->
          <div v-if="currentConfig.showInput" class="text-left">
            <textarea
              v-model="userInput"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              :placeholder="currentConfig.inputPlaceholder"
            ></textarea>
          </div>
      </div>

      <div class="flex gap-3 px-8 pb-8">
        <button 
          @click="cancel" 
          class="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          {{ currentConfig.cancelButtonText }} </button>
        <button 
          @click="confirm" 
          :class="[
            'flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200',
            currentConfig.variant === 'danger' // ✅ Menggunakan currentConfig
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
          ]"
        >
          {{ currentConfig.confirmButtonText }} </button>
      </div>
    </template>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

interface Props {
  title?: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
  variant?: 'danger' | 'warning' // New prop for styling
}

// Definisikan tipe untuk Payload Runtime (argumen dari KelolaPesanan.vue)
interface RuntimePayload {
    title?: string
    message?: string
    confirmButtonText?: string
    cancelButtonText?: string
    variant?: 'danger' | 'warning'
    showInput?: boolean // [NEW] Option to show input
    inputRequired?: boolean // [NEW] Validation flag
    inputPlaceholder?: string // [NEW] Placeholder for input
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Konfirmasi',
  message: 'Apakah Anda yakin ingin melanjutkan?',
  confirmButtonText: 'Ya, Lanjutkan',
  cancelButtonText: 'Batal',
  variant: 'danger'
})

const emit = defineEmits(['confirm', 'cancel'])

const showModal = ref(false)
// Update resolvePromise type to allow returning data object
let resolvePromise: ((value: { confirmed: boolean; value?: string } | PromiseLike<{ confirmed: boolean; value?: string }>) => void) | undefined
const runtimeConfig = ref<RuntimePayload>({}) 
const userInput = ref('') // [NEW] State for input

// ✅ COMPUTED: Menggabungkan props default dan konfigurasi runtime
const currentConfig = computed(() => ({
    title: runtimeConfig.value.title || props.title,
    message: runtimeConfig.value.message || props.message,
    confirmButtonText: runtimeConfig.value.confirmButtonText || props.confirmButtonText,
    cancelButtonText: runtimeConfig.value.cancelButtonText || props.cancelButtonText,
    variant: runtimeConfig.value.variant || props.variant,
    showInput: runtimeConfig.value.showInput,
    inputRequired: runtimeConfig.value.inputRequired, // Pass through
    inputPlaceholder: runtimeConfig.value.inputPlaceholder || 'Masukkan alasan...',
}))


// ✅ PERBAIKAN FUNGSI OPEN: Menerima payload konfigurasi
const open = (payload: RuntimePayload = {}): Promise<{ confirmed: boolean; value?: string }> => {
  runtimeConfig.value = payload 
  userInput.value = '' // Reset input
  showModal.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  // Check validasi input HANYA JIKA showInput=true DAN inputRequired=true (default)
  const isInputRequired = currentConfig.value.inputRequired !== false; // Default true if undefined
  
  if (currentConfig.value.showInput && isInputRequired && !userInput.value.trim()) {
      return; 
  }
  showModal.value = false
  resolvePromise?.({ confirmed: true, value: userInput.value })
  emit('confirm')
}

const cancel = () => {
  showModal.value = false
  resolvePromise?.({ confirmed: false })
  emit('cancel')
}

// Untuk memastikan resolve dipanggil jika modal ditutup dari luar
const onBeforeOpen = () => {
  if (resolvePromise === undefined) {
    resolvePromise = (result) => { 
      if (!result) { 
        console.warn('ConfirmModal closed without explicit action, resolving as false')
      }
    }
  }
}

// Ekspos fungsi open agar bisa diakses dari parent component
defineExpose({
  open
})
</script>

<style>
/* Global styles untuk vue-final-modal */
.vfm__overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>