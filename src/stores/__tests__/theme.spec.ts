import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    vi.clearAllMocks()
    vi.restoreAllMocks()

    document.documentElement.classList.remove('dark-mode')

    // Spy on localStorage
    vi.spyOn(Storage.prototype, 'getItem')
    vi.spyOn(Storage.prototype, 'setItem')

    // Reset matchMedia to default (light mode)
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('should initialize theme from system preference (dark) on first visit', () => {
    // Mock system preference as dark mode
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Mock localStorage to return null (no saved preference)
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should initialize theme from system preference (light) on first visit', () => {
    // Mock system preference as light mode
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query !== '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('should initialize theme from localStorage when saved preference exists (dark)', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('dark')

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
    expect(localStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('should initialize theme from localStorage when saved preference exists (light)', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('light')

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false)
    expect(localStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('should toggle theme from light to dark', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('light')
    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false)

    vi.clearAllMocks()

    store.toggleTheme()

    expect(store.isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should toggle theme from dark to light', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('dark')
    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)

    vi.clearAllMocks()

    store.toggleTheme()

    expect(store.isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('should fall back to system preference when localStorage has invalid value', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    vi.mocked(localStorage.getItem).mockReturnValue('invalid')

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
  })

  it('should fall back to light mode when matchMedia is not supported', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    // @ts-expect-error - testing unsupported browsers
    window.matchMedia = undefined

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })
})
