<template>
  <section class="py-8">
    <div class="mx-auto max-w-6xl px-4">
      <div class="grid grid-cols-1 items-start gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <img :src="content.image" class="h-[391px] w-[391px] rounded object-cover md:h-72" />
        <div class="self-center">
          <h3 class="text-base font-semibold">{{ content.title }}</h3>
          <p
            class="mt-2 text-sm leading-6 text-neutral-700"
            v-for="(p, i) in content.paragraphs"
            :key="i"
          >
            {{ p }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CultureData } from '@/services/homeService';

defineOptions({ name: 'BudayaSection' })

const props = defineProps<{ initialData?: CultureData }>()

const defaultCultureData: CultureData = {
    title: '',
    image: '',
    paragraphs: []
};
const content = ref<CultureData>(props.initialData || defaultCultureData)

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    }
}, { immediate: true })
</script>
