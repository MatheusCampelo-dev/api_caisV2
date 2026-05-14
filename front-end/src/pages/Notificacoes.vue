<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PainelLayout from '@/components/PainelLayout.vue'
import { notificacoesService } from '@/service/index'

const router = useRouter()

const notificacoes = ref([])
const carregando = ref(true)
const filtroAtivo = ref('todas')

const naoLidas = computed(() => notificacoes.value.filter(n => !n.lida).length)

const filtradas = computed(() => {
  if (filtroAtivo.value === 'todas') return notificacoes.value
  if (filtroAtivo.value === 'nao-lidas') return notificacoes.value.filter(n => !n.lida)
  return notificacoes.value.filter(n => n.tipo === filtroAtivo.value)
})

const marcarTodasComoLidas = () => {
  notificacoes.value.forEach(n => (n.lida = true))
}

onMounted(async () => {
  try {
    notificacoes.value = await notificacoesService.listar()
  } catch {
    notificacoes.value = []
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <PainelLayout>
    <div class="conteudo">
      <button class="voltar" @click="router.push('/painel')" type="button">
        <i class="ti ti-arrow-left"></i>
        Voltar ao painel
      </button>

      <div class="cabecalho">
        <div>
          <h1>Notificações</h1>
          <p class="subtitulo">
            <template v-if="carregando">Carregando...</template>
            <template v-else>{{ naoLidas }} não lida{{ naoLidas !== 1 ? 's' : '' }} · {{ notificacoes.length }} no total</template>
          </p>
        </div>
        <button class="btn btn-ghost" @click="marcarTodasComoLidas" :disabled="naoLidas === 0 || carregando">
          <i class="ti ti-checks"></i>
          Marcar todas como lidas
        </button>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <button :class="['chip', { ativo: filtroAtivo === 'todas' }]" @click="filtroAtivo = 'todas'">Todas</button>
        <button :class="['chip', { ativo: filtroAtivo === 'nao-lidas' }]" @click="filtroAtivo = 'nao-lidas'">Não lidas</button>
        <button :class="['chip', { ativo: filtroAtivo === 'vara' }]" @click="filtroAtivo = 'vara'">Da Vara</button>
        <button :class="['chip', { ativo: filtroAtivo === 'instituicao' }]" @click="filtroAtivo = 'instituicao'">Da Instituição</button>
      </div>

      <div v-if="carregando" class="msg-estado">Carregando notificações...</div>

      <template v-else>
        <div v-if="filtradas.length === 0" class="vazio">
          <i class="ti ti-inbox"></i>
          <p>
            <template v-if="notificacoes.length === 0">
              Nenhuma notificação ainda. Elas aparecerão conforme seu processo avançar.
            </template>
            <template v-else>
              Nenhuma notificação com este filtro.
            </template>
          </p>
        </div>

        <div v-else class="lista">
          <div
            v-for="n in filtradas"
            :key="n.id"
            :class="['notif-card', { nao_lida: !n.lida }]"
          >
            <span v-if="!n.lida" class="ponto-nao-lido"></span>
            <div :class="['notif-icone', `cor-${n.cor}`]">
              <i :class="['ti', n.icone]"></i>
            </div>
            <div class="notif-info">
              <p class="notif-titulo">{{ n.titulo }}</p>
              <p class="notif-mensagem">{{ n.mensagem }}</p>
              <p class="notif-meta">{{ n.quando }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </PainelLayout>
</template>

<style scoped>
.conteudo { max-width: 880px; }

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  padding: 0;
}
.voltar:hover { text-decoration: underline; }

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
h1 { font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 14px; color: var(--color-text-secondary); }

.msg-estado {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 16px 0;
}

.filtros {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.chip {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  transition: all 0.15s;
}
.chip:hover { border-color: var(--color-border-strong); }
.chip.ativo {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.notif-card {
  display: flex;
  gap: 14px;
  padding: 14px 18px;
  background: var(--color-bg);
  position: relative;
}
.notif-card.nao_lida { background: var(--color-primary-soft); }

.ponto-nao-lido {
  position: absolute;
  left: 8px;
  top: 22px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.notif-icone {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  margin-left: 8px;
}
.cor-azul { background: var(--color-primary-soft); color: var(--color-primary); }
.notif-card.nao_lida .cor-azul { background: var(--color-bg); }
.cor-verde { background: var(--color-success-soft); color: var(--color-success); }
.cor-amarelo { background: var(--color-warning-soft); color: var(--color-warning); }

.notif-info { flex: 1; min-width: 0; }
.notif-titulo { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.notif-mensagem {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
}
.notif-meta { font-size: 11px; color: var(--color-text-tertiary); }

.vazio {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-tertiary);
}
.vazio .ti { font-size: 36px; margin-bottom: 8px; display: block; }
.vazio p { font-size: 14px; }

button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
