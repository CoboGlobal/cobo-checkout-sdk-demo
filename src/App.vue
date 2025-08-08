<script setup lang="ts">
import CheckoutDemo from './views/CheckoutDemo.vue'
import { setupParentConsoleListener } from '@/services/iframeLogger';
import { onMounted } from 'vue';

onMounted(() => {
  setupParentConsoleListener()
})
</script>

<template>
  <div class="app-container">
    <main>
      <CheckoutDemo />
    </main>
  </div>
</template>

<style>
/* Reset some global styles to avoid layout issues */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
}

.app-container {
  width: 100%;
  margin: 0 auto;
}

header {
  margin-bottom: 20px;
}

nav {
  padding: 10px 0;
}

nav a {
  text-decoration: none;
  color: #4a90e2;
  font-weight: bold;
  font-size: 16px;
}

main {
  width: 100%;
}
</style>
