<script setup lang="ts">
defineProps<{
  src?: string
  type?: string
  sceneName?: string
  size?: number
  resizeW?: number
}>()
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="sceneName"
    :style="{ width: `${size ?? 44}px`, height: `${size ?? 44}px`, borderRadius: '50%', objectFit: 'cover' }"
  />
  <div
    v-else
    :style="{
      width: `${size ?? 44}px`,
      height: `${size ?? 44}px`,
      borderRadius: '50%',
      background: '#444',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#aaa',
      fontSize: '0.8rem',
    }"
  >
    {{ (sceneName || '?').slice(0, 1) }}
  </div>
</template>
