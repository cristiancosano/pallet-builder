import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'PalletBuilder',
      formats: ['es'],
      fileName: 'pallet-builder',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'zustand'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          three: 'THREE',
          '@react-three/fiber': 'ReactThreeFiber',
          '@react-three/drei': 'drei',
          zustand: 'zustand',
        },
      },
    },
    sourcemap: true,
  },
})
