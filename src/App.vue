<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import CheckoutDemo from './views/CheckoutDemo.vue'
import { setupParentConsoleListener } from '@/services/iframeLogger';
import { onMounted } from 'vue';

onMounted(() => {
  setupParentConsoleListener()
})
</script>

<template>
  <div class="app-container">
    <!-- <header>
      <div class="wrapper">
        <nav>
          <RouterLink to="/">首页</RouterLink>
        </nav>
      </div>
    </header> -->

    <main>
      <CheckoutDemo />
    </main>
  </div>
</template>

<style>
/* 重置一些全局样式以避免布局问题 */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
}

.app-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
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
