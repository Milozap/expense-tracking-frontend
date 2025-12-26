import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import { useThemeStore } from '@/stores/theme.ts'

const app = createApp(App)
app.use(createPinia())

app.use(router)
const themeStore = useThemeStore()
themeStore.initializeTheme()

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
})

app.use(ToastService)

app.mount('#app')
