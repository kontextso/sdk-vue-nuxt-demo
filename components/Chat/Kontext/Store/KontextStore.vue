<script lang="ts" setup>
import { useAds } from "@kontextso/sdk-vue";
import usePlugin from "@/components/PluginStore/hook";
import { EVENT_NAME } from "@/components/PluginStore/interface";
import { useStore } from "../../store/state";
import { getMsgId } from "../../common/common";
import { ROLETYPE } from "../../constant";
import type { IMessage } from "../../types";
import { kontextConfig, kontextSession } from "./state";
import { callMonitorEndpoint } from "~/common/prometheus/api-interface";

const { addMessage } = useAds();
const { onEvent, offEvent } = usePlugin();
const { msgList, sceneInfo } = useStore();
const lastAddedMsgId = ref<string>("");

const addMsg = async (msg: IMessage, trackOnly = false) => {
  const msgId = getMsgId(msg) as string;
  if (!msg.content || !msgId) {
    return;
  }
  try {
    await addMessage(
      {
        id: msgId,
        role: msg.role === ROLETYPE.AI ? "assistant" : "user",
        content: msg.content,
        // createdAt: msg.lastChatTime ? new Date(msg.lastChatTime * 1000) : new Date(),
        createdAt: new Date(),
      },
      {
        // trackOnly,
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    callMonitorEndpoint({
      action: "kontext_add_msg_error",
      msgId: msgId,
      sid: sceneInfo.value.secretSceneId,
      msg: err?.message,
    });
  }
};

const addAiMessage = async () => {
  if (!kontextSession.value) {
    return;
  }
  if (kontextConfig.value.msgId) {
    if (lastAddedMsgId.value) {
      // 处理消息被删除的情况
      const lastIdx = msgList.value.findIndex((msg) => getMsgId(msg) === lastAddedMsgId.value);
      if (lastIdx === -1) {
        if (msgList.value.length >= 3) {
          const msg = msgList.value[msgList.value.length - 3];
          lastAddedMsgId.value = getMsgId(msg) as string;
        } else {
          lastAddedMsgId.value = "";
        }
      }
    }
    return;
  }
  const lastIdx = lastAddedMsgId.value ? msgList.value.findIndex((msg) => getMsgId(msg) === lastAddedMsgId.value) : -1;
  const len = msgList.value.length;
  if (!len) {
    return;
  }
  let i = lastIdx + 1;
  for (; i < len; i++) {
    const msg = msgList.value[i];
    const msgId = getMsgId(msg) as string;
    if (!msgId) {
      if (i === len - 1) {
        break;
      }
      continue;
    }
    await addMsg(msg, i < len - 1);
    lastAddedMsgId.value = getMsgId(msg) as string;
  }
  kontextConfig.value.msgId = lastAddedMsgId.value;
};

if (import.meta.client) {
  onMounted(() => {
    onEvent(EVENT_NAME.CHAT_AD_KONTEXT_ADD_MSG, addAiMessage);
    if (msgList.value.length) {
      addAiMessage();
    }
  });
  onBeforeUnmount(() => {
    offEvent(EVENT_NAME.CHAT_AD_KONTEXT_ADD_MSG, addAiMessage);
  });
}
</script>
