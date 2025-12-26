import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, setTokens, getAccessToken, clearTokens } from '../api'

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  it('should send POST request to /api/token/ with credentials', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        access: 'test-access-token',
        refresh: 'test-refresh-token',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await login('testuser', 'testpass')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/token/'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpass',
        }),
      }),
    )
  })

  it('should return access token on success', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        access: 'test-access-token',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await login('testuser', 'testpass')

    expect(result).toEqual({
      access: 'test-access-token',
    })
  })

  it('should throw error with message on 401 response', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        detail: 'Invalid credentials',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(login('testuser', 'wrongpass')).rejects.toThrow()
  })

  it('should throw error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(login('testuser', 'testpass')).rejects.toThrow('Network error')
  })

  it('should store access token in localStorage', () => {
    setTokens('test-access-token')

    expect(localStorage.getItem('accessToken')).toBe('test-access-token')
  })

  it('should return token from localStorage', () => {
    localStorage.setItem('accessToken', 'stored-access-token')

    const token = getAccessToken()

    expect(token).toBe('stored-access-token')
  })

  it('should returns null when no token exists', () => {
    localStorage.removeItem('accessToken')

    const token = getAccessToken()

    expect(token).toBeNull()
  })

  it('should remove access token from localStorage', () => {
    localStorage.setItem('accessToken', 'test-access-token')

    clearTokens()

    expect(localStorage.getItem('accessToken')).toBeNull()
  })
})
