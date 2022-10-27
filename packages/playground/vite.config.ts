import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@visoning/vue-utility': resolve('../../../vue-utility/src/index.ts'),
      '@visoning/vue-interactions': resolve('../core/src/index.ts'),
      '@visoning/vue-interactions-components': resolve(
        '../components/src/index.ts'
      )
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
        '@visoning/vue-utility',
        '@visoning/vue-interactions',
        '@visoning/vue-interactions-components'
      ]
    }
  }
})
