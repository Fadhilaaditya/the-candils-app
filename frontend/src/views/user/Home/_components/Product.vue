<template>
  <section class="bg-[#BAB772] py-10">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="text-center text-2xl text-white font-semibold md:text-3xl">
        {{ content.heading }}
      </h2>
      <p class="mt-2 text-center text-sm text-white">{{ content.subheading }}</p>
      <div class="mt-10 grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
        <article
          v-for="(item, idx) in content.items"
          :key="idx"
          class="h-auto min-h-[357px] w-full max-w-[325px] rounded-lg bg-white p-4 shadow-sm"
        >
          <img :src="item.imageUrl" :alt="item.name" class="h-40 w-full rounded object-cover" />
          <h3 class="mt-4 text-xl font-semibold">{{ item.name }}</h3>
          <p class="mt-1 text-sm text-neutral-600">{{ item.description }}</p>
        </article>
      </div>
      <div class="mt-8 text-center">
        <a
          :href="content.cta.href"
          class="rounded-md bg-[#68663F] px-4 py-2 text-sm text-white hover:bg-[#7a784a]"
          >{{ content.cta.label }}</a
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ProductData } from '@/services/homeService';

defineOptions({ name: 'HomeProduct' })

const props = defineProps<{ initialData?: ProductData }>()

const defaultProductData: ProductData = {
    heading: '',
    subheading: '',
    items: [],
    cta: { label: '', href: '' }
};

const content = ref<ProductData>(props.initialData || defaultProductData)

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    }
}, { immediate: true })
</script>
