<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import InstituicaoLayout from '@/components/InstituicaoLayout.vue'
import { visitasService } from '@/service/index'

const router = useRouter()
const route = useRoute()
const visitaId = route.params.id

const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')

const visita = ref(null)

const criterios = ref([
  { nome: 'Vínculo afetivo', campo: 'criterio_vinculo', opcoes: ['Frágil', 'Em formação', 'Bom'], selecionada: null },
  { nome: 'Comunicação',     campo: 'criterio_comunicacao', opcoes: ['Difícil', 'Adequada', 'Excelente'], selecionada: null },
  { nome: 'Adaptação ao ambiente', campo: 'criterio_adaptacao', opcoes: ['Resistente', 'Cautelosa', 'Confortável'], selecionada: null },
])

const parecer = ref('')
const recomendacoes = [
  { id: 'Prosseguir para próxima visita', label: 'Prosseguir para próxima visita', tipo: 'positivo' },
  { id: 'Solicitar acompanhamento adicional da equipe técnica', label: 'Solicitar acompanhamento adicional da equipe técnica', tipo: 'neutro' },
  { id: 'Sugerir interrupção do estágio de aproximação', label: 'Sugerir interrupção do estágio de aproximação', tipo: 'negativo' },
]
const recomendacaoSelecionada = ref(null)

const isEnviado = computed(() => visita.value?.status_relatorio === 'enviado')

onMounted(async () => {
  try {
    const dados = await visitasService.detalhe(visitaId)
    visita.value = dados
    criterios.value[0].selecionada = dados.criterio_vinculo ?? null
    criterios.value[1].selecionada = dados.criterio_comunicacao ?? null
    criterios.value[2].selecionada = dados.criterio_adaptacao ?? null
    parecer.value = dados.parecer_descritivo ?? ''
    recomendacaoSelecionada.value = dados.recomendacao_vara ?? null
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
})

const formatarData = (v) => {
  if (!v) return '—'
  const [ano, mes, dia] = v.data_visita.split('-')
  const inicio = v.hora_inicio?.slice(0, 5)
  const fim = v.hora_fim?.slice(0, 5)
  return `${dia}/${mes}/${ano}${inicio ? ` · ${inicio}${fim && fim !== inicio ? ' às ' + fim : ''}` : ''}`
}

const selecionarCriterio = (idx, opcao) => {
  if (!isEnviado.value) criterios.value[idx].selecionada = opcao
}

const obterClasseCriterio = (criterio, opcao) => {
  if (criterio.selecionada !== opcao) return ''
  const idx = criterio.opcoes.indexOf(opcao)
  if (idx === 0) return 'pill-vermelho'
  if (idx === 1) return 'pill-amarelo'
  return 'pill-verde'
}

const payload = () => ({
  criterio_vinculo:      criterios.value[0].selecionada,
  criterio_comunicacao:  criterios.value[1].selecionada,
  criterio_adaptacao:    criterios.value[2].selecionada,
  parecer_descritivo:    parecer.value,
  recomendacao_vara:     recomendacaoSelecionada.value,
})

const salvarRascunho = async () => {
  salvando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    await visitasService.atualizar(visitaId, { status_relatorio: 'rascunho', ...payload() })
    sucesso.value = 'Rascunho salvo.'
    setTimeout(() => { sucesso.value = '' }, 3000)
  } catch (e) {
    erro.value = e.message
  } finally {
    salvando.value = false
  }
}

const enviarAVara = async () => {
  if (!criterios.value.every(c => c.selecionada) || !parecer.value.trim() || !recomendacaoSelecionada.value) {
    erro.value = 'Preencha todos os critérios, o parecer e a recomendação antes de enviar.'
    return
  }
  salvando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    await visitasService.atualizar(visitaId, { status_relatorio: 'enviado', ...payload() })
    router.push('/instituicao/relatorios')
  } catch (e) {
    erro.value = e.message
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <InstituicaoLayout>
    <div class="conteudo">
      <button class="voltar" @click="router.push('/instituicao/visitas')" type="button">
        <i class="ti ti-arrow-left"></i>
        Agenda de visitas
      </button>

      <h1>Relatório da visita</h1>
      <p class="subtitulo">Registre o parecer técnico após a aproximação. O texto será encaminhado à Vara da Infância.</p>

      <p v-if="carregando" class="msg-status">Carregando...</p>
      <p v-if="erro && !carregando" class="msg-status erro"><i class="ti ti-alert-circle"></i> {{ erro }}</p>
      <p v-if="sucesso" class="msg-status sucesso"><i class="ti ti-circle-check"></i> {{ sucesso }}</p>

      <template v-if="visita && !carregando">
        <div v-if="isEnviado" class="badge-enviado">
          <i class="ti ti-circle-check"></i> Relatório já enviado à Vara — somente leitura
        </div>

        <!-- Cabeçalho da visita -->
        <div class="resumo-visita">
          <div><span class="resumo-label">Processo</span> · <strong>{{ visita.processo?.numero_processo ?? '—' }}</strong></div>
          <div><span class="resumo-label">Adotante</span> · <strong>{{ visita.processo?.adotante?.nome ?? '—' }}</strong></div>
          <div><span class="resumo-label">Data</span> · <strong>{{ formatarData(visita) }}</strong></div>
          <div><span class="resumo-label">Tipo</span> · <strong>{{ visita.tipo_visita ?? '—' }}</strong></div>
        </div>

        <!-- Critérios -->
        <p class="bloco-titulo">CRITÉRIOS OBSERVADOS</p>
        <div class="criterios-grid">
          <div v-for="(crit, idx) in criterios" :key="idx" class="criterio-card">
            <p class="criterio-nome">{{ crit.nome }}</p>
            <div class="pills">
              <button
                v-for="opcao in crit.opcoes"
                :key="opcao"
                :class="['pill', obterClasseCriterio(crit, opcao)]"
                @click="selecionarCriterio(idx, opcao)"
                type="button"
                :disabled="isEnviado"
              >
                {{ opcao }}
              </button>
            </div>
          </div>
        </div>

        <!-- Parecer descritivo -->
        <p class="bloco-titulo">PARECER DESCRITIVO</p>
        <textarea v-model="parecer" class="textarea" rows="6" :disabled="isEnviado"></textarea>

        <!-- Recomendação à Vara -->
        <p class="bloco-titulo">RECOMENDAÇÃO À VARA</p>
        <div class="recomendacoes">
          <label
            v-for="rec in recomendacoes"
            :key="rec.id"
            :class="['rec-opcao', { selecionada: recomendacaoSelecionada === rec.id, desabilitada: isEnviado }]"
          >
            <input type="radio" v-model="recomendacaoSelecionada" :value="rec.id" :disabled="isEnviado" />
            <i :class="['ti', recomendacaoSelecionada === rec.id ? 'ti-circle-check' : 'ti-circle']"></i>
            <span>{{ rec.label }}</span>
          </label>
        </div>

        <!-- Aviso de privacidade -->
        <div class="aviso">
          <i class="ti ti-lock"></i>
          <p>Este documento é sigiloso e estará disponível apenas para a Vara da Infância. Nenhum dado da criança deve constar no relatório.</p>
        </div>

        <!-- Ações -->
        <div v-if="!isEnviado" class="acoes-rodape">
          <button class="btn btn-ghost" @click="salvarRascunho" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar rascunho' }}
          </button>
          <button class="btn btn-primary" @click="enviarAVara" :disabled="salvando">Enviar à Vara</button>
        </div>
      </template>
    </div>
  </InstituicaoLayout>
</template>

<style scoped>
.conteudo { max-width: 880px; }

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

h1 { font-size: 26px; font-weight: 600; margin-bottom: 4px; }
.subtitulo {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.badge-enviado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--color-success-soft);
  color: var(--color-success);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
}

.resumo-visita {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  background: var(--color-bg-soft);
  padding: 14px 18px;
  border-radius: var(--radius-md);
  margin-bottom: 28px;
  font-size: 13px;
}
.resumo-label { color: var(--color-text-tertiary); }
.resumo-visita strong { font-weight: 600; }

.bloco-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin: 24px 0 12px;
}

.criterios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.criterio-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px;
}
.criterio-nome {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}
.pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  font-size: 11px;
  padding: 5px 11px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-bg);
  transition: all 0.15s;
}
.pill:hover:not(:disabled) { border-color: var(--color-border-strong); }
.pill:disabled { opacity: 0.7; cursor: default; }
.pill.pill-verde { background: var(--color-success-soft); color: var(--color-success); border-color: var(--color-success); font-weight: 600; }
.pill.pill-amarelo { background: var(--color-warning-soft); color: var(--color-warning); border-color: var(--color-warning); font-weight: 600; }
.pill.pill-vermelho { background: var(--color-danger-soft); color: var(--color-danger); border-color: var(--color-danger); font-weight: 600; }

.textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  color: var(--color-text);
  outline: none;
  resize: vertical;
  min-height: 120px;
}
.textarea:focus { border-color: var(--color-primary); }
.textarea:disabled { background: var(--color-bg-soft); }

.recomendacoes { display: flex; flex-direction: column; gap: 8px; }
.rec-opcao {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: all 0.15s;
}
.rec-opcao:hover:not(.desabilitada) { border-color: var(--color-border-strong); }
.rec-opcao.desabilitada { cursor: default; }
.rec-opcao.selecionada { border-color: var(--color-success); background: var(--color-success-soft); color: var(--color-success); font-weight: 600; }
.rec-opcao input { display: none; }
.rec-opcao .ti { font-size: 18px; }

.aviso {
  display: flex;
  gap: 10px;
  background: var(--color-warning-soft);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-top: 20px;
  align-items: flex-start;
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
.msg-status.sucesso { background: var(--color-success-soft); color: var(--color-success); }

.acoes-rodape {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}
</style>
