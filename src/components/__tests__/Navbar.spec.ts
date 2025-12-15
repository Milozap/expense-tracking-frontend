import {describe, it, expect, vi} from "vitest";
import {flushPromises, mount} from "@vue/test-utils";
import Navbar from "@/components/Navbar.vue";
import {createTestingPinia} from '@pinia/testing'
import {useAuthStore} from "@/stores/auth.ts";
import {createMemoryHistory, createRouter} from 'vue-router'
import PrimeVue from 'primevue/config'

describe('Navbar', () => {
  const pinia = createTestingPinia({createSpy: vi.fn});
  const auth = useAuthStore(pinia);

  let routes = [
    {path: '/login', name: 'login', component: {template: '<div>Login Page</div>'}},
    {path: '/register', name: 'register', component: {template: '<div>Register Page</div>'}},
    {path: '/', name: 'home', component: {template: '<div></div>'}},
  ];

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  it.each([
    ['login'],
    ['register'],
  ])('shows %s when not logged in', (componentName) => {
    auth.userId = null;
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});
    const component = wrapper.findComponent("." + componentName)
    expect(component.exists()).toBeTruthy();
  })

  it.each([
    ['login'],
    ['register'],
  ])('does not show %s when logged in', (componentName) => {
    auth.userId = 123;
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});
    const component = wrapper.findComponent("." + componentName)
    expect(component.exists()).not.toBeTruthy();
  })

  it('does not show Logout when not logged in', () => {
    auth.userId = null;
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});
    const logout = wrapper.findComponent(".logout")

    expect(logout.exists()).not.toBeTruthy();
  })

  it('shows Logout when logged in', () => {
    auth.userId = 123;
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});
    const logout = wrapper.findComponent(".logout")

    expect(logout.exists()).toBeTruthy();
  })

  it('navigates to /login when Login is clicked when logged out', async () => {
    auth.userId = null;
    await router.push('/');
    await router.isReady();
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});

    const loginLink = wrapper.get('.login');
    await loginLink.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('navigates to /register when Register is clicked (logged out)', async () => {
    auth.userId = null;
    await router.push('/');
    await router.isReady();
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});

    const registerLink = wrapper.get('.register');
    await registerLink.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/register');
  });

  it('clears userId and redirects to / when Logout is clicked (logged in)', async () => {
    auth.userId = 123 as unknown as number | null;
    await router.push('/');
    await router.isReady();
    const wrapper = mount(Navbar, {global: {plugins: [pinia, router, PrimeVue]}});

    const logoutLink = wrapper.get('.logout');
    await logoutLink.trigger('click');
    await flushPromises();

    expect(auth.userId).toBeNull();
    expect(router.currentRoute.value.path).toBe('/');
  });
})
