<script setup>
import Decoracao from './Decoracao.vue'

defineProps({
  titulo: String,
  descricao: String
})
</script>

<template>
  <section class="hero">
    <div class="deco-left">
      <Decoracao variant="estrela" class="deco-estrela" />
      <Decoracao variant="coracao" class="deco-coracao" />
    </div>
    <div class="hero-content">
      <h1>{{ titulo }}</h1>
      <p v-if="descricao">{{ descricao }}</p>
    </div>
    <div class="deco-right">
      <Decoracao variant="bolinha" class="deco-bolinha" />
      <Decoracao variant="mao" class="deco-mao" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: var(--color-bg-warm);
  padding: 56px 32px;
  position: relative;
  text-align: center;
  border-radius: 0;
  overflow: hidden;
}
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
}
.hero h1 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 16px;
}
.hero p {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
.deco-left, .deco-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 200px;
  pointer-events: none;
}
.deco-left { left: 0; }
.deco-right { right: 0; }
.deco-estrela {
  position: absolute;
  width: 60px;
  top: 24px;
  left: 60px;
}
.deco-coracao {
  position: absolute;
  width: 36px;
  top: 80px;
  left: 110px;
}
.deco-bolinha {
  position: absolute;
  width: 18px;
  top: 90px;
  right: 110px;
}
.deco-mao {
  position: absolute;
  width: 90px;
  top: 30px;
  right: 30px;
}
</style>
