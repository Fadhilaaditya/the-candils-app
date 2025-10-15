<template>
  <footer class="bg-[#BAB772] text-white">
    <div class="mx-auto px-4 py-10">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-10 md:flex-row md:gap-16">
        <!-- Brand -->
        <div class="w-full md:w-1/3">
          <h4 class="text-xl font-semibold">The Candil's</h4>
          <p class="mt-3 text-left text-sm leading-6">
            {{ content.brandText }}
          </p>
        </div>

        <!-- Navigation -->
        <div class="w-full md:w-1/3">
          <h4 class="text-xl font-semibold">Navigasi</h4>
          <ul class="mt-3 space-y-2 text-left text-sm">
            <li v-for="(link, idx) in content.navLinks" :key="idx">
              <RouterLink :to="link.href">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="w-full md:w-1/3">
          <h4 class="text-xl font-semibold">Hubungi Kami</h4>
          <ul class="mt-3 space-y-3 text-left text-sm">
            <li class="flex items-center justify-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="currentColor"
              >
                <path
                  d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.86 8.15 6.84 9.47.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.19-3.37-1.19-.45-1.15-1.11-1.45-1.11-1.45-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.67 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84c.85 0 1.7.12 2.5.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.39.2 2.42.1 2.67.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.67.92.67 1.86 0 1.35-.01 2.44-.01 2.77 0 .27.18.58.69.48A9.98 9.98 0 0 0 22 12c0-5.5-4.46-9.96-10-9.96Z"
                />
              </svg>
              <span>{{ content.social.instagram }}</span>
            </li>
            <li class="flex items-center justify-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="currentColor"
              >
                <path
                  d="M12 2C6.48 2 2 6.03 2 10.98c0 2.76 1.31 5.23 3.45 6.92L4.7 22l4.27-1.66c.99.27 2.03.42 3.03.42 5.52 0 10-4.03 10-8.98C22 6.03 17.52 2 12 2m5.34 12.56c-.23.65-1.14 1.2-1.57 1.24-.42.04-.95.06-1.53-.1-.35-.1-.79-.26-1.36-.51-2.39-1.04-3.95-3.45-4.07-3.61-.12-.17-.97-1.29-.97-2.47s.61-1.75.83-1.99c.23-.24.51-.3.68-.3h.49c.16 0 .37.03.57.43.23.47.74 1.64.8 1.76.06.12.1.26.02.42-.08.17-.12.27-.25.41-.12.14-.26.31-.37.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.34 1.66.92.82 1.69 1.08 1.93 1.2.24.12.38.11.53-.06.15-.17.61-.71.78-.95.17-.24.33-.2.56-.12.23.08 1.46.69 1.71.82.25.13.42.19.49.3.06.12.06.68-.17 1.33Z"
                />
              </svg>
              <span>{{ content.social.whatsapp }}</span>
            </li>
          </ul>
        </div>
      </div>

      <hr class="my-8 mx-auto w-full max-w-3xl border-white/40" />
      <p class="text-center text-xs">© 2025 The Candil's. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import fallbackData from './data/footer.json'

defineOptions({ name: 'UserFooter' })

interface NavLink {
  label: string
  href: string
}
interface FooterData {
  brandTitle: string
  brandText: string
  navLinks: NavLink[]
  social: { instagram: string; whatsapp: string }
}

const props = defineProps<{ endpoint?: string; initialData?: FooterData }>()

const content = ref<FooterData>({ ...fallbackData })

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
