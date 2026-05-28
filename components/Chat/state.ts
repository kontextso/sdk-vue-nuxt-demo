// Kontext-ad-local state, sibling of KontextAds.vue so the relative
// import `./state` resolves here. Holds the visibility state machine the
// component owns.
import { computed, ref } from 'vue'

export const kontextConfig = ref<{
  rounds?: number
  visible: boolean
  loaded: boolean
  msgId?: string
}>({
  rounds: undefined,
  visible: false,
  loaded: false,
  msgId: undefined,
})

export const kontextVisible = computed(() => kontextConfig.value.visible)
