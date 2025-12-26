import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import * as api from '@/services/api'
import * as jwtModule from 'jwt-decode'

vi.mock('@/services/api')
vi.mock('jwt-decode')

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should have userId as null initially', () => {
    const auth = useAuthStore()
    expect(auth.userId).toBeNull()
  })

  it('should have isAuthenticated as false initially', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('should have isLoading as false initially', () => {
    const auth = useAuthStore()
    expect(auth.isLoading).toBe(false)
  })

  it('should set isLoading to true while request is pending', async () => {
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: 1700000000,
    })
    const auth = useAuthStore()
    vi.mocked(api.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ access: 'token' }), 100)),
    )

    const promise = auth.login('testuser', 'testpass')
    expect(auth.isLoading).toBe(true)
    await promise
  })

  it('should set isLoading to false after successful login', async () => {
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: 1700000000,
    })
    const auth = useAuthStore()
    vi.mocked(api.login).mockResolvedValue({
      access: 'test-access-token',
    })

    await auth.login('testuser', 'testpass')
    expect(auth.isLoading).toBe(false)
  })

  it('should set isLoading to false after failed login', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const auth = useAuthStore()
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'))

    try {
      await auth.login('testuser', 'wrongpass')
    } catch {}
    expect(auth.isLoading).toBe(false)
  })

  it('should set isAuthenticated to true on successful login', async () => {
    const auth = useAuthStore()
    vi.mocked(api.login).mockResolvedValue({
      access: 'test-access-token',
    })

    await auth.login('testuser', 'testpass')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('should store token via api service on successful login', async () => {
    const auth = useAuthStore()
    vi.mocked(api.login).mockResolvedValue({
      access: 'test-access-token',
    })

    await auth.login('testuser', 'testpass')
    expect(api.setTokens).toHaveBeenCalledWith('test-access-token')
  })

  it('should throw error on invalid credentials', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const auth = useAuthStore()
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'))

    await expect(auth.login('testuser', 'wrongpass')).rejects.toThrow('Invalid credentials')
  })

  it('should not set isAuthenticated on login failure', async () => {
    const auth = useAuthStore()
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'))

    try {
      await auth.login('testuser', 'wrongpass')
    } catch {
      // error expected
    }
    expect(auth.isAuthenticated).toBe(false)
  })

  it('should clear tokens via api service on logout', () => {
    const auth = useAuthStore()
    auth.logout()

    expect(api.clearTokens).toHaveBeenCalled()
  })

  it('should set userId to null on logout', () => {
    const auth = useAuthStore()
    auth.userId = 123
    auth.logout()

    expect(auth.userId).toBeNull()
  })

  it('should set isAuthenticated to false on logout', () => {
    const auth = useAuthStore()
    auth.isAuthenticated = true
    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
  })

  it('should set isAuthenticated to true when valid token exists', () => {
    vi.mocked(api.getAccessToken).mockReturnValue('valid-token')
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
    })
    const auth = useAuthStore()

    auth.initializeAuth()
    expect(auth.isAuthenticated).toBe(true)
  })

  it('should leave isAuthenticated false when no token exists', () => {
    vi.mocked(api.getAccessToken).mockReturnValue(null)
    const auth = useAuthStore()

    auth.initializeAuth()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('should extract and set userId from JWT on successful login', async () => {
    const auth = useAuthStore()
    vi.mocked(api.login).mockResolvedValue({
      access: 'test-access-token',
    })
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: 1700000000,
    })

    await auth.login('testuser', 'testpass')

    expect(auth.userId).toBe(123)
  })

  it('should set userId from stored token on initialize', () => {
    vi.mocked(api.getAccessToken).mockReturnValue('stored-token')
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 456,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
    })
    const auth = useAuthStore()

    auth.initializeAuth()

    expect(auth.userId).toBe(456)
  })

  it('should set isAuthenticated to false when token is expired on initialize', () => {
    vi.mocked(api.getAccessToken).mockReturnValue('expired-token')
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
    })
    const auth = useAuthStore()

    auth.initializeAuth()

    expect(auth.isAuthenticated).toBe(false)
  })

  it('should set userId to null when token is expired on initialize', () => {
    vi.mocked(api.getAccessToken).mockReturnValue('expired-token')
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
    })
    const auth = useAuthStore()

    auth.initializeAuth()

    expect(auth.userId).toBeNull()
  })

  it('should set isAuthenticated to true when token is not expired on initialize', () => {
    vi.mocked(api.getAccessToken).mockReturnValue('valid-token')
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
    })
    const auth = useAuthStore()

    auth.initializeAuth()

    expect(auth.isAuthenticated).toBe(true)
  })

  it('should handle token with missing exp claim gracefully', () => {
    vi.mocked(api.getAccessToken).mockReturnValue('token-without-exp')
    vi.mocked(jwtModule.jwtDecode).mockReturnValue({
      user_id: 123,
    } as { user_id: number; exp: number })
    const auth = useAuthStore()

    auth.initializeAuth()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.userId).toBeNull()
  })
})
