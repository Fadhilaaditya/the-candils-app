<template>
  <section class="bg-neutral-50 py-16">
    <div class="mx-auto grid max-w-6xl grid-col-reverse grid-cols-1 gap-10 px-4 md:grid-cols-2">
      <div>
        <h2 class="text-4xl font-semibold md:text-5xl">{{ content.heading }}</h2>
        <p class="mt-4 text-sm leading-7 text-neutral-700 font-base">{{ content.description }}</p>
        <div class="mt-6">
          <a
            :href="content.cta.href"
            class="inline-flex items-center gap-2 rounded-md bg-[#BAB772] px-4 py-2 text-sm text-white hover:bg-[#a8a668]"
          >
            <span>{{ content.cta.label }}</span>
          </a>
        </div>
      </div>
      <div>
        <img :src="content.imageUrl" alt="about" class="w-[431px] h-[285px] rounded-lg shadow" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import fallbackData from './data/about.json'

interface CTA {
  label: string
  href: string
}
interface AboutData {
  heading: string
  description: string
  imageUrl: string
  cta: CTA
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
