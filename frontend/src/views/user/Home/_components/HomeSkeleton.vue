<template>
  <div class="w-full animate-pulse">
    <!-- Hero Skeleton -->
    <div class="w-full h-[300px] md:h-[445px] bg-gray-200"></div>

    <!-- About Us Skeleton -->
    <section class="bg-white py-16">
      <div class="mx-auto max-w-6xl px-4">
        <!-- Heading -->
        <div class="h-10 bg-gray-200 w-1/3 mb-8 mx-auto md:mx-0 rounded"></div>

        <div class="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
          <!-- Image -->
          <div class="md:order-2 flex justify-center md:justify-end">
            <div class="w-full max-w-[431px] h-[300px] bg-gray-200 rounded-lg"></div>
          </div>

          <!-- Description -->
          <div class="md:order-1 flex flex-col gap-4">
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div class="h-4 bg-gray-200 w-4/6 rounded"></div>
            <div class="mt-6">
              <div class="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Skeleton -->
    <section class="bg-gray-100 py-10">
      <div class="mx-auto max-w-6xl px-4 flex flex-col items-center">
        <!-- Heading & Subheading -->
        <div class="h-8 bg-gray-200 w-48 mb-3 rounded"></div>
        <div class="h-4 bg-gray-200 w-64 mb-10 rounded"></div>

        <!-- Cards -->
        <div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3 w-full">
          <div
            v-for="i in 3"
            :key="i"
            class="h-[357px] w-full max-w-[325px] rounded-lg bg-white p-4 shadow-sm"
          >
            <div class="h-40 w-full bg-gray-200 rounded mb-4"></div>
            <div class="h-6 bg-gray-200 w-3/4 mb-2 rounded"></div>
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-2/3 mt-2 rounded"></div>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-8">
            <div class="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </section>

    <!-- Our Story Skeleton -->
    <section class="bg-white py-16 h-[443px] flex items-center justify-center">
      <div class="flex flex-col items-center max-w-3xl w-full px-4">
        <!-- Icon -->
        <div class="h-8 w-8 bg-gray-200 rounded-full mb-6"></div>
        <!-- Quote -->
        <div class="h-6 bg-gray-200 w-full mb-3 rounded"></div>
        <div class="h-6 bg-gray-200 w-5/6 mb-3 rounded"></div>
        <div class="h-6 bg-gray-200 w-4/6 rounded"></div>
        <!-- CTA -->
        <div class="mt-8">
            <div class="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomeSkeleton' });
</script>
