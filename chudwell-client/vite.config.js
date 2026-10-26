import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: ' https://ivengie.github.io/chudwell/',
  plugins: [react()],
})
