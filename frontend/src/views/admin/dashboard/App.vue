<template>
  <div class="flex h-screen overflow-hidden bg-gray-100">

    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      
      <AdminHeader />
      
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// (Script Anda tidak perlu diubah)
import AdminSidebar from './_components/Sidebar.vue'
import AdminHeader from './_components/AdminHeader.vue'

defineOptions({
  name: 'AdminLayout',
})
</script>