import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '@/views/LoginView.vue'

describe('LoginView', () => {
  it('renders the Login heading', () => {
    const wrapper = mount(LoginView)
    const h1 = wrapper.get('h1')
    expect(h1.text()).toContain('Login')
  })

  it('renders the stub paragraph text', () => {
    const wrapper = mount(LoginView)
    const p = wrapper.get('p')
    expect(p.text()).toBe('LoginView stub.')
  })
})
