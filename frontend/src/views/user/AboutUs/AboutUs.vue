<template>
  <AboutUsSkeleton v-if="loading" />
  <div v-else>
    <AboutSection v-if="homeContent?.about_us_intro" :initial-data="homeContent.about_us_intro" />
    <OwnerSection v-if="homeContent?.owner" :initial-data="homeContent.owner" />
    <BudayaSection v-if="homeContent?.culture" :initial-data="homeContent.culture" />
    <FunFactSection v-if="homeContent?.funfact" :initial-data="homeContent.funfact" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AboutUsSkeleton from './_components/AboutUsSkeleton.vue';
import AboutSection from './_components/AboutSection.vue'
import OwnerSection from './_components/OwnerSection.vue'
import BudayaSection from './_components/BudayaSection.vue'
import FunFactSection from './_components/FunFactSection.vue'
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
        console.error('Failed to fetch about us content:', error);
    } finally {
        loading.value = false;
    }
});
</script>
