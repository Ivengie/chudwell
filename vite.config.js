import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/chudwell/', // replace with your own repo name (slashes on both sides)
  plugins: [react()],
})
