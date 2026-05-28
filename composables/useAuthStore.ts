// Mock of polybuzz's useAuthStore — they use Pinia hydrated from a cookie
// during SSR, so `suid` is already populated by the time <AdsProvider>'s
// setup() runs. We do the same here (synchronous, deterministic value) to
// avoid the prop-validation throw that fires when userId is undefined,
// because that's not the bug we're trying to reproduce.
//
// KontextProvider only ever reads `authStore.userInfos?.suid` and
// `…?.userEmail`. Files in `composables/` are auto-imported by Nuxt,
// matching how their app exposes useAuthStore without an explicit import.
import { reactive } from 'vue'

interface UserInfos {
  suid: string
  userEmail: string
}

const state = reactive<{ userInfos: UserInfos | null }>({
  userInfos: {
    suid: 'u_demo_suid',
    userEmail: 'demo@example.com',
  },
})

export const useAuthStore = () => state
