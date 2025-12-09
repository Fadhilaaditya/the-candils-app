<template>
  <section class="bg-neutral-50 py-16">
    <div class="mx-auto max-w-6xl px-4">
      <!-- Heading (Moved out for better mobile ordering) -->
      <h2 class="text-4xl font-semibold md:text-5xl mb-8 text-center md:text-left">{{ content.heading }}</h2>

      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
        <!-- Image (First on mobile, Second on desktop) -->
        <div class="md:order-2 flex justify-center md:justify-end">
          <img :src="content.imageUrl" alt="about" class="w-full max-w-[431px] h-auto rounded-lg shadow" />
        </div>

        <!-- Description (Second on mobile, First on desktop) -->
        <div class="md:order-1">
          <p class="text-sm leading-7 text-neutral-700 font-base">{{ content.description }}</p>
          <div class="mt-6">
            <a
              :href="content.cta.href"
              class="inline-flex items-center gap-2 rounded-md bg-[#BAB772] px-4 py-2 text-sm text-white hover:bg-[#a8a668]"
            >
              <span>{{ content.cta.label }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AboutData } from '@/services/homeService';

defineOptions({ name: 'HomeAboutUs' })

const props = defineProps<{ initialData?: AboutData }>()

// Define a default/fallback data structure if initialData is not provided
const defaultAboutData: AboutData = {
  heading: 'Default Heading',
  description: 'This is a default description for the About Us section. Please provide data via props.',
  imageUrl: '/placeholder-image.jpg', // Replace with a suitable default image path
  cta: {
    label: 'Learn More',
    href: '/about'
  }
};

const content = ref<AboutData>(props.initialData || defaultAboutData);

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    } else {
        content.value = defaultAboutData;
    }
}, { immediate: true })
</script>
