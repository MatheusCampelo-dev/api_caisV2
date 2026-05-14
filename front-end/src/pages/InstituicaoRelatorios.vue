<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InstituicaoLayout from '@/components/InstituicaoLayout.vue'
import { visitasService } from '@/service/index'

const router = useRouter()
const busca = ref('')
const filtroAtivo = ref('todos')
const carregando = ref(true)
const erro = ref('')

const visitas = ref([])

onMounted(async () => {
  try {
    const todas = await visitasService.listar()
    visitas.value = todas.filter(v => v.status_relatorio !== 'pendente')
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
})

const recomendacaoLabels = {
  'Prosseguir para próxima visita': { label: 'Prosseguir', cor: 'verde' },
  'Solicitar acompanhamento adicional da equipe técnica': { label: 'Acompanhamento', cor: 'ambar' },
  'Sugerir interrupção do estágio de aproximação': { label: 'Interromper', cor: 'vermelho' },
}

const formatarData = (str) => {
  if (!str) return '—'
  const [ano, mes, dia] = str.split('-')
  return `${dia}/${mes}/${ano}`
}

const filtrados = computed(() => {
  let lista = visitas.value
  if (filtroAtivo.value !== 'todos') {
    lista = lista.filter(v => v.status_relatorio === filtroAtivo.value)
  }
  if (busca.value) {
    const q = busca.value.toLowerCase()
    lista = lista.filter(v =>
      v.processo?.adotante?.nome?.toLowerCase().includes(q) ||
      v.processo?.numero_processo?.includes(q)
    )
  }
  return lista
})

const totalEnviados = computed(() => visitas.value.filter(v => v.status_relatorio === 'enviado').length)
const totalRascunhos = computed(() => visitas.value.filter(v => v.status_relatorio === 'rascunho').length)

const abrirRelatorio = (v) => {
  router.push(`/instituicao/visitas/${v.id}/relatorio`)
}
</script>

<template>
  <InstituicaoLayout>
    <div class="conteudo">
      <div class="cabecalho">
        <div>
          <h1>Relatórios</h1>
          <p v-if="!carregando" class="subtitulo">{{ totalEnviados }} enviados · {{ totalRascunhos }} em rascunho</p>
        </div>
      </div>

      <p v-if="carregando" class="msg-status">Carregando relatórios...</p>
      <p v-if="erro" class="msg-status erro"><i class="ti ti-alert-circle"></i> {{ erro }}</p>

      <template v-if="!carregando && !erro">
        <!-- Busca e filtros -->
        <div class="filtros">
          <div class="campo-busca">
            <i class="ti ti-search"></i>
            <input v-model="busca" placeholder="Buscar por adotante ou processo..." />
          </div>
          <div class="chips">
            <button :class="['chip', { ativo: filtroAtivo === 'todos' }]" @click="filtroAtivo = 'todos'">Todos</button>
            <button :class="['chip', { ativo: filtroAtivo === 'enviado' }]" @click="filtroAtivo = 'enviado'">Enviados</button>
            <button :class="['chip', { ativo: filtroAtivo === 'rascunho' }]" @click="filtroAtivo = 'rascunho'">Rascunhos</button>
          </div>
        </div>

        <!-- Tabela -->
        <div class="tabela">
          <div class="thead">
            <div>Adotante</div>
            <div>Tipo de visita</div>
            <div>Realizada em</div>
            <div>Recomendação</div>
            <div>Status</div>
          </div>

          <div
            v-for="v in filtrados"
            :key="v.id"
            class="trow"
            @click="abrirRelatorio(v)"
          >
            <div class="td-adotante">
              <p class="nome">{{ v.processo?.adotante?.nome ?? '—' }}</p>
              <p class="ref">{{ v.processo?.numero_processo ?? '—' }}</p>
            </div>
            <div class="td-meta">{{ v.tipo_visita ?? '—' }}</div>
            <div class="td-meta">{{ formatarData(v.data_visita) }}</div>
            <div>
              <span
                v-if="v.recomendacao_vara && recomendacaoLabels[v.recomendacao_vara]"
                :class="['recomendacao-tag', `rec-${recomendacaoLabels[v.recomendacao_vara].cor}`]"
              >
                {{ recomendacaoLabels[v.recomendacao_vara].label }}
              </span>
              <span v-else class="td-meta">—</span>
            </div>
            <div>
              <span :class="['status-tag', `st-${v.status_relatorio}`]">
                {{ v.status_relatorio === 'enviado' ? 'Enviado' : 'Rascunho' }}
              </span>
            </div>
          </div>

          <div v-if="filtrados.length === 0" class="vazio">
            <i class="ti ti-file-off"></i>
            <p>Nenhum relatório encontrado.</p>
          </div>
        </div>

        <!-- Aviso -->
        <div class="aviso">
          <i class="ti ti-lock"></i>
          <p>Os relatórios são confidenciais e visíveis apenas para a Vara da Infância e para a equipe técnica desta instituição.</p>
        </div>
      </template>
    </div>
  </InstituicaoLayout>
</template>

<style scoped>
.conteudo { max-width: 1080px; }

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
h1 { font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 14px; color: var(--color-text-secondary); }

.filtros {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}
.campo-busca {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.campo-busca .ti { font-size: 16px; color: var(--color-text-tertiary); }
.campo-busca input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; }

.chips { display: flex; gap: 4px; }
.chip {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-secondary);
}
.chip.ativo { background: var(--color-primary); color: white; border-color: var(--color-primary); }

.tabela {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
  margin-bottom: 20px;
}
.thead {
  display: grid;
  grid-template-columns: 1.8fr 1.6fr 1fr 1.2fr 1fr;
  gap: 14px;
  padding: 12px 18px;
  background: var(--color-bg-soft);
  border-bottom: 1px solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}
.trow {
  display: grid;
  grid-template-columns: 1.8fr 1.6fr 1fr 1.2fr 1fr;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.trow:last-child { border-bottom: none; }
.trow:hover { background: var(--color-bg-soft); }

.td-adotante .nome { font-weight: 600; font-size: 14px; }
.td-adotante .ref { font-size: 11px; color: var(--color-text-tertiary); margin-top: 2px; }
.td-meta { color: var(--color-text-secondary); }

.recomendacao-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
}
.rec-verde { background: var(--color-success-soft); color: var(--color-success); }
.rec-ambar { background: var(--color-warning-soft); color: var(--color-warning); }
.rec-vermelho { background: var(--color-danger-soft); color: var(--color-danger); }

.status-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
}
.st-enviado { background: var(--color-success-soft); color: var(--color-success); }
.st-rascunho { background: var(--color-bg-soft); color: var(--color-text-secondary); }

.vazio {
  padding: 48px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-tertiary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.vazio .ti { font-size: 32px; }

.aviso {
  display: flex;
  gap: 10px;
  background: var(--color-warning-soft);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  align-items: center;
}
.aviso .ti { font-size: 18px; color: var(--color-warning); flex-shrink: 0; }
.aviso p { font-size: 12px; color: var(--color-warning); line-height: 1.5; }

.msg-status {
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}
.msg-status.erro { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
</style>
