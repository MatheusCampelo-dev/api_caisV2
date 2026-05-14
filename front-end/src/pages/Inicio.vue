<script setup>
import { useRouter } from 'vue-router'
import HeaderPublico from '@/components/HeaderPublico.vue'
import Footer from '@/components/Footer.vue'
import IlustracaoFamilia from '@/components/IlustracaoFamilia.vue'
import Decoracao from '@/components/Decoracao.vue'

const router = useRouter()

const atalhos = [
  {
    titulo: 'Por onde começar',
    descricao: 'Etapas, requisitos legais e documentos exigidos.',
    icone: 'ti-book-2',
    cor: 'roxo',
    to: '/por-onde-comecar'
  },
  {
    titulo: 'Localizar Vara',
    descricao: 'Encontre a Vara da Infância da sua comarca.',
    icone: 'ti-map-pin',
    cor: 'azul',
    to: '/localizar-vara'
  },
  {
    titulo: 'Instituições',
    descricao: 'Conheça os lares de acolhimento cadastrados.',
    icone: 'ti-building',
    cor: 'verde',
    to: '/instituicoes'
  }
]

const passos = [
  { numero: 1, titulo: 'Cadastre-se', descricao: 'Crie sua conta com CPF e e-mail.', cor: 'rosa', icone: 'ti-user-plus' },
  { numero: 2, titulo: 'Acompanhe', descricao: 'Veja status, checklist e agendamentos.', cor: 'verde', icone: 'ti-clipboard-check' },
  { numero: 3, titulo: 'Receba avisos', descricao: 'Notificações de cada decisão da Vara.', cor: 'azul', icone: 'ti-bell' }
]
</script>

<template>
  <div class="page">
    <HeaderPublico />

    <main>
      <!-- Hero principal -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-text">
            <h1>Acompanhe seu<br>processo de adoção</h1>
            <p>Um canal único e oficial para visualizar etapas, agendamentos e pendências do seu processo, sem depender de telefonemas ou idas repetidas à Vara da Infância.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" @click="router.push('/cadastro')">
                <i class="ti ti-user-plus"></i>
                Cadastrar-se
              </button>
              <button class="btn btn-outline" @click="router.push('/cadastro')">
                <i class="ti ti-login"></i>
                Já tenho cadastro
              </button>
            </div>
          </div>
          <div class="hero-ilustracao">
            <IlustracaoFamilia />
          </div>
        </div>
      </section>

      <!-- Atalhos -->
      <section class="secao secao-atalhos">
        <p class="secao-titulo">ATALHOS</p>
        <div class="atalhos-grid">
          <RouterLink v-for="atalho in atalhos" :key="atalho.titulo" :to="atalho.to" class="atalho-card">
            <div :class="['atalho-icone', `cor-${atalho.cor}`]">
              <i :class="['ti', atalho.icone]"></i>
            </div>
            <h3>{{ atalho.titulo }}</h3>
            <p>{{ atalho.descricao }}</p>
            <i class="ti ti-chevron-right atalho-seta"></i>
          </RouterLink>
        </div>
      </section>

      <!-- Como funciona -->
      <section class="secao secao-funciona">
        <div class="funciona-card">
          <p class="secao-titulo">COMO FUNCIONA</p>

          <div class="passos">
            <div v-for="(passo, idx) in passos" :key="passo.numero" class="passo-wrapper">
              <div class="passo">
                <span :class="['passo-numero', `cor-${passo.cor}`]">{{ passo.numero }}</span>
                <div :class="['passo-icone', `cor-${passo.cor}`]">
                  <i :class="['ti', passo.icone]"></i>
                </div>
                <h4>{{ passo.titulo }}</h4>
                <p>{{ passo.descricao }}</p>
              </div>
              <div v-if="idx < passos.length - 1" class="passo-linha"></div>
            </div>
          </div>

          <!-- decorações cantos -->
          <div class="deco-mao-canto">
            <Decoracao variant="mao" />
          </div>
          <div class="deco-coracao-canto">
            <Decoracao variant="coracao" />
          </div>
          <div class="deco-bolinha-canto">
            <Decoracao variant="bolinha" />
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

/* hero */
.hero {
  margin: 0 32px;
}
.hero-inner {
  max-width: 1140px;
  margin: 0 auto;
  background: var(--color-bg-warm);
  border-radius: var(--radius-xl);
  padding: 48px 56px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;
}
.hero-text h1 {
  font-size: 38px;
  line-height: 1.2;
  margin-bottom: 20px;
}
.hero-text p {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 28px;
  max-width: 420px;
}
.hero-actions {
  display: flex;
  gap: 12px;
}
.hero-ilustracao {
  display: flex;
  justify-content: center;
}
.hero-ilustracao svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

/* seções */
.secao {
  max-width: 1140px;
  margin: 0 auto;
  padding: 56px 32px 0;
}
.secao-titulo {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin-bottom: 20px;
}

/* atalhos */
.atalhos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.atalho-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  position: relative;
  transition: all 0.15s;
  display: block;
}
.atalho-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}
.atalho-icone {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 16px;
}
.cor-roxo { background: #EEEDFE; color: #5448A6; }
.cor-azul { background: #E6F1FB; color: var(--color-primary); }
.cor-verde { background: #E8F2D8; color: #4A7A1E; }
.cor-rosa { background: #FCE3EA; color: #C84770; }

.atalho-card h3 {
  font-size: 16px;
  margin-bottom: 6px;
}
.atalho-card p {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.atalho-seta {
  position: absolute;
  right: 20px;
  bottom: 20px;
  color: var(--color-primary);
  font-size: 18px;
}

/* como funciona */
.secao-funciona {
  padding-bottom: 56px;
}
.funciona-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 36px 48px 56px;
  position: relative;
  overflow: hidden;
}
.passos {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}
.passo-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}
.passo {
  flex: 1;
  text-align: center;
  position: relative;
}
.passo-numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 16px;
  background: white;
}
.passo-numero.cor-rosa { color: #E879A0; border: 1.5px solid #F8C8D9; }
.passo-numero.cor-verde { color: #7FB432; border: 1.5px solid #D1E5B0; }
.passo-numero.cor-azul { color: var(--color-primary); border: 1.5px solid #B5D4F4; }

.passo-icone {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 14px;
}
.passo h4 {
  font-size: 16px;
  margin-bottom: 6px;
}
.passo p {
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 200px;
  margin: 0 auto;
  line-height: 1.5;
}
.passo-linha {
  width: 100px;
  border-top: 1.5px dashed var(--color-border-strong);
  margin: 36px 0 0;
  flex-shrink: 0;
}

.deco-mao-canto {
  position: absolute;
  bottom: 0;
  left: 8px;
  width: 60px;
  transform: rotate(-25deg);
}
.deco-coracao-canto {
  position: absolute;
  bottom: 20px;
  right: 40px;
  width: 38px;
}
.deco-bolinha-canto {
  position: absolute;
  bottom: 16px;
  right: 12px;
  width: 18px;
}
</style>