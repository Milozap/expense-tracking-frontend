import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: true,
  }),
  actions: {
    initializeTheme() {
      const validThemes = ['dark', 'light']
      let savedTheme: string | null = null
      try {
        savedTheme = localStorage.getItem('theme')
      } catch (e) {
        console.error(e)
      }
      const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

      if (savedTheme && validThemes.includes(savedTheme)) {
        this.isDarkMode = savedTheme === 'dark'
      } else {
        this.isDarkMode = prefersDark
      }

      this.applyTheme()
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
    },
    applyTheme() {
      const theme = this.isDarkMode ? 'dark' : 'light'
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
      try {
        localStorage.setItem('theme', theme)
      } catch (e) {
        console.error(e)
      }
    },
  },
})
