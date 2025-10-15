<template>
  <section class="py-8">
    <div class="mx-auto max-w-5xl px-4">
      <div class="rounded-l-2xl border-l-4 border-[#BAB772] bg-white/10 pl-4">
        <h3 class="text-sm font-semibold text-[#BAB772]">{{ content.kicker }}</h3>
        <p class="mt-2 text-sm leading-6 text-neutral-700">{{ content.text }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import fallbackData from './data/funfact.json'

defineOptions({ name: 'FunFactSection' })

interface FunFactData {
  kicker: string
  text: string
}

const props = defineProps<{ endpoint?: string; initialData?: FunFactData }>()
const content = ref<FunFactData>({ ...fallbackData })

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
