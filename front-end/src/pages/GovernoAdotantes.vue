<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GovernoLayout from '@/components/GovernoLayout.vue'
import { adotantesService, processoService, documentosService } from '@/service/index'

const router = useRouter()

const adotantes = ref([])
const carregando = ref(true)
const atualizando = ref(false)
const erro = ref('')
const ultimaAtualizacao = ref(null)

const busca = ref('')
const filtroStatus = ref('')

const statusLabels = {
  'habilitação':    { label: 'Habilitação',   classe: 'cinza' },
  'fila_de_espera': { label: 'Em fila',        classe: 'azul' },
  'aproximação':    { label: 'Aproximação',    classe: 'ambar' },
  'convivência':    { label: 'Convivência',    classe: 'verde' },
  'sentença':       { label: 'Sentença',       classe: 'roxo' },
}

const paginaAtual = ref(1)
const porPagina = 10

const expandido = ref(null)
const atualizandoDoc = ref(null)

const filtrados = computed(() => {
  let lista = adotantes.value
  if (busca.value) {
    const q = busca.value.toLowerCase()
    lista = lista.filter(a =>
      a.nome?.toLowerCase().includes(q) ||
      a.cpf?.includes(q) ||
      a.processo?.numero_processo?.includes(q)
    )
  }
  if (filtroStatus.value === 'sem_processo') {
    lista = lista.filter(a => !a.processo)
  } else if (filtroStatus.value) {
    lista = lista.filter(a => a.processo?.etapa_atual === filtroStatus.value)
  }
  return lista
})

const paginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * porPagina
  return filtrados.value.slice(inicio, inicio + porPagina)
})

const totalPaginas = computed(() => Math.ceil(filtrados.value.length / porPagina) || 1)

const formatarData = (data) => {
  if (!data) return '—'
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

const carregarAdotantes = async (silencioso = false) => {
  if (!silencioso) carregando.value = true
  else atualizando.value = true
  erro.value = ''
  try {
    adotantes.value = await adotantesService.listar()
    ultimaAtualizacao.value = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (e) {
    if (!silencioso) erro.value = e.message
  } finally {
    carregando.value = false
    atualizando.value = false
  }
}

let intervalo = null

onMounted(() => {
  carregarAdotantes()
  intervalo = setInterval(() => carregarAdotantes(true), 10000)
})

onUnmounted(() => {
  clearInterval(intervalo)
})

const documentosPendentes = (documentos) => {
  if (!documentos) return []
  return documentos.filter(doc => doc.status !== 'entregue')
}

const toggleExpandir = (adotante) => {
  expandido.value = expandido.value === adotante.id ? null : adotante.id
}

const marcarDocumento = async (doc, status) => {
  atualizandoDoc.value = doc.id
  try {
    await documentosService.atualizarStatus(doc.id, status)
    await carregarAdotantes()
    alert(`${doc.nome_documento} marcado como ${statusDocLabels[status]}`)
  } catch (e) {
    alert(`Erro: ${e.message}`)
  } finally {
    atualizandoDoc.value = null
  }
}

const abrirAdotante = (adotante) => {
  if (adotante.processo) {
    router.push(`/governo/adotantes/${adotante.processo.id}`)
  } else {
    abrirModalCriarProcesso(adotante)
  }
}

// Modal criar processo
const modalCriar = ref(false)
const adotanteSelecionado = ref(null)
const formCriar = ref({ numero_processo: '', comarca: '' })
const criando = ref(false)
const erroCriar = ref('')

const abrirModalCriarProcesso = (adotante) => {
  adotanteSelecionado.value = adotante
  formCriar.value = { numero_processo: '', comarca: '' }
  erroCriar.value = ''
  modalCriar.value = true
}

const confirmarCriarProcesso = async () => {
  if (!formCriar.value.numero_processo || !formCriar.value.comarca) {
    erroCriar.value = 'Preencha o número do processo e a comarca.'
    return
  }
  criando.value = true
  erroCriar.value = ''
  try {
    const novo = await processoService.criar({
      adotante_id: adotanteSelecionado.value.id,
      numero_processo: formCriar.value.numero_processo,
      comarca: formCriar.value.comarca,
    })
    modalCriar.value = false
    router.push(`/governo/adotantes/${novo.id}`)
  } catch (e) {
    erroCriar.value = e.message || 'Erro ao criar processo.'
  } finally {
    criando.value = false
  }
}
</script>

<template>
  <GovernoLayout>
    <div class="conteudo">
      <div class="cabecalho">
        <div>
          <h1>Adotantes cadastrados</h1>
          <p class="subtitulo">
            <template v-if="carregando">Carregando...</template>
            <template v-else>
              {{ filtrados.length }} adotante{{ filtrados.length !== 1 ? 's' : '' }} encontrado{{ filtrados.length !== 1 ? 's' : '' }}
              <span v-if="ultimaAtualizacao" class="ultima-atualizacao">· atualizado às {{ ultimaAtualizacao }}</span>
            </template>
          </p>
        </div>
        <button class="btn btn-ghost" :disabled="atualizando || carregando" @click="carregarAdotantes(false)">
          <i :class="['ti', atualizando ? 'ti-loader-2 spin' : 'ti-refresh']"></i>
          Atualizar
        </button>
      </div>

      <div v-if="erro" class="msg-erro"><i class="ti ti-alert-circle"></i> {{ erro }}</div>

      <!-- Busca e filtros -->
      <div class="filtros">
        <div class="campo-busca">
          <i class="ti ti-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar por nome, CPF ou número de processo..." @input="paginaAtual = 1" />
        </div>
        <select v-model="filtroStatus" class="select-filtro" @change="paginaAtual = 1">
          <option value="">Todos</option>
          <option value="sem_processo">Sem processo</option>
          <option v-for="(info, key) in statusLabels" :key="key" :value="key">{{ info.label }}</option>
        </select>
      </div>

      <!-- Tabela -->
      <div class="tabela">
        <div class="thead">
          <div>Adotante</div>
          <div>Etapa</div>
          <div>Habilitado em</div>
          <div>Posição na fila</div>
          <div>Documentos pendentes</div>
          <div></div>
        </div>

        <div v-if="carregando" class="vazio-tabela">Carregando adotantes...</div>

        <div
          v-for="a in paginados"
          :key="a.id"
          class="trow"
          @click="abrirAdotante(a)"
        >
          <div class="td-adotante">
            <p class="nome">{{ a.nome }}</p>
            <p class="ref">{{ a.cpf }} · {{ a.email }}</p>
          </div>
          <div>
            <span v-if="a.processo" :class="['status-tag', `tag-${statusLabels[a.processo.etapa_atual]?.classe ?? 'cinza'}`]">
              {{ statusLabels[a.processo.etapa_atual]?.label ?? a.processo.etapa_atual }}
            </span>
            <span v-else class="status-tag tag-sem">Sem processo</span>
          </div>
          <div class="td-data">{{ a.processo ? formatarData(a.processo.data_habilitacao) : '—' }}</div>
          <div class="td-data">{{ a.processo?.posicao_fila ?? '—' }}</div>
          <div class="td-docs" @click.stop>
            <span v-if="a.processo && a.processo.documentos" class="docs-count">
              {{ documentosPendentes(a.processo.documentos).length }} pendente{{ documentosPendentes(a.processo.documentos).length !== 1 ? 's' : '' }}
            </span>
            <button v-if="a.processo && a.processo.documentos && documentosPendentes(a.processo.documentos).length > 0" class="btn-expand" @click="toggleExpandir(a)">
              <i :class="['ti', expandido === a.id ? 'ti-chevron-up' : 'ti-chevron-down']"></i>
            </button>
          </div>
          <div class="td-acao">
            <span v-if="!a.processo" class="criar-hint">Criar processo</span>
            <i v-else class="ti ti-chevron-right"></i>
          </div>
        </div>

        <!-- Linha expansível para documentos -->
        <div v-if="expandido" class="trow-expandido">
          <div class="docs-lista">
            <div
              v-for="doc in documentosPendentes(adotantes.find(a => a.id === expandido)?.processo?.documentos)"
              :key="doc.id"
              class="doc-item"
            >
              <div class="doc-info">
                <p class="doc-nome">{{ doc.nome_documento }}</p>
                <p v-if="doc.data_validacao" class="doc-detalhe">
                  Validado em {{ new Date(doc.data_validacao).toLocaleDateString('pt-BR') }}
                </p>
              </div>
              <div class="doc-acoes">
                <button
                  class="btn btn-ghost btn-pequeno"
                  :disabled="atualizandoDoc === doc.id"
                  @click="marcarDocumento(doc, 'entregue')"
                >Marcar entregue</button>
                <button
                  class="btn btn-ghost btn-pequeno btn-alerta"
                  :disabled="atualizandoDoc === doc.id"
                  @click="marcarDocumento(doc, 'requer_nova_entrega')"
                >Solicitar reentrega</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!carregando && paginados.length === 0" class="vazio-tabela">
          Nenhum adotante encontrado com os filtros aplicados.
        </div>
      </div>

      <!-- Paginação -->
      <div v-if="totalPaginas > 1" class="paginacao">
        <p class="paginacao-info">
          Mostrando {{ paginados.length ? (paginaAtual - 1) * porPagina + 1 : 0 }}–{{ (paginaAtual - 1) * porPagina + paginados.length }} de {{ filtrados.length }}
        </p>
        <div class="paginacao-controles">
          <button class="btn btn-ghost btn-pagina" :disabled="paginaAtual === 1" @click="paginaAtual--">Anterior</button>
          <button
            v-for="p in totalPaginas"
            :key="p"
            :class="['btn btn-pagina', { 'btn-primary': paginaAtual === p, 'btn-ghost': paginaAtual !== p }]"
            @click="paginaAtual = p"
          >{{ p }}</button>
          <button class="btn btn-ghost btn-pagina" :disabled="paginaAtual === totalPaginas" @click="paginaAtual++">Próxima</button>
        </div>
      </div>
    </div>

    <!-- Modal Criar Processo -->
    <div v-if="modalCriar" class="modal-overlay" @click.self="modalCriar = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Criar processo</h2>
          <button class="modal-close" @click="modalCriar = false"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">
            Adotante: <strong>{{ adotanteSelecionado?.nome }}</strong>
          </p>
          <div class="campo">
            <label>Número do processo</label>
            <input v-model="formCriar.numero_processo" type="text" placeholder="Ex: 0001234-56.2026.8.17.0001" />
          </div>
          <div class="campo">
            <label>Comarca</label>
            <input v-model="formCriar.comarca" type="text" placeholder="Ex: Recife" />
          </div>
        </div>
        <div class="modal-footer">
          <p v-if="erroCriar" class="erro-modal"><i class="ti ti-alert-circle"></i> {{ erroCriar }}</p>
          <button class="btn btn-ghost" @click="modalCriar = false">Cancelar</button>
          <button class="btn btn-primary" @click="confirmarCriarProcesso" :disabled="criando">
            {{ criando ? 'Criando...' : 'Criar processo' }}
          </button>
        </div>
      </div>
    </div>
  </GovernoLayout>
</template>

<style scoped>
.conteudo { max-width: 1080px; }

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
h1 { font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 14px; color: var(--color-text-secondary); }

.msg-erro {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.filtros {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.campo-busca {
  flex: 1;
  min-width: 280px;
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

.select-filtro {
  padding: 9px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-bg);
  outline: none;
  color: var(--color-text);
}

.tabela {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
}
.thead {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1fr 130px 40px;
  gap: 16px;
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
  grid-template-columns: 2fr 1.2fr 1.2fr 1fr 130px 40px;
  gap: 16px;
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
.td-data { color: var(--color-text-secondary); }
.td-acao { text-align: right; color: var(--color-text-tertiary); display: flex; align-items: center; justify-content: flex-end; }

.status-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
}
.tag-azul  { background: var(--color-primary-soft); color: var(--color-primary); }
.tag-ambar { background: var(--color-warning-soft); color: var(--color-warning); }
.tag-verde { background: var(--color-success-soft); color: var(--color-success); }
.tag-cinza { background: var(--color-bg-soft); color: var(--color-text-secondary); }
.tag-roxo  { background: #EEEDFE; color: #5448A6; }
.tag-sem   { background: #f3f4f6; color: #6b7280; }

.criar-hint {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
}

.td-docs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.docs-count { font-weight: 500; }
.btn-expand {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
}
.btn-expand:hover { background: var(--color-primary-soft); }

.trow-expandido {
  background: var(--color-bg-soft);
  border-bottom: 1px solid var(--color-border);
  grid-column: 1 / -1;
}
.docs-lista {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.doc-info {
  flex: 1;
}
.doc-nome {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}
.doc-detalhe {
  font-size: 12px;
  color: var(--color-success);
}
.doc-acoes {
  display: flex;
  gap: 8px;
}
.btn-pequeno { font-size: 12px; padding: 6px 12px; }
.btn-alerta { color: var(--color-danger); border-color: var(--color-danger); }

.vazio-tabela { padding: 36px 24px; text-align: center; font-size: 13px; color: var(--color-text-tertiary); }

.paginacao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.paginacao-info { font-size: 12px; color: var(--color-text-tertiary); }
.paginacao-controles { display: flex; gap: 4px; }
.btn-pagina { padding: 6px 12px; font-size: 12px; min-width: 32px; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.ultima-atualizacao { color: var(--color-text-tertiary); font-size: 12px; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }

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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
.campo input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: var(--color-bg);
  box-sizing: border-box;
}
.erro-modal {
  flex: 1;
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
