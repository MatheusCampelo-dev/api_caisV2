<script setup>
import { useRouter } from 'vue-router'
import HeaderPublico from '@/components/HeaderPublico.vue'
import HeroDecorado from '@/components/HeroDecorado.vue'

const router = useRouter()

const instituicoes = [
  { nome: 'Lar Pequeno Príncipe', bairro: 'Boa Vista · Recife', faixaEtaria: '0 a 12 anos', cor: 'amarelo', icone: '#854F0B', fundo: '#FAEEDA' },
  { nome: 'Casa Esperança', bairro: 'Várzea · Recife', faixaEtaria: '3 a 15 anos', cor: 'verde', icone: '#085041', fundo: '#E1F5EE' },
  { nome: 'Lar Nossa Senhora', bairro: 'Casa Amarela · Recife', faixaEtaria: '0 a 18 anos', cor: 'rosa', icone: '#791F1F', fundo: '#FCEBEB' },
  { nome: 'Casa Renascer', bairro: 'Cordeiro · Recife', faixaEtaria: '6 a 17 anos', cor: 'roxo', icone: '#3C3489', fundo: '#EEEDFE' }
]
</script>

<template>
  <div class="page">
    <HeaderPublico />

    <main class="conteudo">
      <HeroDecorado
        titulo="Instituições de acolhimento"
        descricao="Conheça os lares de acolhimento cadastrados na sua região."
      />

      <section class="lista-secao">
        <div class="grid">
          <button
            v-for="(inst, idx) in instituicoes"
            :key="idx"
            class="card-inst"
            @click="router.push('/instituicoes/lar-pequeno-principe')"
            type="button"
          >
            <div class="card-icone" :style="{ background: inst.fundo, color: inst.icone }">
              <i class="ti ti-building"></i>
            </div>
            <h3>{{ inst.nome }}</h3>
            <p class="bairro"><i class="ti ti-map-pin"></i> {{ inst.bairro }}</p>
            <span class="tag-faixa">{{ inst.faixaEtaria }}</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.conteudo { padding-bottom: 56px; }

.lista-secao {
  max-width: 1140px;
  margin: 0 auto;
  padding: 40px 32px 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.card-inst {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}
.card-inst:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}
.card-icone {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 14px;
}
.card-inst h3 {
  font-size: 16px;
  margin-bottom: 4px;
}
.bairro {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.tag-faixa {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
</style>
