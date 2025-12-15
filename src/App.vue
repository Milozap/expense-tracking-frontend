<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from "@/components/Navbar.vue";
import Card from 'primevue/card';

</script>

<template>
  <div class="min-h-screen min-w-screen">
    <Navbar />

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

