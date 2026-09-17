<script setup>
// Componente puramente decorativo (nessuna logica): un cluster di foglie
// disegnato in SVG, posizionato ai 4 angoli del contenitore relativo in cui
// viene inserito. Riutilizzato sia nell'overlay iniziale che nella modale
// della foto, per dare coerenza visiva al tema "teatrino di carta".
defineProps({
  // Permette di attenuare la cornice quando serve (es. sopra il canvas AR).
  opacity: {
    type: Number,
    default: 0.95,
  },
})
</script>

<template>
  <div class="leaf-frame" :style="{ opacity }" aria-hidden="true">
    <svg class="corner corner-tl" viewBox="0 0 100 100">
      <g>
        <path d="M5,70 C0,40 15,10 55,5 C40,30 45,55 20,75 C15,78 8,76 5,70 Z" fill="var(--forest)" />
        <path d="M25,85 C15,55 35,25 70,15 C55,45 55,70 35,90 C30,93 27,90 25,85 Z" fill="var(--forest-light)" opacity="0.9" />
        <path d="M2,55 Q2,42 8,32" stroke="var(--bark-dark)" stroke-width="2" fill="none" opacity="0.5" />
      </g>
    </svg>

    <svg class="corner corner-tr" viewBox="0 0 100 100">
      <g>
        <path d="M5,70 C0,40 15,10 55,5 C40,30 45,55 20,75 C15,78 8,76 5,70 Z" fill="var(--forest)" />
        <path d="M25,85 C15,55 35,25 70,15 C55,45 55,70 35,90 C30,93 27,90 25,85 Z" fill="var(--forest-light)" opacity="0.9" />
        <path d="M2,55 Q2,42 8,32" stroke="var(--bark-dark)" stroke-width="2" fill="none" opacity="0.5" />
      </g>
    </svg>

    <svg class="corner corner-bl" viewBox="0 0 100 100">
      <g>
        <path d="M5,70 C0,40 15,10 55,5 C40,30 45,55 20,75 C15,78 8,76 5,70 Z" fill="var(--forest)" />
        <path d="M25,85 C15,55 35,25 70,15 C55,45 55,70 35,90 C30,93 27,90 25,85 Z" fill="var(--forest-light)" opacity="0.9" />
        <path d="M2,55 Q2,42 8,32" stroke="var(--bark-dark)" stroke-width="2" fill="none" opacity="0.5" />
      </g>
    </svg>

    <svg class="corner corner-br" viewBox="0 0 100 100">
      <g>
        <path d="M5,70 C0,40 15,10 55,5 C40,30 45,55 20,75 C15,78 8,76 5,70 Z" fill="var(--forest)" />
        <path d="M25,85 C15,55 35,25 70,15 C55,45 55,70 35,90 C30,93 27,90 25,85 Z" fill="var(--forest-light)" opacity="0.9" />
        <path d="M2,55 Q2,42 8,32" stroke="var(--bark-dark)" stroke-width="2" fill="none" opacity="0.5" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.leaf-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  isolation: isolate;
}

.corner {
  position: absolute;
  width: 30%;
  max-width: 7rem;
  height: auto;
}

.corner-tl {
  top: 0;
  left: 0;
}

.corner-tr {
  top: 0;
  right: 0;
  transform: scaleX(-1);
}

.corner-bl {
  bottom: 0;
  left: 0;
  transform: scaleY(-1);
}

.corner-br {
  bottom: 0;
  right: 0;
  transform: scale(-1, -1);
}
</style>
