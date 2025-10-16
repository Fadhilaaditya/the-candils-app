<template>
  <div class="bg-gray-100 p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Overview</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <LocationCard
          v-for="location in dashboardData.locations"
          :key="location.id"
          :location="location"
        />
      </div>

      <div class="lg:col-span-2">
        <GrafikCard :graph-data="dashboardData.salesGraph" />
      </div>

      <div class="lg:col-span-1">
        <UlasanCard :reviews="dashboardData.productReviews" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Import data from JSON file
import dashboardData from './data/DataDashboard.json';

// Import all child components
import LocationCard from './_components/LocationCard.vue';
import UlasanCard from './_components/UlasanCard.vue';
import GrafikCard from './_components/GrafikCard.vue';
</script>
