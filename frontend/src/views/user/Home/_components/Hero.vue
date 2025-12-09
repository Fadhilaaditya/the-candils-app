<template>
  <section
    class="relative min-h-[300px] md:min-h-[445px] overflow-hidden bg-cover bg-center"
    :style="backgroundStyle"
  >
    <div class="h-[300px] md:h-[445px] bg-black/40">
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { HeroData } from '@/services/homeService';

defineOptions({ name: 'HomeHero' })

const props = defineProps<{ initialData?: HeroData }>()

const defaultHeroData: HeroData = {
    title: '',
    subtitle: '',
    imageUrl: '',
    buttons: []
};

const content = ref<HeroData>(props.initialData || defaultHeroData)

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${content.value.imageUrl})`,
}))

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    }
}, { immediate: true })

</script>
