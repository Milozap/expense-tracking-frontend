import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, register, setTokens, getAccessToken, clearTokens } from '../api'

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

  it('should send POST request to /api/auth/register/ with username, email, password and passwordConfirm', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        access: 'test-access-token',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await (
      register as unknown as (
        username: string,
        email: string,
        password: string,
        passwordConfirm: string,
      ) => Promise<unknown>
    )('testuser', 'test@example.com', 'TestPass123!', 'TestPass123!')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/register/'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPass123!',
          password_confirm: 'TestPass123!',
        }),
      }),
    )
  })

  it('should return access token on successful registration', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        access: 'test-access-token',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await register('testuser', 'test@example.com', 'TestPass123!')

    expect(result).toEqual({
      access: 'test-access-token',
    })
  })

  it('should throw error when username already exists (400 response)', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        username: 'Username already exists',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(register('existinguser', 'test@example.com', 'TestPass123!')).rejects.toThrow(
      'Username already exists',
    )
  })

  it('should throw error when email already in use (400 response)', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        email: 'Email already in use',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(register('newuser', 'existing@example.com', 'TestPass123!')).rejects.toThrow(
      'Email already in use',
    )
  })

  it('should throw error when account already exists (409 response)', async () => {
    const mockResponse = {
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({
        detail: 'Account already exists',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(register('testuser', 'test@example.com', 'TestPass123!')).rejects.toThrow(
      'Account already exists',
    )
  })

  it('should throw error on validation failure (422 response)', async () => {
    const mockResponse = {
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        detail: 'Password does not meet requirements',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(register('testuser', 'test@example.com', 'weak')).rejects.toThrow(
      'Password does not meet requirements',
    )
  })

  it('should throw error on server error (500 response)', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        detail: 'Internal server error',
      }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(register('testuser', 'test@example.com', 'TestPass123!')).rejects.toThrow(
      'Registration failed, please try again',
    )
  })

  it('should throw error on network failure during registration', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(register('testuser', 'test@example.com', 'TestPass123!')).rejects.toThrow(
      'Network error',
    )
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
