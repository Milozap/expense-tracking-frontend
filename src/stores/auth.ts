import {defineStore} from "pinia";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: null as number | null
  }),
})
