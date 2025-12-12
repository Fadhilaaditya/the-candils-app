<template>
  <VueFinalModal
    v-model="modelValue"
    class="flex justify-center items-center"
    content-class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4"
    @closed="resetForm"
  >
    <div class="mb-4">
      <h3 class="text-lg font-bold text-gray-900">Tambah Akun Baru</h3>
      <p class="text-sm text-gray-500">Masukkan detail akun baru di bawah ini.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Username -->
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          v-model="form.username"
          type="text"
          id="username"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border"
        />
      </div>

       <!-- Nama Lengkap -->
      <div>
        <label for="namaLengkap" class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          v-model="form.namaLengkap"
          type="text"
          id="namaLengkap"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border"
        />
      </div>

       <!-- Role -->
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
        <select
          v-model="form.role"
          id="role"
          required
           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border bg-white"
        >
          <option value="Admin">Admin</option>
          <option value="Super Admin">Super Admin</option>
        </select>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          required
          minlength="6"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          type="button"
          @click="modelValue = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BAB772]"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="px-4 py-2 text-sm font-medium text-white bg-[#BAB772] border border-transparent rounded-md hover:bg-[#a8a668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BAB772] disabled:opacity-75"
        >
          {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { createUser } from '@/services/userService'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  isVisible: boolean
}>()

const emit = defineEmits(['update:isVisible', 'success'])

const toast = useToast()
const isLoading = ref(false)

const form = ref({
  username: '',
  namaLengkap: '',
  role: 'Admin',
  password: ''
})

const modelValue = computed({
  get: () => props.isVisible,
  set: (val) => emit('update:isVisible', val)
})

const resetForm = () => {
  form.value = {
    username: '',
    namaLengkap: '',
    role: 'Admin',
    password: ''
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await createUser(form.value)
    toast.success('Akun berhasil dibuat!')
    emit('success')
  } catch (error: any) {
    console.error('Create user error:', error)
    toast.error(error.response?.data?.message || 'Gagal membuat akun.')
  } finally {
    isLoading.value = false
  }
}
</script>
