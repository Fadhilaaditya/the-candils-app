<script setup lang="ts">
import Navbar from '@/views/user/_components/Navbar.vue'
import Footer from '@/views/user/_components/Footer.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <Navbar />
  <RouterView />
  <Footer />
</template>

<style scoped></style>
