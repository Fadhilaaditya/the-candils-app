<template>
  <div class="w-full animate-pulse">
    <!-- About Section Skeleton -->
    <section class="bg-white py-10">
      <div class="mx-auto max-w-6xl px-4">
        <!-- Title -->
        <div class="h-7 bg-gray-200 w-1/4 mb-4 rounded"></div>
        <div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[1.35fr_1fr]">
          <!-- Text Paragraphs -->
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-4/6 rounded"></div>
          </div>
          <!-- Images Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="h-45 w-full bg-gray-200 rounded"></div>
            <div class="h-45 w-full bg-gray-200 rounded"></div>
            <div class="h-45 w-full bg-gray-200 rounded"></div>
            <div class="h-45 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Owner Section Skeleton -->
    <section class="py-8">
      <div class="mx-auto max-w-6xl px-4">
        <div class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div class="grid grid-cols-1 p-5 gap-3 md:gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <!-- Image -->
            <div class="h-[411px] w-full md:w-[311px] bg-gray-200 rounded"></div>
            <!-- Text Content -->
            <div>
              <div class="h-6 bg-gray-200 w-1/3 mb-2 rounded"></div> <!-- Heading -->
              <div class="h-5 bg-gray-200 w-1/4 mb-1 rounded"></div> <!-- Name -->
              <div class="h-3 bg-gray-200 w-1/5 mb-4 rounded"></div> <!-- Role -->
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 w-full rounded"></div>
                <div class="h-4 bg-gray-200 w-full rounded"></div>
                <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
                <div class="h-4 bg-gray-200 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Budaya Section Skeleton -->
    <section class="py-8">
      <div class="mx-auto max-w-6xl px-4">
        <div class="grid grid-cols-1 items-start gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <!-- Image -->
          <div class="h-[391px] w-full md:w-[391px] bg-gray-200 rounded md:h-72"></div>
          <!-- Text Content -->
          <div class="self-center w-full">
            <div class="h-5 bg-gray-200 w-1/3 mb-4 rounded"></div> <!-- Title -->
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 w-full rounded"></div>
              <div class="h-4 bg-gray-200 w-full rounded"></div>
              <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FunFact Section Skeleton -->
    <section class="py-8">
      <div class="mx-auto max-w-5xl px-4">
        <div class="rounded-l-2xl border-l-4 border-gray-200 bg-white/10 pl-4">
          <div class="h-4 bg-gray-200 w-1/6 mb-2 rounded"></div>
          <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AboutUsSkeleton' });
</script>
