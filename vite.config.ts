import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fairy/',
  build: {
    chunkSizeWarningLimit: 1000, // 临时提高警告阈值
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 将第三方库分包
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('xlsx')) return 'vendor-xlsx'
            if (id.includes('lucide')) return 'vendor-lucide'
            if (id.includes('framer-motion')) return 'vendor-framer'
            if (id.includes('zustand')) return 'vendor-zustand'
            // 其他较大的库
            return 'vendor-other'
          }
        }
      }
    }
  }
})
