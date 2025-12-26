<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const isLoading = ref(false)

const isFormValid = computed(() => {
  return username.value && password.value && !usernameError.value && !passwordError.value
})

function validateUsername() {
  if (!username.value) {
    usernameError.value = 'Username is required'
  }
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = 'Password is required'
  }
}

function clearUsernameError() {
  usernameError.value = ''
}

function clearPasswordError() {
  passwordError.value = ''
}

async function handleSubmit() {
  isLoading.value = true

  try {
    await auth.login(username.value, password.value)
  } catch (error: unknown) {
    isLoading.value = false
    console.error(error)

    toast.add({
      severity: 'error',
      summary: (error as Error).message || 'Invalid credentials',
    })
    return
  }

  isLoading.value = false
  toast.add({
    severity: 'success',
    summary: 'Login Successful',
  })
  const redirect = route.query.redirect?.toString() || ''
  const isSafeRedirect =
    redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes(':')
  const destination = isSafeRedirect ? redirect : '/dashboard'
  await router.push(destination)
}
</script>

<template>
  <div class="flex items-center justify-center px-4 pt-20 pb-12 min-h-screen">
    <div class="w-full max-w-sm animate-fadeIn">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-[var(--p-text-color)] mb-2">Welcome back</h1>
        <p class="text-[13px] text-[var(--p-text-muted-color)]">
          Sign in to your expense tracking account
        </p>
      </div>

      <div
        class="bg-[var(--p-surface-ground)] border border-[var(--p-surface-200)] rounded-lg p-6 shadow-sm"
        style="--animation-delay: 0.1s"
      >
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          <div class="flex flex-col gap-2 animate-slideUp" style="--animation-delay: 0.2s">
            <label class="text-[13px] font-semibold" for="username"> Username </label>
            <InputText
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              class="w-full"
              @blur="validateUsername"
              @input="clearUsernameError"
            />
            <transition name="slideDown">
              <p v-if="usernameError" class="text-[12px] text-[var(--p-red-500)] font-medium">
                {{ usernameError }}
              </p>
            </transition>
          </div>

          <div class="flex flex-col gap-2 animate-slideUp" style="--animation-delay: 0.3s">
            <label class="text-[13px] font-semibold" for="password"> Password </label>
            <InputText
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full"
              @blur="validatePassword"
              @input="clearPasswordError"
            />
            <transition name="slideDown">
              <p v-if="passwordError" class="text-[12px] text-[var(--p-red-500)] font-medium">
                {{ passwordError }}
              </p>
            </transition>
          </div>

          <Button
            label="Sign In"
            type="submit"
            severity="primary"
            class="w-full animate-slideUp"
            style="--animation-delay: 0.4s"
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
          />
        </form>
      </div>

      <div
        class="mt-6 text-center text-[13px] text-[var(--p-text-muted-color)] animate-slideUp"
        style="--animation-delay: 0.5s"
      >
        New to expense tracking?
        <RouterLink
          to="/register"
          class="font-semibold text-[var(--p-primary-color)] hover:text-[var(--p-primary-600)] transition-colors"
        >
          Create an account
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
  animation-delay: var(--animation-delay, 0s);
}

/* Transition for error messages */
.slideDown-enter-active,
.slideDown-leave-active {
  transition: all 0.3s ease;
}

.slideDown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slideDown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
