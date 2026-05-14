<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderPublico from '@/components/HeaderPublico.vue'
import HeroDecorado from '@/components/HeroDecorado.vue'

const router = useRouter()
const etapaAberta = ref(1)

const etapas = [
  {
    numero: 1,
    titulo: 'Requisitos legais',
    icone: 'ti-file-text',
    cor: 'azul',
    descricao: 'Antes de qualquer documento, confira se você atende às exigências da lei.',
    itens: [
      'Idade mínima de 18 anos',
      'Diferença mínima de 16 anos entre adotante e adotado',
      'Pode ser pessoa solteira, casada ou em união estável (independente do gênero)',
      'Não há limite máximo de idade',
      'Capacidade financeira para criar e educar a criança'
    ]
  },
  {
    numero: 2,
    titulo: 'Documentação',
    icone: 'ti-folder',
    cor: 'verde',
    descricao: 'Reúna os documentos necessários para abrir o processo.',
    itens: [
      'RG e CPF',
      'Comprovante de residência',
      'Certidão de nascimento ou casamento',
      'Comprovante de renda',
      'Atestado de sanidade mental',
      'Certidão negativa criminal',
      'Laudo psicológico'
    ]
  },
  {
    numero: 3,
    titulo: 'Avaliação técnica',
    icone: 'ti-user-check',
    cor: 'roxo',
    descricao: 'Entrevistas e visitas domiciliares conduzidas pela equipe da Vara.',
    itens: [
      'Entrevista psicológica',
      'Entrevista social',
      'Visita domiciliar',
      'Análise do contexto familiar'
    ]
  },
  {
    numero: 4,
    titulo: 'Curso de preparação',
    icone: 'ti-school',
    cor: 'amarelo',
    descricao: 'Curso obrigatório oferecido pela Vara da Infância.',
    itens: [
      'Duração média de 2 a 4 meses',
      'Encontros semanais ou quinzenais',
      'Único documento com upload digital no sistema'
    ]
  },
  {
    numero: 5,
    titulo: 'Habilitação',
    icone: 'ti-award',
    cor: 'rosa',
    descricao: 'Depois da aprovação você entra na fila nacional de adoção.',
    itens: [
      'Sentença judicial de habilitação',
      'Inscrição no Cadastro Nacional de Adoção (CNA)',
      'Validade de 3 anos, renovável',
      'A partir daqui, a espera pela criança'
    ]
  }
]

const mitos = [
  { tipo: 'mito', titulo: 'Pessoas solteiras não podem adotar.', texto: 'A lei brasileira permite adoção por pessoa solteira desde que atenda aos requisitos legais.' },
  { tipo: 'verdade', titulo: 'Crianças mais velhas e grupos de irmãos têm fila menor.', texto: 'Perfis mais flexíveis encontram correspondência mais rápido.' },
  { tipo: 'mito', titulo: 'Posso escolher a criança visitando os abrigos.', texto: 'A escolha não é pessoal — o sistema indica perfis compatíveis com a habilitação.' }
]

const toggleEtapa = (num) => {
  etapaAberta.value = etapaAberta.value === num ? null : num
}
</script>

<template>
  <div class="page">
    <HeaderPublico />

    <main class="conteudo">
      <HeroDecorado
        titulo="Por onde começar?"
        descricao="Cinco etapas formais até a habilitação. Toque em cada uma para ver os detalhes."
      />

      <!-- Timeline accordion -->
      <section class="timeline-secao">
        <div class="timeline">
          <div v-for="etapa in etapas" :key="etapa.numero" class="etapa-linha">
            <!-- Bolinha do numero -->
            <div class="etapa-bolinha-wrapper">
              <span :class="['etapa-bolinha', { ativa: etapaAberta === etapa.numero }]">
                {{ etapa.numero }}
              </span>
              <span v-if="etapa.numero < etapas.length" class="etapa-conector"></span>
            </div>

            <!-- Card da etapa -->
            <button
              :class="['etapa-card', { aberta: etapaAberta === etapa.numero }]"
              @click="toggleEtapa(etapa.numero)"
              type="button"
            >
              <div class="etapa-header">
                <div :class="['etapa-icone', `cor-${etapa.cor}`]">
                  <i :class="['ti', etapa.icone]"></i>
                </div>
                <h3>{{ etapa.titulo }}</h3>
                <i :class="['ti', etapaAberta === etapa.numero ? 'ti-chevron-up' : 'ti-chevron-down']"></i>
              </div>

              <div v-if="etapaAberta === etapa.numero" class="etapa-detalhes">
                <p class="etapa-descricao">{{ etapa.descricao }}</p>
                <ul>
                  <li v-for="item in etapa.itens" :key="item">{{ item }}</li>
                </ul>
              </div>
            </button>
          </div>
        </div>

        <!-- Mitos e Verdades -->
        <div class="mitos-secao">
          <p class="secao-titulo">MITOS E VERDADES</p>
          <div class="mitos-lista">
            <div v-for="(item, idx) in mitos" :key="idx" class="mito-card">
              <span :class="['mito-tag', `tag-${item.tipo}`]">
                {{ item.tipo === 'mito' ? 'Mito' : 'Verdade' }}
              </span>
              <p>
                <strong>"{{ item.titulo }}"</strong>
                {{ item.texto }}
              </p>
            </div>
          </div>
        </div>

        <!-- CTAs finais -->
        <div class="ctas">
          <button class="btn btn-primary btn-cta" @click="router.push('/localizar-vara')">
            <i class="ti ti-map-pin"></i>
            Encontrar minha Vara da Infância
          </button>
          <button class="btn btn-ghost btn-cta" @click="router.push('/cadastro')">
            Já entendi, quero me cadastrar
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.conteudo { padding-bottom: 56px; }

/* timeline */
.timeline-secao {
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 32px 0;
}
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.etapa-linha {
  display: flex;
  gap: 20px;
  padding-bottom: 16px;
}
.etapa-bolinha-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.etapa-bolinha {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-border-strong);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.etapa-bolinha.ativa {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.etapa-conector {
  flex: 1;
  width: 2px;
  background: var(--color-primary);
  margin-top: 4px;
  min-height: 24px;
}

.etapa-card {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  overflow: hidden;
}
.etapa-card.aberta {
  background: var(--color-primary-soft);
  border-color: var(--color-primary-border);
}
.etapa-card:hover:not(.aberta) {
  border-color: var(--color-border-strong);
}

.etapa-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
}
.etapa-header h3 {
  flex: 1;
  font-size: 16px;
  color: var(--color-text);
}
.etapa-header > .ti {
  font-size: 18px;
  color: var(--color-text-tertiary);
}
.etapa-card.aberta .etapa-header > .ti {
  color: var(--color-primary);
}

.etapa-icone {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.cor-azul { background: #E6F1FB; color: var(--color-primary); }
.cor-verde { background: #E8F2D8; color: #4A7A1E; }
.cor-roxo { background: #EEEDFE; color: #5448A6; }
.cor-amarelo { background: #FCEBD0; color: #B07D14; }
.cor-rosa { background: #FCE3EA; color: #C84770; }

.etapa-detalhes {
  padding: 0 20px 20px 70px;
}
.etapa-descricao {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.6;
}
.etapa-detalhes ul {
  margin: 0;
  padding-left: 20px;
}
.etapa-detalhes li {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

/* mitos e verdades */
.mitos-secao {
  margin-top: 40px;
}
.secao-titulo {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.mitos-lista {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-border);
}
.mito-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  background: var(--color-bg);
}
.mito-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  flex-shrink: 0;
}
.tag-mito {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.tag-verdade {
  background: var(--color-success-soft);
  color: var(--color-success);
}
.mito-card p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
.mito-card strong {
  color: var(--color-text);
  margin-right: 4px;
}

/* CTAs */
.ctas {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
}
.btn-cta {
  padding: 12px 22px;
  font-size: 14px;
}
</style>
