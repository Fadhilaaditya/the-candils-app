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
import { ref, onMounted } from 'vue'
import fallbackData from './data/budaya.json'

defineOptions({ name: 'BudayaSection' })

interface BudayaData {
  title: string
  image: string
  paragraphs: string[]
}

const props = defineProps<{ endpoint?: string; initialData?: BudayaData }>()
const content = ref<BudayaData>({ ...fallbackData })

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
