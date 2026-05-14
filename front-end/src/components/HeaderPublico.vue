<script setup>
import { RouterLink, useRoute } from 'vue-router'
import LogoCais from '@/assets/logo/LogoCais.vue'

const route = useRoute()

const isActive = (name) => route.name === name
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink to="/" class="brand">
        <LogoCais :height="44" />
        <div class="brand-tag">
          <span>Centro de apoio à</span>
          <span>infância e a socialização</span>
        </div>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/" :class="['nav-link', { active: isActive('inicio') }]">Início</RouterLink>
        <RouterLink to="/por-onde-comecar" :class="['nav-link', { active: isActive('por-onde-comecar') }]">Por onde começar</RouterLink>
        <RouterLink to="/localizar-vara" :class="['nav-link', { active: isActive('localizar-vara') }]">Localizar Vara</RouterLink>
        <RouterLink to="/instituicoes" :class="['nav-link', { active: isActive('instituicoes') || isActive('detalhe-instituicao') }]">Instituições</RouterLink>
      </nav>

      <RouterLink to="/cadastro" class="btn btn-primary btn-login">
        <i class="ti ti-user"></i>
        Entrar
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--color-bg);
  padding: 18px 0;
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-tag {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: var(--color-primary);
  line-height: 1.3;
}
.nav {
  display: flex;
  align-items: center;
  gap: 32px;
}
.nav-link {
  font-size: 14px;
  color: var(--color-text);
  padding: 6px 0;
  position: relative;
  font-weight: 500;
}
.nav-link.active {
  color: var(--color-primary);
  font-weight: 600;
}
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}
.btn-login {
  padding: 8px 16px;
  font-size: 13px;
}
</style>
