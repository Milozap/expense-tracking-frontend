import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import TopNavbar from '@/components/TopNavbar.vue'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth.ts'
import { useThemeStore } from '@/stores/theme.ts'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'

describe('TopNavbar', () => {
  const routes = [
    { path: '/', name: 'home', component: { template: '<div></div>' } },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
  ]

  let pinia: TestingPinia
  let auth: ReturnType<typeof useAuthStore>
  let theme: ReturnType<typeof useThemeStore>
  let router: Router
  let wrapper: VueWrapper

  beforeEach(async () => {
    pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
    auth = useAuthStore(pinia)
    theme = useThemeStore(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    localStorage.clear()
  })

  function mountNavbar() {
    wrapper = mount(TopNavbar, {
      global: { plugins: [pinia, router, PrimeVue] },
    })
    return wrapper
  }

  it('should show Login link when not logged in', () => {
    auth.userId = null
    mountNavbar()
    const loginLink = wrapper.find('a[href="/login"]')
    expect(loginLink.exists()).toBe(true)
  })

  it('should show Register link when not logged in', () => {
    auth.userId = null
    mountNavbar()
    const registerLink = wrapper.find('a[href="/register"]')
    expect(registerLink.exists()).toBe(true)
  })

  it('should not show Login link when logged in', () => {
    auth.userId = 123
    mountNavbar()
    const loginLink = wrapper.find('a[href="/login"]')
    expect(loginLink.exists()).toBe(false)
  })

  it('should not show Register link when logged in', () => {
    auth.userId = 123
    mountNavbar()
    const registerLink = wrapper.find('a[href="/register"]')
    expect(registerLink.exists()).toBe(false)
  })

  it('should not show Logout button when not logged in', () => {
    auth.userId = null
    mountNavbar()
    const buttons = wrapper.findAllComponents(Button)
    const logoutButton = buttons.find((btn) => btn.props('label') === 'Logout')
    expect(logoutButton).toBeUndefined()
  })

  it('should show Logout button when logged in', () => {
    auth.userId = 123
    mountNavbar()
    const buttons = wrapper.findAllComponents(Button)
    const logoutButton = buttons.find((btn) => btn.props('label') === 'Logout')
    expect(logoutButton).toBeDefined()
  })

  it('should navigate to /login when Login is clicked and user is logged out', async () => {
    auth.userId = null
    mountNavbar()
    const loginLink = wrapper.find('a[href="/login"]')
    await loginLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('should navigate to /register when Register is clicked and user is logged out', async () => {
    auth.userId = null
    mountNavbar()
    const registerLink = wrapper.find('a[href="/register"]')
    await registerLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/register')
  })

  it('should clear userId and redirect to / when Logout is clicked and user is logged in', async () => {
    auth.userId = 123
    mountNavbar()
    const buttons = wrapper.findAllComponents(Button)
    const logoutButton = buttons.find((btn) => btn.props('label') === 'Logout')
    await logoutButton!.trigger('click')
    await flushPromises()
    expect(auth.userId).toBeNull()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('should show moon icon when theme is light', () => {
    theme.isDarkMode = false
    mountNavbar()

    const buttons = wrapper.findAllComponents(Button)
    const themeButton = buttons.find((btn) => {
      const icon = btn.props('icon')
      return icon === 'pi pi-moon' || icon === 'pi pi-sun'
    })

    expect(themeButton).toBeDefined()
    expect(themeButton!.props('icon')).toBe('pi pi-moon')
  })

  it('should show sun icon when theme is dark', () => {
    theme.isDarkMode = true
    mountNavbar()

    const buttons = wrapper.findAllComponents(Button)
    const themeButton = buttons.find((btn) => {
      const icon = btn.props('icon')
      return icon === 'pi pi-moon' || icon === 'pi pi-sun'
    })

    expect(themeButton).toBeDefined()
    expect(themeButton!.props('icon')).toBe('pi pi-sun')
  })

  it('should call toggleTheme when theme toggle button is clicked', async () => {
    theme.isDarkMode = false
    mountNavbar()

    const buttons = wrapper.findAllComponents(Button)
    const themeButton = buttons.find((btn) => {
      const icon = btn.props('icon')
      return icon === 'pi pi-moon' || icon === 'pi pi-sun'
    })

    expect(themeButton).toBeDefined()

    await themeButton!.trigger('click')
    await flushPromises()

    expect(theme.toggleTheme).toHaveBeenCalled()
  })
})
