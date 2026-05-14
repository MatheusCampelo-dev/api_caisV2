<script setup>
import { ref } from 'vue'
import HeaderPublico from '@/components/HeaderPublico.vue'
import HeroDecorado from '@/components/HeroDecorado.vue'

const busca = ref('')
const selecionada = ref(0)

const varas = [
  {
    nome: 'Vara da Infância — Recife',
    endereco: 'Av. Desembargador Guerra Barreto, 200 — Ilha Joana Bezerra, Recife / PE',
    horario: 'Seg–Sex 8h–17h',
    telefone: '(81) 3181-1700',
    distancia: '2,4 km',
    cor: 'azul'
  },
  {
    nome: 'Vara da Infância — Olinda',
    endereco: 'Av. Joaquim Nabuco, 400 — Bairro Novo, Olinda / PE',
    horario: 'Seg–Sex 8h–17h',
    telefone: '(81) 3439-2200',
    distancia: '8,1 km',
    cor: 'verde'
  },
  {
    nome: 'Vara da Infância — Jaboatão',
    endereco: 'R. José Belmiro de Almeida, 90 — Piedade, Jaboatão dos Guararapes / PE',
    horario: 'Seg–Sex 8h–17h',
    telefone: '(81) 3361-8800',
    distancia: '14,3 km',
    cor: 'roxo'
  },
  {
    nome: 'Vara da Infância — Paulista',
    endereco: 'Av. Pres. Castelo Branco, 1500 — Janga, Paulista / PE',
    horario: 'Seg–Sex 8h–17h',
    telefone: '(81) 3437-1100',
    distancia: '19,7 km',
    cor: 'amarelo'
  }
]
</script>

<template>
  <div class="page">
    <HeaderPublico />

    <main class="conteudo">
      <HeroDecorado
        titulo="Localizar Vara da Infância"
        descricao="Encontre a vara da sua comarca para iniciar ou acompanhar o processo de adoção."
      />

      <section class="busca-secao">
        <div class="busca-bar">
          <div class="campo-busca">
            <i class="ti ti-search"></i>
            <input
              v-model="busca"
              type="text"
              placeholder="Buscar por cidade, estado ou CEP..."
            />
          </div>
          <button class="btn btn-ghost">
            <i class="ti ti-current-location"></i>
            Usar minha localização
          </button>
        </div>

        <div class="resultados-grid">
          <!-- Lista de varas -->
          <div class="lista">
            <p class="secao-titulo">RESULTADOS — PRÓXIMAS A VOCÊ</p>
            <button
              v-for="(vara, idx) in varas"
              :key="idx"
              :class="['vara-card', { selecionada: selecionada === idx }]"
              @click="selecionada = idx"
              type="button"
            >
              <div :class="['vara-pin', `cor-${vara.cor}`]">
                <i class="ti ti-map-pin"></i>
              </div>
              <div class="vara-info">
                <div class="vara-header">
                  <h3>{{ vara.nome }}</h3>
                  <span class="vara-distancia">{{ vara.distancia }}</span>
                </div>
                <p class="vara-endereco">{{ vara.endereco }}</p>
                <div class="vara-meta">
                  <span><i class="ti ti-clock"></i> {{ vara.horario }}</span>
                  <span><i class="ti ti-phone"></i> {{ vara.telefone }}</span>
                </div>
              </div>
            </button>
          </div>

          <!-- Mapa estilizado -->
          <div class="mapa-wrapper">
            <p class="secao-titulo">MAPA</p>
            <div class="mapa">
              <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" class="mapa-svg" preserveAspectRatio="xMidYMid slice">
                <!-- background -->
                <rect width="400" height="440" fill="#EAF3DE"/>
                <!-- ruas claras -->
                <path d="M 0 130 Q 100 100 200 140 T 400 180" stroke="#FFFFFF" stroke-width="14" fill="none"/>
                <path d="M 0 290 Q 100 270 200 300 T 400 340" stroke="#FFFFFF" stroke-width="14" fill="none"/>
                <path d="M 80 0 L 110 440" stroke="#FFFFFF" stroke-width="10" fill="none"/>
                <path d="M 220 0 L 260 440" stroke="#FFFFFF" stroke-width="10" fill="none"/>
                <path d="M 330 0 L 350 440" stroke="#FFFFFF" stroke-width="10" fill="none"/>
                <!-- ruas finas -->
                <path d="M 0 60 L 400 80" stroke="#FFFFFF" stroke-width="4" fill="none"/>
                <path d="M 0 220 L 400 240" stroke="#FFFFFF" stroke-width="4" fill="none"/>
                <path d="M 0 380 L 400 400" stroke="#FFFFFF" stroke-width="4" fill="none"/>
                <!-- mancha de água canto inferior direito -->
                <path d="M 280 380 Q 360 360 400 380 L 400 440 L 280 440 Z" fill="#BFDEF2"/>
                <!-- pontos cinza (referências) -->
                <circle cx="100" cy="200" r="4" fill="#A8A8A8"/>
                <circle cx="180" cy="240" r="4" fill="#A8A8A8"/>
                <circle cx="300" cy="180" r="4" fill="#A8A8A8"/>
                <circle cx="320" cy="280" r="4" fill="#A8A8A8"/>
              </svg>

              <!-- pin Recife (selecionado) -->
              <div class="pin pin-primario" style="left: 38%; top: 38%;">
                <div class="pin-shape"><i class="ti ti-scale"></i></div>
              </div>
              <!-- pin Olinda -->
              <div class="pin" style="left: 68%; top: 28%;">
                <div class="pin-shape"><i class="ti ti-building-bank"></i></div>
              </div>
              <!-- pin Jaboatão -->
              <div class="pin" style="left: 60%; top: 62%;">
                <div class="pin-shape"><i class="ti ti-building-bank"></i></div>
              </div>
              <!-- ponto "você está aqui" -->
              <div class="voce-aqui" style="left: 42%; top: 56%;">
                <div class="voce-aqui-pulse"></div>
              </div>

              <!-- legenda -->
              <div class="mapa-legenda">
                <span class="ponto-azul"></span>
                Você está aqui
              </div>
            </div>

            <div class="mapa-controles">
              <button class="btn btn-ghost btn-mapa"><i class="ti ti-plus"></i></button>
              <button class="btn btn-ghost btn-mapa"><i class="ti ti-minus"></i></button>
            </div>
          </div>
        </div>

        <!-- Aviso -->
        <div class="aviso">
          <i class="ti ti-info-circle"></i>
          <p>
            <strong>Você só pode iniciar o processo na vara da comarca onde reside.</strong>
            Em caso de dúvida, ligue para a vara antes de comparecer.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.conteudo { padding-bottom: 56px; }

.busca-secao {
  max-width: 1140px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

.busca-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}
.campo-busca {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.campo-busca:focus-within {
  border-color: var(--color-primary);
}
.campo-busca .ti {
  font-size: 18px;
  color: var(--color-text-tertiary);
}
.campo-busca input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.resultados-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
}

.secao-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vara-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.vara-card:hover { border-color: var(--color-border-strong); }
.vara-card.selecionada {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.vara-pin {
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

.vara-info { flex: 1; }
.vara-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.vara-header h3 {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}
.vara-card.selecionada .vara-header h3 {
  color: var(--color-primary-dark);
}
.vara-distancia {
  font-size: 12px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}
.vara-endereco {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 8px;
}
.vara-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}
.vara-meta .ti {
  font-size: 13px;
  vertical-align: -1px;
}

/* mapa */
.mapa-wrapper {
  display: flex;
  flex-direction: column;
}
.mapa {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.mapa-svg {
  width: 100%;
  height: 100%;
  display: block;
}
.pin {
  position: absolute;
  transform: translate(-50%, -100%);
}
.pin-shape {
  width: 36px;
  height: 46px;
  background: white;
  border: 2.5px solid var(--color-primary);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 16px;
  position: relative;
}
.pin-shape::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: white;
  border-right: 2.5px solid var(--color-primary);
  border-bottom: 2.5px solid var(--color-primary);
}
.pin-primario .pin-shape {
  background: var(--color-primary);
  color: white;
}
.pin-primario .pin-shape::after {
  background: var(--color-primary);
}
.voce-aqui {
  position: absolute;
  transform: translate(-50%, -50%);
}
.voce-aqui-pulse {
  width: 14px;
  height: 14px;
  background: var(--color-primary);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 4px rgba(31, 115, 232, 0.25);
}
.mapa-legenda {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: white;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: var(--shadow-sm);
}
.ponto-azul {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
}
.mapa-controles {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.btn-mapa {
  flex: 1;
  padding: 8px;
  background: var(--color-bg);
}

/* aviso */
.aviso {
  margin-top: 28px;
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.aviso .ti {
  font-size: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}
.aviso p {
  font-size: 13px;
  color: var(--color-primary-dark);
  line-height: 1.6;
}
.aviso strong { font-weight: 600; }
</style>
