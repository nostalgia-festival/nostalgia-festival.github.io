import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ('./') makes the build work on GitHub Pages for both
// user/organization pages (user.github.io) and project pages
// (user.github.io/repo) without needing to know the repo name in advance.
export default defineConfig({
  base: './',
  plugins: [react()],
})
