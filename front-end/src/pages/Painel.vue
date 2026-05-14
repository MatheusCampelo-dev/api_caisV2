<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PainelLayout from '@/components/PainelLayout.vue'
import { useUserStore } from '@/store/user'
import { processoService } from '@/service/index'

const router = useRouter()
const userStore = useUserStore()

const processo = ref(null)
const carregando = ref(true)
const erro = ref('')

const ETAPAS_ORDEM = ['habilitação', 'fila_de_espera', 'aproximação', 'convivência', 'sentença']
const ETAPAS_LABELS = {
  'habilitação': 'Habilitação',
  'fila_de_espera': 'Fila de espera',
  'aproximação': 'Aproximação',
  'convivência': 'Convivência',
  'sentença': 'Sentença'
}

// Quando não há processo ainda, exibe habilitação como etapa atual (padrão inicial)
const etapas = computed(() => {
  const etapaAtual = processo.value?.etapa_atual ?? 'habilitação'
  const idxAtual = ETAPAS_ORDEM.indexOf(etapaAtual)
  return ETAPAS_ORDEM.map((etapa, idx) => ({
    id: idx + 1,
    titulo: ETAPAS_LABELS[etapa],
    status: idx < idxAtual ? 'concluida' : idx === idxAtual ? 'atual' : 'futura'
  }))
})

// Largura da barra de progresso: proporcional à etapa atual
const progressoLargura = computed(() => {
  const idxAtual = ETAPAS_ORDEM.indexOf(processo.value?.etapa_atual ?? 'habilitação')
  return `${(idxAtual / (ETAPAS_ORDEM.length - 1)) * 100}%`
})

const dataHabilitacao = computed(() => {
  if (!processo.value?.data_habilitacao) return null
  return new Date(processo.value.data_habilitacao + 'T00:00:00').toLocaleDateString('pt-BR')
})

onMounted(async () => {
  try {
    // A API retorna null quando o adotante ainda não tem processo — sem erro
    processo.value = await processoService.consultar()
  } catch {
    // qualquer erro de rede real — ignora e mostra estado inicial
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <PainelLayout>
    <div class="conteudo">
      <h1>Olá, {{ userStore.primeiroNome }}</h1>

      <div v-if="carregando" class="msg-estado">Carregando seu processo...</div>

      <!-- Processo existe ou não: sempre mostra a linha do tempo -->
      <template v-else>
        <p class="subtitulo">
          <template v-if="processo">
            {{ processo.comarca }}
            <span v-if="dataHabilitacao"> · Habilitado em {{ dataHabilitacao }}</span>
          </template>
          <template v-else>Seu processo está em análise pela Vara da Infância.</template>
        </p>

        <!-- Card da Linha do Tempo -->
        <div class="card-etapas">
          <p class="etapa-titulo">ETAPA ATUAL</p>

          <div class="stepper-wrapper">
            <div class="stepper-bg-line"></div>
            <div class="stepper-progress-line" :style="{ width: progressoLargura }"></div>

            <div class="stepper">
              <div
                v-for="etapa in etapas"
                :key="etapa.id"
                class="step"
                :class="etapa.status"
              >
                <div class="step-icon">
                  <i v-if="etapa.status === 'concluida'" class="ti ti-check"></i>
                  <span v-else>{{ etapa.id }}</span>
                </div>
                <span class="step-label">{{ etapa.titulo }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Posição na Fila (só exibe se estiver em fila_de_espera) -->
        <div v-if="processo?.etapa_atual === 'fila_de_espera' && processo.posicao_fila" class="card-fila">
          <p class="card-titulo">POSIÇÃO NA FILA</p>
          <div class="card-numero">
            <span class="numero">{{ processo.posicao_fila }}</span>
            <p>na fila de espera</p>
          </div>
        </div>

        <div class="acoes">
          <button class="btn btn-primary" @click="router.push('/painel/documentos')">
            <i class="ti ti-file-text"></i>
            Ver documentos
          </button>
          <button class="btn btn-ghost" @click="router.push('/painel/agendamentos')">
            <i class="ti ti-calendar"></i>
            Agendamentos
          </button>
        </div>
      </template>
    </div>
  </PainelLayout>
</template>

<style scoped>
.conteudo { max-width: 880px; }
h1 { font-size: 28px; margin-bottom: 4px; }
.subtitulo {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.msg-estado {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.msg-estado.erro { color: var(--color-danger); }

/* --- Linha do Tempo (Stepper) --- */
.card-etapas {
  background: #f8f9f5;
  border-radius: var(--radius-lg, 8px);
  padding: 24px 32px;
  margin-bottom: 24px;
}

.etapa-titulo {
  font-size: 12px;
  font-weight: 600;
  color: #7a7a7a;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}

.stepper-wrapper {
  position: relative;
  padding: 0 10px;
}

.stepper-bg-line {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #d1d5db;
  z-index: 1;
}

.stepper-progress-line {
  position: absolute;
  top: 15px;
  left: 0;
  height: 2px;
  background-color: var(--color-primary, #2b6cb0);
  z-index: 2;
  transition: width 0.3s ease;
}

.stepper {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 3;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: transparent;
  width: 90px;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
}

.step-label {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

.step.concluida .step-icon {
  border-color: var(--color-primary, #2b6cb0);
  background-color: #e6f0fa;
  color: var(--color-primary, #2b6cb0);
}
.step.concluida .step-label { color: var(--color-primary, #2b6cb0); }

.step.atual .step-icon {
  border-color: var(--color-primary, #2b6cb0);
  color: var(--color-primary, #2b6cb0);
}
.step.atual .step-label { color: var(--color-primary, #2b6cb0); }

/* --- Card Fila --- */
.card-fila {
  background: var(--color-primary-soft, #f0f7ff);
  border: 1px solid var(--color-primary-border, #cce4ff);
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  margin-bottom: 20px;
}
.card-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 1px;
  margin-bottom: 12px;
}
.card-numero {
  display: flex;
  align-items: baseline;
  gap: 16px;
}
.numero {
  font-size: 48px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1;
}
.card-numero p {
  font-size: 13px;
  color: var(--color-primary);
}

/* --- Card vazio --- */
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

.acoes { display: flex; gap: 12px; }
</style>
