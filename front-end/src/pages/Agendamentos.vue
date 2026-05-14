<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PainelLayout from '@/components/PainelLayout.vue'
import { visitasService } from '@/service/index'

const router = useRouter()

const visitas = ref([])
const carregando = ref(true)
const filtroAtivo = ref('todos')

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const proximas = computed(() => visitas.value.filter(v => v.status_visita === 'agendada'))
const realizadas = computed(() => visitas.value.filter(v => v.status_visita === 'realizada'))

const aplicarFiltro = (lista) => {
  if (filtroAtivo.value === 'todos') return lista
  return lista.filter(v => v._fonte === filtroAtivo.value)
}

const proximasFiltradas = computed(() => aplicarFiltro(proximas.value))
const realizadasFiltradas = computed(() => aplicarFiltro(realizadas.value))

const diaSemana = (dataStr) =>
  dataStr ? DIAS_SEMANA[new Date(dataStr + 'T00:00:00').getDay()] : ''

const dia = (dataStr) =>
  dataStr ? new Date(dataStr + 'T00:00:00').getDate() : ''

const mes = (dataStr) =>
  dataStr ? new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase() : ''

const horario = (inicio, fim) => {
  const h1 = inicio?.slice(0, 5) ?? ''
  const h2 = fim?.slice(0, 5) ?? ''
  return h2 && h2 !== h1 ? `${h1} às ${h2}` : h1
}

const dataFormatada = (dataStr) =>
  dataStr ? new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

onMounted(async () => {
  try {
    visitas.value = await visitasService.minhaAgenda()
  } catch {
    visitas.value = []
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

      <h1>Agendamentos</h1>
      <p class="subtitulo">
        <template v-if="carregando">Carregando...</template>
        <template v-else>{{ proximas.length }} próximo{{ proximas.length !== 1 ? 's' : '' }} · {{ realizadas.length }} realizado{{ realizadas.length !== 1 ? 's' : '' }}</template>
      </p>

      <div v-if="carregando" class="msg-estado">Carregando agenda...</div>

      <template v-else>
        <!-- Próximos -->
        <p class="bloco-titulo">PRÓXIMOS COMPROMISSOS</p>

        <div v-if="proximasFiltradas.length === 0" class="card-vazio">
          <i class="ti ti-calendar-off"></i>
          <p>Nenhum compromisso próximo. Quando a instituição agendar uma visita, ela aparecerá aqui.</p>
        </div>

        <div v-else class="lista">
          <div v-for="v in proximasFiltradas" :key="v.id" class="card-agendamento">
            <div class="data-box">
              <span class="dia">{{ dia(v.data_visita) }}</span>
              <span class="mes">{{ mes(v.data_visita) }}</span>
              <span class="dia-semana">{{ diaSemana(v.data_visita) }}</span>
            </div>
            <div class="info">
              <div class="info-header">
                <div class="icone-tipo cor-azul">
                  <i class="ti ti-home-heart"></i>
                </div>
                <h3>{{ v.tipo_visita }}</h3>
                <span class="badge-status">Confirmado</span>
              </div>
              <p class="local">
                <i class="ti ti-building"></i>
                {{ v.instituicao?.nome ?? 'Instituição' }}
              </p>
              <p class="horario"><i class="ti ti-clock"></i> {{ horario(v.hora_inicio, v.hora_fim) }}</p>
            </div>
          </div>
        </div>

        <!-- Histórico -->
        <p class="bloco-titulo">HISTÓRICO</p>

        <div v-if="realizadasFiltradas.length === 0" class="historico-vazio">
          <p>Nenhuma visita realizada ainda.</p>
        </div>

        <div v-else class="historico">
          <div v-for="v in realizadasFiltradas" :key="v.id" class="hist-item">
            <i class="ti ti-circle-check"></i>
            <div class="hist-info">
              <p class="hist-titulo">{{ v.tipo_visita }}</p>
              <p class="hist-meta">
                {{ v.instituicao?.nome ?? 'Instituição' }} · {{ dataFormatada(v.data_visita) }}
              </p>
            </div>
            <span class="hist-tag">Realizada</span>
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

h1 { font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.subtitulo {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.msg-estado {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 16px 0;
}

.bloco-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin: 28px 0 12px;
}

.card-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-tertiary);
  text-align: center;
}
.card-vazio .ti { font-size: 36px; }
.card-vazio p { font-size: 14px; }

.historico-vazio {
  font-size: 13px;
  color: var(--color-text-tertiary);
  padding: 16px 0;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-agendamento {
  display: flex;
  gap: 18px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  transition: all 0.15s;
}
.card-agendamento:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.data-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  flex-shrink: 0;
  padding: 8px 0;
  border-right: 1px solid var(--color-border);
}
.data-box .dia {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1;
}
.data-box .mes {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-top: 4px;
  font-weight: 500;
}
.data-box .dia-semana {
  font-size: 10px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.info { flex: 1; }
.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.icone-tipo {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.cor-azul { background: var(--color-primary-soft); color: var(--color-primary); }

.info h3 {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
}
.badge-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  background: var(--color-success-soft);
  color: var(--color-success);
  font-weight: 500;
}

.local, .horario {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.local .ti, .horario .ti {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.historico {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.hist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: var(--color-bg);
}
.hist-item > .ti {
  font-size: 18px;
  color: var(--color-success);
  flex-shrink: 0;
}
.hist-info { flex: 1; }
.hist-titulo {
  font-size: 13px;
  font-weight: 500;
}
.hist-meta {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}
.hist-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  background: var(--color-success-soft);
  color: var(--color-success);
  font-weight: 500;
}
</style>
