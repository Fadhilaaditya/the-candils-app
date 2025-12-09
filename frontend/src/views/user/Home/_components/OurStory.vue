<template>
  <section class="bg-white py-16 h-[443px]">
    <div
      class="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="mx-auto h-8 w-8 text-neutral-400"
      >
        <path
          fill="currentColor"
          d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8V11.17A5.17 5.17 0 0 0 7.17 6m9.66 0A5.17 5.17 0 0 0 11.83 11.17V22h8V11.17A5.17 5.17 0 0 0 16.83 6"
        />
      </svg>
      <p class="mt-6 text-3xl leading-7 text-neutral-700 md:text-3lg">{{ content.quote }}</p>
      <div class="mt-8">
        <a
          :href="content.cta.href"
          class="rounded-md text-white bg-[#68663F] px-4 py-2 text-sm hover:bg-[#7a784a]"
          >{{ content.cta.label }}</a
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OurStoryData } from '@/services/homeService';


const props = defineProps<{ initialData?: OurStoryData }>()

const defaultOurStoryData: OurStoryData = {
    quote: '',
    cta: { label: '', href: '' }
};

const content = ref<OurStoryData>(props.initialData || defaultOurStoryData)

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    }
}, { immediate: true })
</script>
