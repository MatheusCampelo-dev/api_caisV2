<script setup>
import SidebarAdotante from './SidebarAdotante.vue'
</script>

<template>
  <div class="layout">
    <SidebarAdotante />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}
.content {
  flex: 1;
  padding: 32px 40px;
  max-width: 100%;
}
</style>
