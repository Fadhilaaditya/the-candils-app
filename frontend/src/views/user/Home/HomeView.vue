<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
  </div>
  <div v-else>
    <Hero v-if="homeContent?.hero" :initial-data="homeContent.hero" />
    <AboutUs v-if="homeContent?.about" :initial-data="homeContent.about" />
    <Product v-if="homeContent?.products" :initial-data="homeContent.products" />
    <OurStory v-if="homeContent?.ourstory" :initial-data="homeContent.ourstory" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Hero from './_components/Hero.vue';
import AboutUs from './_components/AboutUs.vue';
import Product from './_components/Product.vue';
import OurStory from './_components/OurStory.vue';
import { getHomeContent, type HomeContent } from '@/services/homeService';

const homeContent = ref<HomeContent | null>(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await getHomeContent();
        if (response.data.success) {
            homeContent.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to fetch home content:', error);
    } finally {
        loading.value = false;
    }
});
</script>
