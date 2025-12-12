<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Kelola Akun</h2>
        <p class="text-gray-600 mt-1">Daftar akun Admin dan Super Admin</p>
      </div>
      <button
        @click="handleAdd"
        class="mt-4 lg:mt-0 bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-200 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Tambah Akun
      </button>
    </div>

    <!-- Error/Loading -->
    <div v-if="isLoading" class="flex justify-center py-10">
         <svg class="h-10 w-10 text-[#BAB772] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
        {{ errorMessage }}
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <AccountTable
        :users="users"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Modals -->
    <AddAccountModal
      v-model:is-visible="isAddModalVisible"
      @success="fetchUsers"
    />

    <EditAccountModal
      v-model:is-visible="isEditModalVisible"
      :user="selectedUser"
      @success="fetchUsers"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllUsers, deleteUser, type User } from '@/services/userService'
import AccountTable from './_components/AccountTable.vue'
import AddAccountModal from './_components/AddAccountModal.vue'
import EditAccountModal from './_components/EditAccountModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const users = ref<User[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isAddModalVisible = ref(false)
const isEditModalVisible = ref(false)
const selectedUser = ref<User | null>(null)

const fetchUsers = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await getAllUsers()
        users.value = response.data
    } catch (error: any) {
        console.error('Fetch users error:', error)
        errorMessage.value = error.response?.data?.message || 'Gagal memuat data pengguna.'
    } finally {
        isLoading.value = false
    }
}

const handleAdd = () => {
    isAddModalVisible.value = true
}

const handleEdit = (user: User) => {
    selectedUser.value = user
    isEditModalVisible.value = true
}

const handleDelete = async (userId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini?')) return

    try {
        await deleteUser(userId)
        toast.success('Akun berhasil dihapus')
        fetchUsers()
    } catch (error: any) {
         console.error('Delete user error:', error)
         toast.error(error.response?.data?.message || 'Gagal menghapus akun.')
    }
}

onMounted(() => {
    fetchUsers()
})
</script>
