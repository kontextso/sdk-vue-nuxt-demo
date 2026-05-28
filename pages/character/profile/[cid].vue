<script setup lang="ts">
// Placeholder so the avatar link in KontextAds.vue (which goes to
// /character/profile/[cid]) resolves to a real route and the
// "No match found" Vue Router warning goes away.
const route = useRoute()
const cid = computed(() => String(route.params.cid))
</script>

<template>
  <main>
    <p><NuxtLink to="/">&larr; back</NuxtLink></p>
    <h1>Profile: {{ cid }}</h1>
    <p style="opacity: 0.7;">
      Placeholder route. The real polybuzz app would render the character
      profile here.
    </p>
  </main>
</template>
