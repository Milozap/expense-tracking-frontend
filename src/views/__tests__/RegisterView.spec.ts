import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterView from '@/views/RegisterView.vue'

describe('RegisterView', () => {
  it('renders the Register heading', () => {
    const wrapper = mount(RegisterView)
    const h1 = wrapper.get('h1')
    expect(h1.text()).toContain('Register')
  })

  it('renders the stub paragraph text', () => {
    const wrapper = mount(RegisterView)
    const p = wrapper.get('p')
    expect(p.text()).toBe('RegisterView stub.')
  })
})
