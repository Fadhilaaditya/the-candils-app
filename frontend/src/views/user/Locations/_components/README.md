# Google Maps Component

This component provides a Google Maps integration for displaying branch locations and other points of interest.

## Setup

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Add your API key to your environment variables:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## Usage

```vue
<template>
  <GoogleMaps :locations="locations" :center="mapCenter" :zoom="13" />
</template>

<script setup>
import GoogleMaps from './_components/GoogleMaps.vue'

const locations = [
  {
    id: 'branch-1',
    name: 'Branch Name',
    address: 'Full Address',
    lat: -6.295,
    lng: 106.732,
    type: 'branch', // 'branch' | 'competitor' | 'landmark'
  },
]

const mapCenter = {
  lat: -6.295,
  lng: 106.732,
}
</script>
```

## Features

- Interactive Google Maps with custom styling
- Different marker types for branches, competitors, and landmarks
- Info windows with location details
- Responsive design
- Loading state
- TypeScript support

## Props

- `locations`: Array of location objects
- `center`: Map center coordinates
- `zoom`: Map zoom level (default: 13)

## Location Data Structure

```typescript
interface Location {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: 'branch' | 'competitor' | 'landmark'
  phone?: string
  hours?: string
}
```
