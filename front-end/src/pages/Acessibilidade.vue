<script setup>
import { ref } from 'vue'
import HeaderPublico from '@/components/HeaderPublico.vue'
import Footer from '@/components/Footer.vue'

const tamanhoFonte = ref('normal')
const altoContraste = ref(false)

const aplicarFonte = (tamanho) => {
  tamanhoFonte.value = tamanho
  const root = document.documentElement
  if (tamanho === 'pequeno') root.style.fontSize = '14px'
  else if (tamanho === 'grande') root.style.fontSize = '17px'
  else root.style.fontSize = '15px'
}

const alternarContraste = () => {
  altoContraste.value = !altoContraste.value
  document.body.classList.toggle('alto-contraste', altoContraste.value)
}
</script>

<template>
  <div class="page">
    <HeaderPublico />
    <main class="conteudo">
      <article class="artigo">
        <h1>Acessibilidade</h1>
        <p class="lead">O CAIS é construído para ser usado por todas as pessoas, independentemente de limitações visuais, motoras ou cognitivas.</p>

        <!-- Ajustes ativos -->
        <section class="ajustes">
          <h2>Ajustes desta sessão</h2>

          <div class="ajuste-item">
            <div>
              <p class="ajuste-label">Tamanho da fonte</p>
              <p class="ajuste-desc">Ajuste o tamanho do texto em todo o sistema.</p>
            </div>
            <div class="seletor-fonte">
              <button :class="['btn-fonte', { ativo: tamanhoFonte === 'pequeno' }]" @click="aplicarFonte('pequeno')">A-</button>
              <button :class="['btn-fonte', { ativo: tamanhoFonte === 'normal' }]" @click="aplicarFonte('normal')">A</button>
              <button :class="['btn-fonte', { ativo: tamanhoFonte === 'grande' }]" @click="aplicarFonte('grande')">A+</button>
            </div>
          </div>

          <div class="ajuste-item">
            <div>
              <p class="ajuste-label">Alto contraste</p>
              <p class="ajuste-desc">Aumenta o contraste entre texto e fundo.</p>
            </div>
            <button :class="['btn-toggle', { ativo: altoContraste }]" @click="alternarContraste">
              <span class="toggle-bola"></span>
            </button>
          </div>
        </section>

        <section>
          <h2>Recursos disponíveis</h2>
          <ul>
            <li><strong>Navegação por teclado:</strong> use Tab, Shift+Tab e Enter para navegar.</li>
            <li><strong>Leitores de tela:</strong> compatível com NVDA, JAWS e VoiceOver.</li>
            <li><strong>Contraste:</strong> textos seguem a razão mínima WCAG AA (4.5:1).</li>
            <li><strong>Tamanho de toque:</strong> botões em dispositivos móveis têm no mínimo 44×44 px.</li>
            <li><strong>Conteúdo descritivo:</strong> imagens decorativas são marcadas como tal; ícones têm <code>aria-label</code>.</li>
          </ul>
        </section>

        <section>
          <h2>Atalhos de teclado</h2>
          <ul class="atalhos">
            <li><kbd>Alt</kbd> + <kbd>1</kbd> — ir para o conteúdo principal</li>
            <li><kbd>Alt</kbd> + <kbd>2</kbd> — ir para a navegação</li>
            <li><kbd>Alt</kbd> + <kbd>3</kbd> — abrir busca</li>
            <li><kbd>Esc</kbd> — fechar modais ou menus abertos</li>
          </ul>
        </section>

        <section>
          <h2>Reportar problemas</h2>
          <p>Encontrou alguma barreira de acessibilidade? Escreva para <strong>acessibilidade@cais.jus.br</strong> descrevendo a situação. Respondemos em até 5 dias úteis.</p>
        </section>
      </article>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.conteudo {
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 32px;
}
.artigo h1 {
  font-size: 32px;
  margin-bottom: 16px;
}
.lead {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 32px;
}

/* ajustes */
.ajustes {
  background: var(--color-primary-soft);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 32px;
}
.ajustes h2 {
  font-size: 16px;
  margin-bottom: 18px;
  color: var(--color-primary);
}
.ajuste-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-primary-border);
}
.ajuste-item:last-child { border-bottom: none; }
.ajuste-label { font-size: 14px; font-weight: 500; }
.ajuste-desc { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }

.seletor-fonte {
  display: flex;
  gap: 4px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 4px;
}
.btn-fonte {
  width: 36px;
  height: 32px;
  font-size: 13px;
  border-radius: 6px;
  color: var(--color-text-secondary);
}
.btn-fonte.ativo {
  background: var(--color-primary);
  color: white;
}

.btn-toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-border-strong);
  position: relative;
  transition: background 0.2s;
}
.btn-toggle.ativo { background: var(--color-primary); }
.toggle-bola {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
}
.btn-toggle.ativo .toggle-bola { transform: translateX(20px); }

section { margin-bottom: 28px; }
section h2 {
  font-size: 17px;
  margin-bottom: 10px;
}
section p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}
section ul {
  margin: 0;
  padding-left: 20px;
}
section li {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.9;
}
strong { color: var(--color-text); }

.atalhos li {
  list-style: none;
  padding-left: 0;
}
kbd {
  display: inline-block;
  padding: 2px 8px;
  font-family: monospace;
  font-size: 12px;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-strong);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--color-border-strong);
}
</style>
