<script setup lang="ts">
import { buildCidWithName } from '~/common/tools/seo-id'

// Three sample characters, with cid built using the same convention as
// polybuzz: "slug-secretSceneId".
const characters = [
  {
    secretSceneId: '42y7D',
    sceneName: 'Pugsley Addams',
    oriSceneName: 'Pugsley Addams',
    sceneAvatarUrl: 'https://cdn.polyspeak.ai/speakmaster/f44c68b2d2512501d705869b2648818d.webp',
  },
  {
    secretSceneId: 'uyWK7',
    sceneName: 'Angelo Parker',
    oriSceneName: 'Angelo Parker',
    sceneAvatarUrl: '',
  },
  {
    secretSceneId: 'vqfNe',
    sceneName: 'Lily Skynir',
    oriSceneName: 'Lily Skynir',
    sceneAvatarUrl: '',
  },
]
</script>

<template>
  <main>
    <h1>polybuzz-style chat (Nuxt 3 SSR repro)</h1>
    <p>
      Pick a character to open its chat. Each chat lives at
      <code>/character/chat/[cid]</code>, exactly the polybuzz route shape.
      Open DevTools → Network → filter <code>/init</code> and watch
      <code>installId</code> in each request body — it changes every navigation.
    </p>
    <ul>
      <li v-for="c in characters" :key="c.secretSceneId" style="margin: 0.5rem 0;">
        <NuxtLink :to="`/character/chat/${buildCidWithName(c.secretSceneId, c.oriSceneName)}`">
          Chat with {{ c.sceneName }} (cid <code>{{ buildCidWithName(c.secretSceneId, c.oriSceneName) }}</code>)
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
