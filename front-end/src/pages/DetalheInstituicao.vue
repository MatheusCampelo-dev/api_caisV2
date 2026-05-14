<script setup>
import { useRouter } from 'vue-router'
import HeaderPublico from '@/components/HeaderPublico.vue'

const router = useRouter()

const fotos = [
  { cor: '#FAEEDA', icone: '#854F0B' },
  { cor: '#E1F5EE', icone: '#085041' },
  { cor: '#EEEDFE', icone: '#3C3489' }
]

const instituicao = {
  nome: 'Lar Pequeno Príncipe',
  cidade: 'Recife / PE',
  sobre: 'Instituição mantida pela Secretaria de Assistência Social, em funcionamento desde 1998. A rotina é organizada em torno de atividades escolares pela manhã, oficinas e brincadeiras à tarde, e refeições em conjunto. A equipe é formada por educadores sociais, psicóloga e assistente social.',
  endereco: 'R. das Flores, 240 — Boa Vista, Recife',
  telefone: '(81) 3344-5566',
  atendimento: 'Seg a sex · 8h às 17h',
  equipe: '12 educadores · psicóloga · assistente social'
}
</script>

<template>
  <div class="page">
    <HeaderPublico />

    <main class="conteudo">
      <div class="card-principal">

        <button class="voltar" @click="router.push('/instituicoes')" type="button">
          <i class="ti ti-arrow-left"></i>
          Voltar à lista de instituições
        </button>

        <div class="cabecalho">
          <div class="cabecalho-icone">
            <i class="ti ti-building"></i>
          </div>
          <div>
            <h1>{{ instituicao.nome }}</h1>
            <p>Instituição de Acolhimento · {{ instituicao.cidade }}</p>
          </div>
        </div>

        <!-- Galeria de fotos (placeholders) -->
        <div class="galeria">
          <div
            v-for="(foto, idx) in fotos"
            :key="idx"
            class="foto"
            :style="{ background: foto.cor }"
          >
            <i class="ti ti-photo" :style="{ color: foto.icone }"></i>
          </div>
        </div>
        <p class="legenda-galeria">
          <em>Apenas imagens dos espaços comuns. Crianças não são exibidas.</em>
        </p>

        <hr class="divisor" />

        <section class="bloco">
          <h2>SOBRE</h2>
          <p class="sobre-texto">{{ instituicao.sobre }}</p>
        </section>

        <hr class="divisor" />

        <section class="bloco">
          <h2>CONTATO</h2>
          <div class="contato-grid">
            <div class="contato-item">
              <div class="contato-icone cor-azul"><i class="ti ti-map-pin"></i></div>
              <div class="contato-label">Endereço</div>
              <div class="contato-valor">{{ instituicao.endereco }}</div>
            </div>
            <div class="contato-item">
              <div class="contato-icone cor-verde"><i class="ti ti-phone"></i></div>
              <div class="contato-label">Telefone</div>
              <div class="contato-valor">{{ instituicao.telefone }}</div>
            </div>
            <div class="contato-item">
              <div class="contato-icone cor-roxo"><i class="ti ti-clock"></i></div>
              <div class="contato-label">Atendimento</div>
              <div class="contato-valor">{{ instituicao.atendimento }}</div>
            </div>
            <div class="contato-item">
              <div class="contato-icone cor-amarelo"><i class="ti ti-users"></i></div>
              <div class="contato-label">Equipe</div>
              <div class="contato-valor">{{ instituicao.equipe }}</div>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-warm); }
.conteudo {
  max-width: 1140px;
  margin: 0 auto;
  padding: 32px;
}
.card-principal {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 40px 48px;
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  padding: 0;
}
.voltar:hover { text-decoration: underline; }

.cabecalho {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 32px;
}
.cabecalho-icone {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}
.cabecalho h1 {
  font-size: 30px;
  font-weight: 600;
  margin: 0 0 4px;
}
.cabecalho p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* galeria */
.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}
.foto {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
}
.legenda-galeria {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 24px;
}

.divisor {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 28px 0;
}

.bloco h2 {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text);
  margin-bottom: 14px;
}
.sobre-texto {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* contato */
.contato-grid {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 14px 16px;
  align-items: center;
}
.contato-item {
  display: contents;
}
.contato-icone {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  grid-column: 1;
}
.cor-azul { background: var(--color-primary-soft); color: var(--color-primary); }
.cor-verde { background: #E8F2D8; color: #4A7A1E; }
.cor-roxo { background: #EEEDFE; color: #5448A6; }
.cor-amarelo { background: #FCEBD0; color: #B07D14; }

.contato-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  grid-column: 2;
}
.contato-valor {
  font-size: 14px;
  color: var(--color-text);
  text-align: right;
  grid-column: 3;
}
</style>
