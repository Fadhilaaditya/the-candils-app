<template>
  <section class="bg-white py-10">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="text-lg font-semibold text-neutral-700">{{ content.title }}</h2>
      <div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[1.35fr_1fr]">
        <div class="space-y-3 text-sm leading-6 text-neutral-700">
          <p v-for="(para, idx) in content.paragraphs" :key="idx">{{ para }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <img
            v-for="(img, idx) in content.images"
            :key="idx"
            :src="img"
            class="h-45 w-full rounded object-cover"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import fallbackData from './data/about.json'

defineOptions({ name: 'AboutSection' })

interface AboutData {
  title: string
  paragraphs: string[]
  images: string[]
}

const props = defineProps<{ endpoint?: string; initialData?: AboutData }>()
const content = ref<AboutData>({ ...fallbackData })

onMounted(async () => {
  if (props.initialData) {
    content.value = props.initialData
    return
  }
  if (props.endpoint) {
    try {
      const res = await fetch(props.endpoint)
      if (res.ok) content.value = await res.json()
    } catch {}
  }
})
</script>
