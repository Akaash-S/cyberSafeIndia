import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main popup
        popup: resolve(__dirname, 'src/extension/popup.html'),
        // Options page
        options: resolve(__dirname, 'src/extension/options.html'),
        // Background script
        background: resolve(__dirname, 'src/extension/background.ts'),
        // Content script
        content: resolve(__dirname, 'src/extension/content.ts'),
        // Website sync script
        'website-sync': resolve(__dirname, 'src/extension/website-sync.ts'),
        // Blocked page
        blocked: resolve(__dirname, 'src/extension/blocked.html'),
        // Auth page
        auth: resolve(__dirname, 'src/extension/auth.html')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep background and content scripts as .js
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content' || chunkInfo.name === 'website-sync') {
            return '[name].js'
          }
          // Other entries go to assets folder
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            return '[name].[ext]'
          }
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
