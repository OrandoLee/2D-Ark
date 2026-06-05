import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}

export default defineConfig({
  plugins: [react()],
  base: runtime.process?.env?.GITHUB_ACTIONS === 'true' ? '/2D-Ark/' : '/',
})
