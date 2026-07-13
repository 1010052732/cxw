import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: 'D:/shuchu',
    sourcemap: false,
    minify: true,
    rolldownOptions: {
      output: {
        minify:
          mode === 'production'
            ? {
                compress: {
                  dropConsole: true,
                  dropDebugger: true,
                },
              }
            : false,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#B32620',
        },
        javascriptEnabled: true,
      },
    },
  },
}))
