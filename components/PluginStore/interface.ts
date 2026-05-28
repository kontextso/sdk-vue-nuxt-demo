// Polybuzz's plugin-bus contract. The actual list is longer in their app;
// we only declare the symbols KontextProvider/KontextAds reference.
export enum EVENT_NAME {
  CHAT_AD_KONTEXT_RENDERED = 'CHAT_AD_KONTEXT_RENDERED',
  CHAT_AD_KONTEXT_ERROR = 'CHAT_AD_KONTEXT_ERROR',
  CHAT_LIST_SCROLL_BOTTOM = 'CHAT_LIST_SCROLL_BOTTOM',
}

export enum GETTER_NAME {
  CHAT_CUSTOM_BACKGROUND_STYLE = 'CHAT_CUSTOM_BACKGROUND_STYLE',
}
