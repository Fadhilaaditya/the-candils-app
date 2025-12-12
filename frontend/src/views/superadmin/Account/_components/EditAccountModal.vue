<template>
  <VueFinalModal
    v-model="modelValue"
    class="flex justify-center items-center"
    content-class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4"
    @closed="resetForm"
  >
    <div class="mb-4">
      <h3 class="text-lg font-bold text-gray-900">Edit Akun</h3>
      <p class="text-sm text-gray-500">Edit detail akun. Kosongkan password jika tidak ingin mengubahnya.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Username -->
      <div>
        <label for="edit-username" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          v-model="form.username"
          type="text"
          id="edit-username"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border"
        />
      </div>

       <!-- Nama Lengkap -->
      <div>
        <label for="edit-namaLengkap" class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          v-model="form.namaLengkap"
          type="text"
          id="edit-namaLengkap"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border"
        />
      </div>

       <!-- Role -->
      <div>
        <label for="edit-role" class="block text-sm font-medium text-gray-700">Role</label>
        <select
          v-model="form.role"
          id="edit-role"
          required
           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#BAB772] focus:ring focus:ring-[#BAB772] focus:ring-opacity-50 sm:text-sm p-2 border bg-white"
        >
          <option value="Admin">Admin</option>
          <option value="Super Admin">Super Admin</option>
        </select>
      </div>

      <!-- Password -->
      <div>
        <label for="edit-password" class="block text-sm font-medium text-gray-700">Password Baru (Opsional)</label>
        <input
          v-model="form.password"
          type="password"
          id="edit-password"
          minlength="6"
          placeholder="Isi hanya jika ingin ganti password"
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
import { ref, computed, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { updateUser, type User } from '@/services/userService'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  isVisible: boolean
  user: User | null
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

watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      username: newUser.username,
      namaLengkap: newUser.namaLengkap,
      role: newUser.role,
      password: ''
    }
  }
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
   if (!props.user) return
  isLoading.value = true
  try {
    const payload: any = {
        username: form.value.username,
        namaLengkap: form.value.namaLengkap,
        role: form.value.role
    }
    if (form.value.password) {
        payload.password = form.value.password
    }

    await updateUser(props.user.userId, payload)
    toast.success('Akun berhasil diupdate!')
    emit('success')
  } catch (error: any) {
    console.error('Update user error:', error)
    toast.error(error.response?.data?.message || 'Gagal update akun.')
  } finally {
    isLoading.value = false
  }
}
</script>
