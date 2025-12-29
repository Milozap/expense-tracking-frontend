import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import RegisterView from '@/views/RegisterView.vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import PrimeVue from 'primevue/config'
import { nextTick } from 'vue'

const mockToastAdd = vi.fn()
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: mockToastAdd,
  })),
}))

describe('RegisterView', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>
  let auth: ReturnType<typeof useAuthStore>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    auth = useAuthStore()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/register', name: 'register', component: RegisterView },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      ],
    })

    await router.push('/register')
    await router.isReady()
  })

  function mountComponent() {
    return mount(RegisterView, {
      global: {
        plugins: [PrimeVue, pinia, router],
        components: {
          InputText,
          Button,
        },
      },
    })
  }

  it('should render username input field', () => {
    const wrapper = mountComponent()
    const usernameInput = wrapper.find('#username')

    expect(usernameInput.exists()).toBe(true)
    expect(usernameInput.attributes('type')).toBe('text')
  })

  it('should render email input field', () => {
    const wrapper = mountComponent()

    const emailInput = wrapper.find('#email')
    expect(emailInput.exists()).toBe(true)
    expect(emailInput.attributes('type')).toBe('email')
  })

  it('should render password input field', () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('should render confirm password input field', () => {
    const wrapper = mountComponent()

    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(confirmPasswordInput.exists()).toBe(true)
    expect(confirmPasswordInput.attributes('type')).toBe('password')
  })

  it('should render submit button with correct label', () => {
    const wrapper = mountComponent()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign up'),
    )
    expect(submitButton).toBeDefined()
  })

  it('should render link to login page', () => {
    const wrapper = mountComponent()

    const loginLink = wrapper.find('a[href*="login"]')
    expect(loginLink.exists()).toBe(true)
  })

  it('should render password strength requirements', () => {
    const wrapper = mountComponent()

    const text = wrapper.text()
    expect(text).toContain('characters')
    expect(text).toContain('uppercase')
    expect(text).toContain('lowercase')
    expect(text).toContain('number')
    expect(text).toContain('special')
  })

  it('should show error message when username is empty on blur', async () => {
    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    expect(usernameInput.exists()).toBe(true)

    await usernameInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('Username is required')
  })

  it('should clear username error when user modifies the field', async () => {
    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    expect(usernameInput.exists()).toBe(true)

    await usernameInput.trigger('blur')
    await nextTick()

    await usernameInput.setValue('testuser')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('Username is required')
  })

  it('should not show username error on input event', async () => {
    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    expect(usernameInput.exists()).toBe(true)

    await usernameInput.trigger('input')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('Username is required')
  })

  // Email validation tests
  it('should show error message when email is empty on blur', async () => {
    const wrapper = mountComponent()

    const emailInput = wrapper.find('#email')
    expect(emailInput.exists()).toBe(true)

    await emailInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('Email is required')
  })

  it('should show error message when email format is invalid', async () => {
    const wrapper = mountComponent()

    const emailInput = wrapper.find('#email')
    expect(emailInput.exists()).toBe(true)

    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('email format is not valid')
  })

  it('should clear email error when user enters valid email', async () => {
    const wrapper = mountComponent()

    const emailInput = wrapper.find('#email')
    expect(emailInput.exists()).toBe(true)

    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    await nextTick()

    await emailInput.setValue('test@example.com')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('valid email')
  })

  it('should clear email error when user modifies the field', async () => {
    const wrapper = mountComponent()

    const emailInput = wrapper.find('#email')
    expect(emailInput.exists()).toBe(true)

    await emailInput.trigger('blur')
    await nextTick()

    await emailInput.setValue('test@example.com')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('Email is required')
  })

  it('should show password requirements as not met initially', () => {
    const wrapper = mountComponent()

    const text = wrapper.text()
    expect(text).toContain('8 characters')
    expect(text).toContain('uppercase')
    expect(text).toContain('lowercase')
    expect(text).toContain('number')
    expect(text).toContain('special')
  })

  it('should update password strength requirements in real-time', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('Test')
    await nextTick()

    expect((passwordInput.element as HTMLInputElement).value).toBe('Test')

    const text = wrapper.text()
    expect(text).toContain('uppercase')
    expect(text).toContain('lowercase')
  })

  it('should show error when password is too short on blur', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('Short1!')
    await passwordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('does not meet all requirements')
  })

  it('should show error when password lacks uppercase on blur', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('testpass123!')
    await passwordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('does not meet all requirements')
  })

  it('should show error when password lacks lowercase on blur', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('TESTPASS123!')
    await passwordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('does not meet all requirements')
  })

  it('should show error when password lacks number on blur', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('TestPassword!')
    await passwordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('does not meet all requirements')
  })

  it('should show error when password lacks special character on blur', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('TestPassword123')
    await passwordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('does not meet all requirements')
  })

  it('should clear password error when requirements are met', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)

    await passwordInput.setValue('Short1!')
    await passwordInput.trigger('blur')
    await nextTick()

    await passwordInput.setValue('TestPass123!')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('does not meet all requirements')
  })

  it('should show error when confirm password is empty on blur', async () => {
    const wrapper = mountComponent()

    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(confirmPasswordInput.exists()).toBe(true)

    await confirmPasswordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage.toLowerCase()).toContain('confirm your password')
  })

  it('should show error when passwords do not match', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('DifferentPass123!')
    await confirmPasswordInput.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('do not match')
  })

  it('should clear confirm password error when passwords match', async () => {
    const wrapper = mountComponent()

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('DifferentPass123!')
    await confirmPasswordInput.trigger('blur')
    await nextTick()

    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('do not match')
  })

  it('should disable submit button when form is invalid', () => {
    const wrapper = mountComponent()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign up'),
    )
    expect(submitButton?.attributes('disabled')).toBeDefined()
  })

  it('should enable submit button when form is valid', async () => {
    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign up'),
    )
    expect(submitButton?.attributes('disabled')).toBeUndefined()
  })

  it('should disable submit button while registration request is in flight', async () => {
    vi.spyOn(auth, 'register').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    )

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign up'),
    )

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(submitButton?.attributes('disabled')).toBeDefined()
  })

  it('should call auth register with username, email, and password on form submission', async () => {
    const registerSpy = vi.spyOn(auth, 'register').mockResolvedValue(undefined)

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()

    expect(registerSpy).toHaveBeenCalledWith('testuser', 'test@example.com', 'TestPass123!')
  })

  it('should show success toast on successful registration', async () => {
    vi.spyOn(auth, 'register').mockResolvedValue(undefined)

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
      }),
    )
  })

  it('should redirect to dashboard after successful registration', async () => {
    vi.spyOn(auth, 'register').mockResolvedValue(undefined)

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should show error toast on registration failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(auth, 'register').mockRejectedValue(new Error('Username already exists'))

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('existinguser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Username already exists',
      }),
    )
  })

  it('should handle username already exists error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(auth, 'register').mockRejectedValue(new Error('Username already exists'))

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('existinguser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Username already exists',
      }),
    )
  })

  it('should handle email already in use error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(auth, 'register').mockRejectedValue(new Error('Email already in use'))

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('existing@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Email already in use',
      }),
    )
  })

  it('should stay on register page on registration failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(auth, 'register').mockRejectedValue(new Error('Registration failed'))

    const wrapper = mountComponent()

    const usernameInput = wrapper.find('#username')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    expect(usernameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(confirmPasswordInput.exists()).toBe(true)

    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('TestPass123!')
    await confirmPasswordInput.setValue('TestPass123!')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('register')
  })

  it('should navigate to login page when login link is clicked', async () => {
    const wrapper = mountComponent()

    const loginLink = wrapper.find('a[href*="login"]')
    await loginLink.trigger('click')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('login')
  })
})
