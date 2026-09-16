import { createApp } from 'vue'
import './style.css'

// A-Frame deve essere caricato PRIMA del modulo MindAR (che registra i suoi
// componenti su AFRAME). L'ordine di questi due import è importante.
import 'aframe'
import 'mind-ar/dist/mindar-image-aframe.prod.js'

import App from './App.vue'

createApp(App).mount('#app')
