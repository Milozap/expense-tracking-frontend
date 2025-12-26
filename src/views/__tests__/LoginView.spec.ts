import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
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

describe('LoginView', () => {
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
        { path: '/login', name: 'login', component: LoginView },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
      ],
    })

    await router.push('/login')
    await router.isReady()
  })

  function mountComponent() {
    return mount(LoginView, {
      global: {
        plugins: [PrimeVue, pinia, router],
      },
    })
  }

  it('should render username input field', () => {
    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    expect(usernameInputs.length).toBeGreaterThan(0)
    expect(usernameInputs[0]?.attributes('type')).toBe('text')
  })

  it('should render password input field', () => {
    const wrapper = mountComponent()

    const passwordInputs = wrapper.findAllComponents(InputText)
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    expect(passwordInputs[1]?.attributes('type')).toBe('password')
  })

  it('should render submit button', () => {
    const wrapper = mountComponent()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign in'),
    )
    expect(submitButton).toBeDefined()
  })

  it('should render link to register page', () => {
    const wrapper = mountComponent()

    const registerLink = wrapper.find('a[href*="register"]')
    expect(registerLink.exists()).toBe(true)
  })

  it('should show error message when username is empty on blur', async () => {
    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    await usernameInputs[0]?.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('Username is required')
  })

  it('should show error message when password is empty on blur', async () => {
    const wrapper = mountComponent()

    const passwordInputs = wrapper.findAllComponents(InputText)
    await passwordInputs[1]?.trigger('blur')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).toContain('Password is required')
  })

  it('should clear username error when user modifies the field', async () => {
    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    await usernameInputs[0]?.trigger('blur')
    await nextTick()

    await usernameInputs[0]?.setValue('testuser')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('username')
  })

  it('should clear password error when user modifies the field', async () => {
    const wrapper = mountComponent()

    const passwordInputs = wrapper.findAllComponents(InputText)
    await passwordInputs[1]?.trigger('blur')
    await nextTick()

    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('password')
  })

  it('should disable submit button when form is invalid', () => {
    const wrapper = mountComponent()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign in'),
    )
    expect(submitButton?.attributes('disabled')).toBeDefined()
  })

  it('should enable submit button when form is valid', async () => {
    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign in'),
    )
    expect(submitButton?.attributes('disabled')).toBeUndefined()
  })

  it('should disable submit button while login request is in flight', async () => {
    vi.spyOn(auth, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    )

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const buttons = wrapper.findAllComponents(Button)
    const submitButton = buttons.find((btn) =>
      btn.props('label')?.toLowerCase().includes('sign in'),
    )

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(submitButton?.attributes('disabled')).toBeDefined()
  })

  it('should call auth login with username and password on form submission', async () => {
    const loginSpy = vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()

    expect(loginSpy).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('should show error toast on login failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(auth, 'login').mockRejectedValue(new Error('Invalid credentials'))
    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Invalid credentials',
      }),
    )
  })

  it('should clear previous errors on new login attempt', async () => {
    vi.spyOn(auth, 'login').mockRejectedValue(new Error('Invalid credentials'))

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()

    await usernameInputs[0]?.setValue('otheruser')
    await nextTick()

    const errorMessage = wrapper.text()
    expect(errorMessage).not.toContain('Invalid credentials')
  })

  it('should show success toast on successful login', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
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

  it('should redirect to dashboard after successful login', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should redirect to redirect query param if it exists', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    router.push('/login?redirect=/dashboard')
    await router.isReady()

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('should navigate to register page when register link is clicked', async () => {
    const wrapper = mountComponent()

    const registerLink = wrapper.find('a[href*="register"]')
    await registerLink.trigger('click')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('register')
  })

  it('should redirect to dashboard when redirect param is external URL', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    await router.push('/login?redirect=https://evil.com')
    await router.isReady()

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('should redirect to dashboard when redirect param contains protocol', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    await router.push('/login?redirect=//evil.com')
    await router.isReady()

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('should use redirect param when it starts with forward slash', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    router.addRoute({
      path: '/settings',
      name: 'settings',
      component: { template: '<div>Settings</div>' },
    })
    await router.push('/login?redirect=/settings')
    await router.isReady()

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/settings')
  })

  it('should redirect to dashboard when redirect param is empty string', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(undefined)

    await router.push('/login?redirect=')
    await router.isReady()

    const wrapper = mountComponent()

    const usernameInputs = wrapper.findAllComponents(InputText)
    const passwordInputs = wrapper.findAllComponents(InputText)

    await usernameInputs[0]?.setValue('testuser')
    await passwordInputs[1]?.setValue('password123')
    await nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
})
