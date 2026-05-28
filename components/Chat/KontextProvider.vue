<template>
  <AdsProvider
    publisher-token="polybuzz-dev"
    :user-id="authStore.userInfos?.suid"
    :conversation-id="sessionId"
    :character="character"
    :enabled-placement-codes="['inlineAd']"
    :user-email="authStore.userInfos?.userEmail"
    :on-event="eventHandler"
  >
    <slot></slot>
  </AdsProvider>
</template>
<script lang="ts" setup>
import { AdsProvider } from "@kontextso/sdk-vue";
import type { AdEventHandler } from "@kontextso/sdk-vue";
import { useStore } from "@/components/Chat/store/state";
import usePlugin from "@/components/PluginStore/hook";
import { EVENT_NAME } from "@/components/PluginStore/interface";
const authStore = useAuthStore();
const { sessionId, sceneInfo } = useStore();
const { triggerEvents } = usePlugin();
const character = computed(() => ({
  id: sceneInfo.value.secretSceneId,
  name: sceneInfo.value.sceneName,
  avatarUrl: sceneInfo.value.sceneAvatarUrl,
}));

const eventHandler: AdEventHandler = ({ name }) => {
  console.log("--- kontext ads, event ", name);
  if (name === "ad.render-completed") {
    triggerEvents(EVENT_NAME.CHAT_AD_KONTEXT_RENDERED);
  } else if (name === "ad.error" || name === "ad.no-fill") {
    triggerEvents(EVENT_NAME.CHAT_AD_KONTEXT_ERROR);
  }
};
</script>
