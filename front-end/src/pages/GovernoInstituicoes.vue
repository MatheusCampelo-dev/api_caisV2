<script setup>
import { ref, onMounted } from 'vue'
import GovernoLayout from '@/components/GovernoLayout.vue'
import { instituicoesService } from '@/service/index'

const visualizacao = ref('cards')
const instituicoes = ref([])
const carregando = ref(true)
const erro = ref('')

onMounted(async () => {
  try {
    instituicoes.value = await instituicoesService.listar()
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
})

// Ocupação e capacidade ainda não existem no modelo — exibe '—' até que sejam adicionados
const calcularPercentual = (i) => {
  if (!i.ocupacao || !i.capacidade) return 0
  return (i.ocupacao / i.capacidade) * 100
}

const obterStatus = (i) => {
  if (!i.ocupacao || !i.capacidade) return { label: 'Cadastrada', classe: 'cinza' }
  const p = calcularPercentual(i)
  if (p >= 100) return { label: 'Lotada', classe: 'vermelho' }
  if (p >= 85) return { label: 'Quase cheia', classe: 'ambar' }
  return { label: 'Disponível', classe: 'verde' }
}

const calcularVagas = (i) => {
  if (!i.ocupacao || !i.capacidade) return null
  return i.capacidade - i.ocupacao
}
</script>

<template>
  <GovernoLayout>
    <div class="conteudo">
      <div class="cabecalho">
        <div>
          <h1>Consulta de instituições</h1>
          <p class="subtitulo">
            <template v-if="carregando">Carregando...</template>
            <template v-else>{{ instituicoes.length }} instituição{{ instituicoes.length !== 1 ? 'ões' : '' }} cadastrada{{ instituicoes.length !== 1 ? 's' : '' }}</template>
          </p>
        </div>
        <div class="seletor-vista">
          <button :class="['btn-vista', { ativo: visualizacao === 'cards' }]" @click="visualizacao = 'cards'" title="Cards">
            <i class="ti ti-layout-grid"></i>
          </button>
          <button :class="['btn-vista', { ativo: visualizacao === 'lista' }]" @click="visualizacao = 'lista'" title="Lista">
            <i class="ti ti-list"></i>
          </button>
        </div>
      </div>

      <div v-if="erro" class="msg-erro"><i class="ti ti-alert-circle"></i> {{ erro }}</div>
      <div v-if="carregando" class="msg-estado">Carregando instituições...</div>

      <div v-else-if="instituicoes.length === 0" class="vazio">
        Nenhuma instituição cadastrada ainda.
      </div>

      <!-- Cards -->
      <div v-else-if="visualizacao === 'cards'" class="cards-grid">
        <div v-for="(inst, idx) in instituicoes" :key="inst.id ?? idx" class="card-inst">
          <div class="card-header">
            <div class="icone-inst">
              <i class="ti ti-building"></i>
            </div>
            <div class="inst-info">
              <p class="inst-nome">{{ inst.nome }}</p>
              <p class="inst-bairro">{{ inst.email }}</p>
            </div>
            <span :class="['status-tag', `tag-${obterStatus(inst).classe}`]">
              {{ obterStatus(inst).label }}
            </span>
          </div>

          <template v-if="inst.ocupacao && inst.capacidade">
            <div class="barra-secao">
              <div class="barra-header">
                <span>Ocupação</span>
                <span class="barra-valor">{{ inst.ocupacao }} / {{ inst.capacidade }}</span>
              </div>
              <div class="barra">
                <div
                  :class="['barra-fill', `fill-${obterStatus(inst).classe}`]"
                  :style="{ width: calcularPercentual(inst) + '%' }"
                ></div>
              </div>
            </div>
            <p class="inst-rodape">
              <span v-if="calcularVagas(inst) > 0">{{ calcularVagas(inst) }} vagas</span>
              <span v-else>Sem vagas</span>
              · CNPJ {{ inst.cnpj }}
            </p>
          </template>
          <p v-else class="inst-rodape">CNPJ {{ inst.cnpj }}</p>
        </div>
      </div>

      <!-- Lista -->
      <div v-else class="tabela">
        <div class="thead">
          <div>Instituição</div>
          <div>CNPJ</div>
          <div>E-mail</div>
          <div>Status</div>
        </div>
        <div v-for="(inst, idx) in instituicoes" :key="inst.id ?? idx" class="trow">
          <div class="td-nome">{{ inst.nome }}</div>
          <div class="td-meta">{{ inst.cnpj }}</div>
          <div class="td-meta">{{ inst.email }}</div>
          <div>
            <span :class="['status-tag', `tag-${obterStatus(inst).classe}`]">
              {{ obterStatus(inst).label }}
            </span>
          </div>
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
  margin-bottom: 24px;
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
.msg-estado { font-size: 14px; color: var(--color-text-secondary); padding: 16px 0; }
.vazio { font-size: 14px; color: var(--color-text-tertiary); padding: 48px; text-align: center; }

.seletor-vista { display: flex; gap: 4px; background: var(--color-bg-soft); padding: 4px; border-radius: var(--radius-md); }
.btn-vista { width: 36px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); font-size: 16px; border-radius: 6px; }
.btn-vista.ativo { background: var(--color-bg); color: var(--color-primary); box-shadow: var(--shadow-sm); }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.card-inst { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 18px; }

.card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.icone-inst {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
.inst-info { flex: 1; }
.inst-nome { font-size: 14px; font-weight: 600; }
.inst-bairro { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }

.status-tag { font-size: 10px; padding: 3px 10px; border-radius: 12px; font-weight: 500; flex-shrink: 0; white-space: nowrap; }
.tag-verde  { background: var(--color-success-soft); color: var(--color-success); }
.tag-ambar  { background: var(--color-warning-soft); color: var(--color-warning); }
.tag-vermelho { background: var(--color-danger-soft); color: var(--color-danger); }
.tag-cinza  { background: var(--color-bg-soft); color: var(--color-text-secondary); }

.barra-secao { margin-bottom: 10px; }
.barra-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: var(--color-text-secondary); }
.barra-valor { font-weight: 600; color: var(--color-text); }
.barra { height: 8px; background: var(--color-bg-soft); border-radius: 4px; overflow: hidden; }
.barra-fill { height: 100%; transition: width 0.3s; }
.fill-verde { background: #639922; }
.fill-ambar { background: #BA7517; }
.fill-vermelho { background: var(--color-danger); }

.inst-rodape { font-size: 12px; color: var(--color-text-tertiary); }

.tabela { border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-bg); }
.thead {
  display: grid;
  grid-template-columns: 2fr 1.4fr 1.8fr 1fr;
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
  grid-template-columns: 2fr 1.4fr 1.8fr 1fr;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  font-size: 14px;
}
.trow:last-child { border-bottom: none; }
.td-nome { font-weight: 600; }
.td-meta { color: var(--color-text-secondary); }
</style>
