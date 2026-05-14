<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-left">Tribunal de Justiça · Vara da Infância e da Juventude</p>
      <nav class="footer-links">
        <RouterLink to="/sobre">Sobre</RouterLink>
        <RouterLink to="/privacidade">Privacidade</RouterLink>
        <RouterLink to="/acessibilidade">Acessibilidade</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer { padding: 32px 0; }
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.footer-links { display: flex; gap: 28px; }
.footer-links a:hover { color: var(--color-primary); }
</style>
