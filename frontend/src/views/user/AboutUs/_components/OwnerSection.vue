<template>
  <section class="py-8">
    <div class="mx-auto max-w-6xl px-4">
      <div class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 p-5 gap-3 md:gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <img :src="content.photo" class="h-[411px] w-[311px] rounded object-cover" />
          <div>
            <h3 class="text-lg font-semibold text-[#BAB772]">{{ content.heading }}</h3>
            <h4 class="mt-1 text-base font-semibold">{{ content.name }}</h4>
            <p class="text-xs text-neutral-500">{{ content.role }}</p>
            <div class="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
              <p v-for="(para, idx) in content.story" :key="idx">{{ para }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OwnerData } from '@/services/homeService';

defineOptions({ name: 'OwnerSection' })

const props = defineProps<{ initialData?: OwnerData }>()

const defaultOwnerData: OwnerData = {
    heading: '',
    name: '',
    role: '',
    photo: '',
    story: []
};
const content = ref<OwnerData>(props.initialData || defaultOwnerData)

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        content.value = newVal
    }
}, { immediate: true })
</script>
