import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

console.log('[vite-build] VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING')
console.log('[vite-build] VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      server: {
        entry: "./src/entry-server.tsx",
      },
    }),
    nitro(),
    viteReact(),
  ],
})

export default config
