<template>
  <section
    class="relative min-h-[445px] overflow-hidden bg-cover bg-center"
    :style="backgroundStyle"
  >
    <div class="h-[445px] bg-black/40">
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import fallbackData from './data/hero.json'

defineOptions({ name: 'HomeHero' })

interface HeroButton {
  label: string
  href: string
}
interface HeroData {
  title: string
  subtitle: string
  imageUrl: string
  buttons: HeroButton[]
}

const props = defineProps<{
  endpoint?: string
  initialData?: HeroData
}>()

const content = ref<HeroData>({
  ...fallbackData,
})

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${content.value.imageUrl})`,
}))

onMounted(async () => {
  if (props.initialData) {
    content.value = props.initialData
    return
  }
  if (props.endpoint) {
    try {
      const res = await fetch(props.endpoint)
      if (res.ok) {
        content.value = await res.json()
      }
    } catch {}
  }
})
</script>
