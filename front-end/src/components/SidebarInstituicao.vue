<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import LogoCais from '@/assets/logo/LogoCais.vue'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const links = [
  { to: '/instituicao/painel', label: 'Painel', icon: 'ti-layout-dashboard', name: 'inst-painel' },
  { to: '/instituicao/visitas', label: 'Agenda de visitas', icon: 'ti-calendar', name: 'inst-visitas' },
  { to: '/instituicao/relatorios', label: 'Relatórios', icon: 'ti-file-text', name: 'inst-relatorios' },
  { to: '/instituicao/perfil', label: 'Perfil da instituição', icon: 'ti-building', name: 'inst-perfil' }
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
      <i class="ti ti-building brand-icon"></i>
      <div>
        <p class="brand-label">{{ userStore.nome || 'Instituição' }}</p>
        <p class="brand-sub">Instituição de Acolhimento</p>
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

    <div class="sair-card">
      <button class="btn-sair" @click="sair">
        <i class="ti ti-logout"></i>
        <span>Sair</span>
      </button>
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
  color: #854F0B;
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
  background: #FAEEDA;
  color: #854F0B;
}
.nav-item .ti { font-size: 18px; }

.sair-card {
  padding: 12px 20px;
  border-top: 1px solid var(--color-border);
  margin-top: 16px;
}
.btn-sair {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 8px 10px;
  border-radius: var(--radius-md);
  width: 100%;
  transition: all 0.15s;
}
.btn-sair .ti { font-size: 16px; }
.btn-sair:hover { background: var(--color-danger-soft); color: var(--color-danger); }
</style>
