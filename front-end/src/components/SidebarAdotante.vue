<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import LogoCais from '@/assets/logo/LogoCais.vue'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const links = [
  { to: '/painel', label: 'Painel', icon: 'ti-layout-dashboard', name: 'painel' },
  { to: '/painel/documentos', label: 'Documentos', icon: 'ti-file-text', name: 'documentos' },
  { to: '/painel/agendamentos', label: 'Agendamentos', icon: 'ti-calendar', name: 'agendamentos' },
  { to: '/painel/minha-instituicao', label: 'Minha instituição', icon: 'ti-home-heart', name: 'minha-instituicao' },
  { to: '/painel/notificacoes', label: 'Notificações', icon: 'ti-bell', name: 'notificacoes' }
]

const isActive = (name) => route.name === name

const sair = () => {
  if (confirm('Deseja realmente sair? Sua sessão será encerrada.')) {
    userStore.logout()
    router.push('/')
  }
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
      <i class="ti ti-heart-handshake brand-icon"></i>
      <span>Adoção</span>
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
        <span v-if="link.badge" class="badge">{{ link.badge }}</span>
      </RouterLink>
    </nav>

    <!-- Card do usuário com Sair -->
    <div class="user-card">
      <div class="user-row">
        <div class="avatar">{{ userStore.iniciais }}</div>
        <div class="user-info">
          <p class="user-name">{{ userStore.nome }}</p>
          <p class="user-role">Adotante</p>
        </div>
      </div>
      <button class="btn-sair" @click="sair" type="button">
        <i class="ti ti-logout"></i>
        Sair
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
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
  gap: 10px;
  padding: 16px 20px 12px;
  font-weight: 500;
  font-size: 14px;
}
.brand-icon { font-size: 20px; color: var(--color-primary); }

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
.badge {
  margin-left: auto;
  background: var(--color-primary);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 1px 8px;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

/* card de usuário */
.user-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  margin-top: 16px;
  border-top: 1px solid var(--color-border);
}
.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
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
  flex-shrink: 0;
}
.user-info { min-width: 0; overflow: hidden; }
.user-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.btn-sair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-sair:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
.btn-sair .ti { font-size: 16px; }
</style>
