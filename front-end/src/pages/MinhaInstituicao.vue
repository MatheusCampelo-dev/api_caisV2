<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PainelLayout from '@/components/PainelLayout.vue'
import { processoService, visitasService } from '@/service/index'

const router = useRouter()

const processo = ref(null)
const proximaVisita = ref(null)
const carregando = ref(true)

const instituicao = computed(() => processo.value?.instituicao ?? null)
const vinculado = computed(() => !!instituicao.value)

const formatarData = (dataStr) => {
  if (!dataStr) return null
  return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

const formatarHorario = (inicio, fim) => {
  const h1 = inicio?.slice(0, 5) ?? ''
  const h2 = fim?.slice(0, 5) ?? ''
  return h2 && h2 !== h1 ? `${h1} às ${h2}` : h1
}

onMounted(async () => {
  try {
    const [proc, visitas] = await Promise.all([
      processoService.consultar(),
      visitasService.minhaAgenda().catch(() => [])
    ])

    processo.value = proc

    if (visitas.length > 0) {
      const agendadas = visitas
        .filter(v => v.status_visita === 'agendada')
        .sort((a, b) => a.data_visita.localeCompare(b.data_visita))
      proximaVisita.value = agendadas[0] ?? null
    }
  } catch {
    processo.value = null
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

      <h1>Minha instituição</h1>

      <div v-if="carregando" class="msg-estado">Carregando...</div>

      <template v-else-if="!vinculado">
        <!-- Estado: sem vínculo -->
        <div class="card-vazio">
          <i class="ti ti-building-off"></i>
          <p>Você ainda não está vinculado a uma instituição.</p>
          <p class="card-vazio-sub">A Vara da Infância fará esse vínculo quando seu processo avançar para a etapa de aproximação.</p>
        </div>
      </template>

      <template v-else>
        <!-- Banner de vínculo ativo -->
        <div class="banner-vinculo">
          <i class="ti ti-link"></i>
          <p>
            <strong>Vínculo ativo</strong> — você está vinculado a esta instituição no seu processo de adoção.
          </p>
        </div>

        <!-- Cabeçalho da instituição -->
        <div class="cabecalho">
          <div class="icone-grande">
            <i class="ti ti-building"></i>
          </div>
          <div class="info">
            <h2>{{ instituicao.nome }}</h2>
            <p class="meta">CNPJ: {{ instituicao.cnpj }}</p>
          </div>
        </div>

        <!-- Próxima visita -->
        <section v-if="proximaVisita" class="bloco">
          <p class="bloco-titulo">PRÓXIMA VISITA</p>
          <div class="card-visita">
            <div class="visita-header">
              <p class="visita-data">
                {{ formatarData(proximaVisita.data_visita) }}
                · {{ formatarHorario(proximaVisita.hora_inicio, proximaVisita.hora_fim) }}
              </p>
              <span class="badge-confirmada">Confirmada</span>
            </div>
            <p class="visita-descricao">{{ proximaVisita.tipo_visita }}</p>
          </div>
        </section>

        <!-- Contato -->
        <section class="bloco">
          <p class="bloco-titulo">CONTATO</p>
          <div class="contato">
            <div class="contato-linha">
              <i class="ti ti-mail"></i>
              <span>{{ instituicao.email }}</span>
            </div>
          </div>
        </section>

        <!-- Aviso -->
        <div class="aviso">
          <i class="ti ti-info-circle"></i>
          <p>
            O contato direto com a instituição deve ser feito apenas para questões logísticas das visitas.
            Toda comunicação formal passa pela Vara da Infância.
          </p>
        </div>
      </template>
    </div>
  </PainelLayout>
</template>

<style scoped>
.conteudo { max-width: 760px; }

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

h1 { font-size: 28px; font-weight: 600; margin-bottom: 20px; }

.msg-estado { font-size: 14px; color: var(--color-text-secondary); padding: 16px 0; }

.card-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-tertiary);
  text-align: center;
}
.card-vazio .ti { font-size: 42px; }
.card-vazio p { font-size: 15px; font-weight: 500; color: var(--color-text-secondary); }
.card-vazio-sub { font-size: 13px !important; font-weight: 400 !important; color: var(--color-text-tertiary) !important; max-width: 380px; line-height: 1.6; }

.banner-vinculo {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-success-soft);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-bottom: 24px;
}
.banner-vinculo .ti { font-size: 20px; color: var(--color-success); }
.banner-vinculo p { font-size: 13px; color: var(--color-success); line-height: 1.5; }
.banner-vinculo strong { font-weight: 600; }

.cabecalho {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 28px;
}
.icone-grande {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: #FAEEDA;
  color: #854F0B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}
.info h2 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
.meta { font-size: 13px; color: var(--color-text-secondary); }

.bloco { margin-bottom: 24px; }
.bloco-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.card-visita {
  border: 1px solid var(--color-primary-border);
  background: var(--color-primary-soft);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
}
.visita-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.visita-data { font-size: 16px; font-weight: 600; color: var(--color-primary); }
.badge-confirmada {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  background: var(--color-bg);
  color: var(--color-primary);
  font-weight: 500;
}
.visita-descricao { font-size: 13px; color: var(--color-primary); }

.contato {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.contato-linha {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-border);
}
.contato-linha:last-child { border-bottom: none; }
.contato-linha .ti { font-size: 16px; color: var(--color-text-tertiary); }

.aviso {
  display: flex;
  gap: 12px;
  background: var(--color-warning-soft);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-top: 8px;
  align-items: flex-start;
}
.aviso .ti { font-size: 20px; color: var(--color-warning); flex-shrink: 0; }
.aviso p { font-size: 13px; color: var(--color-warning); line-height: 1.6; }
</style>
