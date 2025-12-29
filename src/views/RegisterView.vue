<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const auth = useAuthStore()
const toast = useToast()
const router = useRouter()

const username = ref<string>('')
const usernameError = ref<string>('')
const email = ref<string>('')
const emailError = ref<string>('')
const password = ref<string>('')
const passwordError = ref<string>('')
const confirmPassword = ref<string>('')
const confirmPasswordError = ref<string>('')
const isLoading = ref(false)

const isFormValid = computed(() => {
  const hasRequiredFields = !!(
    username.value &&
    email.value &&
    password.value &&
    confirmPassword.value
  )

  const hasNoValidationErrors = !(
    usernameError.value ||
    emailError.value ||
    passwordError.value ||
    confirmPasswordError.value
  )

  const isPasswordStrong = Object.values(passwordStrength.value).every(Boolean)

  const passwordsMatch = password.value === confirmPassword.value

  return hasRequiredFields && hasNoValidationErrors && isPasswordStrong && passwordsMatch
})

const passwordStrength = computed(() => {
  const lowerCaseLetters = /[a-z]/
  const upperCaseLetters = /[A-Z]/
  const numbers = /\d/
  const specialCharacters = /[!@#$%^&*._-]/

  return {
    minLength: password.value.length >= 8,
    hasUppercase: password.value.match(upperCaseLetters),
    hasLowercase: password.value.match(lowerCaseLetters),
    hasNumber: password.value.match(numbers),
    hasSpecial: password.value.match(specialCharacters),
  }
})

function validateUsername() {
  if (!username.value) {
    usernameError.value = 'Username is required'
  }
}

function clearUsernameError() {
  usernameError.value = ''
}

function validateEmail() {
  const emailRegex =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }

  if (!email.value.match(emailRegex)) {
    emailError.value = 'The email format is not valid'
  }
}

function clearEmailError() {
  emailError.value = ''
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  if (
    !(
      passwordStrength.value.hasNumber &&
      passwordStrength.value.hasSpecial &&
      passwordStrength.value.minLength &&
      passwordStrength.value.hasLowercase &&
      passwordStrength.value.hasUppercase
    )
  ) {
    passwordError.value = 'Password does not meet all requirements'
  }

  if (confirmPassword.value && password.value === confirmPassword.value) {
    clearConfirmPasswordError()
  }
}

function clearPasswordError() {
  passwordError.value = ''
}

function validateConfirmPassword() {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Confirm your password'
    return
  }

  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
  }
}

function clearConfirmPasswordError() {
  confirmPasswordError.value = ''
}

async function handleSubmit() {
  isLoading.value = true

  try {
    await auth.register(username.value, email.value, password.value)
  } catch (error) {
    isLoading.value = false
    console.error(error)

    toast.add({
      severity: 'error',
      summary: (error as Error).message || 'Registration Failed',
    })
    return
  }

  isLoading.value = false
  toast.add({
    severity: 'success',
    summary: 'Registration Successful',
  })
  await router.push('/dashboard')
}
</script>

<template>
  <div class="flex items-start justify-center px-4 pt-20 pb-12 min-h-screen">
    <div class="w-full max-w-sm animate-fadeIn">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-[var(--p-text-color)] mb-2">Create your account</h1>
        <p class="text-[13px] text-[var(--p-text-muted-color)]">Track your expenses easily</p>
      </div>

      <div
        class="bg-[var(--p-surface-ground)] border border-[var(--p-surface-200)] rounded-lg p-6 shadow-sm"
        style="--animation-delay: 0.1s"
      >
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          <div class="flex flex-col gap-2 animate-slideUp" style="--animation-delay: 0.2s">
            <label class="text-[13px] font-semibold" for="username">Username</label>
            <InputText
              id="username"
              v-model="username"
              type="text"
              placeholder="Choose a username"
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

          <!-- Email Field -->
          <div class="flex flex-col gap-2 animate-slideUp" style="--animation-delay: 0.3s">
            <label class="text-[13px] font-semibold" for="email">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              @blur="validateEmail"
              @input="clearEmailError"
            />
            <transition name="slideDown">
              <p v-if="emailError" class="text-[12px] text-[var(--p-red-500)] font-medium">
                {{ emailError }}
              </p>
            </transition>
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-2 animate-slideUp" style="--animation-delay: 0.4s">
            <label class="text-[13px] font-semibold" for="password">Password</label>
            <InputText
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full"
              @blur="validatePassword"
              @input="clearPasswordError"
            />

            <!-- Password Strength Requirements -->
            <div class="mt-2 space-y-1 text-[12px]">
              <div
                :class="
                  passwordStrength.minLength
                    ? 'text-[var(--p-green-500)]'
                    : 'text-[var(--p-text-muted-color)]'
                "
              >
                <i
                  :class="passwordStrength.minLength ? 'pi pi-check' : 'pi pi-circle'"
                  class="text-[10px] mr-1"
                ></i>
                At least 8 characters
              </div>
              <div
                :class="
                  passwordStrength.hasUppercase
                    ? 'text-[var(--p-green-500)]'
                    : 'text-[var(--p-text-muted-color)]'
                "
              >
                <i
                  :class="passwordStrength.hasUppercase ? 'pi pi-check' : 'pi pi-circle'"
                  class="text-[10px] mr-1"
                ></i>
                One uppercase letter (A-Z)
              </div>
              <div
                :class="
                  passwordStrength.hasLowercase
                    ? 'text-[var(--p-green-500)]'
                    : 'text-[var(--p-text-muted-color)]'
                "
              >
                <i
                  :class="passwordStrength.hasLowercase ? 'pi pi-check' : 'pi pi-circle'"
                  class="text-[10px] mr-1"
                ></i>
                One lowercase letter (a-z)
              </div>
              <div
                :class="
                  passwordStrength.hasNumber
                    ? 'text-[var(--p-green-500)]'
                    : 'text-[var(--p-text-muted-color)]'
                "
              >
                <i
                  :class="passwordStrength.hasNumber ? 'pi pi-check' : 'pi pi-circle'"
                  class="text-[10px] mr-1"
                ></i>
                One number (0-9)
              </div>
              <div
                :class="
                  passwordStrength.hasSpecial
                    ? 'text-[var(--p-green-500)]'
                    : 'text-[var(--p-text-muted-color)]'
                "
              >
                <i
                  :class="passwordStrength.hasSpecial ? 'pi pi-check' : 'pi pi-circle'"
                  class="text-[10px] mr-1"
                ></i>
                One special character (!@#$%^&*._-)
              </div>
            </div>

            <transition name="slideDown">
              <p v-if="passwordError" class="text-[12px] text-[var(--p-red-500)] font-medium">
                {{ passwordError }}
              </p>
            </transition>
          </div>

          <!-- Confirm Password Field -->
          <div class="flex flex-col gap-2 animate-slideUp" style="--animation-delay: 0.5s">
            <label class="text-[13px] font-semibold" for="confirmPassword">Confirm Password</label>
            <InputText
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full"
              @blur="validateConfirmPassword"
              @input="clearConfirmPasswordError"
            />
            <transition name="slideDown">
              <p
                v-if="confirmPasswordError"
                class="text-[12px] text-[var(--p-red-500)] font-medium"
              >
                {{ confirmPasswordError }}
              </p>
            </transition>
          </div>

          <Button
            label="Sign Up"
            type="submit"
            severity="primary"
            class="w-full animate-slideUp"
            style="--animation-delay: 0.6s"
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
          />
        </form>
      </div>

      <div
        class="mt-6 text-center text-[13px] text-[var(--p-text-muted-color)] animate-slideUp"
        style="--animation-delay: 0.7s"
      >
        Already have an account?
        <RouterLink
          to="/login"
          class="font-semibold text-[var(--p-primary-color)] hover:text-[var(--p-primary-600)] transition-colors"
        >
          Sign in
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
