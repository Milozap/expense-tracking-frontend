import { defineStore } from 'pinia'
import { clearTokens, getAccessToken, login, register, setTokens } from '@/services/api'
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  user_id: number
  exp: number
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: null as number | null,
    isAuthenticated: false,
    isLoading: false,
  }),
  actions: {
    decodeUserIdFromToken(token: string): number | null {
      try {
        const decoded = jwtDecode<JWTPayload>(token)
        return decoded.user_id
      } catch (e) {
        console.error('Failed to decode token:', e)
        return null
      }
    },
    async login(username: string, password: string) {
      this.isLoading = true
      try {
        const userInfo = await login(username, password)
        setTokens(userInfo.access)
        this.userId = this.decodeUserIdFromToken(userInfo.access)
        this.isAuthenticated = true
      } catch (e: unknown) {
        console.error(e)
        throw e
      } finally {
        this.isLoading = false
      }
    },
    logout() {
      clearTokens()
      this.userId = null
      this.isAuthenticated = false
    },
    async register(username: string, email: string, password: string, passwordConfirm: string) {
      this.isLoading = true
      try {
        const userInfo = await register(username, email, password, passwordConfirm)
        setTokens(userInfo.access)
        this.userId = this.decodeUserIdFromToken(userInfo.access)
        this.isAuthenticated = true
      } catch (e: unknown) {
        console.error(e)
        throw e
      } finally {
        this.isLoading = false
      }
    },
    isTokenExpired(token: string): boolean {
      try {
        const decoded = jwtDecode<JWTPayload>(token)
        if (!decoded.exp) {
          return true
        }
        const currentTime = Math.floor(Date.now() / 1000)
        return decoded.exp < currentTime
      } catch {
        return true
      }
    },
    initializeAuth() {
      const token = getAccessToken()
      if (token === null || this.isTokenExpired(token)) {
        this.userId = null
        this.isAuthenticated = false
      } else {
        this.userId = this.decodeUserIdFromToken(token)
        this.isAuthenticated = true
      }
    },
  },
})
