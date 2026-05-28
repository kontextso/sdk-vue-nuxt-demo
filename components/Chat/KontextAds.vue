<template>
  <div v-if="adMsgId" ref="adRef" :class="['msg-list', !isM && 'isPC', isLast && 'last-msg', !kontextVisible && 'ad-preload']">
    <NuxtLink
      no-prefetch
      :to="
        localPath({
          name: 'RoleInformation',
          params: { CID: buildCidWithName(query.secretSceneId, query.oriSceneName) },
          query: { pre_source: 1 },
        })
      "
      @click="toProfile"
    >
      <CommonAvatar
        :key="query.sceneAvatarUrl"
        :src="query.sceneAvatarUrl"
        type="role"
        :scene-name="query.sceneName"
        :size="44"
        class="mt14"
        :resize-w="128"
      ></CommonAvatar>
    </NuxtLink>
    <div :class="['messagebox', isCustomChatBgStyle && 'custom']">
      <InlineAd :message-id="adMsgId!" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { InlineAd } from "@kontextso/sdk-vue";
import { isMobile, zsTrack } from "~/common/tools";
import { useStore } from "@/components/Chat/store/state";
import { buildCidWithName } from "~/common/tools/seo-id";
import usePlugin from "@/components/PluginStore/hook";
import { EVENT_NAME, GETTER_NAME } from "@/components/PluginStore/interface";
import { SMApiAdRewardChatadReport } from "@/networkapi/yapiApi";
import { timeout } from "@/common/tools/retry";
import { kontextConfig, kontextVisible } from "./state";
import { updateAdConfig } from "./events";

defineProps<{
  isLast: boolean;
}>();

const isM = isMobile();
const { query, submitLoading } = useStore();
const localPath = useExtendLocalePath();
const { triggerGetters, triggerEvents, onEvent, offEvent } = usePlugin();
const isCustomChatBgStyle = computed(() => {
  return triggerGetters(GETTER_NAME.CHAT_CUSTOM_BACKGROUND_STYLE);
});
const adMsgId = computed(() => kontextConfig.value.msgId);
const adLoaded = ref(false);
const authStore = useAuthStore();

const toProfile = () => {
  zsTrack("IDK_059", {
    Scenes: query.value.secretSceneId,
  });
};

const onAdError = () => {
  console.log("--- kontext ads, on ad error, reset");
  adLoaded.value = false;
  kontextConfig.value.msgId = undefined;
};

const onAdLoaded = () => {
  adLoaded.value = true;
};
const resetKontext = () => {
  kontextConfig.value = {
    rounds: undefined,
    visible: false,
    loaded: false,
    msgId: undefined,
  };
};

if (import.meta.client) {
  watch(
    () => kontextVisible.value,
    (val) => {
      if (val) {
        triggerEvents(EVENT_NAME.CHAT_LIST_SCROLL_BOTTOM);
      }
    },
    {
      immediate: true,
    }
  );
  watch(
    () => kontextConfig.value.msgId,
    () => {
      kontextConfig.value.loaded = false;
    },
    {
      immediate: true,
    }
  );
  watch(
    () => [adLoaded.value, submitLoading.value],
    () => {
      kontextConfig.value.loaded = adLoaded.value && !submitLoading.value;
    },
    {
      immediate: true,
    }
  );
  watch(
    () => kontextConfig.value.visible,
    async (v) => {
      if (v) {
        try {
          await nextTick();
          const adUniqueId = Math.floor((window.performance.timeOrigin + window.performance.now()) * 1000) + "_" + authStore.userInfos?.suid;
          const createTime = String(Date.now());
          const reportType = String(adLoaded.value ? AD_REWARD.VIEW : AD_REWARD.ERROR_REWARD);
          const { default: md5 } = await import("js-md5");
          await SMApiAdRewardChatadReport({
            adUniqueId,
            reportType,
            adType: "2",
            createTime,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sign: md5(`adType=2&adUniqueId=${adUniqueId}&createTime=${createTime}&reportType=${reportType}&secret=V4hUieYUt8qeqH3Ef4K34yaOTkdWaR5J`),
          });
          await timeout(0.5);
          await updateAdConfig(false);
        } catch {
          void 0;
        }
      }
    }
  );
  onBeforeRouteLeave(() => {
    resetKontext();
  });
  onBeforeRouteUpdate(() => {
    resetKontext();
  });
  onMounted(() => {
    triggerEvents(EVENT_NAME.CHAT_LIST_SCROLL_BOTTOM);
    onEvent(EVENT_NAME.CHAT_AD_KONTEXT_RENDERED, onAdLoaded);
    onEvent(EVENT_NAME.CHAT_AD_KONTEXT_ERROR, onAdError);
  });
  onBeforeUnmount(() => {
    offEvent(EVENT_NAME.CHAT_AD_KONTEXT_RENDERED, onAdLoaded);
    offEvent(EVENT_NAME.CHAT_AD_KONTEXT_ERROR, onAdError);
  });
}
</script>
<style lang="less" scoped>
.msg-list {
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: 40px;
  &.last-msg {
    padding-top: 4px;
  }
  &.ad-preload {
    position: absolute;
    top: -1000px;
  }
  .avatar {
    margin-right: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    position: relative;

    :deep(div) {
      transition-property: transform;
      transition-duration: 0.3s;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  .messagebox {
    position: relative;
    max-width: calc(100% - 80px);
    min-height: 45px;
    padding: 12px;
    background: #343434;
    border-radius: 2px 12px 12px 12px;
    box-sizing: border-box;
    line-height: 150%;
    margin-right: 80px;
    word-wrap: break-word;
  }
  &.isPC {
    .avatar:hover {
      &::after {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
      }
      :deep(div) {
        transform: scale(1.2);
      }
    }
  }
}
@media screen and (max-width: 480px) {
  .messagebox {
    margin-right: 44px !important;
  }
}
@media screen and (max-width: 744px) {
  .msg-list .messagebox {
    background: rgba(16, 16, 17, 0.98);
  }
}
</style>
