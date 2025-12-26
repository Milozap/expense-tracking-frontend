import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import TopNavbar from '@/components/TopNavbar.vue'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth.ts'
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
  let router: Router
  let wrapper: VueWrapper

  beforeEach(async () => {
    pinia = createTestingPinia({ createSpy: vi.fn })
    auth = useAuthStore(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
  })

  function mountNavbar() {
    wrapper = mount(TopNavbar, {
      global: { plugins: [pinia, router, PrimeVue] },
    })
    return wrapper
  }

  it('shows Login when not logged in', () => {
    auth.userId = null
    mountNavbar()
    const loginLink = wrapper.find('a[href="/login"]')
    expect(loginLink.exists()).toBe(true)
  })

  it('shows Register when not logged in', () => {
    auth.userId = null
    mountNavbar()
    const registerLink = wrapper.find('a[href="/register"]')
    expect(registerLink.exists()).toBe(true)
  })

  it('does not show Login when logged in', () => {
    auth.userId = 123
    mountNavbar()
    const loginLink = wrapper.find('a[href="/login"]')
    expect(loginLink.exists()).toBe(false)
  })

  it('does not show Register when logged in', () => {
    auth.userId = 123
    mountNavbar()
    const registerLink = wrapper.find('a[href="/register"]')
    expect(registerLink.exists()).toBe(false)
  })

  it('does not show Logout when not logged in', () => {
    auth.userId = null
    mountNavbar()
    const buttons = wrapper.findAllComponents(Button)
    const logoutButton = buttons.find((btn) => btn.props('label') === 'Logout')
    expect(logoutButton).toBeUndefined()
  })

  it('shows Logout when logged in', () => {
    auth.userId = 123
    mountNavbar()
    const buttons = wrapper.findAllComponents(Button)
    const logoutButton = buttons.find((btn) => btn.props('label') === 'Logout')
    expect(logoutButton).toBeDefined()
  })

  it('navigates to /login when Login is clicked when logged out', async () => {
    auth.userId = null
    mountNavbar()
    const loginLink = wrapper.find('a[href="/login"]')
    await loginLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('navigates to /register when Register is clicked (logged out)', async () => {
    auth.userId = null
    mountNavbar()
    const registerLink = wrapper.find('a[href="/register"]')
    await registerLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/register')
  })

  it('clears userId and redirects to / when Logout is clicked (logged in)', async () => {
    auth.userId = 123
    mountNavbar()
    const buttons = wrapper.findAllComponents(Button)
    const logoutButton = buttons.find((btn) => btn.props('label') === 'Logout')
    await logoutButton!.trigger('click')
    await flushPromises()
    expect(auth.userId).toBeNull()
    expect(router.currentRoute.value.path).toBe('/')
  })
})
