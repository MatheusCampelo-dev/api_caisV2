<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GovernoLayout from '@/components/GovernoLayout.vue'
import { useUserStore } from '@/store/user'
import { adotantesService } from '@/service/index'

const router = useRouter()
const userStore = useUserStore()

const saudacao = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const dataHoje = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
)

const adotantes = ref([])
const carregando = ref(true)

const stats = computed(() => {
  const lista = adotantes.value
  return [
    {
      titulo: 'Total de adotantes',
      valor: lista.length,
      icone: 'ti-users',
      cor: 'azul',
      desc: 'cadastrados no sistema',
    },
    {
      titulo: 'Com processo ativo',
      valor: lista.filter(a => a.processo).length,
      icone: 'ti-file-text',
      cor: 'roxo',
      desc: 'adotantes em acompanhamento',
    },
    {
      titulo: 'Em fila de espera',
      valor: lista.filter(a => a.processo?.etapa_atual === 'fila_de_espera').length,
      icone: 'ti-hourglass',
      cor: 'ambar',
      desc: 'aguardando aproximação',
    },
    {
      titulo: 'Em aproximação',
      valor: lista.filter(a => ['aproximação', 'convivência'].includes(a.processo?.etapa_atual)).length,
      icone: 'ti-heart-handshake',
      cor: 'verde',
      desc: 'em visitas ou convivência',
    },
  ]
})

onMounted(async () => {
  try {
    adotantes.value = await adotantesService.listar()
  } catch {
    // sem dados — cards mostram 0
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <GovernoLayout>
    <div class="conteudo">
      <div class="cabecalho">
        <div>
          <h1>{{ saudacao }}, {{ userStore.primeiroNome || userStore.nome }}</h1>
          <p class="subtitulo">{{ dataHoje }}</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpis">
        <div v-for="(kpi, idx) in stats" :key="idx" class="kpi-card">
          <div :class="['kpi-icone', `cor-${kpi.cor}`]">
            <i :class="['ti', kpi.icone]"></i>
          </div>
          <div class="kpi-info">
            <p class="kpi-titulo">{{ kpi.titulo }}</p>
            <p class="kpi-valor">
              <template v-if="carregando">—</template>
              <template v-else>{{ kpi.valor }}</template>
            </p>
            <p class="kpi-desc">{{ kpi.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Atalhos -->
      <section class="atalhos">
        <h2>Atalhos rápidos</h2>
        <div class="atalhos-grid">
          <button class="atalho" @click="router.push('/governo/adotantes')">
            <i class="ti ti-users"></i>
            <span>Adotantes</span>
            <p>Buscar e gerenciar processos</p>
          </button>
          <button class="atalho" @click="router.push('/governo/instituicoes')">
            <i class="ti ti-building"></i>
            <span>Instituições</span>
            <p>Consultar abrigos cadastrados</p>
          </button>
        </div>
      </section>
    </div>
  </GovernoLayout>
</template>

<style scoped>
.conteudo { max-width: 1140px; }

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
h1 { font-size: 26px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 14px; color: var(--color-text-secondary); }

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}
.kpi-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
}
.kpi-icone {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.cor-azul  { background: var(--color-primary-soft); color: var(--color-primary); }
.cor-ambar { background: var(--color-warning-soft); color: var(--color-warning); }
.cor-verde { background: var(--color-success-soft); color: var(--color-success); }
.cor-roxo  { background: #EEEDFE; color: #5448A6; }

.kpi-info { flex: 1; }
.kpi-titulo {
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}
.kpi-valor {
  font-size: 28px;
  font-weight: 600;
  margin-top: 4px;
  line-height: 1;
}
.kpi-desc {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 6px;
}

/* atalhos */
.atalhos h2 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.atalhos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 520px;
}
.atalho {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-align: left;
  transition: all 0.15s;
}
.atalho:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.atalho .ti { font-size: 24px; color: var(--color-primary); margin-bottom: 12px; display: block; }
.atalho span { display: block; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.atalho p { font-size: 12px; color: var(--color-text-tertiary); }
</style>
