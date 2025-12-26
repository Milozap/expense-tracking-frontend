import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia, type Store } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

vi.mock('@/views/HomeView.vue', () => ({ default: { template: '<div>Home</div>' } }))
vi.mock('@/views/LoginView.vue', () => ({ default: { template: '<div>Login</div>' } }))
vi.mock('@/views/RegisterView.vue', () => ({ default: { template: '<div>Register</div>' } }))
vi.mock('@/views/AboutView.vue', () => ({ default: { template: '<div>About</div>' } }))
vi.mock('@/views/DashboardView.vue', () => ({ default: { template: '<div>Dashboard</div>' } }))

describe('Router', () => {
  let auth: ReturnType<typeof useAuthStore>

  beforeEach(async () => {
    setActivePinia(createPinia())
    auth = useAuthStore()
    await router.push('/')
  })

  it('should redirect to login when accessing protected route unauthenticated', async () => {
    auth.isAuthenticated = false
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('should allow access to public routes without authentication', async () => {
    auth.isAuthenticated = false
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('should allow access to protected routes when authenticated', async () => {
    auth.isAuthenticated = true
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should redirect to dashboard on successful login', async () => {
    auth.isAuthenticated = true
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should prevent navigation to register if already authenticated', async () => {
    auth.isAuthenticated = true
    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('should preserve query parameter for redirect after login', async () => {
    auth.isAuthenticated = false
    await router.push('/dashboard')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
  })
})
