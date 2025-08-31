<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './_components/Sidebar.vue'
</script>
