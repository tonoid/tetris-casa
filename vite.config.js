import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const LOCALE_PATHS = ['fr', 'es', 'de']

function localizedHtml(html, locale) {
  const url = `https://tetris.casa/${locale}/`
  return html
    .replace(/<html lang="en"/, `<html lang="${locale}"`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
}

function staticSiteFallbacks() {
  return {
    name: 'static-site-fallbacks',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve('dist')
      const indexPath = path.join(distDir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const html = fs.readFileSync(indexPath, 'utf8')

      for (const locale of LOCALE_PATHS) {
        const dir = path.join(distDir, locale)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), localizedHtml(html, locale))
      }

      fs.writeFileSync(path.join(distDir, '404.html'), html)
    },
  }
}

export default defineConfig({
  plugins: [react(), staticSiteFallbacks()],
  base: '/',
  build: {
    target: 'es2020',
    sourcemap: false,
    reportCompressedSize: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react'
          }
        },
      },
    },
  },
})
