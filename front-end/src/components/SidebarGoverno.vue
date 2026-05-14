<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import LogoCais from '@/assets/logo/LogoCais.vue'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const links = [
  { to: '/governo', label: 'Painel', icon: 'ti-layout-dashboard', name: 'governo-painel' },
  { to: '/governo/adotantes', label: 'Adotantes', icon: 'ti-users', name: 'governo-adotantes' },
  { to: '/governo/instituicoes', label: 'Instituições', icon: 'ti-building', name: 'governo-instituicoes' },
]

const isActive = (name) => route.name === name

const sair = () => {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="brand">
      <LogoCais :height="36" />
      <div class="brand-tag">
        <span>Centro de apoio à</span>
        <span>infância e a socialização</span>
      </div>
    </RouterLink>

    <div class="brand-section">
      <i class="ti ti-shield-check brand-icon"></i>
      <div>
        <p class="brand-label">Painel do Governo</p>
        <p class="brand-sub">
          {{ userStore.nome }}<template v-if="userStore.comarca"> — {{ userStore.comarca }}</template>
        </p>
      </div>
    </div>

    <nav class="nav">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="['nav-item', { active: isActive(link.name) }]"
      >
        <i :class="['ti', link.icon]"></i>
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>

    <div class="user-card">
      <div class="avatar">{{ userStore.iniciais || 'V' }}</div>
      <div class="user-info">
        <p class="user-name">{{ userStore.nome || 'Vara' }}</p>
        <p class="user-role">Vara da Infância</p>
      </div>
      <button class="btn-sair" @click="sair" title="Sair"><i class="ti ti-logout"></i></button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-bg-soft);
  border-right: 1px solid var(--color-border);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 16px;
  border-bottom: 1px solid var(--color-border);
}
.brand-tag {
  display: flex;
  flex-direction: column;
  font-size: 10px;
  color: var(--color-primary);
  line-height: 1.3;
}
.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 14px;
}
.brand-icon {
  font-size: 22px;
  color: var(--color-primary);
}
.brand-label {
  font-weight: 600;
  font-size: 13px;
}
.brand-sub {
  font-size: 11px;
  color: var(--color-text-tertiary);
}
.nav {
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all 0.15s;
}
.nav-item:hover { background: rgba(0,0,0,0.04); }
.nav-item.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
.nav-item .ti { font-size: 18px; }

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  margin-top: 16px;
  border-top: 1px solid var(--color-border);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
.user-name { font-size: 13px; font-weight: 600; flex: 1; }
.user-role { font-size: 11px; color: var(--color-text-tertiary); }
.user-info { flex: 1; min-width: 0; }
.btn-sair {
  color: var(--color-text-tertiary);
  font-size: 16px;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: var(--radius-md);
}
.btn-sair:hover { color: var(--color-danger); background: var(--color-danger-soft); }
</style>
