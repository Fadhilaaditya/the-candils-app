<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in users" :key="user.userId" class="hover:bg-gray-50 transition-colors duration-150">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.username }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.namaLengkap }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="user.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'"
            >
              {{ user.role }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
             <button @click="$emit('edit', user)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
             <button @click="$emit('delete', user.userId)" class="text-red-600 hover:text-red-900">Hapus</button>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="4" class="px-6 py-10 text-center text-gray-500">
            Belum ada data user.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/services/userService'

defineProps<{
  users: User[]
}>()

defineEmits(['edit', 'delete'])
</script>
