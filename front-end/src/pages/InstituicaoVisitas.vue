<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InstituicaoLayout from '@/components/InstituicaoLayout.vue'
import { visitasService, processoService } from '@/service/index'

const router = useRouter()

const visitas = ref([])
const carregando = ref(true)
const erroGeral = ref('')

const proximas = ref([])
const realizadas = ref([])

const MESES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

const normalizar = (v) => ({
  id: v.id,
  data: v.data_visita?.split('-').reverse().join('/') ?? '',
  diaSemana: v.data_visita ? DIAS_SEMANA[new Date(v.data_visita + 'T00:00:00').getDay()] : '',
  horario: `${v.hora_inicio?.slice(0,5) ?? ''} às ${v.hora_fim?.slice(0,5) ?? ''}`,
  adotante: v.processo?.adotante?.nome ?? '—',
  processo: v.processo?.numero_processo ?? '—',
  tipo: v.tipo_visita,
  status: v.status_visita,
  podeRegistrarRelatorio: v.status_relatorio === 'pendente' && v.status_visita === 'realizada'
})

const atualizarListas = () => {
  proximas.value = visitas.value.filter(v => v.status === 'agendada')
  realizadas.value = visitas.value.filter(v => v.status === 'realizada')
}

const carregarVisitas = async () => {
  carregando.value = true
  erroGeral.value = ''
  try {
    const dados = await visitasService.listar()
    visitas.value = dados.map(normalizar)
    atualizarListas()
  } catch (e) {
    erroGeral.value = e.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregarVisitas)

// Modal Nova visita
const modalNova = ref(false)
const formNova = ref({ cpf: '', processo_id: '', adotanteNome: '', tipo: '1ª visita de aproximação', data: '', horaInicio: '', horaFim: '' })
const salvando = ref(false)
const buscandoCpf = ref(false)
const erroCpf = ref('')
const erroModal = ref('')

const abrirNovaVisita = () => {
  formNova.value = { cpf: '', processo_id: '', adotanteNome: '', tipo: '1ª visita de aproximação', data: '', horaInicio: '', horaFim: '' }
  erroModal.value = ''
  erroCpf.value = ''
  modalNova.value = true
}

const buscarProcessoPorCpf = async () => {
  const cpf = formNova.value.cpf.trim()
  if (!cpf) return
  buscandoCpf.value = true
  erroCpf.value = ''
  formNova.value.processo_id = ''
  formNova.value.adotanteNome = ''
  try {
    const proc = await processoService.buscarPorCpf(cpf)
    formNova.value.processo_id = proc.id
    formNova.value.adotanteNome = proc.adotante?.nome ?? ''
  } catch (e) {
    erroCpf.value = e.message || 'Nenhum processo encontrado para este CPF.'
  } finally {
    buscandoCpf.value = false
  }
}

const salvarNova = async () => {
  if (!formNova.value.processo_id) {
    erroModal.value = 'Busque um adotante pelo CPF antes de agendar.'
    return
  }
  if (!formNova.value.data || !formNova.value.horaInicio) {
    erroModal.value = 'Preencha data e horário de início.'
    return
  }
  salvando.value = true
  erroModal.value = ''
  try {
    await visitasService.criar({
      processo_id: formNova.value.processo_id,
      tipo_visita: formNova.value.tipo,
      data_visita: formNova.value.data,
      hora_inicio: formNova.value.horaInicio,
      hora_fim: formNova.value.horaFim || formNova.value.horaInicio
    })
    await carregarVisitas()
    modalNova.value = false
    mostrarToast('Visita agendada com sucesso')
  } catch (e) {
    erroModal.value = e.message
  } finally {
    salvando.value = false
  }
}

// Modal Reagendar
const modalReagendar = ref(false)
const visitaReagendando = ref(null)
const formReagendar = ref({ data: '', horaInicio: '', horaFim: '' })
const salvandoReagendar = ref(false)
const erroReagendar = ref('')

const abrirReagendar = (visita) => {
  visitaReagendando.value = visita
  formReagendar.value = { data: '', horaInicio: '', horaFim: '' }
  erroReagendar.value = ''
  modalReagendar.value = true
}

const confirmarReagendamento = async () => {
  if (!formReagendar.value.data || !formReagendar.value.horaInicio) {
    erroReagendar.value = 'Informe a nova data e horário de início.'
    return
  }
  salvandoReagendar.value = true
  erroReagendar.value = ''
  try {
    await visitasService.atualizar(visitaReagendando.value.id, {
      data_visita: formReagendar.value.data,
      hora_inicio: formReagendar.value.horaInicio,
      hora_fim: formReagendar.value.horaFim || formReagendar.value.horaInicio,
      status_relatorio: 'pendente'
    })
    await carregarVisitas()
    modalReagendar.value = false
    mostrarToast('Visita reagendada com sucesso')
  } catch (e) {
    erroReagendar.value = e.message
  } finally {
    salvandoReagendar.value = false
  }
}

// Concluir visita (marcar como realizada para poder fazer o relatório)
const concluindo = ref(null)

const concluirVisita = async (v) => {
  concluindo.value = v.id
  try {
    await visitasService.atualizar(v.id, {
      status_visita: 'realizada',
      status_relatorio: 'pendente',
    })
    await carregarVisitas()
    mostrarToast('Visita marcada como concluída')
  } catch (e) {
    mostrarToast('Erro ao concluir visita: ' + e.message)
  } finally {
    concluindo.value = null
  }
}

// Toast
const toast = ref(null)
const mostrarToast = (msg) => {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

const irParaRelatorio = (v) => {
  router.push(`/instituicao/visitas/${v.id}/relatorio`)
}
</script>

<template>
  <InstituicaoLayout>
    <div class="conteudo">
      <div class="cabecalho">
        <div>
          <h1>Agenda de visitas</h1>
          <p class="subtitulo">{{ proximas.length }} próximas · {{ realizadas.length }} realizadas</p>
        </div>
        <button class="btn btn-primary" @click="abrirNovaVisita" :disabled="carregando">
          <i class="ti ti-calendar-plus"></i>
          Nova visita
        </button>
      </div>

      <p v-if="erroGeral" class="msg-erro"><i class="ti ti-alert-circle"></i> {{ erroGeral }}</p>
      <p v-if="carregando" class="carregando">Carregando agenda...</p>

      <p class="bloco-titulo">PRÓXIMAS VISITAS</p>
      <div class="lista">
        <div v-for="v in proximas" :key="v.id" class="visita-card">
          <div class="data-box">
            <span class="dia">{{ v.data.split('/')[0] }}</span>
            <span class="mes">{{ ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][parseInt(v.data.split('/')[1]) - 1] }}</span>
            <span class="dia-semana">{{ v.diaSemana }}</span>
          </div>
          <div class="info">
            <div class="info-header">
              <h3>{{ v.adotante }}</h3>
              <span class="badge agendada">Agendada</span>
            </div>
            <p class="tipo-visita">{{ v.tipo }}</p>
            <div class="meta">
              <span><i class="ti ti-clock"></i> {{ v.horario }}</span>
              <span><i class="ti ti-file-text"></i> Processo {{ v.processo }}</span>
            </div>
          </div>
          <div class="acoes-card acoes-card-duplo">
            <button class="btn btn-ghost btn-pequeno" @click="abrirReagendar(v)">
              <i class="ti ti-edit"></i>
              Reagendar
            </button>
            <button
              class="btn btn-primary btn-pequeno"
              :disabled="concluindo === v.id"
              @click="concluirVisita(v)"
            >
              <i class="ti ti-check"></i>
              {{ concluindo === v.id ? 'Salvando...' : 'Concluir' }}
            </button>
          </div>
        </div>
      </div>

      <p class="bloco-titulo">REALIZADAS</p>
      <div class="lista">
        <div v-for="v in realizadas" :key="v.id" class="visita-card realizada">
          <div class="data-box">
            <span class="dia">{{ v.data.split('/')[0] }}</span>
            <span class="mes">{{ ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][parseInt(v.data.split('/')[1]) - 1] }}</span>
            <span class="dia-semana">{{ v.diaSemana }}</span>
          </div>
          <div class="info">
            <div class="info-header">
              <h3>{{ v.adotante }}</h3>
              <span :class="['badge', v.podeRegistrarRelatorio ? 'pendente' : 'concluida']">
                {{ v.podeRegistrarRelatorio ? 'Aguardando relatório' : 'Relatório enviado' }}
              </span>
            </div>
            <p class="tipo-visita">{{ v.tipo }}</p>
            <div class="meta">
              <span><i class="ti ti-clock"></i> {{ v.horario }}</span>
              <span><i class="ti ti-file-text"></i> Processo {{ v.processo }}</span>
            </div>
          </div>
          <div class="acoes-card">
            <button v-if="v.podeRegistrarRelatorio" class="btn btn-primary btn-pequeno" @click="irParaRelatorio(v)">
              <i class="ti ti-edit"></i> Registrar relatório
            </button>
            <button v-else class="btn btn-ghost btn-pequeno">
              <i class="ti ti-eye"></i> Ver relatório
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nova Visita -->
    <div v-if="modalNova" class="modal-overlay" @click.self="modalNova = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Nova visita</h2>
          <button class="modal-close" @click="modalNova = false"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="campo">
            <label>CPF do adotante</label>
            <div class="cpf-busca">
              <input
                v-model="formNova.cpf"
                type="text"
                placeholder="000.000.000-00"
                @blur="buscarProcessoPorCpf"
                @keydown.enter.prevent="buscarProcessoPorCpf"
              />
              <button class="btn btn-ghost btn-cpf" :disabled="buscandoCpf || !formNova.cpf.trim()" @click="buscarProcessoPorCpf">
                <i v-if="buscandoCpf" class="ti ti-loader-2 spin"></i>
                <i v-else class="ti ti-search"></i>
              </button>
            </div>
            <p v-if="erroCpf" class="campo-erro">{{ erroCpf }}</p>
            <p v-if="formNova.adotanteNome" class="campo-ok">
              <i class="ti ti-circle-check"></i> {{ formNova.adotanteNome }}
            </p>
          </div>
          <div class="campo">
            <label>Tipo de visita</label>
            <select v-model="formNova.tipo">
              <option>1ª visita de aproximação</option>
              <option>2ª visita de aproximação</option>
              <option>3ª visita de aproximação</option>
              <option>Acompanhamento de convivência</option>
              <option>Visita preliminar</option>
            </select>
          </div>
          <div class="campo">
            <label>Data</label>
            <input type="date" v-model="formNova.data" />
          </div>
          <div class="form-grid">
            <div class="campo">
              <label>Hora início</label>
              <input type="time" v-model="formNova.horaInicio" />
            </div>
            <div class="campo">
              <label>Hora término</label>
              <input type="time" v-model="formNova.horaFim" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <p v-if="erroModal" class="erro-modal"><i class="ti ti-alert-circle"></i> {{ erroModal }}</p>
          <button class="btn btn-ghost" @click="modalNova = false">Cancelar</button>
          <button class="btn btn-primary" @click="salvarNova" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Agendar visita' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Reagendar -->
    <div v-if="modalReagendar" class="modal-overlay" @click.self="modalReagendar = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Reagendar visita</h2>
          <button class="modal-close" @click="modalReagendar = false"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="resumo-original">
            <p class="resumo-label">Data original</p>
            <p class="resumo-valor">
              {{ visitaReagendando?.data }} · {{ visitaReagendando?.horario }}
            </p>
            <p class="resumo-meta">{{ visitaReagendando?.adotante }} · {{ visitaReagendando?.tipo }}</p>
          </div>

          <div class="campo">
            <label>Nova data</label>
            <input type="date" v-model="formReagendar.data" />
          </div>
          <div class="form-grid">
            <div class="campo">
              <label>Hora início</label>
              <input type="time" v-model="formReagendar.horaInicio" />
            </div>
            <div class="campo">
              <label>Hora término</label>
              <input type="time" v-model="formReagendar.horaFim" />
            </div>
          </div>
          <div class="campo">
            <label>Motivo do reagendamento</label>
            <textarea v-model="formReagendar.motivo" rows="3" placeholder="Será registrado no histórico"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <p v-if="erroReagendar" class="erro-modal"><i class="ti ti-alert-circle"></i> {{ erroReagendar }}</p>
          <button class="btn btn-ghost" @click="modalReagendar = false">Cancelar</button>
          <button class="btn btn-primary" @click="confirmarReagendamento" :disabled="salvandoReagendar">
            {{ salvandoReagendar ? 'Salvando...' : 'Confirmar reagendamento' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast">
        <i class="ti ti-circle-check"></i>
        <span>{{ toast }}</span>
      </div>
    </transition>
  </InstituicaoLayout>
</template>

<style scoped>
.conteudo { max-width: 1000px; position: relative; }

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
h1 { font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 14px; color: var(--color-text-secondary); }

.bloco-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin: 28px 0 12px;
}
.bloco-titulo:first-of-type { margin-top: 0; }

.lista { display: flex; flex-direction: column; gap: 12px; }

.visita-card {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 18px 20px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.visita-card:hover { border-color: var(--color-border-strong); }
.visita-card.realizada { background: var(--color-bg-soft); }

.data-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  padding: 4px 0;
  border-right: 1px solid var(--color-border);
  flex-shrink: 0;
}
.data-box .dia { font-size: 26px; font-weight: 600; color: var(--color-primary); line-height: 1; }
.visita-card.realizada .data-box .dia { color: var(--color-text-tertiary); }
.data-box .mes { font-size: 11px; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500; letter-spacing: 0.5px; }
.data-box .dia-semana { font-size: 10px; color: var(--color-text-tertiary); margin-top: 4px; }

.info { flex: 1; }
.info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.info h3 { flex: 1; font-size: 15px; font-weight: 600; }
.badge { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 500; }
.badge.agendada { background: var(--color-primary-soft); color: var(--color-primary); }
.badge.pendente { background: var(--color-warning-soft); color: var(--color-warning); }
.badge.concluida { background: var(--color-success-soft); color: var(--color-success); }

.tipo-visita { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 6px; }
.meta { display: flex; gap: 16px; font-size: 12px; color: var(--color-text-tertiary); }
.meta .ti { font-size: 13px; margin-right: 4px; vertical-align: -1px; }

.acoes-card { flex-shrink: 0; }
.acoes-card-duplo { display: flex; gap: 8px; }
.btn-pequeno { font-size: 12px; padding: 7px 13px; }

/* modal */
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
  max-width: 480px;
  max-height: 90vh;
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
.modal-body { padding: 20px 22px; overflow-y: auto; }
.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid var(--color-border);
}

.resumo-original {
  background: var(--color-bg-soft);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}
.resumo-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.resumo-valor { font-size: 14px; font-weight: 600; margin-top: 2px; }
.resumo-meta { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }

.campo { margin-bottom: 14px; }
.campo label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.campo input,
.campo select,
.campo textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  font-family: inherit;
  background: var(--color-bg);
}
.campo textarea { resize: vertical; min-height: 70px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.campo-dica { font-size: 11px; color: var(--color-text-tertiary); margin-top: 4px; display: block; }

.cpf-busca {
  display: flex;
  gap: 8px;
}
.cpf-busca input { flex: 1; }
.btn-cpf {
  padding: 0 14px;
  flex-shrink: 0;
}
.campo-erro {
  font-size: 12px;
  color: #dc2626;
  margin-top: 6px;
}
.campo-ok {
  font-size: 12px;
  color: var(--color-success);
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }
.msg-erro, .carregando {
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.msg-erro { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.carregando { color: var(--color-text-secondary); }
.erro-modal {
  flex: 1;
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--color-success);
  color: white;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  z-index: 200;
}
.toast .ti { font-size: 20px; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
