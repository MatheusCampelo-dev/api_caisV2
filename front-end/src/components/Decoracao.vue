<script setup>
defineProps({
  variant: { type: String, default: 'estrela' } // estrela | mao | coracao | bolinha
})
</script>

<template>
  <!-- estrelinha verde estilo doodle -->
  <svg v-if="variant === 'estrela'" viewBox="0 0 60 60" class="deco">
    <path d="M 30 6 L 33 24 L 54 30 L 33 36 L 30 54 L 27 36 L 6 30 L 27 24 Z" fill="#9DC25A" />
  </svg>

  <!-- mãozinha amarela acenando -->
  <svg v-else-if="variant === 'mao'" viewBox="0 0 80 80" class="deco">
    <path d="M 20 50 Q 18 30 30 28 L 32 22 Q 34 14 42 16 L 42 30 L 46 14 Q 50 8 56 12 L 52 30 L 58 16 Q 64 12 66 20 L 60 36 L 66 26 Q 72 24 72 32 L 66 50 Q 62 66 46 68 Q 26 70 20 50 Z"
          fill="#F2C94C" />
  </svg>

  <!-- coração rosa -->
  <svg v-else-if="variant === 'coracao'" viewBox="0 0 60 60" class="deco">
    <path d="M 30 50 C 10 36 8 18 22 14 C 28 13 30 18 30 22 C 30 18 32 13 38 14 C 52 18 50 36 30 50 Z"
          fill="#F18AAE" />
  </svg>

  <!-- bolinha azul -->
  <svg v-else viewBox="0 0 30 30" class="deco">
    <circle cx="15" cy="15" r="10" fill="#79BCEA" />
  </svg>
</template>

<style scoped>
.deco {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
