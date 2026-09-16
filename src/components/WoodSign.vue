<script setup>
// Componente "presentazionale" generico: accetta il tag da renderizzare
// tramite la prop `as` (div, button, h1...) e stila il contenuto passato
// via slot come un cartello di legno inciso, coerente col tema delle carte.
defineProps({
  as: {
    type: String,
    default: 'div',
  },
})
</script>

<template>
  <component :is="as" class="wood-sign">
    <slot />
  </component>
</template>

<style scoped>
.wood-sign {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 1.15rem;
  border-radius: 0.4rem;
  background:
    repeating-linear-gradient(
      100deg,
      rgba(0, 0, 0, 0.07) 0px,
      rgba(0, 0, 0, 0.07) 2px,
      transparent 2px,
      transparent 12px
    ),
    linear-gradient(180deg, #b97a50 0%, var(--bark) 45%, #8c4e33 100%);
  border: 2px solid var(--bark-dark);
  box-shadow:
    0 3px 0 var(--bark-dark),
    0 5px 10px rgba(0, 0, 0, 0.35);
  color: var(--cream);
  font-family: 'Caveat', cursive;
  font-size: 1.2rem;
  line-height: 1;
  white-space: nowrap;
  cursor: inherit;
}
</style>
