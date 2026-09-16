import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Vue non deve provare a risolvere i tag di A-Frame (a-scene, a-entity, a-camera, ...)
          // come componenti Vue: sono web component custom registrati da A-Frame/MindAR.
          isCustomElement: (tag) => tag.startsWith('a-'),
        },
      },
    }),
    tailwindcss(),
  ],
})
