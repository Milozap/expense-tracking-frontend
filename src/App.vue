<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopNavbar from '@/components/TopNavbar.vue'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
</script>

<template>
  <div class="min-h-screen min-w-screen">
    <Toast />
    <TopNavbar />

    <div class="flex justify-center px-8 py-8">
      <div class="w-full max-w-7xl">
        <Card class="shadow-sm">
          <template #content>
            <RouterView />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
