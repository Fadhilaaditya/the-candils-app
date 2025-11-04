<template>
  <VueFinalModal
    v-model="showModal"
    class="flex justify-center items-center"
    content-class="relative flex flex-col max-w-md mx-4 bg-white rounded-2xl shadow-2xl"
    @before-open="onBeforeOpen"
  >
    <template #default>
      <!-- Icon Container -->
      <div class="flex justify-center pt-8 pb-4">
        <div :class="[
          'w-16 h-16 rounded-full flex items-center justify-center',
          variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
        ]">
          <svg 
            v-if="variant === 'danger'" 
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

      <!-- Content -->
      <div class="px-8 pb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">
          {{ title }}
        </h2>
        <p class="text-gray-600 leading-relaxed">
          {{ message }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 px-8 pb-8">
        <button 
          @click="cancel" 
          class="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          {{ cancelButtonText }}
        </button>
        <button 
          @click="confirm" 
          :class="[
            'flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200',
            variant === 'danger' 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
          ]"
        >
          {{ confirmButtonText }}
        </button>
      </div>
    </template>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

interface Props {
  title?: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
  variant?: 'danger' | 'warning' // New prop for styling
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
let resolvePromise: ((value: boolean | PromiseLike<boolean>) => void) | undefined

// Fungsi untuk membuka modal dan mengembalikan Promise
const open = (): Promise<boolean> => {
  showModal.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  showModal.value = false
  resolvePromise?.(true)
  emit('confirm')
}

const cancel = () => {
  showModal.value = false
  resolvePromise?.(false)
  emit('cancel')
}

// Untuk memastikan resolve dipanggil jika modal ditutup dari luar
const onBeforeOpen = () => {
  if (resolvePromise === undefined) {
    resolvePromise = (value) => { 
      if (!value) { 
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