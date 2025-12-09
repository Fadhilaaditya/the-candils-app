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
import { ref, watch } from 'vue'
import type { FunFactData } from '@/services/homeService';

defineOptions({ name: 'FunFactSection' })

const props = defineProps<{ initialData?: FunFactData }>()

const defaultFunFactData: FunFactData = {
    kicker: '',
    text: ''
};
const content = ref<FunFactData>(props.initialData || defaultFunFactData)

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    }
}, { immediate: true })
</script>
