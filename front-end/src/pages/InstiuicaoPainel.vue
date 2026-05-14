<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InstituicaoLayout from '@/components/InstituicaoLayout.vue'
import { visitasService } from '@/service/index'

const router = useRouter()

const visitas = ref([])
const carregando = ref(true)
const erro = ref('')

const MESES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

const hoje = new Date()

const normalizar = (v) => {
  const dataObj = v.data_visita ? new Date(v.data_visita + 'T00:00:00') : null
  return {
    id: v.id,
    dataObj,
    dia: dataObj ? String(dataObj.getDate()).padStart(2, '0') : '—',
    mes: dataObj ? MESES[dataObj.getMonth()] : '—',
    diaSemana: dataObj ? DIAS_SEMANA[dataObj.getDay()] : '—',
    horario: `${v.hora_inicio?.slice(0, 5) ?? ''} às ${v.hora_fim?.slice(0, 5) ?? ''}`,
    adotante: v.processo?.adotante?.nome ?? '—',
    processo: v.processo?.numero_processo ?? '—',
    tipo: v.tipo_visita ?? '—',
    status: v.status_visita,
    relatorioStatus: v.status_relatorio,
  }
}

onMounted(async () => {
  try {
    const dados = await visitasService.listar()
    visitas.value = dados.map(normalizar)
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
})

const agendadas = computed(() =>
  visitas.value.filter(v => v.status === 'agendada')
)

const proximaVisita = computed(() => {
  const futuras = agendadas.value
    .filter(v => v.dataObj && v.dataObj >= hoje)
    .sort((a, b) => a.dataObj - b.dataObj)
  return futuras[0] ?? null
})

const relatoriosPendentes = computed(() =>
  visitas.value.filter(v => v.status === 'realizada' && v.relatorioStatus === 'pendente').length
)

const metricas = computed(() => [
  {
    id: 1,
    titulo: 'Visitas agendadas',
    valor: String(agendadas.value.length),
    subtitulo: 'Próximas visitas',
    icone: 'ti-calendar-event',
    cor: '#2b6cb0',
    fundo: '#e6f0fa'
  },
  {
    id: 2,
    titulo: 'Relatórios pendentes',
    valor: String(relatoriosPendentes.value),
    subtitulo: 'Aguardando preenchimento',
    icone: 'ti-file-alert',
    cor: '#b45309',
    fundo: '#fef3c7'
  },
  {
    id: 3,
    titulo: 'Visitas realizadas',
    valor: String(visitas.value.filter(v => v.status === 'realizada').length),
    subtitulo: 'Total registrado',
    icone: 'ti-users',
    cor: '#085041',
    fundo: '#E1F5EE'
  }
])

const acoesPendentes = computed(() =>
  visitas.value.filter(v => v.status === 'realizada' && v.relatorioStatus === 'pendente')
)
</script>

<template>
  <InstituicaoLayout>
    <div class="conteudo">
      <div class="cabecalho-pagina">
        <h1>Painel</h1>
        <p class="subtitulo">Visão geral das atividades e acompanhamentos.</p>
      </div>

      <div v-if="carregando" class="msg-estado">Carregando dados...</div>
      <div v-else-if="erro" class="msg-estado erro"><i class="ti ti-alert-circle"></i> {{ erro }}</div>

      <template v-else>
        <!-- Métricas Rápidas -->
        <div class="grid-metricas">
          <div v-for="metrica in metricas" :key="metrica.id" class="card-metrica">
            <div class="icone-box" :style="{ backgroundColor: metrica.fundo, color: metrica.cor }">
              <i :class="['ti', metrica.icone]"></i>
            </div>
            <div class="info-metrica">
              <p class="titulo-metrica">{{ metrica.titulo }}</p>
              <p class="valor-metrica">{{ metrica.valor }}</p>
              <p class="sub-metrica">{{ metrica.subtitulo }}</p>
            </div>
          </div>
        </div>

        <div class="grid-destaques">
          <!-- Card: Próxima Visita -->
          <div class="bloco-destaque">
            <div class="bloco-header">
              <h2>Próxima visita</h2>
              <button class="btn-link" @click="router.push('/instituicao/visitas')">Ver agenda completa</button>
            </div>

            <div v-if="!proximaVisita" class="vazio-card">
              <i class="ti ti-calendar-off"></i>
              <p>Nenhuma visita agendada</p>
            </div>

            <div v-else class="card-visita">
              <div class="data-coluna">
                <span class="dia">{{ proximaVisita.dia }}</span>
                <span class="mes">{{ proximaVisita.mes }}</span>
                <span class="semana">{{ proximaVisita.diaSemana }}</span>
              </div>
              <div class="detalhes-coluna">
                <div class="detalhes-topo">
                  <span class="nome">{{ proximaVisita.adotante }}</span>
                  <span class="tag tag-azul">Agendada</span>
                </div>
                <p class="tipo-visita">{{ proximaVisita.tipo }}</p>
                <div class="meta-info">
                  <span><i class="ti ti-clock"></i> {{ proximaVisita.horario }}</span>
                  <span><i class="ti ti-file-text"></i> Processo {{ proximaVisita.processo }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Ações Pendentes -->
          <div class="bloco-destaque">
            <div class="bloco-header">
              <h2>Ações pendentes</h2>
            </div>

            <div v-if="acoesPendentes.length === 0" class="vazio-card">
              <i class="ti ti-circle-check"></i>
              <p>Nenhum relatório pendente</p>
            </div>

            <div v-else class="lista-acoes">
              <div v-for="acao in acoesPendentes" :key="acao.id" class="card-acao">
                <div class="acao-info">
                  <div class="icone-alerta"><i class="ti ti-alert-triangle"></i></div>
                  <div>
                    <p class="acao-texto">Relatório pendente</p>
                    <p class="acao-detalhe">{{ acao.adotante }} · Visita de {{ acao.dia }}/{{ acao.mes }}</p>
                  </div>
                </div>
                <button class="btn btn-primary" @click="router.push('/instituicao/relatorios')">
                  Preencher
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </InstituicaoLayout>
</template>

<style scoped>
.conteudo { max-width: 960px; }

.cabecalho-pagina { margin-bottom: 32px; }
h1 { font-size: 26px; font-weight: 600; margin-bottom: 4px; }
.subtitulo { font-size: 14px; color: var(--color-text-secondary); }

.msg-estado {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.msg-estado.erro { color: var(--color-danger); }

.grid-metricas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}
.card-metrica {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card-metrica:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.icone-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.titulo-metrica {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.valor-metrica { font-size: 28px; font-weight: 700; color: var(--color-text); line-height: 1.1; margin-bottom: 6px; }
.sub-metrica { font-size: 12px; color: var(--color-text-secondary); }

.grid-destaques {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}
.bloco-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.bloco-header h2 { font-size: 16px; font-weight: 600; color: var(--color-text); }
.btn-link { background: none; border: none; color: #2b6cb0; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-link:hover { text-decoration: underline; }

.vazio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: var(--color-text-tertiary);
  font-size: 13px;
  text-align: center;
}
.vazio-card .ti { font-size: 28px; }

.card-visita {
  display: flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
}
.data-coluna {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 24px;
  border-right: 1px solid var(--color-border);
  min-width: 80px;
}
.data-coluna .dia { font-size: 28px; font-weight: 600; color: #2b6cb0; line-height: 1; margin-bottom: 4px; }
.data-coluna .mes { font-size: 11px; font-weight: 600; color: var(--color-text-tertiary); letter-spacing: 1px; }
.data-coluna .semana { font-size: 11px; color: var(--color-text-tertiary); margin-top: 2px; }
.detalhes-coluna { padding-left: 24px; flex: 1; }
.detalhes-topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.detalhes-topo .nome { font-weight: 600; font-size: 15px; }
.tipo-visita { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px; }
.meta-info { display: flex; gap: 16px; font-size: 12px; color: var(--color-text-tertiary); }
.meta-info span { display: flex; align-items: center; gap: 4px; }
.meta-info .ti { font-size: 14px; }
.tag { font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px; }
.tag-azul { background: #e6f0fa; color: #2b6cb0; }

.lista-acoes { display: flex; flex-direction: column; gap: 12px; }
.card-acao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fef8f0;
  border: 1px solid #fbd38d;
  border-radius: var(--radius-lg, 8px);
  padding: 16px;
}
.acao-info { display: flex; align-items: center; gap: 12px; }
.icone-alerta { color: #b45309; font-size: 20px; display: flex; }
.acao-texto { font-size: 13px; font-weight: 600; color: #92400e; margin-bottom: 2px; }
.acao-detalhe { font-size: 11px; color: #b45309; }

.btn { padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: var(--radius-md, 6px); border: none; cursor: pointer; transition: opacity 0.2s; }
.btn-primary { background: #2b6cb0; color: white; }
.btn:hover { opacity: 0.9; }
</style>
