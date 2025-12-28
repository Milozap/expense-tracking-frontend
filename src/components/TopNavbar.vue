<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import { useThemeStore } from '@/stores/theme.ts'

const authStore = useAuthStore()
const { userId } = storeToRefs(authStore)
const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)
</script>

<template>
  <nav
    class="sticky top-0 z-40 bg-[var(--p-surface-ground)] border-b border-[var(--p-surface-400)] shadow-sm"
  >
    <div
      class="flex justify-between items-center gap-8 px-8 py-4 h-[70px] md:gap-4 md:px-4 md:h-[60px] sm:gap-2 sm:px-3 sm:h-14"
    >
      <div class="flex items-center gap-4 flex-shrink-0">
        <Button
          aria-label="Toggle light/dark mode"
          @click="themeStore.toggleTheme()"
          :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
          class="transition-all duration-300 hover:rotate-20"
          severity="secondary"
          text
        />
      </div>

      <div class="hidden md:flex items-center gap-4 flex-1 justify-center">
        <RouterLink
          to="/"
          class="text-xl font-semibold no-underline text-[var(--p-text-color)] transition-colors duration-300 -tracking-[0.5px] hover:text-[var(--p-primary-color)]"
        >
          Expenses
        </RouterLink>
      </div>

      <div class="flex items-center gap-4 flex-shrink-0 md:flex-1 md:justify-end sm:gap-2">
        <div v-if="!userId" class="auth-buttons flex items-center gap-3 sm:gap-1">
          <RouterLink to="/login" class="no-underline flex items-center">
            <Button label="Login" size="small" text severity="primary" />
          </RouterLink>
          <RouterLink to="/register" class="no-underline flex items-center">
            <Button label="Register" size="small" text severity="primary" />
          </RouterLink>
        </div>
        <div v-else class="flex items-center gap-3 sm:gap-1">
          <span
            class="text-sm text-[var(--p-text-muted-color)] px-3 py-2 bg-[var(--p-surface-ground)] rounded-md font-medium"
            >{{ userId }}</span
          >
          <Button label="Logout" size="small" severity="danger" text @click="authStore.logout()" />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Override PrimeVue text button hover styles for auth buttons */
.auth-buttons :deep(.p-button-text:hover) {
  background: transparent;
  opacity: 0.8;
}

.auth-buttons :deep(.p-button-text) {
  transition: opacity 200ms ease, color 200ms ease;
}
</style>
