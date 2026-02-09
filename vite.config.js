import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served under https://chatbotbuilder.store/cosmicchat
export default defineConfig({
  plugins: [react()],
  base: '/cosmicchat/',
})
