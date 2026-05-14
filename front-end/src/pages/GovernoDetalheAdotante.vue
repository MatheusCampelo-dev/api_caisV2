<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GovernoLayout from '@/components/GovernoLayout.vue'
import { processoService, documentosService, instituicoesService } from '@/service/index'

const router = useRouter()
const route = useRoute()

const processo = ref(null)
const carregando = ref(true)
const erro = ref('')
const toast = ref(null)

const instituicoes = ref([])
const relatorios = ref([])

const statusLabels = {
  'habilitação':    'Habilitação',
  'fila_de_espera': 'Em fila de espera',
  'aproximação':    'Aproximação',
  'convivência':    'Convivência',
  'sentença':       'Sentença'
}

const statusDocLabels = {
  'entregue':            'Entregue',
  'pendente':            'Pendente',
  'requer_nova_entrega': 'Reentregar'
}

const carregarTudo = async () => {
  carregando.value = true
  erro.value = ''
  try {
    const [proc, inst, rel] = await Promise.all([
      processoService.detalhe(route.params.id),
      instituicoesService.listar(),
      processoService.relatorios(route.params.id),
    ])
    processo.value = proc
    instituicoes.value = inst
    relatorios.value = rel
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregarTudo)

// ── Avançar etapa ─────────────────────────────────────────────
const avancandoEtapa = ref(false)
const etapas = ['habilitação', 'fila_de_espera', 'aproximação', 'convivência', 'sentença']

const proxEtapa = computed(() => {
  if (!processo.value) return null
  const idx = etapas.indexOf(processo.value.etapa_atual)
  return idx < etapas.length - 1 ? etapas[idx + 1] : null
})

const aprovarEtapa = async () => {
  if (!proxEtapa.value) return
  avancandoEtapa.value = true
  try {
    await processoService.avancarEtapa(processo.value.id, proxEtapa.value)
    await carregarTudo()
    mostrarToast(`Etapa avançada para ${statusLabels[proxEtapa.value]}`)
  } catch (e) {
    mostrarToast(`Erro: ${e.message}`, true)
  } finally {
    avancandoEtapa.value = false
  }
}

// ── Documentos ────────────────────────────────────────────────
const atualizandoDoc = ref(null)

const marcarDocumento = async (doc, status) => {
  atualizandoDoc.value = doc.id
  try {
    await documentosService.atualizarStatus(doc.id, status)
    await carregarTudo()
    mostrarToast(`${doc.nome_documento} marcado como ${statusDocLabels[status]}`)
  } catch (e) {
    mostrarToast(`Erro: ${e.message}`, true)
  } finally {
    atualizandoDoc.value = null
  }
}

// ── Vincular Instituição ──────────────────────────────────────
const modalVincular = ref(false)
const formVincular = ref({ instituicao_id: '' })
const vinculando = ref(false)
const erroVincular = ref('')

const abrirModalVincular = () => {
  formVincular.value.instituicao_id = processo.value?.instituicao_id ?? ''
  erroVincular.value = ''
  modalVincular.value = true
}

const confirmarVincular = async () => {
  vinculando.value = true
  erroVincular.value = ''
  try {
    await processoService.vincularInstituicao(
      processo.value.id,
      formVincular.value.instituicao_id || null
    )
    modalVincular.value = false
    await carregarTudo()
    mostrarToast(
      formVincular.value.instituicao_id
        ? 'Instituição vinculada com sucesso'
        : 'Instituição desvinculada'
    )
  } catch (e) {
    erroVincular.value = e.message || 'Erro ao vincular instituição.'
  } finally {
    vinculando.value = false
  }
}

// ── Toast ─────────────────────────────────────────────────────
const mostrarToast = (msg, isErro = false) => {
  toast.value = { msg, isErro }
  setTimeout(() => { toast.value = null }, 4000)
}

const formatarData = (data) => {
  if (!data) return '—'
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}
</script>

<template>
  <GovernoLayout>
    <div class="conteudo">
      <button class="voltar" @click="router.push('/governo/adotantes')" type="button">
        <i class="ti ti-arrow-left"></i>
        Lista de adotantes
      </button>

      <div v-if="carregando" class="msg-estado">Carregando processo...</div>
      <div v-else-if="erro" class="msg-estado erro"><i class="ti ti-alert-circle"></i> {{ erro }}</div>

      <template v-else-if="processo">
        <!-- Cabeçalho -->
        <div class="cabecalho">
          <div>
            <h1>{{ processo.adotante?.nome ?? '—' }}</h1>
            <p class="subtitulo">
              CPF {{ processo.adotante?.cpf ?? '—' }} · processo nº {{ processo.numero_processo }}
            </p>
          </div>
          <span class="badge-status">{{ statusLabels[processo.etapa_atual] ?? processo.etapa_atual }}</span>
        </div>

        <!-- Resumo -->
        <div class="resumo">
          <div class="resumo-item">
            <p class="resumo-label">Comarca</p>
            <p class="resumo-valor">{{ processo.comarca }}</p>
          </div>
          <div class="resumo-item">
            <p class="resumo-label">Habilitado em</p>
            <p class="resumo-valor">{{ formatarData(processo.data_habilitacao) }}</p>
          </div>
          <div v-if="processo.posicao_fila" class="resumo-item">
            <p class="resumo-label">Posição na fila</p>
            <p class="resumo-valor">{{ processo.posicao_fila }}º</p>
          </div>
          <div class="resumo-item" :class="{ 'resumo-item-destaque': processo.instituicao }">
            <p class="resumo-label">Instituição vinculada</p>
            <p class="resumo-valor">{{ processo.instituicao?.nome ?? 'Nenhuma' }}</p>
          </div>
        </div>

        <!-- Documentos -->
        <section class="bloco">
          <p class="bloco-titulo">DOCUMENTOS DO PROCESSO</p>
          <div v-if="!processo.documentos || processo.documentos.length === 0" class="vazio-bloco">
            Nenhum documento registrado ainda para este processo.
          </div>
          <div v-else class="checklist">
            <div
              v-for="doc in processo.documentos"
              :key="doc.id"
              :class="['check-item', { entregue: doc.status === 'entregue', reentregar: doc.status === 'requer_nova_entrega' }]"
            >
              <i :class="['ti', doc.status === 'entregue' ? 'ti-circle-check' : doc.status === 'requer_nova_entrega' ? 'ti-alert-triangle' : 'ti-circle']"></i>
              <div class="check-info">
                <p class="check-nome">{{ doc.nome_documento }}</p>
                <p v-if="doc.data_validacao" class="check-detalhe">
                  Validado em {{ new Date(doc.data_validacao).toLocaleDateString('pt-BR') }}
                </p>
              </div>
              <div class="check-acoes">
                <button
                  v-if="doc.status !== 'entregue'"
                  class="btn btn-ghost btn-pequeno"
                  :disabled="atualizandoDoc === doc.id"
                  @click="marcarDocumento(doc, 'entregue')"
                >Marcar entregue</button>
                <button
                  v-if="doc.status === 'entregue'"
                  class="btn btn-ghost btn-pequeno btn-alerta"
                  :disabled="atualizandoDoc === doc.id"
                  @click="marcarDocumento(doc, 'requer_nova_entrega')"
                >Solicitar reentrega</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Relatórios de Visitas -->
        <section class="bloco">
          <p class="bloco-titulo">RELATÓRIOS DE VISITAS</p>
          <div v-if="relatorios.length === 0" class="vazio-bloco">
            Nenhum relatório de visita enviado ainda para este processo.
          </div>
          <div v-else class="relatorios-lista">
            <div
              v-for="rel in relatorios"
              :key="rel.id"
              class="relatorio-card"
            >
              <div class="relatorio-header">
                <div>
                  <p class="relatorio-instituicao">{{ rel.instituicao?.nome }}</p>
                  <p class="relatorio-data">
                    Visita em {{ new Date(rel.data_visita).toLocaleDateString('pt-BR') }}
                    às {{ rel.hora_inicio }}
                  </p>
                </div>
                <span class="relatorio-tipo">{{ rel.tipo_visita }}</span>
              </div>
              <div class="relatorio-conteudo">
                <div class="criterios">
                  <div class="criterio">
                    <span class="criterio-label">Vínculo:</span>
                    <span class="criterio-valor">{{ rel.criterio_vinculo }}</span>
                  </div>
                  <div class="criterio">
                    <span class="criterio-label">Comunicação:</span>
                    <span class="criterio-valor">{{ rel.criterio_comunicacao }}</span>
                  </div>
                  <div class="criterio">
                    <span class="criterio-label">Adaptação:</span>
                    <span class="criterio-valor">{{ rel.criterio_adaptacao }}</span>
                  </div>
                </div>
                <div class="parecer">
                  <p class="parecer-label">Parecer descritivo:</p>
                  <p class="parecer-texto">{{ rel.parecer_descritivo }}</p>
                </div>
                <div class="recomendacao">
                  <p class="recomendacao-label">Recomendação para a vara:</p>
                  <p class="recomendacao-texto">{{ rel.recomendacao_vara }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Ações do processo -->
        <section class="bloco">
          <p class="bloco-titulo">AÇÕES DO PROCESSO</p>
          <div class="acoes">
            <!-- Vincular instituição -->
            <button class="acao-card" @click="abrirModalVincular">
              <i class="ti ti-building"></i>
              <span>
                {{ processo.instituicao ? `Alterar instituição (${processo.instituicao.nome})` : 'Vincular instituição' }}
              </span>
            </button>

            <!-- Avançar etapa -->
            <button
              v-if="proxEtapa"
              class="acao-card destaque"
              :disabled="avancandoEtapa"
              @click="aprovarEtapa"
            >
              <i class="ti ti-circle-check"></i>
              <span>{{ avancandoEtapa ? 'Avançando...' : `Avançar para ${statusLabels[proxEtapa]}` }}</span>
            </button>

            <p v-if="!proxEtapa" class="etapa-final">
              <i class="ti ti-check"></i> Processo na etapa final: Sentença
            </p>
          </div>
        </section>
      </template>

      <!-- Modal Vincular Instituição -->
      <div v-if="modalVincular" class="modal-overlay" @click.self="modalVincular = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Vincular instituição</h2>
            <button class="modal-close" @click="modalVincular = false"><i class="ti ti-x"></i></button>
          </div>
          <div class="modal-body">
            <p class="modal-desc">
              Selecione a instituição de acolhimento que acompanhará o processo de
              <strong>{{ processo?.adotante?.nome }}</strong>.
            </p>
            <div class="campo">
              <label>Instituição</label>
              <select v-model="formVincular.instituicao_id">
                <option value="">Nenhuma (desvincular)</option>
                <option v-for="inst in instituicoes" :key="inst.id" :value="inst.id">
                  {{ inst.nome }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <p v-if="erroVincular" class="erro-modal"><i class="ti ti-alert-circle"></i> {{ erroVincular }}</p>
            <button class="btn btn-ghost" @click="modalVincular = false">Cancelar</button>
            <button class="btn btn-primary" @click="confirmarVincular" :disabled="vinculando">
              {{ vinculando ? 'Salvando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <transition name="toast">
        <div v-if="toast" :class="['toast', { 'toast-erro': toast.isErro }]">
          <i :class="['ti', toast.isErro ? 'ti-alert-circle' : 'ti-circle-check']"></i>
          <span>{{ toast.msg }}</span>
          <button class="toast-fechar" @click="toast = null"><i class="ti ti-x"></i></button>
        </div>
      </transition>
    </div>
  </GovernoLayout>
</template>

<style scoped>
.conteudo { max-width: 880px; position: relative; }

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}
.voltar:hover { color: var(--color-primary); }

.msg-estado {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.msg-estado.erro { color: var(--color-danger); }

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
h1 { font-size: 26px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 13px; color: var(--color-text-secondary); }
.badge-status {
  font-size: 12px;
  padding: 5px 14px;
  border-radius: 14px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 500;
  white-space: nowrap;
}

.resumo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}
.resumo-item {
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}
.resumo-item-destaque {
  background: var(--color-primary-soft);
}
.resumo-item-destaque .resumo-label { color: var(--color-primary); }
.resumo-item-destaque .resumo-valor { color: var(--color-primary); font-weight: 600; }
.resumo-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.resumo-valor { font-size: 14px; margin-top: 4px; }

.bloco { margin-bottom: 28px; }
.bloco-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.vazio-bloco {
  padding: 20px 18px;
  font-size: 13px;
  color: var(--color-text-tertiary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

/* Documentos */
.checklist {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}
.check-item:last-child { border-bottom: none; }
.check-item > .ti { font-size: 20px; color: var(--color-text-tertiary); flex-shrink: 0; }
.check-item.entregue { background: var(--color-success-soft); border-left: 3px solid var(--color-success); }
.check-item.entregue > .ti { color: var(--color-success); }
.check-item.entregue .check-nome { color: var(--color-success); font-weight: 600; }
.check-item.reentregar { background: var(--color-danger-soft); border-left: 3px solid var(--color-danger); }
.check-item.reentregar > .ti { color: var(--color-danger); }
.check-info { flex: 1; }
.check-nome { font-size: 14px; }
.check-detalhe { font-size: 11px; color: var(--color-success); margin-top: 2px; }
.check-acoes { display: flex; gap: 6px; }

/* Ações processo */
.acoes { display: flex; flex-direction: column; gap: 10px; }
.acao-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  cursor: pointer;
}
.acao-card:hover { border-color: var(--color-primary); color: var(--color-primary); }
.acao-card.destaque { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.acao-card.destaque:hover { opacity: 0.9; }
.acao-card .ti { font-size: 18px; }
.acao-card:disabled { opacity: 0.6; cursor: not-allowed; }

.etapa-final {
  font-size: 13px;
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.btn-pequeno { font-size: 12px; padding: 6px 12px; }
.btn-alerta { color: var(--color-danger); border-color: var(--color-danger); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}
.modal {
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
}
.modal-header h2 { font-size: 17px; font-weight: 600; }
.modal-close {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-tertiary);
}
.modal-close:hover { background: var(--color-bg-soft); }
.modal-body { padding: 20px 22px; }
.modal-desc { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px; }
.modal-desc strong { color: var(--color-text); }
.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid var(--color-border);
}
.campo { margin-bottom: 14px; }
.campo label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.campo select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: var(--color-bg);
  box-sizing: border-box;
  font-family: inherit;
}
.erro-modal {
  flex: 1;
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--color-success);
  color: white;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-md);
  max-width: 360px;
  z-index: 200;
}
.toast.toast-erro { background: var(--color-danger); }
.toast > .ti { font-size: 20px; }
.toast-fechar { color: white; opacity: 0.8; display: flex; }
.toast-fechar:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }

/* Relatórios */
.relatorios-lista { display: flex; flex-direction: column; gap: 16px; }
.relatorio-card {
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid var(--color-border);
}
.relatorio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.relatorio-instituicao {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}
.relatorio-data {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.relatorio-tipo {
  font-size: 11px;
  padding: 4px 8px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: 8px;
  font-weight: 500;
}
.relatorio-conteudo { display: flex; flex-direction: column; gap: 12px; }
.criterios {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.criterio {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.criterio-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
}
.criterio-valor {
  font-size: 13px;
  font-weight: 500;
}
.parecer, .recomendacao {
  padding: 12px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.parecer-label, .recomendacao-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
}
.parecer-texto, .recomendacao-texto {
  font-size: 14px;
  line-height: 1.4;
}
</style>
